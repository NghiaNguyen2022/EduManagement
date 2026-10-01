import assert from 'node:assert/strict';
import test from 'node:test';
const base = process.env.TEST_BASE_URL;
test('portal and Tools routes render their real content', { skip: !base }, async () => {
  for (const [route, content] of [['/', 'Vireon'], ['/app-portal', 'Vireon'], ['/tools', 'Công cụ nhỏ.'], ['/tools/excel', 'Excel Rescue'], ['/tools/billscan', 'BillScan'], ['/tools/sitereport', 'SiteReport'], ['/tools/quotecompare', 'QuoteCompare'], ['/demo/nhat-ky-hien-truong', 'hiện trường']]) {
    const response = await fetch(base + route, { headers: { Connection: 'close' }, signal: AbortSignal.timeout(15000) }); assert.equal(response.status, 200, route);
    const html = await response.text(); assert.ok(html.includes(content), route);
    assert.ok(!html.includes('Your site is taking shape'), route);
  }
});
test('sitemap uses the current portal routes', { skip: !base }, async () => {
  const response = await fetch(base + '/sitemap.xml', { headers: { Connection: 'close' }, signal: AbortSignal.timeout(15000) }); assert.equal(response.status, 200);
  const xml = await response.text(); assert.match(xml, /\/tools\/excel/); assert.match(xml, /\/app-portal/);
});
