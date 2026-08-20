export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 pt-24 text-center lg:px-8">
      <h1
        className="text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Not found
      </h1>
      <p className="mt-3 text-sm text-anyme-silver-mid">
        That series or episode doesn&apos;t exist — or isn&apos;t available on
        the web.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-anyme-silver-light px-5 text-sm font-semibold text-black"
      >
        Back home
      </a>
    </div>
  );
}
