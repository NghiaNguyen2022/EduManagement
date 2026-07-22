import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  countActiveAssignments,
  countActiveChildren,
  createDonVi,
  findDonViById,
  findDonViByCode,
  listAllDonVi,
  updateDonVi,
  updateDonViStatus,
} from "../db/donVi.repository.js";

type LoaiDonVi = "he_thong" | "truong" | "trung_tam" | "co_so";
type LoaiHinhDaoTao = "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac";
type TrangThaiDonVi = "hoat_dong" | "tam_ngung" | "ngung_hoat_dong";

const LOAI_DON_VI_HOP_LE: LoaiDonVi[] = [
  "he_thong",
  "truong",
  "trung_tam",
  "co_so",
];

const LOAI_HINH_DAO_TAO_HOP_LE: LoaiHinhDaoTao[] = [
  "mam_non",
  "ngoai_ngu",
  "tin_hoc",
  "khac",
];

function normalizeMaDonVi(value: string) {
  return value.trim().toUpperCase();
}

function validateLoaiDonVi(value: string): asserts value is LoaiDonVi {
  if (!LOAI_DON_VI_HOP_LE.includes(value as LoaiDonVi)) {
    throw new Error("Loại đơn vị không hợp lệ.");
  }
}

function validateLoaiHinhDaoTao(
  value: string | null,
): asserts value is LoaiHinhDaoTao | null {
  if (value !== null && !LOAI_HINH_DAO_TAO_HOP_LE.includes(value as LoaiHinhDaoTao)) {
    throw new Error("Loại hình đào tạo không hợp lệ.");
  }
}

/**
 * Đơn vị hệ thống (node gốc `SYSTEM`, `loaiDonVi = 'he_thong'`) chỉ dùng để quản trị:
 * cây đơn vị, người dùng/vai trò. Không tạo dữ liệu nghiệp vụ (chương trình, hồ sơ giáo
 * viên, lớp học, học sinh, tuyển sinh) tại đơn vị này — dữ liệu đó luôn phải thuộc một
 * trường/trung tâm/cơ sở cụ thể.
 */
export async function assertDonViChoPhepNghiepVu(donViId: number) {
  const donVi = await findDonViById(donViId);

  if (donVi?.loaiDonVi === "he_thong") {
    throw new Error(
      "Đơn vị hệ thống chỉ dùng để quản trị (đơn vị, người dùng, vai trò), không tạo dữ liệu nghiệp vụ tại đây. Vui lòng chuyển sang trường/trung tâm cụ thể.",
    );
  }
}

export async function getDonViTree(input: {
  isSystemAdmin: boolean;
  actorOrganizationIds: number[];
}) {
  const all = await listAllDonVi();

  if (input.isSystemAdmin) {
    return all;
  }

  const visibleIds = new Set<number>(input.actorOrganizationIds);

  for (const unit of all) {
    if (
      unit.donViChaId &&
      input.actorOrganizationIds.includes(unit.donViChaId)
    ) {
      visibleIds.add(unit.id);
    }
  }

  return all.filter((unit) => visibleIds.has(unit.id));
}

export async function getDonViDetail(id: number) {
  const found = await findDonViById(id);

  if (!found) {
    throw new Error("Không tìm thấy đơn vị.");
  }

  return found;
}

export async function createDonViUnit(input: {
  donViChaId: number | null;
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: string;
  loaiHinhDaoTao: string | null;
  diaChi?: string | null;
  soDienThoai?: string | null;
  email?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const maDonVi = normalizeMaDonVi(input.maDonVi);
  const tenDonVi = input.tenDonVi.trim();

  if (!maDonVi) {
    throw new Error("Vui lòng nhập mã đơn vị.");
  }

  if (!tenDonVi) {
    throw new Error("Vui lòng nhập tên đơn vị.");
  }

  validateLoaiDonVi(input.loaiDonVi);
  validateLoaiHinhDaoTao(input.loaiHinhDaoTao);

  if (
    (input.loaiDonVi === "truong" || input.loaiDonVi === "trung_tam") &&
    !input.loaiHinhDaoTao
  ) {
    throw new Error("Trường/trung tâm phải chọn loại hình đào tạo.");
  }

  const existed = await findDonViByCode(maDonVi);

  if (existed) {
    throw new Error("Mã đơn vị đã tồn tại.");
  }

  let parent = null;

  if (input.donViChaId) {
    parent = await findDonViById(input.donViChaId);

    if (!parent) {
      throw new Error("Không tìm thấy đơn vị cha.");
    }

    if (parent.trangThai !== "hoat_dong") {
      throw new Error("Đơn vị cha đang không hoạt động, không thể tạo đơn vị con.");
    }
  }

  const created = await createDonVi({
    donViChaId: input.donViChaId,
    maDonVi,
    tenDonVi,
    loaiDonVi: input.loaiDonVi,
    loaiHinhDaoTao: input.loaiHinhDaoTao,
    diaChi: input.diaChi?.trim() || null,
    soDienThoai: input.soDienThoai?.trim() || null,
    email: input.email?.trim() || null,
  });

  if (!created) {
    throw new Error("Không thể tạo đơn vị.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    action: "don_vi.create",
    objectType: "DonVi",
    objectId: String(created.id),
    content: `Tạo đơn vị ${created.tenDonVi} (${created.maDonVi}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

export async function updateDonViUnit(input: {
  id: number;
  tenDonVi: string;
  loaiDonVi: string;
  loaiHinhDaoTao: string | null;
  diaChi?: string | null;
  soDienThoai?: string | null;
  email?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const target = await findDonViById(input.id);

  if (!target) {
    throw new Error("Không tìm thấy đơn vị.");
  }

  const tenDonVi = input.tenDonVi.trim();

  if (!tenDonVi) {
    throw new Error("Vui lòng nhập tên đơn vị.");
  }

  validateLoaiDonVi(input.loaiDonVi);
  validateLoaiHinhDaoTao(input.loaiHinhDaoTao);

  if (
    (input.loaiDonVi === "truong" || input.loaiDonVi === "trung_tam") &&
    !input.loaiHinhDaoTao
  ) {
    throw new Error("Trường/trung tâm phải chọn loại hình đào tạo.");
  }

  if (input.loaiDonVi !== target.loaiDonVi) {
    const assignedUsers = await countActiveAssignments(input.id);

    if (assignedUsers > 0) {
      throw new Error(
        "Không thể đổi loại đơn vị vì đã có người dùng được gán tại đơn vị này.",
      );
    }
  }

  const updated = await updateDonVi({
    id: input.id,
    tenDonVi,
    loaiDonVi: input.loaiDonVi,
    loaiHinhDaoTao: input.loaiHinhDaoTao,
    diaChi: input.diaChi?.trim() || null,
    soDienThoai: input.soDienThoai?.trim() || null,
    email: input.email?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật đơn vị.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    action: "don_vi.update",
    objectType: "DonVi",
    objectId: String(updated.id),
    content: `Cập nhật đơn vị ${updated.tenDonVi} (${updated.maDonVi}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setDonViStatus(input: {
  id: number;
  trangThai: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const target = await findDonViById(input.id);

  if (!target) {
    throw new Error("Không tìm thấy đơn vị.");
  }

  if (
    input.trangThai !== "hoat_dong" &&
    input.trangThai !== "tam_ngung" &&
    input.trangThai !== "ngung_hoat_dong"
  ) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  if (target.loaiDonVi === "he_thong") {
    throw new Error("Không thể đổi trạng thái đơn vị hệ thống gốc.");
  }

  if (input.trangThai === "ngung_hoat_dong") {
    const activeChildren = await countActiveChildren(input.id);

    if (activeChildren > 0) {
      throw new Error(
        "Đơn vị còn đơn vị con đang hoạt động, không thể ngừng hoạt động.",
      );
    }
  }

  const trangThai = input.trangThai as TrangThaiDonVi;

  const updated = await updateDonViStatus({
    id: input.id,
    trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái đơn vị.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    action: "don_vi.set_status",
    objectType: "DonVi",
    objectId: String(updated.id),
    content: `Đổi trạng thái đơn vị ${updated.tenDonVi} (${updated.maDonVi}) sang ${trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
