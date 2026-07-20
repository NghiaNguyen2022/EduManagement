import {
  useEffect,
  useState,
} from "react";

import type {
  AuthOrganization,
} from "../../features/auth/authTypes";
import {
  addAssignmentApi,
  listAssignmentsApi,
  listAvailableOrganizationsApi,
  removeAssignmentApi,
} from "../../features/users/userAssignmentApi";
import type {
  UserAssignmentItem,
} from "../../features/users/userAssignmentTypes";
import {
  listRolesApi,
} from "../../features/users/userApi";
import type {
  RoleOption,
  UserListItem,
} from "../../features/users/userTypes";

type UserAssignmentPanelProps = {
  user: UserListItem;
  onClose: () => void;
};

export function UserAssignmentPanel({
  user,
  onClose,
}: UserAssignmentPanelProps) {
  const [
    assignments,
    setAssignments,
  ] = useState<
    UserAssignmentItem[]
  >([]);
  const [
    organizations,
    setOrganizations,
  ] = useState<
    AuthOrganization[]
  >([]);
  const [roles, setRoles] =
    useState<RoleOption[]>([]);
  const [
    organizationId,
    setOrganizationId,
  ] = useState("");
  const [roleId, setRoleId] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        assignmentRows,
        organizationRows,
        roleRows,
      ] = await Promise.all([
        listAssignmentsApi(
          user.id,
        ),
        listAvailableOrganizationsApi(),
        listRolesApi(),
      ]);

      setAssignments(
        assignmentRows,
      );
      setOrganizations(
        organizationRows,
      );
      setRoles(roleRows);

      if (
        organizationRows.length >
          0 &&
        !organizationId
      ) {
        setOrganizationId(
          String(
            organizationRows[0].id,
          ),
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải phân công.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [user.id]);

  async function handleAdd() {
    setSaving(true);
    setError("");

    try {
      await addAssignmentApi(
        user.id,
        {
          organizationId:
            Number(
              organizationId,
            ),
          roleId:
            Number(roleId),
        },
      );

      setRoleId("");
      await loadData();
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Không thể thêm phân công.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(
    assignment: UserAssignmentItem,
  ) {
    const confirmed =
      window.confirm(
        `Xóa vai trò ${assignment.tenVaiTro} tại ${assignment.tenDonVi}?`,
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await removeAssignmentApi(
        user.id,
        assignment.id,
      );
      await loadData();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Không thể xóa phân công.",
      );
    }
  }

  return (
    <div className="assignment-panel__overlay">
      <section className="assignment-panel">
        <header>
          <div>
            <h2>
              Vai trò và đơn vị
            </h2>
            <p>
              {user.hoTen} ·{" "}
              {user.tenDangNhap}
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={onClose}
          >
            Đóng
          </button>
        </header>

        {error ? (
          <div className="form-error">
            {error}
          </div>
        ) : null}

        <div className="assignment-create">
          <label>
            <span>Đơn vị</span>
            <select
              value={
                organizationId
              }
              onChange={(event) =>
                setOrganizationId(
                  event.target.value,
                )
              }
            >
              {organizations.map(
                (organization) => (
                  <option
                    key={
                      organization.id
                    }
                    value={
                      organization.id
                    }
                  >
                    {
                      organization.tenDonVi
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <span>Vai trò</span>
            <select
              value={roleId}
              onChange={(event) =>
                setRoleId(
                  event.target.value,
                )
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
            type="button"
            className="primary-button"
            disabled={
              saving ||
              !organizationId ||
              !roleId
            }
            onClick={() =>
              void handleAdd()
            }
          >
            {saving
              ? "Đang thêm..."
              : "Thêm phân công"}
          </button>
        </div>

        <div className="assignment-list">
          {loading ? (
            <div>
              Đang tải dữ liệu...
            </div>
          ) : assignments.length >
            0 ? (
            assignments.map(
              (assignment) => (
                <article
                  key={
                    assignment.id
                  }
                  className="assignment-item"
                >
                  <div>
                    <strong>
                      {
                        assignment.tenVaiTro
                      }
                    </strong>
                    <span>
                      {
                        assignment.tenDonVi
                      }
                    </span>
                    <small>
                      {
                        assignment.maDonVi
                      }{" "}
                      ·{" "}
                      {
                        assignment.maVaiTro
                      }
                    </small>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      void handleRemove(
                        assignment,
                      )
                    }
                  >
                    Xóa
                  </button>
                </article>
              ),
            )
          ) : (
            <div className="empty-cell">
              Chưa có phân công.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
