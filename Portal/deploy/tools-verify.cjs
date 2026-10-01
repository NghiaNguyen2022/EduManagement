// End-to-end staging verification using only synthetic files and this script's sessions/jobs.
const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');const {randomUUID,createHash}=require('node:crypto');const assert=require('node:assert/strict');
const release=path.resolve(__dirname,'..'),runtime=path.join(release,'runtime'),base='http://127.0.0.1:3219';
async function main(){
process.loadEnvFile('/home/pauldigi/apps/vireon-portal/.env');
Object.assign(process.env,{TOOLS_ENABLED:'true',FREE_BETA:'true',TOOLS_STORAGE_ROOT:'/home/pauldigi/vireon-tools-data',TOOLS_MAX_ROWS:'10000',TOOLS_MAX_CELLS:'100000'});
const worker=require(path.join(runtime,'server/tools/worker.cjs'));const db=require(path.join(runtime,'server/tools/db.cjs'));const ExcelJS=require(path.join(runtime,'node_modules/exceljs'));
const server=spawn(process.execPath,[path.join(runtime,'server.js')],{cwd:runtime,env:{...process.env,NODE_ENV:'production',HOSTNAME:'127.0.0.1',PORT:'3219',TOOLS_ORIGIN:base},stdio:'ignore'});
const ownedJobs=[],owners=[];
async function call(url,method='GET',cookie,body){const r=await fetch(base+'/api/tools/'+url,{method,headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return r;}
async function session(){const r=await call('session','POST');assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];owners.push(createHash('sha256').update(cookie.split('=')[1]).digest('hex'));return cookie;}
try{
let ready=false;for(let i=0;i<40;i++){try{if((await fetch(base+'/robots.txt')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready,'staging ready');
// Serialize with production cron, but process only this verifier's synthetic jobs.
await db.locked('vireon-tools-worker',async conn=>{
await conn.execute('INSERT INTO tool_runtime (id,heartbeat_at) VALUES (1,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE heartbeat_at=UTC_TIMESTAMP()');
const cookie=await session(),other=await session();
for(const operation of ['deduplicate','merge','compare']){
const values=operation==='deduplicate'?['ID,Value\n001,A\n001,B\n,Blank\n']:['ID,Value\n001,A\n002,B\n','ID,Value\n001,C\n003,D\n'];
let r=await call('jobs','POST',cookie,{requestKey:randomUUID(),files:values.map((v,i)=>({name:'qa-'+i+'.csv',size:Buffer.byteLength(v)}))});assert.equal(r.status,201);let j=await r.json();ownedJobs.push(j.id);
// This synthetic verifier exercises processing without reporting a real payment.
await db.query("UPDATE tool_access SET amount=0,payment_status='free' WHERE job_id=?",[j.id]);
for(let i=0;i<values.length;i++){r=await fetch(base+`/api/tools/jobs/${j.id}/file?file=${j.files[i].id}`,{method:'PUT',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/octet-stream'},body:values[i]});assert.equal(r.status,200);}
assert.equal((await call(`jobs/${j.id}/inspect`,'POST',cookie)).status,200);await worker.processJob(j.id,conn);j=await(await call('jobs/'+j.id,'GET',cookie)).json();assert.equal(j.status,'configured');
assert.equal((await call('jobs/'+j.id,'GET',other)).status,404);assert.equal((await call(`jobs/${j.id}/download`,'GET',cookie)).status,403);
const config={operation,sources:j.metadata.files.map(f=>({fileId:f.id,sheet:'CSV',keys:[0],compare:[1],names:['ID','Value']}))};assert.equal((await call(`jobs/${j.id}/process`,'POST',cookie,config)).status,200);await worker.processJob(j.id,conn);j=await(await call('jobs/'+j.id,'GET',cookie)).json();assert.equal(j.status,'ready');
r=await call(`jobs/${j.id}/download`,'GET',cookie);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);const book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await r.arrayBuffer()));assert.ok(book.getWorksheet('Summary'));
if(operation==='deduplicate')assert.equal(j.result.stats.removedRows,1);if(operation==='merge')assert.equal(j.result.stats.outputRows,4);if(operation==='compare')assert.equal(j.result.stats.changedCells,1);
console.log('TOOLS_LINUX_E2E_PASS '+operation);
}
});
const stateFile=path.join(release,'release-state.json');const state=JSON.parse(fs.readFileSync(stateFile));state.e2ePassed=true;fs.writeFileSync(stateFile,JSON.stringify(state,null,2),{mode:0o600});
}finally{
try{
const {removeJob}=require(path.join(runtime,'server/tools/storage.cjs'));
for(const id of ownedJobs)await db.locked('tools-job-'+id,async conn=>{
await require(path.join(runtime,'server/tools/drive.cjs')).removeJob(id);
await removeJob(id);
await conn.execute('DELETE FROM tool_files WHERE job_id=?',[id]);
await conn.execute('DELETE FROM tool_jobs WHERE id=?',[id]);
});
for(const owner of owners){await db.query('DELETE FROM tool_jobs WHERE owner_hash=? AND cleaned_at IS NOT NULL',[owner]);await db.query('DELETE FROM tool_sessions WHERE token_hash=?',[owner]);await db.query('DELETE FROM tool_rate_limits WHERE bucket_key LIKE ?',['%-'+owner+':%']);}
}finally{server.kill('SIGTERM');await db.getPool().end();}
}
}
main().catch(e=>{console.error('TOOLS_LINUX_E2E_FAILED '+e.message);process.exitCode=1;});
