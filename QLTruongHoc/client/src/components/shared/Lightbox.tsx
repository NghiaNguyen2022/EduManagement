import { useEffect, useState } from "react";
import { appUrl } from "../../utils/appUrl";

type LightboxProps = {
  images: string[];
  startIndex: number;
  title?: string;
  onClose: () => void;
};

/** Xem ảnh phóng to — dùng chung cho album ảnh hoạt động lớp (cả phía giáo viên và phụ huynh). */
export function Lightbox({ images, startIndex, title, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + images.length) % images.length);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Đóng">
        ×
      </button>

      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        {images.length > 1 ? (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--prev"
            aria-label="Ảnh trước"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
          >
            ‹
          </button>
        ) : null}

        <img src={appUrl(images[index])} alt="" className="lightbox-image" />

        {images.length > 1 ? (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--next"
            aria-label="Ảnh sau"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
          >
            ›
          </button>
        ) : null}
      </div>

      {title || images.length > 1 ? (
        <div className="lightbox-caption">
          {title ? <strong>{title}</strong> : null}
          {images.length > 1 ? (
            <span>
              {index + 1}/{images.length}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
