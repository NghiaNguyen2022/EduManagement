import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { SelectField, TextField } from "../components/form";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { GuardedLink } from "../components/shared/GuardedLink";
import { NotificationDialog } from "../components/shared/NotificationDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import type { AuthOrganization } from "../features/auth/authTypes";
import {
  addAssignmentApi,
  listAssignmentsApi,
  listAvailableOrganizationsApi,
  removeAssignmentApi,
} from "../features/users/userAssignmentApi";
import type { UserAssignmentItem } from "../features/users/userAssignmentTypes";
import {
  getUserDetailApi,
  listRolesApi,
  resetPasswordApi,
  updateUserStatusApi,
} from "../features/users/userApi";
import type { RoleOption, UserDetail } from "../features/users/userTypes";

const TRANG_THAI_LABEL: Record<string, string> = {
  hoat_dong: "Hoạt động",
  tam_khoa: "Tạm khóa",
  ngung: "Ngừng",
};

const noop = () => {};

export function UserDetailPage() {
  const { id } = useParams();
  const { auth } = useAuth();

  const [item, setItem] = useState<UserDetail | null>(null);
  const [assignments, setAssignments] = useState<UserAssignmentItem[]>([]);
  const [organizations, setOrganizations] = useState<AuthOrganization[]>(
    [],
  );
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [organizationId, setOrganizationId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [addingAssignment, setAddingAssignment] = useState(false);

  const [pendingRemove, setPendingRemove] =
    useState<UserAssignmentItem | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const [confirmStatusChange, setConfirmStatusChange] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("nguoi_dung.quan_ly")
    );
  }, [auth]);

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [detail, assignmentRows, organizationRows, roleRows] =
        await Promise.all([
          getUserDetailApi(Number(id)),
          listAssignmentsApi(Number(id)),
          listAvailableOrganizationsApi(),
          listRolesApi(),
        ]);

      setItem(detail);
      setAssignments(assignmentRows);
      setOrganizations(organizationRows);
      setRoles(roleRows);

      if (organizationRows.length > 0 && !organizationId) {
        setOrganizationId(String(organizationRows[0].id));
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [id]);

  async function handleAddAssignment() {
    if (!id || !organizationId || !roleId) return;

    setError("");
    setNotice("");
    setAddingAssignment(true);

    try {
      await addAssignmentApi(Number(id), {
        organizationId: Number(organizationId),
        roleId: Number(roleId),
      });
      setNotice("Đã thêm phân công vai trò.");
      setRoleId("");
      await loadData();
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Không thể thêm phân công.",
      );
    } finally {
      setAddingAssignment(false);
    }
  }

  async function handleRemoveAssignment() {
    if (!id || !pendingRemove) return;

    setRemoveBusy(true);
    setRemoveError("");

    try {
      await removeAssignmentApi(Number(id), pendingRemove.id);
      setNotice(
        `Đã xóa vai trò ${pendingRemove.tenVaiTro} tại ${pendingRemove.tenDonVi}.`,
      );
      setPendingRemove(null);
      await loadData();
    } catch (removeErr) {
      setRemoveError(
        removeErr instanceof Error
          ? removeErr.message
          : "Không thể xóa phân công.",
      );
    } finally {
      setRemoveBusy(false);
    }
  }

  async function handleToggleStatus() {
    if (!id || !item) return;

    setStatusBusy(true);
    setStatusError("");

    try {
      const trangThaiMoi =
        item.trangThai === "hoat_dong" ? "tam_khoa" : "hoat_dong";

      await updateUserStatusApi(Number(id), trangThaiMoi);
      setNotice(
        `Đã đổi trạng thái sang ${TRANG_THAI_LABEL[trangThaiMoi]}.`,
      );
      setConfirmStatusChange(false);
      await loadData();
    } catch (statusErr) {
      setStatusError(
        statusErr instanceof Error
          ? statusErr.message
          : "Không thể đổi trạng thái.",
      );
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleResetPassword() {
    if (!id) return;

    setResetBusy(true);
    setResetError("");

    try {
      const result = await resetPasswordApi(Number(id));
      setConfirmReset(false);
      setTemporaryPassword(result.temporaryPassword);
    } catch (resetErr) {
      setResetError(
        resetErr instanceof Error
          ? resetErr.message
          : "Không thể đặt lại mật khẩu.",
      );
    } finally {
      setResetBusy(false);
    }
  }

  if (loading || !item) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Người dùng"
          subtitle={error || "Đang tải dữ liệu..."}
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={item.hoTen}
        subtitle={`Tên đăng nhập ${item.tenDangNhap}`}
        action={
          <GuardedLink to="/users" className="text-button">
            ← Quản lý người dùng
          </GuardedLink>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      <SectionCard
        title="Trạng thái tài khoản"
        subtitle={`Hiện tại: ${TRANG_THAI_LABEL[item.trangThai]}${
          item.batBuocDoiMatKhau ? " · Bắt buộc đổi mật khẩu" : ""
        }`}
        actions={
          canManage ? (
            <div className="row-actions">
              <button
                type="button"
                className={
                  item.trangThai === "hoat_dong"
                    ? "danger-button"
                    : "primary-button"
                }
                onClick={() => {
                  setStatusError("");
                  setConfirmStatusChange(true);
                }}
              >
                {item.trangThai === "hoat_dong" ? "Khóa" : "Mở khóa"}
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setResetError("");
                  setConfirmReset(true);
                }}
              >
                Reset mật khẩu
              </button>
            </div>
          ) : null
        }
      >
        <div className="user-create-form">
          <TextField
            label="Tên đăng nhập"
            value={item.tenDangNhap}
            disabled
            onChange={noop}
          />
          <TextField label="Họ tên" value={item.hoTen} disabled onChange={noop} />
          <TextField
            label="Email"
            value={item.email || "—"}
            disabled
            onChange={noop}
          />
          <TextField
            label="Số điện thoại"
            value={item.soDienThoai || "—"}
            disabled
            onChange={noop}
          />
        </div>
      </SectionCard>

      {canManage ? (
        <SectionCard
          title="Vai trò theo đơn vị"
          subtitle="Một người dùng có thể được gán nhiều vai trò ở nhiều đơn vị khác nhau."
        >
          <div className="user-toolbar">
            <SelectField
              label="Đơn vị"
              value={organizationId}
              options={organizations.map((organization) => ({
                value: String(organization.id),
                label: organization.tenDonVi,
              }))}
              onChange={setOrganizationId}
            />

            <SelectField
              label="Vai trò"
              value={roleId}
              placeholder="Chọn vai trò"
              options={roles.map((role) => ({
                value: String(role.id),
                label: role.tenVaiTro,
              }))}
              onChange={setRoleId}
            />

            <button
              type="button"
              className="primary-button"
              disabled={addingAssignment || !organizationId || !roleId}
              onClick={() => void handleAddAssignment()}
            >
              {addingAssignment ? "Đang thêm..." : "Thêm phân công"}
            </button>
          </div>

          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Vai trò</th>
                  <th>Đơn vị</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <strong>{assignment.tenVaiTro}</strong>
                      <small>{assignment.maVaiTro}</small>
                    </td>
                    <td>
                      <span>{assignment.tenDonVi}</span>
                      <small>{assignment.maDonVi}</small>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setRemoveError("");
                          setPendingRemove(assignment);
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-cell">
                      Chưa có phân công nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}

      <ConfirmDialog
        open={confirmStatusChange}
        title={
          item.trangThai === "hoat_dong" ? "Khóa tài khoản" : "Mở khóa tài khoản"
        }
        message={
          item.trangThai === "hoat_dong"
            ? `Khóa tài khoản ${item.hoTen}? Người dùng sẽ không đăng nhập được cho tới khi mở khóa lại.`
            : `Mở khóa tài khoản ${item.hoTen}?`
        }
        confirmLabel={item.trangThai === "hoat_dong" ? "Khóa" : "Mở khóa"}
        danger={item.trangThai === "hoat_dong"}
        busy={statusBusy}
        error={statusError}
        onConfirm={() => void handleToggleStatus()}
        onCancel={() => setConfirmStatusChange(false)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset mật khẩu"
        message={`Đặt lại mật khẩu tạm cho ${item.hoTen}? Người dùng sẽ phải đổi mật khẩu ngay lần đăng nhập tiếp theo.`}
        confirmLabel="Reset mật khẩu"
        danger
        busy={resetBusy}
        error={resetError}
        onConfirm={() => void handleResetPassword()}
        onCancel={() => setConfirmReset(false)}
      />

      <NotificationDialog
        open={Boolean(temporaryPassword)}
        title="Đã đặt lại mật khẩu"
        message={`Mật khẩu tạm mới: ${temporaryPassword}. Hãy gửi lại cho người dùng và yêu cầu đổi ngay lần đăng nhập đầu tiên.`}
        tone="success"
        onClose={() => setTemporaryPassword("")}
      />

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Xóa phân công vai trò"
        message={
          pendingRemove
            ? `Xóa vai trò ${pendingRemove.tenVaiTro} tại ${pendingRemove.tenDonVi}?`
            : ""
        }
        confirmLabel="Xóa"
        danger
        busy={removeBusy}
        error={removeError}
        onConfirm={() => void handleRemoveAssignment()}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
