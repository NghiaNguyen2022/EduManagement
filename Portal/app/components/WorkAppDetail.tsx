import Link from "next/link";
import type { WorkApp } from "@/lib/work-apps";
import PilotForm from "./PilotForm";
import SiteHeader from "./SiteHeader";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteNav } from "@/lib/nav";

export default async function WorkAppDetail({ app }: { app: WorkApp }) {
  const locale = await getLocale();
  return (
    <main>
      <SiteHeader
        eyebrow="Vireon Labs"
        locale={locale}
        links={getSiteNav(getDictionary(locale))}
      />
      <section className="section work-hero">
        <Link className="back-link" href="/app-portal">
          ← App Portal
        </Link>
        <p className="kicker">{app.code} · DEMO · NHẬN ĐĂNG KÝ PILOT</p>
        <h1>{app.title}</h1>
        <p className="work-lead">{app.description}</p>
        <p>{app.audience}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href={`/demo/${app.slug}`}>
            Trải nghiệm demo ↗
          </Link>
          <a className="button button-quiet" href="#pilot">
            Đăng ký pilot
          </a>
        </div>
      </section>
      <section className="section work-detail-grid">
        <div>
          <p className="kicker">MỘT QUY TRÌNH, BA BƯỚC</p>
          <div className="work-steps">
            {app.steps.map((step, i) => (
              <div key={step}>
                <span>0{i + 1}</span>
                <h3>{step}</h3>
              </div>
            ))}
          </div>
          <h2>Đầu ra dùng được mỗi ngày</h2>
          <p>{app.result}</p>
          <div className="work-notice">
            <strong>Phạm vi trải nghiệm</strong>
            <p>{app.scope}</p>
            <p>
              Dữ liệu demo chỉ lưu trên trình duyệt hiện tại. Chưa có AI thực,
              đồng bộ máy chủ, tài khoản đội nhóm hoặc chế độ làm việc ngoại
              tuyến đầy đủ.
            </p>
          </div>
          <h3>Khi triển khai pilot</h3>
          <p>
            Chọn một đội, một quy trình và mẫu báo cáo thực tế. Đo thời gian ghi
            nhận, chất lượng dữ liệu và thời gian duyệt trước khi mở rộng. Tích
            hợp ERP là tùy chọn sau pilot.
          </p>
        </div>
        <aside className="work-panel" id="pilot">
          <p className="kicker">CÙNG THỬ TRÊN CÔNG VIỆC THẬT</p>
          <h2>Đăng ký pilot</h2>
          <p>Cho chúng tôi biết nhu cầu của đội bạn.</p>
          <PilotForm appSlug={app.slug} />
        </aside>
      </section>
    </main>
  );
}
