import { useEffect, useMemo, useState } from "react";

import { SelectField } from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { duyetDieuChinhApi, listYeuCauDieuChinhApi } from "../features/taiChinh/taiChinhApi";
import type {
  DieuChinhListItem,
  LoaiDieuChinh,
  TrangThaiDieuChinh,
} from "../features/taiChinh/taiChinhTypes";

const LOAI_DIEU_CHINH_LABEL: Record<LoaiDieuChinh, string> = {
  hoan_phi: "Hoàn phí",
  chuyen_phi: "Chuyển phí",
  bao_luu: "Bảo lưu",
};

const TRANG_THAI_LABEL: Record<TrangThaiDieuChinh, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

function formatTien(value: string) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

export function DieuChinhListPage() {
  const { auth } = useAuth();
  const isHeThong = auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canDuyet = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri") || permissions.includes("tai_chinh.duyet");
  }, [auth]);

  const [trangThai, setTrangThai] = useState<TrangThaiDieuChinh | "">("cho_duyet");
  const [items, setItems] = useState<DieuChinhListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDuyet, setConfirmDuyet] = useState<{
    dieuChinh: DieuChinhListItem;
    quyetDinh: "duyet" | "tu_choi";
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  function load() {
    setLoading(true);
    setError("");

    listYeuCauDieuChinhApi(trangThai || undefined)
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải danh sách yêu cầu điều chỉnh."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trangThai]);

  async function handleConfirmDuyet() {
    if (!confirmDuyet) return;

    setConfirmBusy(true);
    setConfirmError("");

    try {
      await duyetDieuChinhApi(confirmDuyet.dieuChinh.id, { quyetDinh: confirmDuyet.quyetDinh });
      setConfirmDuyet(null);
      load();
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Không thể xử lý yêu cầu điều chỉnh.",
      );
    } finally {
      setConfirmBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Yêu cầu điều chỉnh"
        subtitle={
          isHeThong
            ? "Hoàn phí, chuyển phí, bảo lưu của tất cả đơn vị — chỉ xem, duyệt tại đúng đơn vị"
            : "Hoàn phí, chuyển phí, bảo lưu đang chờ hoặc đã xử lý tại đơn vị"
        }
      />

      <SectionCard title="Bộ lọc" subtitle="Lọc theo trạng thái xử lý">
        <SelectField
          label="Trạng thái"
          value={trangThai}
          placeholder="Tất cả"
          options={[
            { value: "cho_duyet", label: "Chờ duyệt" },
            { value: "da_duyet", label: "Đã duyệt" },
            { value: "tu_choi", label: "Từ chối" },
          ]}
          onChange={(value) => setTrangThai(value as TrangThaiDieuChinh | "")}
        />
      </SectionCard>

      <SectionCard
        title="Danh sách yêu cầu"
        subtitle={loading ? "Đang tải dữ liệu..." : `${items.length} yêu cầu`}
      >
        {error ? <div className="form-error">{error}</div> : null}

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Kỳ thu</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Người tạo</th>
                <th>Người duyệt</th>
                {isHeThong ? <th>Đơn vị</th> : null}
                {canDuyet ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.hocSinh.hoTen}</strong>
                    <small>{item.hocSinh.maHocSinh}</small>
                  </td>
                  <td>{item.kyThu.tenKyThu}</td>
                  <td>{LOAI_DIEU_CHINH_LABEL[item.loaiDieuChinh]}</td>
                  <td>{item.loaiDieuChinh === "bao_luu" ? "—" : formatTien(item.soTien)}</td>
                  <td>{item.lyDo}</td>
                  <td>
                    <span className={`status-badge status-badge--${item.trangThai}`}>
                      {TRANG_THAI_LABEL[item.trangThai]}
                    </span>
                  </td>
                  <td>{item.nguoiTao.hoTen}</td>
                  <td>{item.nguoiDuyet?.hoTen ?? "—"}</td>
                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={item.donVi} to="/finance/dieu-chinh" />
                    </td>
                  ) : null}
                  {canDuyet ? (
                    <td>
                      {item.trangThai === "cho_duyet" && !isHeThong ? (
                        item.nguoiTaoId === auth?.user.id ? (
                          <small>Không thể tự duyệt yêu cầu của mình</small>
                        ) : (
                          <div className="row-actions">
                            <button
                              type="button"
                              className="text-button"
                              onClick={() =>
                                setConfirmDuyet({ dieuChinh: item, quyetDinh: "duyet" })
                              }
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() =>
                                setConfirmDuyet({ dieuChinh: item, quyetDinh: "tu_choi" })
                              }
                            >
                              Từ chối
                            </button>
                          </div>
                        )
                      ) : item.trangThai === "cho_duyet" ? (
                        <small>Duyệt tại đơn vị {item.donVi?.tenDonVi}</small>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && items.length === 0 ? (
                <tr>
                  <td
                    colSpan={isHeThong ? (canDuyet ? 10 : 9) : canDuyet ? 9 : 8}
                    className="empty-cell"
                  >
                    Không có yêu cầu điều chỉnh nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={confirmDuyet !== null}
        title={
          confirmDuyet?.quyetDinh === "duyet"
            ? "Duyệt yêu cầu điều chỉnh"
            : "Từ chối yêu cầu điều chỉnh"
        }
        message={
          confirmDuyet
            ? `${confirmDuyet.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"} yêu cầu ${LOAI_DIEU_CHINH_LABEL[
                confirmDuyet.dieuChinh.loaiDieuChinh
              ].toLowerCase()} (${confirmDuyet.dieuChinh.lyDo}) do ${confirmDuyet.dieuChinh.nguoiTao.hoTen} tạo?`
            : ""
        }
        confirmLabel={confirmDuyet?.quyetDinh === "duyet" ? "Duyệt" : "Từ chối"}
        danger={confirmDuyet?.quyetDinh === "tu_choi"}
        busy={confirmBusy}
        error={confirmError}
        onConfirm={() => void handleConfirmDuyet()}
        onCancel={() => {
          setConfirmDuyet(null);
          setConfirmError("");
        }}
      />
    </div>
  );
}
