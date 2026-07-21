import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ConfirmDialog,
} from "../components/shared/ConfirmDialog";
import {
  PageHeader,
} from "../components/shared/PageHeader";
import {
  Pagination,
} from "../components/shared/Pagination";
import {
  SectionCard,
} from "../components/shared/SectionCard";
import {
  UserAssignmentPanel,
} from "../components/users/UserAssignmentPanel";
import {
  SelectField,
  TextField,
} from "../components/form";
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

type PendingAction =
  | {
      type: "status";
      user: UserListItem;
    }
  | {
      type: "reset";
      user: UserListItem;
    }
  | null;

const initialForm: FormState = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  roleId: "",
};

const PAGE_SIZE = 7;

export function UserManagementPage() {
  const { auth } = useAuth();

  const [
    users,
    setUsers,
  ] = useState<UserListItem[]>([]);
  const [
    roles,
    setRoles,
  ] = useState<RoleOption[]>([]);
  const [
    form,
    setForm,
  ] = useState<FormState>(
    initialForm,
  );
  const [
    searchText,
    setSearchText,
  ] = useState("");
  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");
  const [
    page,
    setPage,
  ] = useState(1);
  const [
    loading,
    setLoading,
  ] = useState(true);
  const [
    submitting,
    setSubmitting,
  ] = useState(false);
  const [
    actionBusy,
    setActionBusy,
  ] = useState(false);
  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction>(null);
  const [
    assignmentUser,
    setAssignmentUser,
  ] = useState<UserListItem | null>(
    null,
  );
  const [
    error,
    setError,
  ] = useState("");
  const [
    notice,
    setNotice,
  ] = useState("");

  const canManage =
    useMemo(() => {
      const permissions =
        auth?.currentOrganization
          ?.quyen ?? [];

      return (
        permissions.includes(
          "he_thong.quan_tri",
        ) ||
        permissions.includes(
          "nguoi_dung.quan_ly",
        )
      );
    }, [auth]);

  const filteredUsers =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            !keyword ||
            user.hoTen
              .toLowerCase()
              .includes(keyword) ||
            user.tenDangNhap
              .toLowerCase()
              .includes(keyword) ||
            (user.email ?? "")
              .toLowerCase()
              .includes(keyword) ||
            (
              user.soDienThoai ??
              ""
            )
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            statusFilter ===
              "all" ||
            user.trangThai ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      searchText,
      statusFilter,
      users,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredUsers.length /
          PAGE_SIZE,
      ),
    );

  const visibleUsers =
    filteredUsers.slice(
      (page - 1) *
        PAGE_SIZE,
      page * PAGE_SIZE,
    );

  useEffect(() => {
    setPage(1);
  }, [
    searchText,
    statusFilter,
  ]);

  useEffect(() => {
    if (
      page > totalPages
    ) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        userRows,
        roleRows,
      ] = await Promise.all([
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
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const result =
        await createUserApi({
          username:
            form.username,
          fullName:
            form.fullName,
          email:
            form.email,
          phone:
            form.phone,
          roleId:
            Number(
              form.roleId,
            ),
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

  async function executePendingAction() {
    if (!pendingAction) {
      return;
    }

    setActionBusy(true);
    setError("");
    setNotice("");

    try {
      if (
        pendingAction.type ===
        "status"
      ) {
        const nextStatus =
          pendingAction.user
            .trangThai ===
          "hoat_dong"
            ? "tam_khoa"
            : "hoat_dong";

        await updateUserStatusApi(
          pendingAction.user.id,
          nextStatus,
        );

        setNotice(
          nextStatus ===
          "tam_khoa"
            ? `Đã khóa tài khoản ${pendingAction.user.tenDangNhap}.`
            : `Đã mở khóa tài khoản ${pendingAction.user.tenDangNhap}.`,
        );
      } else {
        const result =
          await resetPasswordApi(
            pendingAction.user.id,
          );

        setNotice(
          `Mật khẩu tạm của ${pendingAction.user.tenDangNhap}: ${result.temporaryPassword}`,
        );
      }

      setPendingAction(null);
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể thực hiện thao tác.",
      );
    } finally {
      setActionBusy(false);
    }
  }

  const confirmTitle =
    pendingAction?.type ===
    "reset"
      ? "Đặt lại mật khẩu"
      : pendingAction?.user
            .trangThai ===
          "hoat_dong"
        ? "Khóa tài khoản"
        : "Mở khóa tài khoản";

  const confirmMessage =
    pendingAction?.type ===
    "reset"
      ? `Hệ thống sẽ tạo mật khẩu tạm mới và đăng xuất tất cả phiên của ${pendingAction.user.tenDangNhap}.`
      : pendingAction?.user
            .trangThai ===
          "hoat_dong"
        ? `Tài khoản ${pendingAction?.user.tenDangNhap} sẽ bị khóa và đăng xuất khỏi tất cả thiết bị.`
        : `Cho phép tài khoản ${pendingAction?.user.tenDangNhap} đăng nhập lại?`;

  return (
    <div className="page-stack">
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Tạo tài khoản, gán nhiều vai trò và quản lý quyền làm việc theo từng đơn vị."
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
          subtitle="Vai trò đầu tiên được gán tại đơn vị hiện tại. Có thể bổ sung thêm sau khi tạo."
        >
          <form
            className="user-create-form"
            onSubmit={
              handleCreate
            }
          >
            <TextField
              label="Tên đăng nhập"
              value={
                form.username
              }
              required
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  username:
                    value,
                })
              }
            />

            <TextField
              label="Họ tên"
              value={
                form.fullName
              }
              required
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  fullName:
                    value,
                })
              }
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  email:
                    value,
                })
              }
            />

            <TextField
              label="Số điện thoại"
              type="tel"
              value={form.phone}
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  phone:
                    value,
                })
              }
            />

            <SelectField
              label="Vai trò ban đầu"
              value={form.roleId}
              required
              placeholder="Chọn vai trò"
              options={roles.map(
                (role) => ({
                  value: role.id,
                  label:
                    role.tenVaiTro,
                }),
              )}
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  roleId:
                    value,
                })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={
                submitting
              }
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
            : `${filteredUsers.length} tài khoản phù hợp`
        }
      >
        <div className="user-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo tên, tài khoản, email hoặc số điện thoại"
            onChange={
              setSearchText
            }
          />

          <SelectField
            value={
              statusFilter
            }
            options={[
              {
                value: "all",
                label:
                  "Tất cả trạng thái",
              },
              {
                value:
                  "hoat_dong",
                label:
                  "Hoạt động",
              },
              {
                value:
                  "tam_khoa",
                label:
                  "Tạm khóa",
              },
              {
                value:
                  "ngung",
                label:
                  "Ngừng",
              },
            ]}
            onChange={
              setStatusFilter
            }
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>
                  Người dùng
                </th>
                <th>
                  Vai trò
                </th>
                <th>
                  Liên hệ
                </th>
                <th>
                  Trạng thái
                </th>
                <th>
                  Đổi mật khẩu
                </th>
                {canManage ? (
                  <th>
                    Thao tác
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {visibleUsers.map(
                (user) => (
                  <tr
                    key={user.id}
                  >
                    <td>
                      <strong>
                        {user.hoTen}
                      </strong>
                      <small>
                        {
                          user.tenDangNhap
                        }
                      </small>
                    </td>

                    <td>
                      <div className="role-badges">
                        {user.roles.map(
                          (role) => (
                            <span
                              key={
                                role.id
                              }
                              className="role-badge"
                            >
                              {
                                role.tenVaiTro
                              }
                            </span>
                          ),
                        )}
                      </div>
                    </td>

                    <td>
                      <span>
                        {user.email ||
                          "—"}
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
                              setAssignmentUser(
                                user,
                              )
                            }
                          >
                            Vai trò · Đơn vị
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setError("");
                              setPendingAction({
                                type: "status",
                                user,
                              });
                            }}
                          >
                            {user.trangThai ===
                            "hoat_dong"
                              ? "Khóa"
                              : "Mở khóa"}
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setError("");
                              setPendingAction({
                                type: "reset",
                                user,
                              });
                            }}
                          >
                            Reset mật khẩu
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ),
              )}

              {!loading &&
              visibleUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      canManage
                        ? 6
                        : 5
                    }
                    className="empty-cell"
                  >
                    Không có người dùng phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={
            PAGE_SIZE
          }
          total={
            filteredUsers.length
          }
          onChange={
            setPage
          }
          itemLabel="tài khoản"
        />
      </SectionCard>

      <ConfirmDialog
        open={
          Boolean(
            pendingAction,
          )
        }
        title={
          confirmTitle
        }
        message={
          confirmMessage
        }
        confirmLabel={
          pendingAction?.type ===
          "reset"
            ? "Reset mật khẩu"
            : pendingAction
                  ?.user
                  .trangThai ===
                "hoat_dong"
              ? "Khóa tài khoản"
              : "Mở khóa"
        }
        danger={
          pendingAction?.type ===
            "reset" ||
          pendingAction?.user
              .trangThai ===
            "hoat_dong"
        }
        busy={
          actionBusy
        }
        error={
          pendingAction ? error : ""
        }
        onConfirm={() =>
          void executePendingAction()
        }
        onCancel={() =>
          setPendingAction(
            null,
          )
        }
      />

      {assignmentUser ? (
        <UserAssignmentPanel
          user={
            assignmentUser
          }
          onClose={() => {
            setAssignmentUser(
              null,
            );
            void loadData();
          }}
        />
      ) : null}
    </div>
  );
}
