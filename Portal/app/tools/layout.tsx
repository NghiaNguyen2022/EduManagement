import Link from 'next/link';
import './tools.css';
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <div className="vt-shell"><header className="vt-header"><Link href="/tools" className="vt-brand"><span className="vt-brand-mark" aria-hidden="true">V</span><span>Vireon <b>Tools</b><small>Công cụ nhỏ. Việc xong nhanh.</small></span></Link><nav aria-label="Điều hướng Tools"><Link href="/tools">Các công cụ</Link><Link href="/">Về Vireon ↗</Link></nav></header><main className="vt-main">{children}</main><footer className="vt-footer"><span>Vireon Tools · Làm gọn việc mỗi ngày.</span><Link href="/tools#du-lieu">Dữ liệu & quyền riêng tư</Link><Link href="/lien-he">Liên hệ hỗ trợ</Link></footer></div>;
}
