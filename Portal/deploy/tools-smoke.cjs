const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');
const release=path.resolve(__dirname,'..'),runtime=path.join(release,'runtime');
async function main(){
const statePath=path.join(release,'release-state.json');const state=JSON.parse(fs.readFileSync(statePath));if(!state.prepared)throw new Error('Prepare first');
process.loadEnvFile('/home/pauldigi/apps/vireon-portal/.env');
const server=spawn(process.execPath,[path.join(runtime,'server.js')],{cwd:runtime,env:{...process.env,NODE_ENV:'production',HOSTNAME:'127.0.0.1',PORT:'3219',TOOLS_ENABLED:'true',FREE_BETA:'true',TOOLS_ORIGIN:'http://127.0.0.1:3219',TOOLS_STORAGE_ROOT:'/home/pauldigi/vireon-tools-data'},stdio:'ignore'});
try{
let ready=false;for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:3219/robots.txt')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw new Error('Staging unavailable');
for(const route of ['/','/app-portal','/tools','/tools/excel','/tools/billscan','/tools/sitereport','/tools/quotecompare','/demo/nhat-ky-hien-truong','/lien-he']){
const response=await fetch('http://127.0.0.1:3219'+route);if(response.status!==200)throw new Error(route+': '+response.status);const html=await response.text();
for(const m of html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)){if(!(await fetch(new URL(m[1],'http://127.0.0.1:3219'))).ok)throw new Error('Missing asset');}console.log('PASS '+route);
}
const sitemap=await(await fetch('http://127.0.0.1:3219/sitemap.xml')).text();if(!sitemap.includes('/tools/excel'))throw new Error('Sitemap missing Tools');
const session=await fetch('http://127.0.0.1:3219/api/tools/session',{method:'POST',headers:{Origin:'http://127.0.0.1:3219'}});if(session.status!==200)throw new Error('Tools DB/session unavailable');
state.smokePassed=true;fs.writeFileSync(statePath,JSON.stringify(state,null,2),{mode:0o600});console.log('TOOLS_STAGING_SMOKE_OK');
}finally{server.kill('SIGTERM');}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
