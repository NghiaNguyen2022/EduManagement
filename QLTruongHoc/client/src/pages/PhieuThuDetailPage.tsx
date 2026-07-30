import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { appUrl } from "../utils/appUrl";

import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { getPhieuThuDetailApi } from "../features/taiChinh/taiChinhApi";
import type { PhieuThuDetail } from "../features/taiChinh/taiChinhTypes";
import { soTienBangChu } from "../utils/soTienBangChu";

const PHUONG_THUC_LABEL: Record<string, string> = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  the: "Thẻ",
  khac: "Khác",
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

export function PhieuThuDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("in") === "1";

  const [detail, setDetail] = useState<PhieuThuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getPhieuThuDetailApi(Number(id))
      .then(setDetail)
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải chi tiết phiếu thu.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (autoPrint && detail) {
      window.print();
    }
  }, [autoPrint, detail]);

  if (loading || !detail) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Phiếu thu"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Phiếu thu học phí"
        action={
          <div className="row-actions no-print">
            <button
              type="button"
              className="text-button"
              onClick={() => window.print()}
            >
              In biên nhận
            </button>

            <GuardedLink
              to={`/finance/ky-thu/${detail.kyThu.id}`}
              className="text-button"
            >
              ← Kỳ thu
            </GuardedLink>
          </div>
        }
      />

      {error ? <div className="form-error no-print">{error}</div> : null}

      <div className="phieu-slip">
        <div className="phieu-slip__header">
          {detail.mauIn.hienThiLogo && detail.donVi.hinhAnhUrl ? (
            <img src={appUrl(detail.donVi.hinhAnhUrl)} alt="" className="phieu-slip__logo" />
          ) : null}

          <div className="phieu-slip__donvi">
            <strong>{detail.donVi.tenDonVi}</strong>
            {detail.donVi.diaChi ? <span>{detail.donVi.diaChi}</span> : null}
            {detail.donVi.soDienThoai || detail.donVi.email ? (
              <span>
                {[detail.donVi.soDienThoai, detail.donVi.email].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </div>
        </div>

        <div className="phieu-slip__title">
          <h1>Phiếu thu học phí</h1>
          <p>
            Số phiếu: {detail.soPhieu} · Ngày lập: {detail.ngayThu}
          </p>
        </div>

        <div className="phieu-slip__body">
          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Học sinh</span>
            <span className="phieu-slip__row-value">
              {detail.hocSinh.hoTen} ({detail.hocSinh.maHocSinh})
            </span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Lớp học</span>
            <span className="phieu-slip__row-value">
              {detail.lopHoc ? `${detail.lopHoc.tenLop} (${detail.lopHoc.maLop})` : "—"}
            </span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Kỳ thu</span>
            <span className="phieu-slip__row-value">
              {detail.kyThu.tenKyThu} ({detail.kyThu.maKyThu})
            </span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Số tiền</span>
            <span className="phieu-slip__row-value">{formatTien(detail.soTien)}</span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Phương thức</span>
            <span className="phieu-slip__row-value">{PHUONG_THUC_LABEL[detail.phuongThuc]}</span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Nội dung</span>
            <span className="phieu-slip__row-value">{detail.ghiChu || "—"}</span>
          </div>
        </div>

        <p className="phieu-slip__amount-words">
          Bằng chữ: {soTienBangChu(Number(detail.soTien))}
        </p>

        {detail.mauIn.ghiChuFooter ? (
          <p className="phieu-slip__footer-note">{detail.mauIn.ghiChuFooter}</p>
        ) : null}

        <div className="phieu-slip__signatures">
          <div className="phieu-slip__signature">
            <strong>{detail.mauIn.nhanKyNguoiNop}</strong>
            <small>(Ký, ghi rõ họ tên)</small>
            <div className="phieu-slip__signature-space" />
          </div>

          <div className="phieu-slip__signature">
            <strong>{detail.mauIn.nhanKyNguoiLap}</strong>
            <small>(Ký, ghi rõ họ tên)</small>
            <div className="phieu-slip__signature-space" />
          </div>
        </div>
      </div>
    </div>
  );
}
