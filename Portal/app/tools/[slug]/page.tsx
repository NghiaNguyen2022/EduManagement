import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toolsCatalog } from '@/lib/tools-catalog';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const tool = toolsCatalog.find(t => t.slug === slug); return { title: tool?.name || 'Công cụ', alternates: { canonical: `/tools/${slug}` } }; }
export default async function ComingSoon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const tool = toolsCatalog.find(t => t.slug === slug && t.slug !== 'excel'); if (!tool) notFound();
  return <section className={`vt-coming vt-${tool.color}`}><Link href="/tools" className="vt-back">← Tất cả công cụ</Link><span className="vt-icon" aria-hidden="true">{tool.icon}</span><span className="vt-pill vt-muted">Sắp ra mắt</span><h1>{tool.name}</h1><h2>{tool.subtitle}</h2><p>{tool.description}</p><ul>{tool.features.map(f => <li key={f}>{f}</li>)}</ul><div className="vt-notice">Công cụ đang được chuẩn bị, chưa nhận file và chưa thu phí.{slug === 'billscan' && ' Thông tin nhà cung cấp OCR và chính sách xử lý chứng từ sẽ được công bố trước khi mở.'}</div><Link className="vt-button" href="/tools/excel">Khám phá Excel Rescue ↗</Link></section>;
}
