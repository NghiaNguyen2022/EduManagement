type PaginationProps = {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  page?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number) => void;

  itemLabel?: string;
};

function toSafeInteger(
  value: unknown,
  fallback: number,
): number {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    !Number.isInteger(numberValue)
  ) {
    return fallback;
  }

  return numberValue;
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  page,
  pageSize,
  total,
  onChange,
  itemLabel = "mục",
}: PaginationProps) {
  const safePageSize = Math.max(
    1,
    toSafeInteger(pageSize, 10),
  );

  const safeTotal = Math.max(
    0,
    toSafeInteger(total, 0),
  );

  const calculatedTotalPages =
    totalPages !== undefined
      ? Math.max(
          1,
          toSafeInteger(totalPages, 1),
        )
      : Math.max(
          1,
          Math.ceil(
            safeTotal / safePageSize,
          ),
        );

  const rawCurrentPage =
    currentPage ?? page ?? 1;

  const safeCurrentPage = clamp(
    toSafeInteger(rawCurrentPage, 1),
    1,
    calculatedTotalPages,
  );

  const changeHandler =
    onPageChange ?? onChange;

  const hasItemRange =
    total !== undefined &&
    pageSize !== undefined;

  const startItem =
    safeTotal === 0
      ? 0
      : (safeCurrentPage - 1) *
          safePageSize +
        1;

  const endItem =
    safeTotal === 0
      ? 0
      : Math.min(
          safeCurrentPage *
            safePageSize,
          safeTotal,
        );

  function goToPage(
    nextPage: number,
  ) {
    if (!changeHandler) {
      return;
    }

    changeHandler(
      clamp(
        nextPage,
        1,
        calculatedTotalPages,
      ),
    );
  }

  return (
    <div className="pagination">
      <div className="pagination__summary">
        {hasItemRange ? (
          <>
            Hiển thị{" "}
            <strong>
              {startItem}–{endItem}
            </strong>{" "}
            trong{" "}
            <strong>
              {safeTotal}
            </strong>{" "}
            {itemLabel}
          </>
        ) : (
          <>
            Trang{" "}
            <strong>
              {safeCurrentPage}
            </strong>{" "}
            /{" "}
            <strong>
              {calculatedTotalPages}
            </strong>
          </>
        )}
      </div>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          disabled={
            safeCurrentPage <= 1
          }
          onClick={() =>
            goToPage(
              safeCurrentPage - 1,
            )
          }
          aria-label="Trang trước"
        >
          ‹
        </button>

        <span className="pagination__page">
          Trang {safeCurrentPage}/
          {calculatedTotalPages}
        </span>

        <button
          type="button"
          className="pagination__button"
          disabled={
            safeCurrentPage >=
            calculatedTotalPages
          }
          onClick={() =>
            goToPage(
              safeCurrentPage + 1,
            )
          }
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </div>
  );
}
