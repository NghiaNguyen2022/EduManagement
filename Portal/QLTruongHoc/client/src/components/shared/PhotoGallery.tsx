import { useState } from "react";
import { appUrl } from "../../utils/appUrl";

import type { HoatDongItem } from "../../features/hoatDong/hoatDongTypes";
import { Lightbox } from "./Lightbox";

type PhotoGalleryProps = {
  items: HoatDongItem[];
  emptyMessage?: string;
  onDelete?: (item: HoatDongItem) => void;
  deletingId?: number | null;
};

function formatDay(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00`));
}

/**
 * Album ảnh hoạt động lớp — mỗi hoạt động 1 khối (tiêu đề, ngày, mô tả) +
 * lưới ảnh thu nhỏ, bấm vào ảnh bất kỳ để phóng to (Lightbox), điều hướng
 * qua lại đúng trong phạm vi ảnh của hoạt động đó. Dùng chung cho cả phía
 * giáo viên (ClassDetailPage, có thể xoá) và phụ huynh (PortalLandingPage,
 * chỉ xem — không truyền `onDelete`).
 */
export function PhotoGallery({
  items,
  emptyMessage = "Chưa có ảnh hoạt động nào.",
  onDelete,
  deletingId,
}: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
    title: string;
  } | null>(null);

  if (items.length === 0) {
    return <div className="empty-cell">{emptyMessage}</div>;
  }

  return (
    <div className="photo-gallery">
      {items.map((item) => (
        <article className="photo-gallery__item" key={item.hoatDong.id}>
          <header className="photo-gallery__header">
            <div>
              <strong>{item.hoatDong.tieuDe}</strong>
              <span className="photo-gallery__date">{formatDay(item.hoatDong.ngayHoatDong)}</span>
            </div>

            {onDelete ? (
              <button
                type="button"
                className="text-button"
                disabled={deletingId === item.hoatDong.id}
                onClick={() => onDelete(item)}
              >
                {deletingId === item.hoatDong.id ? "Đang xoá..." : "Xoá"}
              </button>
            ) : null}
          </header>

          {item.hoatDong.moTa ? <p className="photo-gallery__desc">{item.hoatDong.moTa}</p> : null}

          {item.anh.length === 0 ? (
            <div className="empty-cell">Chưa có ảnh.</div>
          ) : (
            <div className="photo-gallery__grid">
              {item.anh.map((anh, index) => (
                <button
                  type="button"
                  key={anh.id}
                  className="photo-gallery__thumb"
                  onClick={() =>
                    setLightbox({
                      urls: item.anh.map((row) => row.url),
                      index,
                      title: item.hoatDong.tieuDe,
                    })
                  }
                >
                  <img src={appUrl(anh.url)} alt="" />
                </button>
              ))}
            </div>
          )}
        </article>
      ))}

      {lightbox ? (
        <Lightbox
          images={lightbox.urls}
          startIndex={lightbox.index}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
