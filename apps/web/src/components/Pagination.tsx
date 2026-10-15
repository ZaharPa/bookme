import type { PaginationProps } from "../types/PaginationProps";

export default function Pagination({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-4"
    >
      <button
        type="button"
        disabled={Boolean(page <= 1 || isLoading)}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={Boolean(page >= totalPages || isLoading)}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
