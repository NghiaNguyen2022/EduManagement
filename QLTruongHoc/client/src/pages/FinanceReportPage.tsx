import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DateField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { StatCard } from "../components/shared/StatCard";
import { useAuth } from "../features/auth/AuthContext";
import { getBaoCaoTaiChinhApi } from "../features/taiChinh/taiChinhApi";
import type { BaoCaoTaiChinh } from "../features/taiChinh/taiChinhTypes";

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function firstDayOfMonth() {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function FinanceReportPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [tuNgay, setTuNgay] = useState(firstDayOfMonth());
  const [denNgay, setDenNgay] = useState(today());
  const [report, setReport] = useState<BaoCaoTaiChinh | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      const data = await getBaoCaoTaiChinhApi(tuNgay, denNgay);
      setReport(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải báo cáo tài chính.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [auth?.currentOrganization?.id]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Báo cáo tài chính"
        subtitle={
          isHeThong
            ? "Thu và công nợ gộp toàn bộ đơn vị đang hoạt động"
            : "Thu và công nợ trong đơn vị đang làm việc"
        }
        action={
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/finance")}
          >
            ← Tài chính
          </button>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}

      <SectionCard title="Khoảng thời gian">
        <div className="user-toolbar">
          <DateField label="Từ ngày" value={tuNgay} onChange={setTuNgay} />
          <DateField label="Đến ngày" value={denNgay} onChange={setDenNgay} />

          <button
            type="button"
            className="primary-button"
            disabled={loading}
            onClick={() => void loadReport()}
          >
            {loading ? "Đang tải..." : "Xem báo cáo"}
          </button>
        </div>
      </SectionCard>

      {report ? (
        <>
          <section className="summary-grid">
            <StatCard
              title="Tổng thu trong khoảng"
              value={formatTien(report.tongThu)}
              note={`${report.soPhieuThu} phiếu thu`}
              tone="success"
            />

            <StatCard
              title="Tổng công nợ hiện tại"
              value={formatTien(report.tongCongNo)}
              note="Toàn bộ khoản còn phải thu"
              tone="warning"
            />
          </section>

          <SectionCard
            title="Thu theo kỳ thu"
            subtitle={`${report.theoKyThu.length} kỳ thu`}
          >
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Kỳ thu</th>
                    {isHeThong ? <th>Đơn vị</th> : null}
                    <th>Phải thu</th>
                    <th>Đã thu</th>
                    <th>Còn lại</th>
                  </tr>
                </thead>

                <tbody>
                  {report.theoKyThu.map((item) => (
                    <tr key={item.kyThu.id}>
                      <td>
                        <strong>{item.kyThu.tenKyThu}</strong>
                        <small>{item.kyThu.maKyThu}</small>
                      </td>
                      {isHeThong ? (
                        <td>{item.donVi?.tenDonVi ?? "—"}</td>
                      ) : null}
                      <td>{formatTien(item.phaiThu)}</td>
                      <td>{formatTien(item.daThu)}</td>
                      <td>{formatTien(item.conLai)}</td>
                    </tr>
                  ))}

                  {report.theoKyThu.length === 0 ? (
                    <tr>
                      <td colSpan={isHeThong ? 5 : 4} className="empty-cell">
                        Chưa có kỳ thu nào.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
