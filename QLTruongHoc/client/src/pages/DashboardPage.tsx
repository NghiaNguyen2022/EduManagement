import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { getDashboardSummaryApi } from "../features/dashboard/dashboardApi";
import type { DashboardSummary } from "../features/dashboard/dashboardTypes";

type DashboardPageProps = {
  databaseConnected: boolean | null;
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function formatToday() {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
}

export function DashboardPage({ databaseConnected }: DashboardPageProps) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getDashboardSummaryApi()
      .then((data) => {
        if (!active) return;
        setSummary(data);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError instanceof Error ? loadError.message : "Không thể tải số liệu tổng quan.",
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auth?.currentOrganization?.id]);

  const summaryCards = [
    {
      title: "Học sinh đang học",
      value: summary?.hocSinhDangHoc ?? 0,
      note: 'Đang có trạng thái "Đang học"',
      icon: "♙",
      tone: "primary" as const,
    },
    {
      title: "Lớp đang hoạt động",
      value: summary?.lopDangHoc ?? 0,
      note: 'Đang có trạng thái "Đang học"',
      icon: "▣",
      tone: "secondary" as const,
    },
    {
      title: "Công nợ hiện tại",
      value: summary ? formatTien(summary.congNoHienTai) : "—",
      note: "Tổng khoản phải thu còn lại",
      icon: "▤",
      tone: "warning" as const,
    },
    {
      title: "Lead mới trong tháng",
      value: summary?.leadMoiThangNay ?? 0,
      note: "Tính từ đầu tháng tới hôm nay",
      icon: "✓",
      tone: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Bảng điều hành"
        subtitle="Theo dõi nhanh tình hình tuyển sinh, lớp học, học viên và vận hành trong ngày"
        action={
          <button className="primary-button" onClick={() => navigate("/admissions")}>
            + Tiếp nhận học viên
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}

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
          subtitle={formatToday()}
          actions={
            <button type="button" className="text-button" onClick={() => navigate("/schedule")}>
              Xem thời khóa biểu
            </button>
          }
          className="section-card--wide"
        >
          <div className="class-list">
            {loading ? (
              <div className="empty-cell">Đang tải...</div>
            ) : (summary?.lichHocHomNay.length ?? 0) === 0 ? (
              <div className="empty-cell">Không có buổi học nào hôm nay.</div>
            ) : (
              summary!.lichHocHomNay.map((item) => (
                <div className="class-row" key={item.buoiHoc.id}>
                  <div className="class-row__time">
                    {item.buoiHoc.gioBatDau.slice(0, 5)} – {item.buoiHoc.gioKetThuc.slice(0, 5)}
                  </div>
                  <div className="class-row__main">
                    <strong>{item.lopHocTenLop}</strong>
                    <span>{item.giaoVienHoTen || "Chưa phân công"}</span>
                  </div>
                  <div className="class-row__room">{item.buoiHoc.phongHoc || "—"}</div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/attendance")}
                  >
                    Điểm danh
                  </button>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Trạng thái hệ thống" subtitle="Kết nối dịch vụ nền tảng">
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
