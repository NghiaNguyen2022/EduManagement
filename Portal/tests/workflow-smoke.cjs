const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('outputs', {recursive:true});
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const context = await browser.newContext();
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for (const slug of ['nhat-ky-hien-truong','bao-hong-thiet-bi','kiem-tra-trung-bay']) {
  await page.goto(base+'/demo/'+slug);
  await page.getByRole('button',{name:'Điền dữ liệu mẫu',exact:true}).click();
  if(slug==='kiem-tra-trung-bay') await page.getByLabel('Đúng vị trí trưng bày',{exact:true}).check();
  await page.getByRole('button',{name:'Tạo bản nháp theo mẫu',exact:true}).click();
  await page.getByLabel('Nội dung gửi',{exact:true}).fill((await page.getByLabel('Nội dung gửi',{exact:true}).inputValue())+'\nĐã kiểm tra bản nháp.');
  await page.getByRole('button',{name:'Xác nhận & lưu bản ghi →',exact:true}).click();
  await page.locator('.demo-entry').waitFor();
  if(slug==='bao-hong-thiet-bi') {
   for(const name of ['Tiếp nhận xử lý','Báo đã xử lý','Người báo xác nhận']) await page.getByRole('button',{name,exact:true}).click();
   assert.equal(await page.locator('.demo-entry .app-status').innerText(),'HOÀN TẤT');
  } else { await page.getByRole('button',{name:'Duyệt bản ghi',exact:true}).click(); assert.equal(await page.locator('.demo-entry .app-status').innerText(),'ĐÃ DUYỆT'); }
  await page.reload(); await page.getByRole('button',{name:'≡ Lịch sử & xử lý'}).click();
  assert.equal(await page.locator('.demo-entry').count(),1);
  await page.getByLabel('Tìm bản ghi').fill('khong-co-ket-qua'); assert.equal(await page.locator('.demo-entry').count(),0);
  await page.getByRole('button',{name:'↗ Báo cáo ngày'}).click();
  assert.match(await page.locator('.demo-report').innerText(),/Đã kiểm tra bản nháp/);
  const dl = page.waitForEvent('download'); await page.getByRole('button',{name:'Tải báo cáo TXT ↓'}).click(); const d=await dl; assert.ok(d.suggestedFilename().endsWith('.txt'));
  console.log('PASS workflow '+slug);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/demo/nhat-ky-hien-truong');
 await page.getByRole('button',{name:'Điền dữ liệu mẫu',exact:true}).click();
 await page.getByRole('button',{name:'Tạo bản nháp theo mẫu',exact:true}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.screenshot({path:'outputs/demo-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1100});
 await page.screenshot({path:'outputs/demo-desktop.png',fullPage:true});
 for(const slug of ['nhat-ky-hien-truong','bao-hong-thiet-bi','kiem-tra-trung-bay']) {
  const response=await page.goto(base+'/app-portal/'+slug); assert.equal(response.status(),200);
  assert.equal(await page.getByRole('button',{name:'Gửi đăng ký pilot →'}).count(),1);
 }
 const api=await context.request.post(base+'/api/pilots',{headers:{Origin:'https://evil.invalid'},data:{}}); assert.equal(api.status(),403);
 const bad=await context.request.post(base+'/api/pilots',{headers:{Origin:base},data:{}}); assert.equal(bad.status(),400);
 const admin=await context.request.patch(base+'/api/admin/pilots/00000000-0000-0000-0000-000000000000',{headers:{Origin:base},data:{status:'closed'}}); assert.equal(admin.status(),401);
 assert.deepEqual(errors,[]); console.log('PASS mobile overflow, downloads, detail pages, API validation, anonymous admin denied; no browser errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
