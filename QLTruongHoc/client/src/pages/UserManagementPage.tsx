import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PageHeader,
} from "../components/shared/PageHeader";
import {
  SectionCard,
} from "../components/shared/SectionCard";
import {
  useAuth,
} from "../features/auth/AuthContext";
import {
  createUserApi,
  listRolesApi,
  listUsersApi,
  resetPasswordApi,
  updateUserStatusApi,
} from "../features/users/userApi";
import type {
  RoleOption,
  UserListItem,
} from "../features/users/userTypes";

type FormState = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
};

const initialForm: FormState = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  roleId: "",
};

export function UserManagementPage() {
  const { auth } = useAuth();

  const [users, setUsers] =
    useState<UserListItem[]>([]);
  const [roles, setRoles] =
    useState<RoleOption[]>([]);
  const [form, setForm] =
    useState<FormState>(initialForm);
  const [loading, setLoading] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [notice, setNotice] =
    useState("");

  const canManage = useMemo(() => {
    const permissions =
      auth?.currentOrganization?.quyen ?? [];

    return (
      permissions.includes(
        "he_thong.quan_tri",
      ) ||
      permissions.includes(
        "nguoi_dung.quan_ly",
      )
    );
  }, [auth]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [userRows, roleRows] =
        await Promise.all([
          listUsersApi(),
          canManage
            ? listRolesApi()
            : Promise.resolve([]),
        ]);

      setUsers(userRows);
      setRoles(roleRows);
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
  }, []);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const result = await createUserApi({
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        roleId: Number(form.roleId),
      });

      setNotice(
        `Đã tạo tài khoản ${form.username}. Mật khẩu tạm: ${result.temporaryPassword}`,
      );
      setForm(initialForm);
      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo tài khoản.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatus(
    user: UserListItem,
  ) {
    const nextStatus =
      user.trangThai === "hoat_dong"
        ? "tam_khoa"
        : "hoat_dong";

    setError("");
    setNotice("");

    try {
      await updateUserStatusApi(
        user.id,
        nextStatus,
      );
      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Không thể đổi trạng thái.",
      );
    }
  }

  async function handleReset(
    user: UserListItem,
  ) {
    setError("");
    setNotice("");

    try {
      const result =
        await resetPasswordApi(user.id);

      setNotice(
        `Mật khẩu tạm của ${user.tenDangNhap}: ${result.temporaryPassword}`,
      );
      await loadData();
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Không thể đặt lại mật khẩu.",
      );
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Tạo tài khoản, gán vai trò và kiểm soát trạng thái đăng nhập theo đơn vị."
      />

      {error ? (
        <div className="form-error">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="form-success">
          {notice}
        </div>
      ) : null}

      {canManage ? (
        <SectionCard
          title="Tạo tài khoản mới"
          subtitle="Tài khoản mới bắt buộc đổi mật khẩu khi đăng nhập lần đầu."
        >
          <form
            className="user-create-form"
            onSubmit={handleCreate}
          >
            <label>
              <span>Tên đăng nhập</span>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm({
                    ...form,
                    username:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Họ tên</span>
              <input
                value={form.fullName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    fullName:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Số điện thoại</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Vai trò</span>
              <select
                value={form.roleId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    roleId:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  Chọn vai trò
                </option>
                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.tenVaiTro}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Đang tạo..."
                : "Tạo tài khoản"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách người dùng"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${users.length} tài khoản trong đơn vị hiện tại`
        }
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
                <th>Đổi mật khẩu</th>
                {canManage ? (
                  <th>Thao tác</th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={`${user.id}-${user.roleId}`}>
                  <td>
                    <strong>
                      {user.hoTen}
                    </strong>
                    <small>
                      {user.tenDangNhap}
                    </small>
                  </td>

                  <td>
                    {user.tenVaiTro}
                  </td>

                  <td>
                    <span>
                      {user.email || "—"}
                    </span>
                    <small>
                      {user.soDienThoai ||
                        "Chưa có SĐT"}
                    </small>
                  </td>

                  <td>
                    <span
                      className={`status-badge status-badge--${user.trangThai}`}
                    >
                      {user.trangThai ===
                      "hoat_dong"
                        ? "Hoạt động"
                        : user.trangThai ===
                            "tam_khoa"
                          ? "Tạm khóa"
                          : "Ngừng"}
                    </span>
                  </td>

                  <td>
                    {user.batBuocDoiMatKhau
                      ? "Bắt buộc"
                      : "Không"}
                  </td>

                  {canManage ? (
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            void handleStatus(
                              user,
                            )
                          }
                        >
                          {user.trangThai ===
                          "hoat_dong"
                            ? "Khóa"
                            : "Mở khóa"}
                        </button>

                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            void handleReset(
                              user,
                            )
                          }
                        >
                          Reset mật khẩu
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
