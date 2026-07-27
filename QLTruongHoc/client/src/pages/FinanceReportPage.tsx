import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DateField } from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
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

function isoDate(year: number, monthIndex: number, day: number) {
  const date = new Date(Date.UTC(year, monthIndex, day));
  return date.toISOString().slice(0, 10);
}

function lastDayOfMonth(year: number, monthIndex: number) {
  return isoDate(year, monthIndex + 1, 0);
}

type KhoangThoiGianPreset = "thang_nay" | "thang_truoc" | "quy_nay" | "nam_nay";

const PRESET_LABEL: Record<KhoangThoiGianPreset, string> = {
  thang_nay: "Tháng này",
  thang_truoc: "Tháng trước",
  quy_nay: "Quý này",
  nam_nay: "Năm nay",
};

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(cells: string[]) {
  return cells.map(escapeCsvCell).join(",");
}

function taiXuongCsv(filename: string, rows: string[]) {
  const noiDung = "﻿" + rows.join("\r\n");
  const blob = new Blob([noiDung], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getPresetRange(preset: KhoangThoiGianPreset) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (preset === "thang_nay") {
    return { tuNgay: isoDate(year, month, 1), denNgay: today() };
  }

  if (preset === "thang_truoc") {
    const truocMonth = month === 0 ? 11 : month - 1;
    const truocYear = month === 0 ? year - 1 : year;
    return {
      tuNgay: isoDate(truocYear, truocMonth, 1),
      denNgay: lastDayOfMonth(truocYear, truocMonth),
    };
  }

  if (preset === "quy_nay") {
    const quyStartMonth = Math.floor(month / 3) * 3;
    return { tuNgay: isoDate(year, quyStartMonth, 1), denNgay: today() };
  }

  return { tuNgay: isoDate(year, 0, 1), denNgay: today() };
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

  async function loadReport(khoangTuNgay = tuNgay, khoangDenNgay = denNgay) {
    setLoading(true);
    setError("");

    try {
      const data = await getBaoCaoTaiChinhApi(khoangTuNgay, khoangDenNgay);
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

  function handleChonPreset(preset: KhoangThoiGianPreset) {
    const range = getPresetRange(preset);
    setTuNgay(range.tuNgay);
    setDenNgay(range.denNgay);
    void loadReport(range.tuNgay, range.denNgay);
  }

  function handleXuatCsv() {
    if (!report) return;

    const rows = [
      toCsvRow(["Báo cáo tài chính", `${tuNgay} → ${denNgay}`]),
      "",
      toCsvRow(["Tổng thu trong khoảng", report.tongThu]),
      toCsvRow(["Số phiếu thu", String(report.soPhieuThu)]),
      toCsvRow(["Hoàn phí đã duyệt", report.tongHoanPhi]),
      toCsvRow(["Thu ròng", report.tongThuRong]),
      toCsvRow(["Tổng công nợ hiện tại", report.tongCongNo]),
      toCsvRow(["Tổng chi trong khoảng", report.tongChiPhi]),
      toCsvRow(["Lãi/lỗ ròng", report.laiLoRong]),
      "",
      toCsvRow(
        isHeThong
          ? ["Kỳ thu", "Mã kỳ thu", "Đơn vị", "Phải thu", "Đã thu", "Còn lại"]
          : ["Kỳ thu", "Mã kỳ thu", "Phải thu", "Đã thu", "Còn lại"],
      ),
      ...report.theoKyThu.map((item) =>
        toCsvRow(
          isHeThong
            ? [
                item.kyThu.tenKyThu,
                item.kyThu.maKyThu,
                item.donVi?.tenDonVi ?? "",
                item.phaiThu,
                item.daThu,
                item.conLai,
              ]
            : [item.kyThu.tenKyThu, item.kyThu.maKyThu, item.phaiThu, item.daThu, item.conLai],
        ),
      ),
    ];

    taiXuongCsv(`bao-cao-tai-chinh_${tuNgay}_${denNgay}.csv`, rows);
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
        <div className="row-actions">
          {(Object.keys(PRESET_LABEL) as KhoangThoiGianPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              className="text-button"
              disabled={loading}
              onClick={() => handleChonPreset(preset)}
            >
              {PRESET_LABEL[preset]}
            </button>
          ))}
        </div>

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
              title="Hoàn phí đã duyệt"
              value={formatTien(report.tongHoanPhi)}
              note={`Thu ròng ${formatTien(report.tongThuRong)}`}
              tone="info"
            />

            <StatCard
              title="Tổng công nợ hiện tại"
              value={formatTien(report.tongCongNo)}
              note="Toàn bộ khoản còn phải thu"
              tone="warning"
            />

            <StatCard
              title="Tổng chi trong khoảng"
              value={formatTien(report.tongChiPhi)}
              note="Chi phí vận hành đã ghi nhận"
              tone="danger"
            />

            <StatCard
              title="Lãi/lỗ ròng"
              value={formatTien(report.laiLoRong)}
              note="Thu ròng − chi phí trong khoảng"
              tone={Number(report.laiLoRong) >= 0 ? "success" : "danger"}
            />
          </section>

          <SectionCard
            title="Thu theo kỳ thu"
            subtitle={`${report.theoKyThu.length} kỳ thu`}
            actions={
              <button type="button" className="text-button" onClick={handleXuatCsv}>
                Xuất CSV
              </button>
            }
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
                        <EntityLink
                          to={`/finance/ky-thu/${item.kyThu.id}`}
                          donVi={item.donVi}
                        >
                          <strong>{item.kyThu.tenKyThu}</strong>
                        </EntityLink>
                        <small>{item.kyThu.maKyThu}</small>
                      </td>
                      {isHeThong ? (
                        <td>
                          <OrgLink donVi={item.donVi} to="/finance/bao-cao" />
                        </td>
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
