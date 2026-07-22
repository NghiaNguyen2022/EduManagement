import { useEffect, useMemo, useState } from "react";

import {
  SelectField,
  TextField,
} from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createLeadApi,
  listLeadApi,
} from "../features/lead/leadApi";
import type {
  LeadFormInput,
  LeadItem,
} from "../features/lead/leadTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const TRANG_THAI_LABEL: Record<string, string> = {
  moi: "Mới",
  dang_cham_soc: "Đang chăm sóc",
  da_hen_lich: "Đã hẹn lịch",
  da_hoc_thu: "Đã học thử",
  da_dang_ky: "Đã đăng ký",
  khong_tiep_tuc: "Không tiếp tục",
};

const NGUON_LABEL: Record<string, string> = {
  gioi_thieu: "Giới thiệu",
  facebook: "Facebook",
  website: "Website",
  walk_in: "Walk-in",
  khac: "Khác",
};

const emptyForm: LeadFormInput = {
  hoTen: "",
  soDienThoai: "",
  email: "",
  nguon: "khac",
  doTuoiHoacTrinhDo: "",
  nhuCau: "",
};

export function LeadsPage() {
  const { auth } = useAuth();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<LeadFormInput>(emptyForm);

  const isHeThong =
    auth?.currentOrganization?.loaiDonVi === "he_thong";

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      !isHeThong &&
      (permissions.includes("he_thong.quan_tri") ||
        permissions.includes("tuyen_sinh.quan_ly"))
    );
  }, [auth, isHeThong]);

  useUnsavedChangesGuard(
    JSON.stringify(form) !== JSON.stringify(emptyForm),
  );

  const filteredLeads = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return leads.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.hoTen.toLowerCase().includes(keyword) ||
        item.maLead.toLowerCase().includes(keyword) ||
        item.soDienThoai.includes(keyword);

      const matchesStatus =
        statusFilter === "all" || item.trangThai === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchText, statusFilter]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listLeadApi();
      setLeads(rows);
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
  }, [auth?.currentOrganization?.id]);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const created = await createLeadApi(form);
      setNotice(`Đã tạo lead ${created.maLead}.`);
      setForm(emptyForm);
      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo lead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Tuyển sinh"
        subtitle={
          isHeThong
            ? "Xem gộp lead của tất cả đơn vị (chỉ xem — đơn vị hệ thống không tiếp nhận tuyển sinh)"
            : "Tiếp nhận và chăm sóc khách hàng tiềm năng đến khi xác nhận đăng ký"
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {canManage ? (
        <SectionCard
          title="Tiếp nhận lead mới"
          subtitle="Mã lead do hệ thống tự sinh theo năm."
        >
          <form className="user-create-form" onSubmit={handleCreate}>
            <TextField
              label="Họ tên người liên hệ"
              value={form.hoTen}
              required
              onChange={(value) =>
                setForm({ ...form, hoTen: value })
              }
            />

            <TextField
              label="Số điện thoại"
              type="tel"
              value={form.soDienThoai}
              required
              onChange={(value) =>
                setForm({ ...form, soDienThoai: value })
              }
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                setForm({ ...form, email: value })
              }
            />

            <SelectField
              label="Nguồn"
              value={form.nguon}
              options={Object.entries(NGUON_LABEL).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) =>
                setForm({
                  ...form,
                  nguon: value as LeadFormInput["nguon"],
                })
              }
            />

            <TextField
              label="Độ tuổi / trình độ quan tâm"
              value={form.doTuoiHoacTrinhDo}
              onChange={(value) =>
                setForm({
                  ...form,
                  doTuoiHoacTrinhDo: value,
                })
              }
            />

            <TextField
              label="Nhu cầu"
              value={form.nhuCau}
              onChange={(value) =>
                setForm({ ...form, nhuCau: value })
              }
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo lead"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách lead"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${filteredLeads.length} lead`
        }
      >
        <div className="user-toolbar">
          <TextField
            type="search"
            value={searchText}
            placeholder="Tìm theo tên, mã lead hoặc số điện thoại"
            onChange={setSearchText}
          />

          <SelectField
            value={statusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              ...Object.entries(TRANG_THAI_LABEL).map(
                ([value, label]) => ({ value, label }),
              ),
            ]}
            onChange={setStatusFilter}
          />
        </div>

        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Số điện thoại</th>
                <th>Nguồn</th>
                <th>Trạng thái</th>
                {isHeThong ? <th>Đơn vị</th> : null}
              </tr>
            </thead>

            <tbody>
              {filteredLeads.map((item) => (
                <tr key={item.id}>
                  <td>
                    <EntityLink
                      to={`/admissions/${item.id}`}
                      donVi={item.donVi}
                    >
                      <strong>{item.hoTen}</strong>
                    </EntityLink>
                    <small>{item.maLead}</small>
                  </td>

                  <td>{item.soDienThoai}</td>
                  <td>{NGUON_LABEL[item.nguon]}</td>

                  <td>
                    <span
                      className={`status-badge status-badge--${item.trangThai}`}
                    >
                      {TRANG_THAI_LABEL[item.trangThai]}
                    </span>
                  </td>

                  {isHeThong ? (
                    <td>
                      <OrgLink donVi={item.donVi} to="/admissions" />
                    </td>
                  ) : null}
                </tr>
              ))}

              {!loading && filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={isHeThong ? 5 : 4} className="empty-cell">
                    Chưa có lead nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
