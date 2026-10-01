const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const operation of ['deduplicate','merge','compare']) {
  await page.goto(base+'/tools/excel');
  await page.getByRole('button',{name:operation==='deduplicate'?'Loại dòng trùng':operation==='merge'?'Ghép các file':'Đối chiếu A / B'}).click();
  const files=[{name:'data-a.csv',mimeType:'text/csv',buffer:Buffer.from('ID,Value\n001,A\n001,B\n002,C\n')}];
  if(operation!=='deduplicate') files.push({name:'data-b.csv',mimeType:'text/csv',buffer:Buffer.from('ID,Value\n002,D\n003,E\n')});
  await page.getByLabel('Chọn file Excel hoặc CSV').setInputFiles(files);
  await page.getByRole('checkbox',{name:/Tôi có quyền/}).check();
  await page.getByRole('button',{name:'Tải file & đọc cấu trúc →'}).click();
  await page.getByRole('heading',{name:'Chọn quy tắc xử lý'}).waitFor({timeout:150000});
  assert.equal(await page.getByLabel('Thao tác',{exact:true}).inputValue(),operation);
  await page.getByRole('button',{name:'Xử lý & xem kết quả →'}).click();
  await page.getByRole('heading',{name:'Kết quả đã sẵn sàng'}).waitFor({timeout:150000});
  const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'Tải kết quả Excel ↓'}).click();const d=await downloadPromise;assert.match(d.suggestedFilename(),/\.xlsx$/);
  await page.reload();await page.getByRole('heading',{name:'Các lượt trong trình duyệt này'}).waitFor();
  await page.locator('.vt-history>button').first().click();await page.getByRole('heading',{name:'Kết quả đã sẵn sàng'}).waitFor();
  console.log('PASS browser '+operation);
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/tools');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);fs.mkdirSync('outputs',{recursive:true});await page.screenshot({path:'outputs/tools-mobile.png',fullPage:true});
 await page.goto(base+'/tools/excel');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.setViewportSize({width:1440,height:1050});await page.goto(base+'/tools');await page.screenshot({path:'outputs/tools-desktop.png',fullPage:true});
 for(const route of ['/tools/billscan','/tools/sitereport','/tools/quotecompare','/','/app-portal','/demo/nhat-ky-hien-truong','/lien-he']) {const r=await page.goto(base+route);assert.equal(r.status(),200,route);}
 assert.deepEqual(errors,[]);console.log('PASS mobile, routes, no browser exceptions');
 const jobs=await (await context.request.get(base+'/api/tools/jobs')).json();
 for(const job of jobs.jobs || []) { const deleted=await context.request.delete(base+'/api/tools/jobs/'+job.id,{headers:{Origin:base}});assert.equal(deleted.status(),200); }
 console.log('PASS removed synthetic jobs from this isolated browser session');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
