import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";

type DashboardPageProps = {
  databaseConnected: boolean | null;
};

const summaryCards = [
  {
    title: "Học sinh đang học",
    value: "486",
    note: "Tăng 18 học sinh trong tháng",
    icon: "♙",
    tone: "primary" as const,
  },
  {
    title: "Lớp đang hoạt động",
    value: "28",
    note: "22 lớp ngoại ngữ · 6 lớp mầm non",
    icon: "▣",
    tone: "secondary" as const,
  },
  {
    title: "Hồ sơ chờ xử lý",
    value: "12",
    note: "5 hồ sơ cần liên hệ hôm nay",
    icon: "▤",
    tone: "warning" as const,
  },
  {
    title: "Tỷ lệ chuyên cần",
    value: "94,8%",
    note: "Tính trên 30 ngày gần nhất",
    icon: "✓",
    tone: "success" as const,
  },
];

const todayClasses = [
  {
    time: "08:00 – 09:30",
    className: "Starter A1.02",
    teacher: "Cô Nguyễn Thảo",
    room: "P.201",
  },
  {
    time: "09:45 – 11:15",
    className: "Kids English K3",
    teacher: "Thầy Minh",
    room: "P.105",
  },
  {
    time: "14:00 – 15:30",
    className: "Pre-IELTS 01",
    teacher: "Cô Thanh Hà",
    room: "P.302",
  },
  {
    time: "17:30 – 19:00",
    className: "Tin học thiếu nhi",
    teacher: "Thầy Quốc",
    room: "Lab 01",
  },
];

export function DashboardPage({
  databaseConnected,
}: DashboardPageProps) {
  return (
    <>
      <PageHeader
        title="Bảng điều hành"
        subtitle="Theo dõi nhanh tình hình tuyển sinh, lớp học, học viên và vận hành trong ngày"
        action={
          <button className="primary-button">
            + Tiếp nhận học viên
          </button>
        }
      />

      <section className="summary-grid">
        {summaryCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            note={card.note}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="dashboard-grid">
        <SectionCard
          title="Lịch học hôm nay"
          subtitle="Thứ Hai, 20 tháng 7"
          actions={
            <button type="button" className="text-button">
              Xem thời khóa biểu
            </button>
          }
          className="section-card--wide"
        >
          <div className="class-list">
            {todayClasses.map((item) => (
              <div
                className="class-row"
                key={`${item.time}-${item.className}`}
              >
                <div className="class-row__time">{item.time}</div>
                <div className="class-row__main">
                  <strong>{item.className}</strong>
                  <span>{item.teacher}</span>
                </div>
                <div className="class-row__room">{item.room}</div>
                <button
                  type="button"
                  className="secondary-button"
                >
                  Điểm danh
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Trạng thái hệ thống"
          subtitle="Kết nối dịch vụ nền tảng"
        >
          <div className="system-status">
            <span
              className={[
                "system-status__dot",
                databaseConnected === true ? "is-online" : "",
                databaseConnected === false ? "is-offline" : "",
              ].join(" ")}
            />

            <div>
              <strong>
                {databaseConnected === null
                  ? "Đang kiểm tra..."
                  : databaseConnected
                    ? "Database hoạt động"
                    : "Database chưa kết nối"}
              </strong>
              <small>MySQL · SchoolCenter</small>
            </div>
          </div>
        </SectionCard>
      </section>
    </>
  );
}
