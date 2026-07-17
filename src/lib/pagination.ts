export const POSTS_PER_PAGE = 3;

export type PageResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevHref: string | null;
  nextHref: string | null;
};

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize = POSTS_PER_PAGE,
  basePath = '/blog',
): PageResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  const pageHref = (n: number) =>
    n <= 1 ? basePath : `${basePath}/page/${n}`;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total,
    hasPrev: current > 1,
    hasNext: current < totalPages,
    prevHref: current > 1 ? pageHref(current - 1) : null,
    nextHref: current < totalPages ? pageHref(current + 1) : null,
  };
}

export function getTotalPages(totalItems: number, pageSize = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(totalItems / pageSize) || 1);
}
