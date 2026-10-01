import type { Metadata } from 'next';
import Link from 'next/link';
import ExcelWizard from './wizard';
import { get as getSettings } from '@/server/tools/settings.cjs';
import { enabled, limits } from '@/server/tools/config.cjs';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Excel Rescue — Vireon Tools', alternates: { canonical: '/tools/excel' } };
export default async function ExcelPage() {
  const settings = (await getSettings()).values;
  return <><Link href="/tools" className="vt-back">← Tất cả công cụ</Link><div className="vt-page-heading"><div><span className="vt-eyebrow">BẢNG TÍNH GỌN GÀNG HƠN</span><h1>Excel Rescue<span className="vt-pill">{settings.billingEnabled ? `${settings.priceVnd.toLocaleString('vi-VN')} đ / lượt` : 'Beta miễn phí'}</span></h1><p>Loại trùng, ghép file, đối chiếu. Bạn chọn quy tắc, công cụ thực hiện.</p></div><span className="vt-icon vt-green" aria-hidden="true">▦</span></div>{enabled() ? <ExcelWizard limits={{ fileBytes: limits.fileBytes, files: limits.files, rows: limits.rows, cells: limits.cells }} /> : <div className="vt-panel"><h2>Đang chuẩn bị mở beta</h2><p>Hệ thống chưa nhận file lúc này. Vui lòng quay lại sau.</p></div>}</>;
}
