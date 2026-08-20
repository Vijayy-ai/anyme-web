import { HeaderShell } from "./HeaderShell";
import { Logo } from "./Logo";
import { HeaderMenu } from "./HeaderMenu";
import { getTopPicks, toCardList } from "@/lib/content";

export async function Header() {
  const topSeries = await getTopPicks()
    .then(toCardList)
    .catch(() => []);

  return (
    <HeaderShell>
      <header className="sticky top-0 z-40 w-full border-b border-transparent bg-transparent transition-colors duration-200">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-3 py-3.5 sm:px-4 lg:px-5">
          <Logo size="sm" />
          <HeaderMenu topSeries={topSeries} />
        </div>
      </header>
    </HeaderShell>
  );
}
