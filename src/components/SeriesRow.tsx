import { SeriesCard } from "./SeriesCard";
import { SECTION_SIZE } from "@/lib/content";
import type { SeriesCardData } from "@/lib/types";

export function SeriesRow({
  title,
  series,
  ranked = false,
}: {
  title: string;
  series: SeriesCardData[];
  ranked?: boolean;
}) {
  const items = series.slice(0, SECTION_SIZE);
  if (!items.length) return null;

  return (
    <section className="relative w-full">
      <div className="mb-3 flex items-end justify-between sm:mb-4">
        <h2
          className="text-xs font-bold uppercase tracking-[0.12em] text-white sm:text-sm"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 xs:gap-x-3 sm:grid-cols-3 sm:gap-x-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-x-3.5">
        {items.map((item, i) => (
          <SeriesCard
            key={item.id}
            series={item}
            rank={ranked ? i + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
