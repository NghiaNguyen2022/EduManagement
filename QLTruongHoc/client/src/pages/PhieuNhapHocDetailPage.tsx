import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { appUrl } from "../utils/appUrl";

import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { getPhieuNhapHocDetailApi } from "../features/hocSinh/hocSinhApi";
import type { PhieuNhapHocDetail } from "../features/hocSinh/hocSinhTypes";

const MOI_QUAN_HE_LABEL: Record<string, string> = {
  cha: "Cha",
  me: "Mẹ",
  ong: "Ông",
  ba: "Bà",
  nguoi_giam_ho: "Người giám hộ",
  khac: "Khác",
};

export function PhieuNhapHocDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("in") === "1";

  const [detail, setDetail] = useState<PhieuNhapHocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getPhieuNhapHocDetailApi(Number(id))
      .then(setDetail)
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải chi tiết phiếu nhập học.",
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
          title="Phiếu xác nhận nhập học"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Phiếu xác nhận nhập học"
        action={
          <div className="row-actions no-print">
            <button type="button" className="text-button" onClick={() => window.print()}>
              In phiếu
            </button>

            <GuardedLink to={`/students/${detail.hocSinh.id}`} className="text-button">
              ← Hồ sơ học sinh
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
          <h1>Phiếu xác nhận nhập học</h1>
          <p>
            Số phiếu: {detail.soPhieu} · Ngày nhập học: {detail.ngayNhapHoc}
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
            <span className="phieu-slip__row-label">Ngày sinh</span>
            <span className="phieu-slip__row-value">{detail.hocSinh.ngaySinh || "—"}</span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Phụ huynh liên hệ</span>
            <span className="phieu-slip__row-value">
              {detail.phuHuynh
                ? `${detail.phuHuynh.hoTen} (${MOI_QUAN_HE_LABEL[detail.phuHuynh.moiQuanHe] ?? detail.phuHuynh.moiQuanHe}) — ${detail.phuHuynh.dienThoai}`
                : "—"}
            </span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Người lập phiếu</span>
            <span className="phieu-slip__row-value">{detail.nguoiLap.hoTen}</span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Ghi chú</span>
            <span className="phieu-slip__row-value">{detail.ghiChu || "—"}</span>
          </div>
        </div>

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
            <strong>{detail.mauIn.nhanKyDaiDienDonVi}</strong>
            <small>(Ký, ghi rõ họ tên)</small>
            <div className="phieu-slip__signature-space" />
          </div>
        </div>
      </div>
    </div>
  );
}
