export type BaoGiangItem = {
  id: number;
  buoiHocId: number;
  noiDungBaiHoc: string | null;
  baiTap: string | null;
  ghiChu: string | null;
  actorUserId: number | null;
  createdAt: string;
  updatedAt: string;
} | null;

export type BaoGiangFormInput = {
  noiDungBaiHoc: string;
  baiTap: string;
  ghiChu: string;
};
