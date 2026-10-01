export type TinNhanItem = {
  id: number;
  donViId: number;
  hocSinhId: number;
  lopHocId: number | null;
  nguoiGuiId: number;
  nguoiGuiLaPhuHuynh: boolean;
  noiDung: string;
  createdAt: string;
};

export type TinNhanThreadItem = {
  hocSinh: { id: number; hoTen: string; maHocSinh: string };
  lastMessage: TinNhanItem;
  coTinChuaDoc: boolean;
  lopHoc: { id: number; tenLop: string } | null;
};
