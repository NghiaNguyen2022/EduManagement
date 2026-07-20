import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DateField,
  SelectField,
  TextField,
} from "../components/form";
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
  getAuditLogDetailApi,
  listAuditActionsApi,
  listAuditLogsApi,
} from "../features/auditLogs/auditLogApi";
import type {
  AuditLogDetail,
  AuditLogItem,
} from "../features/auditLogs/auditLogTypes";

const PAGE_SIZE = 20;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Asia/Ho_Chi_Minh",
    },
  ).format(new Date(value));
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    "auth.login": "Đăng nhập",
    "auth.login_failed": "Đăng nhập thất bại",
    "auth.login_blocked": "Đăng nhập bị chặn",
    "auth.logout": "Đăng xuất",
    "auth.change_password": "Đổi mật khẩu",
    "auth.select_organization": "Chọn đơn vị",
    "user.create": "Tạo tài khoản",
    "user.lock": "Khóa tài khoản",
    "user.unlock": "Mở khóa tài khoản",
    "user.reset_password": "Reset mật khẩu",
    "user.add_assignment": "Thêm vai trò · đơn vị",
    "user.remove_assignment": "Xóa vai trò · đơn vị",
    "role.update_permissions": "Thay đổi phân quyền",
  };

  return labels[action] ?? action;
}

export function SystemAuditLogPage() {
  const [items, setItems] =
    useState<AuditLogItem[]>([]);
  const [actions, setActions] =
    useState<string[]>([]);
  const [selected, setSelected] =
    useState<AuditLogDetail | null>(null);

  const [search, setSearch] =
    useState("");
  const [action, setAction] =
    useState("");
  const [level, setLevel] =
    useState("");
  const [fromDate, setFromDate] =
    useState("");
  const [toDate, setToDate] =
    useState("");
  const [page, setPage] =
    useState(1);
  const [total, setTotal] =
    useState(0);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const hasFilter = useMemo(
    () =>
      Boolean(
        search ||
          action ||
          level ||
          fromDate ||
          toDate,
      ),
    [
      search,
      action,
      level,
      fromDate,
      toDate,
    ],
  );

  async function loadLogs(
    targetPage = page,
  ) {
    setLoading(true);
    setError("");

    try {
      const result =
        await listAuditLogsApi({
          search,
          action,
          level,
          fromDate,
          toDate,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });

      setItems(result.items);
      setPage(result.pagination.page);
      setTotal(result.pagination.total);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải nhật ký.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listAuditActionsApi()
      .then(setActions)
      .catch(() => setActions([]));

    void loadLogs(1);
  }, []);

  async function openDetail(
    logId: number,
  ) {
    setError("");

    try {
      const detail =
        await getAuditLogDetailApi(logId);

      setSelected(detail);
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Không thể tải chi tiết.",
      );
    }
  }

  function resetFilters() {
    setSearch("");
    setAction("");
    setLevel("");
    setFromDate("");
    setToDate("");
    setPage(1);

    window.setTimeout(() => {
      void loadLogs(1);
    }, 0);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Nhật ký hệ thống"
        subtitle="Theo dõi các thao tác quan trọng liên quan đến đăng nhập, người dùng và phân quyền."
      />

      {error ? (
        <div className="form-error">
          {error}
        </div>
      ) : null}

      <SectionCard
        title="Bộ lọc"
        subtitle="Tìm nhanh các thao tác cần kiểm tra."
      >
        <div className="audit-filter-panel">
          <div className="audit-filter-panel__primary">
            <div className="audit-filter-panel__search">
              <TextField
                label="Tìm kiếm"
                type="search"
                value={search}
                placeholder="Hành động, nội dung, người dùng..."
                onChange={setSearch}
              />
            </div>

            <div className="audit-filter-panel__action">
              <SelectField
                label="Hành động"
                value={action}
                placeholder="Tất cả hành động"
                options={actions.map(
                  (item) => ({
                    value: item,
                    label: actionLabel(item),
                  }),
                )}
                onChange={setAction}
              />
            </div>

            <div className="audit-filter-panel__level">
              <SelectField
                label="Mức độ"
                value={level}
                placeholder="Tất cả mức độ"
                options={[
                  {
                    value: "thong_tin",
                    label: "Thông tin",
                  },
                  {
                    value: "canh_bao",
                    label: "Cảnh báo",
                  },
                  {
                    value: "loi",
                    label: "Lỗi",
                  },
                ]}
                onChange={setLevel}
              />
            </div>
          </div>

          <div className="audit-filter-panel__secondary">
            <div className="audit-filter-panel__date">
              <DateField
                label="Từ ngày"
                value={fromDate}
                max={toDate || undefined}
                onChange={setFromDate}
              />
            </div>

            <div className="audit-filter-panel__date">
              <DateField
                label="Đến ngày"
                value={toDate}
                min={fromDate || undefined}
                onChange={setToDate}
              />
            </div>

            <div className="audit-filter-panel__buttons">
              {hasFilter ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={resetFilters}
                >
                  Xóa lọc
                </button>
              ) : null}

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void loadLogs(1)
                }
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Lịch sử hoạt động"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${total} bản ghi`
        }
      >
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Người thực hiện</th>
                <th>Đơn vị</th>
                <th>Nội dung</th>
                <th>Mức độ</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {formatDateTime(
                      item.createdAt,
                    )}
                  </td>
                  <td>
                    <strong>
                      {actionLabel(
                        item.hanhDong,
                      )}
                    </strong>
                    <small>
                      {item.hanhDong}
                    </small>
                  </td>
                  <td>
                    <span>
                      {item.nguoiDungHoTen ||
                        "Hệ thống"}
                    </span>
                    <small>
                      {item.nguoiDungTenDangNhap ||
                        "—"}
                    </small>
                  </td>
                  <td>
                    <span>
                      {item.donViTen ||
                        "Toàn hệ thống"}
                    </span>
                    <small>
                      {item.donViMa || "—"}
                    </small>
                  </td>
                  <td>
                    {item.noiDung || "—"}
                  </td>
                  <td>
                    <span
                      className={`audit-level audit-level--${item.mucDo}`}
                    >
                      {item.mucDo ===
                      "thong_tin"
                        ? "Thông tin"
                        : item.mucDo ===
                            "canh_bao"
                          ? "Cảnh báo"
                          : "Lỗi"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        void openDetail(
                          item.id,
                        )
                      }
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}

              {!loading &&
              items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="empty-cell"
                  >
                    Chưa có nhật ký phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={(nextPage) => {
            void loadLogs(nextPage);
          }}
          itemLabel="bản ghi"
        />
      </SectionCard>

      {selected ? (
        <div className="audit-detail-overlay">
          <section
            className="audit-detail"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <div>
                <h2>
                  {actionLabel(
                    selected.hanhDong,
                  )}
                </h2>
                <p>
                  {formatDateTime(
                    selected.createdAt,
                  )}
                </p>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setSelected(null)
                }
              >
                Đóng
              </button>
            </header>

            <dl>
              <div>
                <dt>Người thực hiện</dt>
                <dd>
                  {selected.nguoiDungHoTen ||
                    "Hệ thống"}
                </dd>
              </div>

              <div>
                <dt>Đơn vị</dt>
                <dd>
                  {selected.donViTen ||
                    "Toàn hệ thống"}
                </dd>
              </div>

              <div>
                <dt>Địa chỉ IP</dt>
                <dd>
                  {selected.diaChiIp ||
                    "Không có"}
                </dd>
              </div>

              <div>
                <dt>Đối tượng</dt>
                <dd>
                  {selected.doiTuong ||
                    "Không có"}
                  {selected.doiTuongId
                    ? ` #${selected.doiTuongId}`
                    : ""}
                </dd>
              </div>
            </dl>

            <section>
              <h3>Nội dung</h3>
              <p>
                {selected.noiDung ||
                  "Không có nội dung."}
              </p>
            </section>

            {selected.duLieu ? (
              <section>
                <h3>Dữ liệu bổ sung</h3>
                <pre>
                  {typeof selected.duLieu ===
                  "string"
                    ? selected.duLieu
                    : JSON.stringify(
                        selected.duLieu,
                        null,
                        2,
                      )}
                </pre>
              </section>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
