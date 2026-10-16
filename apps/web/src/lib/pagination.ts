export type PageItem = number | "...";

export function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const wanted = [1, page - 1, page, page + 1, totalPages];

  const pages = [...new Set(wanted)]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;

  for (const current of pages) {
    const gap = current - previous;

    if (gap === 2) {
      items.push(previous + 1);
    } else if (gap > 2) {
      items.push("...");
    }

    items.push(current);
    previous = current;
  }

  return items;
}
