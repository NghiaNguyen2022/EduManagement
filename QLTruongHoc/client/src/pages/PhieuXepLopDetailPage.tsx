import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { getPhieuXepLopDetailApi } from "../features/lopHoc/lopHocApi";
import type { PhieuXepLopDetail } from "../features/lopHoc/lopHocTypes";

export function PhieuXepLopDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("in") === "1";

  const [detail, setDetail] = useState<PhieuXepLopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getPhieuXepLopDetailApi(Number(id))
      .then(setDetail)
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải chi tiết phiếu xếp lớp.",
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
        <PageHeader title="Phiếu xếp lớp" subtitle={error || "Đang tải dữ liệu..."} />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Phiếu xếp lớp"
        action={
          <div className="row-actions no-print">
            <button type="button" className="text-button" onClick={() => window.print()}>
              In phiếu
            </button>

            <GuardedLink to={`/classes/${detail.lopHoc.id}`} className="text-button">
              ← Lớp học
            </GuardedLink>
          </div>
        }
      />

      {error ? <div className="form-error no-print">{error}</div> : null}

      <div className="phieu-slip">
        <div className="phieu-slip__header">
          {detail.mauIn.hienThiLogo && detail.donVi.hinhAnhUrl ? (
            <img src={detail.donVi.hinhAnhUrl} alt="" className="phieu-slip__logo" />
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
          <h1>Phiếu xếp lớp</h1>
          <p>
            Số phiếu: {detail.soPhieu} · Ngày vào lớp: {detail.ngayVaoLop}
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
              {detail.lopHoc.tenLop} ({detail.lopHoc.maLop})
            </span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Phòng học</span>
            <span className="phieu-slip__row-value">{detail.lopHoc.phongHoc || "—"}</span>
          </div>

          <div className="phieu-slip__row">
            <span className="phieu-slip__row-label">Kết quả test đầu vào</span>
            <span className="phieu-slip__row-value">{detail.ketQuaTestDauVao || "—"}</span>
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
            <strong>{detail.mauIn.nhanKyNguoiLap}</strong>
            <small>(Ký, ghi rõ họ tên)</small>
            <div className="phieu-slip__signature-space" />
          </div>
        </div>
      </div>
    </div>
  );
}
