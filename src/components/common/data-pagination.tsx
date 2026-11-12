import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

type QueryValue = string | undefined;

function pageWindow(page: number, pageCount: number) {
  const pages = new Set<number>([1, pageCount, page]);
  if (page > 1) pages.add(page - 1);
  if (page < pageCount) pages.add(page + 1);

  return [...pages].sort((a, b) => a - b);
}

export async function DataPagination({
  page,
  pageCount,
  total,
  pageSize,
  basePath,
  query = {},
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  basePath: string;
  query?: Record<string, QueryValue>;
}) {
  const t = await getTranslations("common");

  if (pageCount <= 1) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("showing", {
          from: total === 0 ? 0 : 1,
          to: Math.min(pageSize, total),
          total,
        })}
      </p>
    );
  }

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }

    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }

    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  }

  const pages = pageWindow(page, pageCount);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("showing", { from, to, total })}
      </p>
      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            {page <= 1 ? (
              <Button variant="ghost" size="sm" disabled>
                {t("previous")}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={hrefFor(page - 1) as Route}>{t("previous")}</Link>
              </Button>
            )}
          </PaginationItem>
          {pages.map((pageNumber, index) => {
            const previous = pages[index - 1];
            const hasGap = previous !== undefined && pageNumber - previous > 1;

            return (
              <PaginationItem key={pageNumber}>
                {hasGap ? <PaginationEllipsis /> : null}
                <Button
                  variant={pageNumber === page ? "outline" : "ghost"}
                  size="icon"
                  asChild
                >
                  <Link href={hrefFor(pageNumber) as Route}>{pageNumber}</Link>
                </Button>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            {page >= pageCount ? (
              <Button variant="ghost" size="sm" disabled>
                {t("next")}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={hrefFor(page + 1) as Route}>{t("next")}</Link>
              </Button>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
