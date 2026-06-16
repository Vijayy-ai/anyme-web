import { Logo } from "./Logo";
import { HeaderMenu } from "./HeaderMenu";

export function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-anyme-border bg-anyme-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Logo size="sm" />
        <HeaderMenu />
      </div>
    </header>
  );
}
