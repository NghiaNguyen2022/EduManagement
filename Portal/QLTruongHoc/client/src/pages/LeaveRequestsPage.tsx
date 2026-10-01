import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { duyetDonXinPhepApi, listDonXinPhepStaffApi } from "../features/xinPhep/xinPhepApi";
import type { DonXinPhepRow, TrangThaiDonXinPhep } from "../features/xinPhep/xinPhepTypes";

const TRANG_THAI_LABEL: Record<TrangThaiDonXinPhep, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

type PendingAction = {
  id: number;
  hoTen: string;
  chapNhan: boolean;
};

export function LeaveRequestsPage() {
  const { auth } = useAuth();

  const canDuyet = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("diem_danh.thuc_hien")
    );
  }, [auth]);

  const [rows, setRows] = useState<DonXinPhepRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await listDonXinPhepStaffApi();
      setRows(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải danh sách đơn xin phép.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [auth?.currentOrganization?.id]);

  async function handleConfirmAction() {
    if (!pendingAction) return;

    setBusy(true);
    setActionError("");

    try {
      await duyetDonXinPhepApi(pendingAction.id, { chapNhan: pendingAction.chapNhan });
      setNotice(
        pendingAction.chapNhan
          ? "Đã duyệt đơn, tự động cập nhật điểm danh các buổi liên quan."
          : "Đã từ chối đơn.",
      );
      setPendingAction(null);
      await load();
    } catch (actionErr) {
      setActionError(
        actionErr instanceof Error ? actionErr.message : "Không thể xử lý đơn xin phép.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Đơn xin phép"
        subtitle="Danh sách đơn xin phép nghỉ do phụ huynh gửi trong đơn vị đang chọn"
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Danh sách đơn"
        subtitle={loading ? "Đang tải dữ liệu..." : `${rows.length} đơn`}
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Lớp</th>
                <th>Khoảng ngày</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                {canDuyet ? <th>Thao tác</th> : null}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.donXinPhep.id}>
                  <td>
                    <strong>{row.hocSinh.hoTen}</strong>
                    <small>{row.hocSinh.maHocSinh}</small>
                  </td>
                  <td>{row.lopHoc.tenLop}</td>
                  <td>
                    {row.donXinPhep.tuNgay} - {row.donXinPhep.denNgay}
                  </td>
                  <td>{row.donXinPhep.lyDo}</td>
                  <td>{TRANG_THAI_LABEL[row.donXinPhep.trangThai]}</td>
                  {canDuyet ? (
                    <td>
                      {row.donXinPhep.trangThai === "cho_duyet" ? (
                        <div className="section-card-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setPendingAction({
                                id: row.donXinPhep.id,
                                hoTen: row.hocSinh.hoTen,
                                chapNhan: true,
                              })
                            }
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setPendingAction({
                                id: row.donXinPhep.id,
                                hoTen: row.hocSinh.hoTen,
                                chapNhan: false,
                              })
                            }
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={canDuyet ? 6 : 5} className="empty-cell">
                    Chưa có đơn xin phép nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.chapNhan ? "Duyệt đơn xin phép" : "Từ chối đơn xin phép"}
        message={
          pendingAction
            ? pendingAction.chapNhan
              ? `Duyệt đơn xin phép của ${pendingAction.hoTen}? Hệ thống sẽ tự động ghi "vắng có phép" cho các buổi học chưa điểm danh trong khoảng ngày xin phép.`
              : `Từ chối đơn xin phép của ${pendingAction.hoTen}?`
            : ""
        }
        confirmLabel={pendingAction?.chapNhan ? "Duyệt" : "Từ chối"}
        danger={!pendingAction?.chapNhan}
        busy={busy}
        error={actionError}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => {
          setPendingAction(null);
          setActionError("");
        }}
      />
    </div>
  );
}
