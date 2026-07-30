const CHU_SO = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

/** Đọc 1 nhóm 3 chữ số (0-999) thành chữ, theo quy tắc số đếm tiếng Việt. */
function docNhomBaChuSo(nhom: number, coHangCaoHonTruoc: boolean): string {
  const tram = Math.floor(nhom / 100);
  const chuc = Math.floor((nhom % 100) / 10);
  const donVi = nhom % 10;

  const phan: string[] = [];

  if (tram > 0) {
    phan.push(`${CHU_SO[tram]} trăm`);
  } else if (coHangCaoHonTruoc && (chuc > 0 || donVi > 0)) {
    phan.push("không trăm");
  }

  if (chuc === 0) {
    if (donVi > 0 && (tram > 0 || coHangCaoHonTruoc)) {
      phan.push(`lẻ ${CHU_SO[donVi]}`);
    } else if (donVi > 0) {
      phan.push(CHU_SO[donVi]);
    }
  } else if (chuc === 1) {
    phan.push("mười");

    if (donVi === 5) phan.push("lăm");
    else if (donVi > 0) phan.push(CHU_SO[donVi]);
  } else {
    phan.push(`${CHU_SO[chuc]} mươi`);

    if (donVi === 1) phan.push("mốt");
    else if (donVi === 5) phan.push("lăm");
    else if (donVi === 4) phan.push("tư");
    else if (donVi > 0) phan.push(CHU_SO[donVi]);
  }

  return phan.join(" ");
}

/** Số tiền → chữ tiếng Việt, VD 1250000 → "Một triệu hai trăm năm mươi nghìn đồng". */
export function soTienBangChu(soTien: number): string {
  const value = Math.round(Math.abs(soTien));

  if (value === 0) return "Không đồng";

  const donVi = ["", "nghìn", "triệu", "tỷ"];
  const nhomList: number[] = [];
  let n = value;

  while (n > 0) {
    nhomList.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];

  for (let i = nhomList.length - 1; i >= 0; i -= 1) {
    const nhom = nhomList[i];

    if (nhom === 0) continue;

    const coHangCaoHonTruoc = i < nhomList.length - 1;
    const chu = docNhomBaChuSo(nhom, coHangCaoHonTruoc);

    parts.push(donVi[i] ? `${chu} ${donVi[i]}` : chu);
  }

  const cauChu = parts.join(" ").replace(/\s+/g, " ").trim();
  const ketQua = `${cauChu} đồng`;

  return ketQua.charAt(0).toUpperCase() + ketQua.slice(1);
}
