import { educationAppearance } from "../../config/educationAppearance";

type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function Pagination({
  page,
  totalItems,
  pageSize = educationAppearance.pagination.defaultPageSize,
  pageSizeOptions = educationAppearance.pagination.pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize),
  );

  const safePage = Math.min(
    Math.max(page, 1),
    totalPages,
  );

  const from =
    totalItems === 0
      ? 0
      : (safePage - 1) * pageSize + 1;

  const to = Math.min(
    safePage * pageSize,
    totalItems,
  );

  return (
    <div className="pagination">
      <div className="pagination__summary">
        Hiển thị <strong>{from}</strong>–<strong>{to}</strong> trong{" "}
        <strong>{totalItems}</strong> mục
      </div>

      <div className="pagination__controls">
        {onPageSizeChange ? (
          <label className="pagination__page-size">
            <span>Số dòng</span>
            <select
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange(Number(event.target.value))
              }
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="button"
          className="pagination__button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹
        </button>

        <span className="pagination__current">
          Trang {safePage}/{totalPages}
        </span>

        <button
          type="button"
          className="pagination__button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
