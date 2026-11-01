import { getPageItems } from "../lib/pagination";
import type { PaginationProps } from "../types/PaginationProps";

export default function Pagination({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center gap-2"
    >
      <button
        type="button"
        disabled={Boolean(page <= 1 || isLoading)}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary"
      >
        Previous
      </button>

      {items.map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-1 text-muted">
            ...
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className="page-box rounded-sm bg-ink font-semibold text-white"
          >
            {item}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={isLoading}
            onClick={() => onPageChange(item)}
            className="page-box rounded-sm border border-line bg-white hover:border-ink disabled:opacity-50"
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={Boolean(page >= totalPages || isLoading)}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary"
      >
        Next
      </button>
    </nav>
  );
}
