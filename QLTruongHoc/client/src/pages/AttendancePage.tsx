import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { DateField, SelectField, TextField } from "../components/form";
import { PageHeader } from "../components/shared/PageHeader";
import { SectionCard } from "../components/shared/SectionCard";
import { useAuth } from "../features/auth/AuthContext";
import {
  getBaoGiangApi,
  luuBaoGiangApi,
} from "../features/baoGiang/baoGiangApi";
import type { BaoGiangFormInput } from "../features/baoGiang/baoGiangTypes";
import {
  getDiemDanhRosterApi,
  luuDiemDanhApi,
} from "../features/diemDanh/diemDanhApi";
import type {
  DiemDanhHocSinhItem,
  TrangThaiDiemDanh,
} from "../features/diemDanh/diemDanhTypes";
import { listThoiKhoaBieuApi } from "../features/lichHoc/lichHocApi";
import type { ThoiKhoaBieuItem } from "../features/lichHoc/lichHocTypes";

const emptyBaoGiangForm: BaoGiangFormInput = {
  noiDungBaiHoc: "",
  baiTap: "",
  ghiChu: "",
};

const TRANG_THAI_DIEM_DANH_LABEL: Record<TrangThaiDiemDanh, string> = {
  co_mat: "Có mặt",
  vang_co_phep: "Vắng có phép",
  vang_khong_phep: "Vắng không phép",
  di_tre: "Đi trễ",
  ve_som: "Về sớm",
};

const TRANG_THAI_BUOI_HOC_LABEL: Record<string, string> = {
  du_kien: "Dự kiến",
  da_hoc: "Đã điểm danh",
  nghi: "Nghỉ",
  huy: "Huỷ",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const { auth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const buoiHocIdParam = searchParams.get("buoiHocId");
  const selectedBuoiHocId = buoiHocIdParam
    ? Number(buoiHocIdParam)
    : null;

  const canManage = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("diem_danh.thuc_hien")
    );
  }, [auth]);

  const canGhiBaoGiang = useMemo(() => {
    const permissions = auth?.currentOrganization?.quyen ?? [];
    return (
      permissions.includes("he_thong.quan_tri") ||
      permissions.includes("hoc_tap.ghi_nhan")
    );
  }, [auth]);

  const [ngay, setNgay] = useState(todayIso());
  const [items, setItems] = useState<ThoiKhoaBieuItem[]>([]);
  const [loadingDay, setLoadingDay] = useState(true);
  const [error, setError] = useState("");

  const [hocSinh, setHocSinh] = useState<DiemDanhHocSinhItem[]>([]);
  const [buoiHocInfo, setBuoiHocInfo] = useState<
    ThoiKhoaBieuItem["buoiHoc"] | null
  >(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [baoGiangForm, setBaoGiangForm] = useState<BaoGiangFormInput>(
    emptyBaoGiangForm,
  );
  const [loadingBaoGiang, setLoadingBaoGiang] = useState(false);
  const [savingBaoGiang, setSavingBaoGiang] = useState(false);

  async function loadDay() {
    setLoadingDay(true);
    setError("");

    try {
      const rows = await listThoiKhoaBieuApi({
        tuNgay: ngay,
        denNgay: ngay,
      });
      setItems(rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách buổi học.",
      );
    } finally {
      setLoadingDay(false);
    }
  }

  useEffect(() => {
    if (!selectedBuoiHocId) {
      void loadDay();
    }
  }, [ngay, selectedBuoiHocId, auth?.currentOrganization?.id]);

  async function loadRoster(buoiHocId: number) {
    setLoadingRoster(true);
    setError("");
    setNotice("");

    try {
      const data = await getDiemDanhRosterApi(buoiHocId);
      setHocSinh(data.hocSinh);
      setBuoiHocInfo(data.buoiHoc);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải điểm danh.",
      );
    } finally {
      setLoadingRoster(false);
    }
  }

  useEffect(() => {
    if (selectedBuoiHocId) {
      void loadRoster(selectedBuoiHocId);
    }
  }, [selectedBuoiHocId, auth?.currentOrganization?.id]);

  async function loadBaoGiang(buoiHocId: number) {
    setLoadingBaoGiang(true);

    try {
      const data = await getBaoGiangApi(buoiHocId);
      setBaoGiangForm({
        noiDungBaiHoc: data?.noiDungBaiHoc ?? "",
        baiTap: data?.baiTap ?? "",
        ghiChu: data?.ghiChu ?? "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải báo giảng.",
      );
    } finally {
      setLoadingBaoGiang(false);
    }
  }

  useEffect(() => {
    if (selectedBuoiHocId) {
      void loadBaoGiang(selectedBuoiHocId);
    } else {
      setBaoGiangForm(emptyBaoGiangForm);
    }
  }, [selectedBuoiHocId, auth?.currentOrganization?.id]);

  async function handleSaveBaoGiang() {
    if (!selectedBuoiHocId) return;

    setSavingBaoGiang(true);
    setError("");
    setNotice("");

    try {
      await luuBaoGiangApi(selectedBuoiHocId, baoGiangForm);
      setNotice("Đã lưu báo giảng.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể lưu báo giảng.",
      );
    } finally {
      setSavingBaoGiang(false);
    }
  }

  function openRoster(buoiHocId: number) {
    setSearchParams({ buoiHocId: String(buoiHocId) });
  }

  function closeRoster() {
    setSearchParams({});
    setHocSinh([]);
    setBuoiHocInfo(null);
  }

  function setTrangThai(
    hocSinhId: number,
    trangThai: TrangThaiDiemDanh,
  ) {
    setHocSinh((current) =>
      current.map((item) =>
        item.hocSinh.id === hocSinhId
          ? { ...item, trangThai }
          : item,
      ),
    );
  }

  function setGhiChu(hocSinhId: number, ghiChu: string) {
    setHocSinh((current) =>
      current.map((item) =>
        item.hocSinh.id === hocSinhId
          ? { ...item, ghiChu }
          : item,
      ),
    );
  }

  function setNhanXet(hocSinhId: number, nhanXet: string) {
    setHocSinh((current) =>
      current.map((item) =>
        item.hocSinh.id === hocSinhId
          ? { ...item, nhanXet }
          : item,
      ),
    );
  }

  async function handleSave() {
    if (!selectedBuoiHocId) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await luuDiemDanhApi(
        selectedBuoiHocId,
        hocSinh.map((item) => ({
          hocSinhId: item.hocSinh.id,
          trangThai: item.trangThai,
          ghiChu: item.ghiChu || undefined,
          nhanXet: item.nhanXet || undefined,
        })),
      );
      setHocSinh(result.hocSinh);
      setBuoiHocInfo(result.buoiHoc);
      setNotice("Đã lưu điểm danh.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể lưu điểm danh.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (selectedBuoiHocId) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Điểm danh"
          subtitle={
            buoiHocInfo
              ? `Ngày ${buoiHocInfo.ngayHoc} · ${buoiHocInfo.gioBatDau.slice(0, 5)} - ${buoiHocInfo.gioKetThuc.slice(0, 5)}`
              : "Đang tải..."
          }
          action={
            <button
              type="button"
              className="text-button"
              onClick={closeRoster}
            >
              ← Danh sách buổi học
            </button>
          }
        />

        {error ? <div className="form-error">{error}</div> : null}
        {notice ? <div className="form-success">{notice}</div> : null}

        <SectionCard
          title="Danh sách học sinh"
          subtitle={
            loadingRoster
              ? "Đang tải dữ liệu..."
              : `${hocSinh.length} học sinh`
          }
        >
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Nhận xét</th>
                </tr>
              </thead>

              <tbody>
                {hocSinh.map((item) => (
                  <tr key={item.hocSinh.id}>
                    <td>
                      <strong>{item.hocSinh.hoTen}</strong>
                      <small>{item.hocSinh.maHocSinh}</small>
                    </td>

                    <td>
                      <SelectField
                        value={item.trangThai}
                        disabled={!canManage || saving}
                        options={Object.entries(
                          TRANG_THAI_DIEM_DANH_LABEL,
                        ).map(([value, label]) => ({
                          value,
                          label,
                        }))}
                        onChange={(value) =>
                          setTrangThai(
                            item.hocSinh.id,
                            value as TrangThaiDiemDanh,
                          )
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        value={item.ghiChu ?? ""}
                        disabled={!canManage || saving}
                        onChange={(value) =>
                          setGhiChu(item.hocSinh.id, value)
                        }
                      />
                    </td>

                    <td>
                      <TextField
                        value={item.nhanXet ?? ""}
                        disabled={!canManage || saving}
                        onChange={(value) =>
                          setNhanXet(item.hocSinh.id, value)
                        }
                      />
                    </td>
                  </tr>
                ))}

                {!loadingRoster && hocSinh.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      Lớp chưa có học sinh nào tại ngày học này.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {canManage && hocSinh.length > 0 ? (
            <button
              type="button"
              className="primary-button"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Đang lưu..." : "Lưu điểm danh"}
            </button>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Báo giảng"
          subtitle={
            loadingBaoGiang
              ? "Đang tải dữ liệu..."
              : "Nội dung bài học và bài tập đã giao trong buổi này"
          }
        >
          <div className="user-create-form">
            <TextField
              label="Nội dung bài học"
              value={baoGiangForm.noiDungBaiHoc}
              disabled={!canGhiBaoGiang || savingBaoGiang}
              onChange={(value) =>
                setBaoGiangForm({
                  ...baoGiangForm,
                  noiDungBaiHoc: value,
                })
              }
            />

            <TextField
              label="Bài tập giao"
              value={baoGiangForm.baiTap}
              disabled={!canGhiBaoGiang || savingBaoGiang}
              onChange={(value) =>
                setBaoGiangForm({
                  ...baoGiangForm,
                  baiTap: value,
                })
              }
            />

            <TextField
              label="Ghi chú"
              value={baoGiangForm.ghiChu}
              disabled={!canGhiBaoGiang || savingBaoGiang}
              onChange={(value) =>
                setBaoGiangForm({
                  ...baoGiangForm,
                  ghiChu: value,
                })
              }
            />

            {canGhiBaoGiang ? (
              <button
                type="button"
                className="primary-button"
                disabled={savingBaoGiang}
                onClick={() => void handleSaveBaoGiang()}
              >
                {savingBaoGiang ? "Đang lưu..." : "Lưu báo giảng"}
              </button>
            ) : null}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Điểm danh"
        subtitle="Chọn một buổi học để điểm danh học sinh"
        action={
          <Link className="text-button" to="/attendance/xin-phep">
            Đơn xin phép →
          </Link>
        }
      />

      {error ? <div className="form-error">{error}</div> : null}

      <SectionCard title="Chọn ngày">
        <DateField
          label="Ngày"
          value={ngay}
          onChange={setNgay}
        />
      </SectionCard>

      <SectionCard
        title="Buổi học trong ngày"
        subtitle={
          loadingDay
            ? "Đang tải dữ liệu..."
            : `${items.length} buổi học`
        }
      >
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Lớp</th>
                <th>Giáo viên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.buoiHoc.id}>
                  <td>
                    {item.buoiHoc.gioBatDau.slice(0, 5)} -{" "}
                    {item.buoiHoc.gioKetThuc.slice(0, 5)}
                  </td>
                  <td>
                    <strong>{item.lopHocTenLop}</strong>
                    <small>{item.lopHocMaLop}</small>
                  </td>
                  <td>{item.giaoVienHoTen || "—"}</td>
                  <td>
                    {TRANG_THAI_BUOI_HOC_LABEL[item.buoiHoc.trangThai]}
                  </td>
                  <td>
                    {item.buoiHoc.trangThai === "nghi" ||
                    item.buoiHoc.trangThai === "huy" ? (
                      "—"
                    ) : (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => openRoster(item.buoiHoc.id)}
                      >
                        Điểm danh
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {!loadingDay && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Không có buổi học nào trong ngày này.
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
