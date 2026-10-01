// Run on cPanel inside /home/pauldigi/vireon-releases/tools-YYYYMMDD-name.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFile } = require('node:child_process');
const live = '/home/pauldigi/apps/vireon-portal';
const release = path.resolve(__dirname, '..');
const runtime = path.join(release, 'runtime');
const statePath = path.join(release, 'release-state.json');
const storage = '/home/pauldigi/vireon-tools-data';
function run(bin, args, options = {}) { const r = spawnSync(bin, args, { stdio: 'inherit', ...options }); if (r.error || r.status !== 0) throw new Error(`Command failed: ${path.basename(bin)} (${r.status})`); return r; }
function save(s) { fs.writeFileSync(statePath, JSON.stringify(s, null, 2), { mode: 0o600 }); }
function env() { process.loadEnvFile(path.join(live, '.env')); }
function writeEnv(values) {
  const file = path.join(live, '.env'); let text = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(values)) { const pattern = new RegExp(`^${key}=.*$`, 'm'); text = pattern.test(text) ? text.replace(pattern, key + '=' + value) : text.trimEnd() + '\n' + key + '=' + value + '\n'; }
  const tmp = file + '.tools-new'; fs.writeFileSync(tmp, text, { mode: 0o600 }); fs.renameSync(tmp, file);
}
function restart() { fs.mkdirSync(path.join(live, 'tmp'), { recursive: true }); fs.writeFileSync(path.join(live, 'tmp/restart.txt'), new Date().toISOString()); }
async function main() {
  if (!/^\/home\/pauldigi\/vireon-releases\/tools-\d{8}-[a-z0-9-]+$/.test(release)) throw new Error('Unexpected release location');
  const action = process.argv[2];
  if (action === 'backup' || action === 'checkpoint' || action === 'snapshot') {
    const previous = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : null;
    if (action === 'backup' && previous) throw new Error('Backup already exists');
    if (action === 'checkpoint' && (!previous?.prepared || previous.applied)) throw new Error('Checkpoint only before activating a prepared release');
    env();
    const backup = '/home/pauldigi/vireon-backups/' + path.basename(release) + '-' + Date.now(); fs.mkdirSync(backup, { recursive: true, mode: 0o700 });
    const items = ['app.cjs','app.js','server.js','.env','.next','package.json','package-lock.json','app','lib','public','db','server','next.config.ts'].filter(x => fs.existsSync(path.join(live,x)));
    run('tar',['-czf',path.join(backup,'application.tar.gz'),'-C',live,...items]); run('tar',['-tzf',path.join(backup,'application.tar.gz')],{stdio:'ignore'});
    fs.copyFileSync(path.join(live,'app.cjs'),path.join(backup,'app.cjs')); fs.copyFileSync(path.join(live,'.env'),path.join(backup,'.env'));
    // The Passenger entry may point outside the original app root to an active release.
    const entry = fs.readFileSync(path.join(live,'app.cjs'),'utf8');
    const active = entry.match(/require\(["'](\/home\/pauldigi\/vireon-releases\/tools-\d{8}-[a-z0-9-]+\/runtime)\/server\.js["']\)/);
    if (entry.includes('/home/pauldigi/vireon-releases/') && !active) throw new Error('Cannot identify active runtime; inspect entry before backup');
    if (active) {
      const activeRuntime = active[1];
      if (fs.realpathSync(activeRuntime) !== activeRuntime) throw new Error('Unexpected active runtime symlink');
      run('tar',['-czf',path.join(backup,'active-runtime.tar.gz'),'-C',path.dirname(activeRuntime),'runtime']);
      run('tar',['-tzf',path.join(backup,'active-runtime.tar.gz')],{stdio:'ignore'});
      fs.writeFileSync(path.join(backup,'active-runtime.json'),JSON.stringify({path:activeRuntime,node:process.version},null,2),{mode:0o600});
    }
    if(fs.existsSync('/home/pauldigi/vireon.vn/sitemap.xml'))fs.copyFileSync('/home/pauldigi/vireon.vn/sitemap.xml',path.join(backup,'sitemap.xml'));
    const cron = spawnSync('crontab',['-l'],{encoding:'utf8'}); if (cron.status !== 0 && !/no crontab/i.test(cron.stderr || '')) throw new Error('Cannot inspect existing crontab');
    fs.writeFileSync(path.join(backup,'crontab.txt'),cron.stdout || '',{mode:0o600});
    const fd=fs.openSync(path.join(backup,'database.sql'),'wx',0o600);
    try { run('mysqldump',['--single-transaction','--quick','--skip-lock-tables','--no-tablespaces','--host',process.env.MYSQL_HOST || 'localhost','--port',process.env.MYSQL_PORT || '3306','--user',process.env.MYSQL_USER,...['tool_jobs','tool_files','tool_sessions','tool_rate_limits','tool_runtime','tool_access','tool_access_sessions','tool_cloud_files','tool_oauth_states','tool_payment_audit'].map(t=>'--ignore-table='+process.env.MYSQL_DATABASE+'.'+t),process.env.MYSQL_DATABASE],{env:{...process.env,MYSQL_PWD:process.env.MYSQL_PASSWORD || ''},stdio:['ignore',fd,'inherit']}); } finally { fs.closeSync(fd); }
    if(fs.statSync(path.join(backup,'database.sql')).size<100)throw new Error('Empty database backup');
    const toolsKey=process.env.TOOLS_KEY_FILE || path.join(process.env.TOOLS_STORAGE_ROOT || storage,'.portal-secrets.key');
    if(fs.existsSync(toolsKey))fs.copyFileSync(toolsKey,path.join(backup,'tools-secrets.key'));
    const uploads=process.env.STORAGE_ROOT; if(uploads && fs.existsSync(uploads)) {run('tar',['-czf',path.join(backup,'uploads.tar.gz'),'-C',path.dirname(uploads),path.basename(uploads)]);run('tar',['-tzf',path.join(backup,'uploads.tar.gz')],{stdio:'ignore'});}
    for(const name of fs.readdirSync(backup))fs.chmodSync(path.join(backup,name),0o600);
    if(action !== 'snapshot') save(previous ? {...previous,previousBackup:previous.backup,backup,checkpointedAt:Date.now()} : {backup,prepared:false,applied:false,enabled:false});console.log('TOOLS_BACKUP_OK '+backup);return;
  }
  const s=JSON.parse(fs.readFileSync(statePath,'utf8'));
  if(action==='prepare') {
    if(s.applied)throw new Error('Release already applied');
    run('npm',['ci','--omit=dev','--ignore-scripts','--no-fund'],{cwd:runtime}); env();
    fs.mkdirSync(storage,{recursive:true,mode:0o700});fs.chmodSync(storage,0o700);
    run(process.execPath,[path.join(runtime,'server/tools/migrate.cjs')],{cwd:runtime});
    s.prepared=true;save(s);console.log('TOOLS_PREPARED');return;
  }
  if(action==='apply') {
    if(!s.prepared || s.applied || !s.smokePassed || !s.e2ePassed)throw new Error('Prepare, staging smoke and end-to-end verification required');
    if(!s.checkpointedAt || Date.now()-s.checkpointedAt>900000)throw new Error('Fresh checkpoint required before apply');
    writeEnv({TOOLS_ENABLED:'false',FREE_BETA:'true',TOOLS_STORAGE_ROOT:storage,TOOLS_ORIGIN:'https://vireon.vn',TOOLS_MAX_ROWS:'10000',TOOLS_MAX_CELLS:'100000'});
    const entry=`const fs=require('node:fs');\nprocess.loadEnvFile(${JSON.stringify(path.join(live,'.env'))});\nrequire(${JSON.stringify(path.join(runtime,'server.js'))});\n`;
    fs.writeFileSync(path.join(live,'app.cjs.tools-new'),entry,{mode:0o600});fs.renameSync(path.join(live,'app.cjs.tools-new'),path.join(live,'app.cjs'));
    s.applied=true;save(s);restart();console.log('TOOLS_APPLIED_DISABLED');return;
  }
  if(action==='benchmark') {
    if(!s.prepared || !s.smokePassed)throw new Error('Prepare and smoke first');
    const latencies=[];let healthy=true;let pending=false;
    const timer=setInterval(async()=>{if(pending)return;pending=true;const started=Date.now();try{const r=await fetch('https://vireon.vn/',{signal:AbortSignal.timeout(10000)});await r.arrayBuffer();latencies.push(Date.now()-started);if(!r.ok)healthy=false;}catch{healthy=false;}finally{pending=false;}},2000);
    let output;
    try{output=await new Promise((resolve,reject)=>execFile(process.execPath,[path.join(runtime,'tests/tools-benchmark.cjs')],{cwd:runtime,timeout:180000,maxBuffer:1024*1024},(error,stdout)=>error?reject(new Error('Linux benchmark failed')):resolve(stdout)));}finally{clearInterval(timer);}
    const report=JSON.parse(output);if(report.platform!=='linux' || report.results.some(r=>r.maxRssKb>384*1024 || r.durationMs>60000) || !healthy || !latencies.length)throw new Error('Host benchmark or live website response exceeds beta budget');
    fs.writeFileSync(path.join(release,'linux-benchmark.json'),JSON.stringify({...report,websiteLatenciesMs:latencies},null,2),{mode:0o600});
    s.linuxBenchmarkPassed=true;save(s);console.log('TOOLS_LINUX_BENCHMARK_OK '+JSON.stringify(report.results));return;
  }
  if(action==='cron') {
    if(!s.applied)throw new Error('Apply disabled release first');
    const current=spawnSync('crontab',['-l'],{encoding:'utf8'});if(current.status!==0 && !/no crontab/i.test(current.stderr || ''))throw new Error('Cannot inspect cron');
    const content=(current.stdout || '').split('\n').filter(line=>!line.includes('# vireon-tools-worker')).join('\n').trimEnd();
    const line=`* * * * * NODE_ENV=production ${process.execPath} --env-file=${live}/.env ${runtime}/server/tools/worker.cjs >> /home/pauldigi/vireon-tools-worker.log 2>&1 # vireon-tools-worker`;
    const file=path.join(release,'tools.crontab');fs.writeFileSync(file,content+'\n'+line+'\n',{mode:0o600});run('crontab',[file]);
    fs.closeSync(fs.openSync('/home/pauldigi/vireon-tools-worker.log','a',0o600));s.cronInstalled=true;s.cronInstalledAt=Date.now();save(s);console.log('TOOLS_CRON_INSTALLED; verify next scheduled heartbeat before enable');return;
  }
  if(action==='enable') {
    if(!s.applied || !s.cronInstalled || !s.linuxBenchmarkPassed)throw new Error('Need application, cron and Linux benchmark verification'); env();
    const mysql=require(path.join(runtime,'node_modules/mysql2/promise'));const c=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT || 3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
    try {const [rows]=await c.query('SELECT id FROM tool_runtime WHERE heartbeat_at>DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 MINUTE) AND heartbeat_at>?',[new Date(s.cronInstalledAt).toISOString().slice(0,19).replace('T',' ')]);if(!rows.length)throw new Error('Scheduled worker heartbeat missing');}finally{await c.end();}
    const sitemap='/home/pauldigi/vireon.vn/sitemap.xml';
    if(fs.existsSync(sitemap)){
      if(!fs.readFileSync(sitemap,'utf8').includes('<loc>https://vireon.vn/listing</loc>'))throw new Error('Static sitemap changed; inspect before replacing');
      fs.renameSync(sitemap,path.join(s.backup,'sitemap-static-removed.xml'));s.sitemapArchived=true;save(s);
    }
    writeEnv({TOOLS_ENABLED:'true'});s.enabled=true;save(s);restart();console.log('TOOLS_ENABLED');return;
  }
  if(action==='rollback') {
    // Legacy API/worker cannot enforce paid codes or delete remote Drive objects.
    env();
    const mysql=require(path.join(runtime,'node_modules/mysql2/promise'));
    const connection=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT || 3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
    try {
      const [tables]=await connection.query("SHOW TABLES LIKE 'tool_access'");
      if(tables.length){
        const [active]=await connection.query("SELECT a.job_id FROM tool_access a JOIN tool_jobs j ON j.id=a.job_id WHERE j.cleaned_at IS NULL AND (a.amount>0 OR a.storage_provider='drive') LIMIT 1");
        if(active.length){
          const previousEntry=fs.readFileSync(path.join(s.backup,'app.cjs'),'utf8');
          const target=previousEntry.match(/require\(["'](\/home\/pauldigi\/vireon-releases\/tools-\d{8}-[a-z0-9-]+\/runtime)\/server\.js["']\)/);
          const oldApi=target && path.join(target[1],'server/tools/api.cjs'),oldWorker=target && path.join(target[1],'server/tools/worker.cjs');
          if(!oldApi || !fs.existsSync(oldApi) || !fs.readFileSync(oldApi,'utf8').includes('commerce.authorizeDownload') || !oldWorker || !fs.existsSync(oldWorker) || !fs.readFileSync(oldWorker,'utf8').includes('drive.removeJob'))throw new Error('Cannot roll back paid/Drive jobs to legacy code. Keep a commerce-aware API and cleanup worker; deploy a compatible fix.');
        }
      }
    }finally{await connection.end();}
    fs.copyFileSync(path.join(s.backup,'app.cjs'),path.join(live,'app.cjs'));fs.copyFileSync(path.join(s.backup,'.env'),path.join(live,'.env'));
    if(s.cronInstalled)run('crontab',[path.join(s.backup,'crontab.txt')]);if(s.sitemapArchived)fs.copyFileSync(path.join(s.backup,'sitemap.xml'),'/home/pauldigi/vireon.vn/sitemap.xml');s.enabled=false;s.applied=false;save(s);restart();console.log('TOOLS_ROLLBACK_OK');return;
  }
  throw new Error('Unknown action');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
