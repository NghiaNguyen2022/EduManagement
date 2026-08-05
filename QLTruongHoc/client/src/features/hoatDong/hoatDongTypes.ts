export type HoatDongAnhItem = {
  id: number;
  hoatDongId: number;
  url: string;
  thuTu: number;
};

export type HoatDongItem = {
  hoatDong: {
    id: number;
    donViId: number;
    lopHocId: number;
    ngayHoatDong: string;
    tieuDe: string;
    moTa: string | null;
    actorUserId: number;
    createdAt: string;
  };
  anh: HoatDongAnhItem[];
  hocSinhIds: number[];
};

export type HoatDongFormInput = {
  lopHocId: string;
  ngayHoatDong: string;
  tieuDe: string;
  moTa: string;
  urls: string[];
  hocSinhIds: number[];
};
