import Link from "next/link";
import { workApps } from "@/lib/work-apps";

export default function WorkAppGallery({ locale = "vi" }: { locale?: string }) {
  const en = locale === "en";
  return (
    <section className="section work-gallery" id="work-apps">
      <div className="section-heading">
        <div>
          <p className="kicker">VIREON LABS · 01—03</p>
          <h2>
            {en
              ? "Small tools. Useful outcomes."
              : "Việc nhỏ mỗi ngày. Kết quả rõ ràng."}
          </h2>
        </div>
        <p>
          {en
            ? "Try three interactive workflow demos. Pilot registration is open; the demos use local sample data."
            : "Trải nghiệm ba quy trình ngay trên portal. Đang nhận đăng ký pilot; bản demo dùng dữ liệu mẫu trên trình duyệt."}
        </p>
      </div>
      <div className="app-grid">
        {workApps.map((app) => (
          <article className={`app-card ${app.color}`} key={app.slug}>
            <div className="app-top">
              <span className="app-icon">{app.code}</span>
              <span className="app-status">
                {en ? "Demo · Pilot registration" : "Demo · Nhận đăng ký pilot"}
              </span>
            </div>
            <p className="work-audience">
              {en ? app.audienceEn : app.audience}
            </p>
            <h3>{en ? app.titleEn : app.title}</h3>
            <p>{en ? app.descriptionEn : app.description}</p>
            <div className="app-actions">
              <Link className="app-action-primary" href={`/demo/${app.slug}`}>
                {en ? "Try demo" : "Trải nghiệm demo"} ↗
              </Link>
              <Link
                className="app-action-secondary"
                href={`/app-portal/${app.slug}`}
              >
                {en ? "Explore & register" : "Chi tiết & đăng ký"}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
