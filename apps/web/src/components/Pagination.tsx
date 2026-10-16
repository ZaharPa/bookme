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
      className="mt-6 flex items-center justify-center gap-4"
    >
      <button
        type="button"
        disabled={Boolean(page <= 1 || isLoading)}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 disabled:opacity-40"
      >
        Previous
      </button>

      {items.map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={item === page || isLoading}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`rounded px-3 py-1 ${
              item === page ? "bg-gray-900 text-white" : "border"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={Boolean(page >= totalPages || isLoading)}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
