import { useEffect, useMemo, useState } from "react";

import {
  SelectField,
  TextField,
} from "../components/form";
import { EntityLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  createDonViApi,
  listDonViApi,
} from "../features/donVi/donViApi";
import type {
  DonViFormInput,
  DonViItem,
} from "../features/donVi/donViTypes";
import { useUnsavedChangesGuard } from "../features/navigation/UnsavedChangesContext";

const LOAI_DON_VI_LABEL: Record<string, string> = {
  he_thong: "Hệ thống",
  truong: "Trường",
  trung_tam: "Trung tâm",
  co_so: "Cơ sở",
};

const LOAI_HINH_DAO_TAO_LABEL: Record<string, string> = {
  mam_non: "Mầm non",
  ngoai_ngu: "Ngoại ngữ",
  tin_hoc: "Tin học",
  khac: "Khác",
};

const TRANG_THAI_LABEL: Record<string, string> = {
  hoat_dong: "Hoạt động",
  tam_ngung: "Tạm ngưng",
  ngung_hoat_dong: "Ngừng hoạt động",
};

type DonViTreeNode = DonViItem & { children: DonViTreeNode[] };

/** Dựng cây cha-con từ danh sách phẳng đã có sẵn — không cần API riêng. */
function buildDonViTree(units: DonViItem[]): DonViTreeNode[] {
  const nodesById = new Map<number, DonViTreeNode>();

  for (const unit of units) {
    nodesById.set(unit.id, { ...unit, children: [] });
  }

  const roots: DonViTreeNode[] = [];

  for (const node of nodesById.values()) {
    const parent = node.donViChaId ? nodesById.get(node.donViChaId) : undefined;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortRecursive(list: DonViTreeNode[]) {
    list.sort((a, b) => a.tenDonVi.localeCompare(b.tenDonVi));
    for (const node of list) {
      sortRecursive(node.children);
    }
  }

  sortRecursive(roots);

  return roots;
}

function OrgTreeNode({ node }: { node: DonViTreeNode }) {
  return (
    <div className="org-tree__branch">
      <div className="org-tree__row">
        <EntityLink to={`/organizations/${node.id}`}>
          <strong>{node.tenDonVi}</strong>
        </EntityLink>
        <small>{node.maDonVi}</small>
        <span className="org-tree__tag">{LOAI_DON_VI_LABEL[node.loaiDonVi]}</span>
        {node.loaiHinhDaoTao ? (
          <span className="org-tree__tag org-tree__tag--soft">
            {LOAI_HINH_DAO_TAO_LABEL[node.loaiHinhDaoTao]}
          </span>
        ) : null}
        <span className={`status-badge status-badge--${node.trangThai}`}>
          {TRANG_THAI_LABEL[node.trangThai]}
        </span>
      </div>

      {node.children.length > 0 ? (
        <div className="org-tree__children">
          {node.children.map((child) => (
            <OrgTreeNode key={child.id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const emptyForm: DonViFormInput = {
  maDonVi: "",
  tenDonVi: "",
  loaiDonVi: "co_so",
  loaiHinhDaoTao: null,
  diaChi: "",
  soDienThoai: "",
  email: "",
};

export function OrganizationTreePage() {
  const { auth } = useAuth();

  const [units, setUnits] = useState<DonViItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DonViFormInput>(emptyForm);

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return permissions.includes("he_thong.quan_tri");
  }, [auth]);

  useUnsavedChangesGuard(
    JSON.stringify(form) !== JSON.stringify(emptyForm),
  );

  const tree = useMemo(() => buildDonViTree(units), [units]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await listDonViApi();
      setUnits(rows);
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      // Đơn vị mới luôn nằm trực tiếp dưới Hệ thống — hiện chưa hỗ trợ đơn vị
      // chứa đơn vị con, nên không cho chọn đơn vị cha ở đây (server tự gán).
      await createDonViApi(form);
      setNotice(`Đã tạo đơn vị ${form.tenDonVi}.`);
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu đơn vị.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Cây đơn vị"
        subtitle="Quản lý trường, trung tâm và cơ sở trong toàn hệ thống"
        action={
          canManage ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowForm((current) => !current)}
            >
              {showForm ? "Đóng" : "Thêm đơn vị"}
            </button>
          ) : null
        }
      />

      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="form-success">{notice}</div> : null}

      {showForm && canManage ? (
        <SectionCard
          title="Thêm đơn vị"
          subtitle="Đơn vị mới luôn nằm trực tiếp dưới Hệ thống."
        >
          <form className="user-create-form" onSubmit={handleSubmit}>
            <TextField
              label="Mã đơn vị"
              value={form.maDonVi}
              required
              placeholder="VD: TTNN-Q8"
              onChange={(value) =>
                setForm({ ...form, maDonVi: value })
              }
            />

            <TextField
              label="Tên đơn vị"
              value={form.tenDonVi}
              required
              onChange={(value) =>
                setForm({ ...form, tenDonVi: value })
              }
            />

            <SelectField
              label="Loại đơn vị"
              value={form.loaiDonVi}
              required
              options={[
                { value: "truong", label: "Trường" },
                { value: "trung_tam", label: "Trung tâm" },
                { value: "co_so", label: "Cơ sở" },
              ]}
              onChange={(value) =>
                setForm({
                  ...form,
                  loaiDonVi: value as DonViFormInput["loaiDonVi"],
                })
              }
            />

            <SelectField
              label="Loại hình đào tạo"
              value={form.loaiHinhDaoTao ?? ""}
              placeholder="Chọn loại hình"
              options={[
                { value: "mam_non", label: "Mầm non" },
                { value: "ngoai_ngu", label: "Ngoại ngữ" },
                { value: "tin_hoc", label: "Tin học" },
                { value: "khac", label: "Khác" },
              ]}
              onChange={(value) =>
                setForm({
                  ...form,
                  loaiHinhDaoTao: value
                    ? (value as DonViFormInput["loaiHinhDaoTao"])
                    : null,
                })
              }
            />

            <TextField
              label="Địa chỉ"
              value={form.diaChi}
              onChange={(value) =>
                setForm({ ...form, diaChi: value })
              }
            />

            <TextField
              label="Số điện thoại"
              type="tel"
              value={form.soDienThoai}
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

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Tạo đơn vị"}
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Danh sách đơn vị"
        subtitle={
          loading
            ? "Đang tải dữ liệu..."
            : `${units.length} đơn vị`
        }
      >
        {!loading && tree.length === 0 ? (
          <div className="empty-cell">Chưa có đơn vị nào.</div>
        ) : (
          <div className="org-tree">
            {tree.map((node) => (
              <OrgTreeNode key={node.id} node={node} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
