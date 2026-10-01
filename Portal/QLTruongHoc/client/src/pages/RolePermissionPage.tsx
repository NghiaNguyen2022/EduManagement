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
  getRolePermissionsApi,
  listPermissionsApi,
  listRolesApi,
  updateRolePermissionsApi,
} from "../features/roles/roleApi";
import type {
  PermissionItem,
  RoleItem,
} from "../features/roles/roleTypes";

export function RolePermissionPage() {
  const { auth } = useAuth();

  const [roles, setRoles] =
    useState<RoleItem[]>([]);
  const [permissions, setPermissions] =
    useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] =
    useState<number | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] =
    useState<number[]>([]);
  const [savedPermissionIds, setSavedPermissionIds] =
    useState<number[]>([]);
  const [advancedOpen, setAdvancedOpen] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [notice, setNotice] =
    useState("");

  const currentPermissions =
    auth?.currentOrganization?.quyen ?? [];

  const isSystemAdmin =
    currentPermissions.includes(
      "he_thong.quan_tri",
    );

  const canManage =
    isSystemAdmin ||
    currentPermissions.includes(
      "phan_quyen.quan_ly",
    );

  const selectedRole =
    roles.find(
      (role) => role.id === selectedRoleId,
    ) ?? null;

  const canEditSelectedRole =
    canManage &&
    Boolean(selectedRole) &&
    (
      selectedRole?.maVaiTro !==
        "quan_tri_he_thong" ||
      isSystemAdmin
    );

  const selectedPermissions = useMemo(
    () =>
      permissions.filter(
        (permission) =>
          selectedPermissionIds.includes(
            permission.id,
          ),
      ),
    [permissions, selectedPermissionIds],
  );

  const groupedSelectedPermissions =
    useMemo(() => {
      const map = new Map<
        string,
        PermissionItem[]
      >();

      for (
        const permission
        of selectedPermissions
      ) {
        const group =
          map.get(permission.nhomQuyen) ?? [];

        group.push(permission);
        map.set(permission.nhomQuyen, group);
      }

      return Array.from(map.entries());
    }, [selectedPermissions]);

  const allGroupedPermissions = useMemo(() => {
    const map = new Map<
      string,
      PermissionItem[]
    >();

    for (const permission of permissions) {
      const group =
        map.get(permission.nhomQuyen) ?? [];

      group.push(permission);
      map.set(permission.nhomQuyen, group);
    }

    return Array.from(map.entries());
  }, [permissions]);

  const hasChanges =
    JSON.stringify(
      [...selectedPermissionIds].sort(
        (a, b) => a - b,
      ),
    ) !==
    JSON.stringify(
      [...savedPermissionIds].sort(
        (a, b) => a - b,
      ),
    );

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError("");

      try {
        const [roleRows, permissionRows] =
          await Promise.all([
            listRolesApi(),
            listPermissionsApi(),
          ]);

        setRoles(roleRows);
        setPermissions(permissionRows);

        if (roleRows.length > 0) {
          setSelectedRoleId(
            roleRows[0].id,
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải phân quyền.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInitial();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    setAdvancedOpen(false);
    setError("");
    setNotice("");

    getRolePermissionsApi(selectedRoleId)
      .then((result) => {
        setSelectedPermissionIds(
          result.permissionIds,
        );
        setSavedPermissionIds(
          result.permissionIds,
        );
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải quyền của vai trò.",
        );
      });
  }, [selectedRoleId]);

  function togglePermission(
    permissionId: number,
  ) {
    if (!canEditSelectedRole) {
      return;
    }

    setSelectedPermissionIds(
      (current) =>
        current.includes(permissionId)
          ? current.filter(
              (id) =>
                id !== permissionId,
            )
          : [...current, permissionId],
    );
  }

  async function handleSave() {
    if (
      !selectedRoleId ||
      !canEditSelectedRole
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result =
        await updateRolePermissionsApi(
          selectedRoleId,
          selectedPermissionIds,
        );

      setSavedPermissionIds(
        result.permissionIds,
      );
      setNotice(
        "Đã cập nhật phân quyền.",
      );
      setAdvancedOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể lưu phân quyền.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Vai trò · Phân quyền"
        subtitle="Các vai trò đã được gán sẵn bộ quyền phù hợp. Chỉ điều chỉnh khi thật sự cần."
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

      <div className="role-simple-layout">
        <SectionCard
          title="Vai trò"
          subtitle={`${roles.length} vai trò hệ thống`}
        >
          <div className="role-simple-list">
            {roles.map((role) => (
              <button
                type="button"
                key={role.id}
                className={[
                  "role-simple-item",
                  role.id === selectedRoleId
                    ? "role-simple-item--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setSelectedRoleId(role.id)
                }
              >
                <span>
                  <strong>
                    {role.tenVaiTro}
                  </strong>
                  <small>
                    {role.moTa ||
                      role.maVaiTro}
                  </small>
                </span>

                <b>
                  {role.id ===
                  selectedRoleId
                    ? "Đang xem"
                    : "›"}
                </b>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={
            selectedRole?.tenVaiTro ??
            "Chi tiết vai trò"
          }
          subtitle={
            selectedRole?.moTa ??
            "Chọn vai trò để xem"
          }
          actions={
            canEditSelectedRole ? (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setAdvancedOpen(
                    (current) =>
                      !current,
                  )
                }
              >
                {advancedOpen
                  ? "Đóng điều chỉnh"
                  : "Điều chỉnh nâng cao"}
              </button>
            ) : undefined
          }
        >
          {loading ? (
            <div>Đang tải dữ liệu...</div>
          ) : (
            <>
              <div className="role-summary">
                <div>
                  <span>Số quyền</span>
                  <strong>
                    {
                      selectedPermissionIds.length
                    }
                  </strong>
                </div>

                <div>
                  <span>Phạm vi</span>
                  <strong>
                    {selectedRole?.phamVi ===
                    "he_thong"
                      ? "Toàn hệ thống"
                      : selectedRole?.phamVi ===
                          "cong_thong_tin"
                        ? "Cổng thông tin"
                        : "Theo đơn vị"}
                  </strong>
                </div>

                <div>
                  <span>Trạng thái</span>
                  <strong>
                    {selectedRole?.dangHoatDong
                      ? "Đang hoạt động"
                      : "Ngừng hoạt động"}
                  </strong>
                </div>
              </div>

              {!advancedOpen ? (
                <div className="role-permission-summary">
                  {groupedSelectedPermissions.length >
                  0 ? (
                    groupedSelectedPermissions.map(
                      ([
                        groupName,
                        groupItems,
                      ]) => (
                        <section
                          key={groupName}
                          className="role-permission-summary__group"
                        >
                          <strong>
                            {groupName}
                          </strong>

                          <div>
                            {groupItems.map(
                              (permission) => (
                                <span
                                  key={
                                    permission.id
                                  }
                                >
                                  {
                                    permission.tenQuyen
                                  }
                                </span>
                              ),
                            )}
                          </div>
                        </section>
                      ),
                    )
                  ) : (
                    <div className="empty-role-permission">
                      Vai trò này chưa có quyền
                      quản trị nội bộ.
                    </div>
                  )}
                </div>
              ) : (
                <div className="role-advanced">
                  <div className="role-advanced__notice">
                    Chỉ nên thay đổi khi có
                    nghiệp vụ mới hoặc quy trình
                    vận hành thay đổi.
                  </div>

                  <div className="role-advanced__groups">
                    {allGroupedPermissions.map(
                      ([
                        groupName,
                        groupItems,
                      ]) => (
                        <section
                          key={groupName}
                          className="role-advanced__group"
                        >
                          <strong>
                            {groupName}
                          </strong>

                          <div>
                            {groupItems.map(
                              (permission) => (
                                <label
                                  key={
                                    permission.id
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissionIds.includes(
                                      permission.id,
                                    )}
                                    onChange={() =>
                                      togglePermission(
                                        permission.id,
                                      )
                                    }
                                  />

                                  <span>
                                    {
                                      permission.tenQuyen
                                    }
                                  </span>
                                </label>
                              ),
                            )}
                          </div>
                        </section>
                      ),
                    )}
                  </div>

                  <div className="role-advanced__actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => {
                        setSelectedPermissionIds(
                          savedPermissionIds,
                        );
                        setAdvancedOpen(
                          false,
                        );
                      }}
                    >
                      Hủy
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      disabled={
                        !hasChanges ||
                        saving
                      }
                      onClick={() =>
                        void handleSave()
                      }
                    >
                      {saving
                        ? "Đang lưu..."
                        : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
