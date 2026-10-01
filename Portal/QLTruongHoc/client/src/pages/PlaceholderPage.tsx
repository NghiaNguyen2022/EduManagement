import { PageHeader } from "../components/shared/PageHeader";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader
        title={title}
        subtitle="Phân hệ đang được chuẩn hóa nghiệp vụ và sẽ triển khai theo checklist của sprint"
      />

      <section className="empty-state">
        <div className="empty-state__icon">◇</div>
        <h2>{title}</h2>
        <p>
          UI khung đã sẵn sàng. Database, API, quyền truy cập và màn hình nghiệp vụ
          sẽ được hoàn thiện song song trong sprint tương ứng.
        </p>
        <button type="button" className="secondary-button">
          Xem checklist triển khai
        </button>
      </section>
    </>
  );
}
