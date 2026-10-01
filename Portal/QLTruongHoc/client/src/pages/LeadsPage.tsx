import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
      DateField,
      SelectField,
      TextField,
} from "../components/form";
import { EntityLink, OrgLink } from "../components/shared/EntityLink";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import { ghiDanhTrucTiepApi } from "../features/hocSinh/hocSinhApi";
import type { GhiDanhTrucTiepFormInput } from "../features/hocSinh/hocSinhTypes";
import {
      createLeadApi,
      listLeadApi,
      listLichHenSapToiApi,
      xuLyLichHenApi,
} from "../features/lead/leadApi";
import type {
      LeadFormInput,
      LeadItem,
      LichHenSapToiItem,
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

const MOI_QUAN_HE_LABEL: Record<string, string> = {
      cha: "Cha",
      me: "Mẹ",
      ong: "Ông",
      ba: "Bà",
      nguoi_giam_ho: "Người giám hộ",
      khac: "Khác",
};

const emptyGhiDanhForm: GhiDanhTrucTiepFormInput = {
      hoTenHocVien: "",
      ngaySinh: "",
      gioiTinh: "",
      diaChiHocVien: "",
      ngayNhapHoc: "",
      hoTenNguoiLienHe: "",
      soDienThoaiNguoiLienHe: "",
      emailNguoiLienHe: "",
      moiQuanHe: "",
};

function formatThoiGian(value: string) {
      return new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(value.replace(" ", "T")));
}

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
      const [lichHen, setLichHen] = useState<LichHenSapToiItem[]>([]);
      const [xuLyId, setXuLyId] = useState<number | null>(null);

      const [ghiDanhForm, setGhiDanhForm] = useState<GhiDanhTrucTiepFormInput>(
            emptyGhiDanhForm,
      );
      const [savingGhiDanh, setSavingGhiDanh] = useState(false);

      const isHeThong =
            auth?.currentOrganization?.loaiDonVi === "he_thong";

      // Mầm non không có khái niệm khách hàng tiềm năng/đặt lịch — tuyển sinh ghi
      // nhận thẳng hồ sơ học sinh + phụ huynh, học vụ xếp lớp sau theo độ tuổi.
      // Xem docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md.
      const isMamNon =
            auth?.currentOrganization?.loaiHinhDaoTao === "mam_non";

      const canManage = useMemo(() => {
            const permissions = auth?.currentOrganization?.quyen ?? [];
            return (
                  !isHeThong &&
                  (permissions.includes("he_thong.quan_tri") ||
                        permissions.includes("tuyen_sinh.quan_ly"))
            );
      }, [auth, isHeThong]);

      useUnsavedChangesGuard(
            JSON.stringify(form) !== JSON.stringify(emptyForm) ||
            JSON.stringify(ghiDanhForm) !== JSON.stringify(emptyGhiDanhForm),
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
            // Mầm non không dùng Lead — không cần tải danh sách khách hàng tiềm năng.
            if (isMamNon) {
                  setLeads([]);
                  setLoading(false);
                  return;
            }

            void loadData();
      }, [auth?.currentOrganization?.id, isMamNon]);

      async function loadLichHen() {
            try {
                  const rows = await listLichHenSapToiApi();
                  setLichHen(rows);
            } catch {
                  setLichHen([]);
            }
      }

      useEffect(() => {
            if (isHeThong || isMamNon) {
                  setLichHen([]);
                  return;
            }

            void loadLichHen();
      }, [auth?.currentOrganization?.id, isHeThong, isMamNon]);

      async function handleXuLyLichHen(
            hoatDongId: number,
            trangThai: "da_xu_ly" | "da_huy",
      ) {
            setError("");
            setNotice("");
            setXuLyId(hoatDongId);

            try {
                  await xuLyLichHenApi(hoatDongId, trangThai);
                  setNotice(
                        trangThai === "da_xu_ly"
                              ? "Đã đánh dấu lịch hẹn hoàn thành."
                              : "Đã huỷ lịch hẹn.",
                  );
                  await loadLichHen();
            } catch (xuLyError) {
                  setError(
                        xuLyError instanceof Error
                              ? xuLyError.message
                              : "Không thể cập nhật lịch hẹn.",
                  );
            } finally {
                  setXuLyId(null);
            }
      }

      async function handleCreate(
            event: React.FormEvent<HTMLFormElement>,
      ) {
            event.preventDefault();
            setError("");
            setNotice("");
            setSubmitting(true);

            try {
                  const created = await createLeadApi(form);
                  setNotice(`Đã tạo khách hàng tiềm năng ${created.maLead}.`);
                  setForm(emptyForm);
                  await loadData();
            } catch (createError) {
                  setError(
                        createError instanceof Error
                              ? createError.message
                              : "Không thể tạo khách hàng tiềm năng.",
                  );
            } finally {
                  setSubmitting(false);
            }
      }

      async function handleGhiDanh(
            event: React.FormEvent<HTMLFormElement>,
      ) {
            event.preventDefault();
            setError("");
            setNotice("");
            setSavingGhiDanh(true);

            try {
                  const created = await ghiDanhTrucTiepApi(ghiDanhForm);
                  setNotice(`Đã ghi danh học sinh ${created.maHocSinh}.`);
                  setGhiDanhForm(emptyGhiDanhForm);
            } catch (ghiDanhError) {
                  setError(
                        ghiDanhError instanceof Error
                              ? ghiDanhError.message
                              : "Không thể ghi danh học sinh.",
                  );
            } finally {
                  setSavingGhiDanh(false);
            }
      }

      if (isMamNon && !isHeThong) {
            return (
                  <div className="page-stack">
                        <PageHeader
                              title="Tuyển sinh"
                              subtitle="Ghi nhận hồ sơ học sinh và phụ huynh — học vụ sẽ xếp lớp theo độ tuổi sau."
                        />

                        {error ? <div className="form-error">{error}</div> : null}
                        {notice ? <div className="form-success">{notice}</div> : null}

                        {canManage ? (
                              <SectionCard
                                    title="Ghi nhận hồ sơ học sinh"
                                    subtitle="Mã học sinh do hệ thống tự sinh theo năm."
                              >
                                    <form className="user-create-form" onSubmit={handleGhiDanh}>
                                          <TextField
                                                label="Họ tên học viên"
                                                value={ghiDanhForm.hoTenHocVien}
                                                required
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, hoTenHocVien: value })
                                                }
                                          />

                                          <DateField
                                                label="Ngày sinh học viên"
                                                value={ghiDanhForm.ngaySinh}
                                                required
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, ngaySinh: value })
                                                }
                                          />

                                          <SelectField
                                                label="Giới tính"
                                                value={ghiDanhForm.gioiTinh}
                                                placeholder="Chọn giới tính"
                                                options={[
                                                      { value: "nam", label: "Nam" },
                                                      { value: "nu", label: "Nữ" },
                                                      { value: "khac", label: "Khác" },
                                                ]}
                                                onChange={(value) =>
                                                      setGhiDanhForm({
                                                            ...ghiDanhForm,
                                                            gioiTinh: value as GhiDanhTrucTiepFormInput["gioiTinh"],
                                                      })
                                                }
                                          />

                                          <TextField
                                                label="Địa chỉ học viên"
                                                value={ghiDanhForm.diaChiHocVien}
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, diaChiHocVien: value })
                                                }
                                          />

                                          <DateField
                                                label="Ngày nhập học"
                                                value={ghiDanhForm.ngayNhapHoc}
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, ngayNhapHoc: value })
                                                }
                                          />

                                          <TextField
                                                label="Họ tên người liên hệ (phụ huynh)"
                                                value={ghiDanhForm.hoTenNguoiLienHe}
                                                required
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, hoTenNguoiLienHe: value })
                                                }
                                          />

                                          <TextField
                                                label="Số điện thoại người liên hệ"
                                                type="tel"
                                                value={ghiDanhForm.soDienThoaiNguoiLienHe}
                                                required
                                                onChange={(value) =>
                                                      setGhiDanhForm({
                                                            ...ghiDanhForm,
                                                            soDienThoaiNguoiLienHe: value,
                                                      })
                                                }
                                          />

                                          <TextField
                                                label="Email người liên hệ"
                                                type="email"
                                                value={ghiDanhForm.emailNguoiLienHe}
                                                onChange={(value) =>
                                                      setGhiDanhForm({ ...ghiDanhForm, emailNguoiLienHe: value })
                                                }
                                          />

                                          <SelectField
                                                label="Mối quan hệ với học viên"
                                                value={ghiDanhForm.moiQuanHe}
                                                required
                                                placeholder="Chọn mối quan hệ"
                                                options={Object.entries(MOI_QUAN_HE_LABEL).map(
                                                      ([value, label]) => ({ value, label }),
                                                )}
                                                onChange={(value) =>
                                                      setGhiDanhForm({
                                                            ...ghiDanhForm,
                                                            moiQuanHe: value as GhiDanhTrucTiepFormInput["moiQuanHe"],
                                                      })
                                                }
                                          />

                                          <button
                                                type="submit"
                                                className="primary-button"
                                                disabled={savingGhiDanh}
                                          >
                                                {savingGhiDanh ? "Đang ghi danh..." : "Ghi danh"}
                                          </button>
                                    </form>
                              </SectionCard>
                        ) : null}
                  </div>
            );
      }

      return (
            <div className="page-stack">
                  <PageHeader
                        title="Tuyển sinh"
                        subtitle={
                              isHeThong
                                    ? "Xem gộp khách hàng tiềm năng của tất cả đơn vị (chỉ xem — đơn vị hệ thống không tiếp nhận tuyển sinh)"
                                    : "Tiếp nhận và chăm sóc khách hàng tiềm năng đến khi xác nhận đăng ký"
                        }
                  />

                  {error ? <div className="form-error">{error}</div> : null}
                  {notice ? <div className="form-success">{notice}</div> : null}

                  {!isHeThong ? (
                        <SectionCard
                              title="Lịch hẹn sắp tới"
                              subtitle="Cuộc gọi/gặp gỡ đã đặt lịch, còn chờ xử lý — kể cả lịch hẹn đã quá giờ chưa xử lý"
                        >
                              <div className="user-table-wrap">
                                    <table className="user-table">
                                          <thead>
                                                <tr>
                                                      <th>Thời gian</th>
                                                      <th>Khách hàng tiềm năng</th>
                                                      <th>Số điện thoại</th>
                                                      <th>Nội dung</th>
                                                      {canManage ? <th>Thao tác</th> : null}
                                                </tr>
                                          </thead>

                                          <tbody>
                                                {lichHen.map((item) => (
                                                      <tr key={item.hoatDong.id}>
                                                            <td>{formatThoiGian(item.hoatDong.thoiGian)}</td>
                                                            <td>
                                                                  <Link to={`/admissions/${item.lead.id}`}>
                                                                        <strong>{item.lead.hoTen}</strong>
                                                                  </Link>
                                                                  <small>{item.lead.maLead}</small>
                                                            </td>
                                                            <td>{item.lead.soDienThoai}</td>
                                                            <td>{item.hoatDong.noiDung}</td>
                                                            {canManage ? (
                                                                  <td>
                                                                        <div className="section-card-actions">
                                                                              <button
                                                                                    type="button"
                                                                                    className="text-button"
                                                                                    style={{ marginRight: "8px" }}
                                                                                    disabled={xuLyId === item.hoatDong.id}
                                                                                    onClick={() =>
                                                                                          void handleXuLyLichHen(item.hoatDong.id, "da_xu_ly")
                                                                                    }
                                                                              >
                                                                                    Đã thực hiện
                                                                              </button>
                                                                              <button
                                                                                    type="button"
                                                                                    className="text-button"
                                                                                    disabled={xuLyId === item.hoatDong.id}
                                                                                    onClick={() =>
                                                                                          void handleXuLyLichHen(item.hoatDong.id, "da_huy")
                                                                                    }
                                                                              >
                                                                                    Huỷ
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            ) : null}
                                                      </tr>
                                                ))}

                                                {lichHen.length === 0 ? (
                                                      <tr>
                                                            <td colSpan={canManage ? 5 : 4} className="empty-cell">
                                                                  Không có lịch hẹn nào đang chờ xử lý.
                                                            </td>
                                                      </tr>
                                                ) : null}
                                          </tbody>
                                    </table>
                              </div>
                        </SectionCard>
                  ) : null}

                  {canManage ? (
                        <SectionCard
                              title="Tiếp nhận khách hàng tiềm năng mới"
                              subtitle="Mã khách hàng tiềm năng do hệ thống tự sinh theo năm."
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
                                          {submitting ? "Đang tạo..." : "Tạo khách hàng tiềm năng"}
                                    </button>
                              </form>
                        </SectionCard>
                  ) : null}

                  <SectionCard
                        title="Danh sách khách hàng tiềm năng"
                        subtitle={
                              loading
                                    ? "Đang tải dữ liệu..."
                                    : `${filteredLeads.length} khách hàng tiềm năng`
                        }
                  >
                        <div className="user-toolbar">
                              <TextField
                                    type="search"
                                    value={searchText}
                                    placeholder="Tìm theo tên, mã khách hàng tiềm năng hoặc số điện thoại"
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
                                                <th>Khách hàng tiềm năng</th>
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
                                                            Chưa có khách hàng tiềm năng nào.
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
