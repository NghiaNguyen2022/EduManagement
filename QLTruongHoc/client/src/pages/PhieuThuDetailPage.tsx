import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TextField } from "../components/form";
import { GuardedLink } from "../components/shared/GuardedLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { getPhieuThuDetailApi } from "../features/taiChinh/taiChinhApi";
import type { PhieuThuDetail } from "../features/taiChinh/taiChinhTypes";

const PHUONG_THUC_LABEL: Record<string, string> = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  the: "Thẻ",
  khac: "Khác",
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

const noop = () => {};

export function PhieuThuDetailPage() {
  const { id } = useParams();

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
        title={`Phiếu thu ${detail.soPhieu}`}
        subtitle={`Kỳ thu ${detail.kyThu.tenKyThu}`}
        action={
          <div className="row-actions">
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

      {error ? <div className="form-error">{error}</div> : null}

      <SectionCard title="Thông tin phiếu thu">
        <div className="user-create-form">
          <TextField label="Số phiếu" value={detail.soPhieu} disabled onChange={noop} />

          <TextField
            label="Học sinh"
            value={`${detail.hocSinh.hoTen} (${detail.hocSinh.maHocSinh})`}
            disabled
            onChange={noop}
          />

          <TextField
            label="Kỳ thu"
            value={`${detail.kyThu.tenKyThu} (${detail.kyThu.maKyThu})`}
            disabled
            onChange={noop}
          />

          <TextField
            label="Số tiền"
            value={formatTien(detail.soTien)}
            disabled
            onChange={noop}
          />

          <TextField
            label="Phương thức"
            value={PHUONG_THUC_LABEL[detail.phuongThuc]}
            disabled
            onChange={noop}
          />

          <TextField
            label="Ngày thu"
            value={detail.ngayThu}
            disabled
            onChange={noop}
          />

          <TextField
            label="Ghi chú"
            value={detail.ghiChu || "—"}
            disabled
            onChange={noop}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Khoản phải thu liên quan"
        subtitle="Số dư tại thời điểm hiện tại (không phải tại thời điểm lập phiếu)"
      >
        <div className="user-create-form">
          <TextField
            label="Tổng tiền"
            value={formatTien(detail.khoanPhaiThu.tongTien)}
            disabled
            onChange={noop}
          />

          <TextField
            label="Giảm trừ"
            value={formatTien(detail.khoanPhaiThu.giamTru)}
            disabled
            onChange={noop}
          />

          <TextField
            label="Đã thu"
            value={formatTien(detail.khoanPhaiThu.daThu)}
            disabled
            onChange={noop}
          />

          <TextField
            label="Còn lại"
            value={formatTien(detail.khoanPhaiThu.conLai)}
            disabled
            onChange={noop}
          />
        </div>
      </SectionCard>
    </div>
  );
}
