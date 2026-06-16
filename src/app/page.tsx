import Link from "next/link";
import { AppStoreButtons } from "@/components/AppStoreButtons";
import { COMMUNITY_LINK } from "@/lib/constants";

const stats = [
  { value: "55+", label: "Anime Series" },
  { value: "4,000+", label: "Users" },
  { value: "100+", label: "Paying Customers" },
  { value: "1M+", label: "Organic Social Views" },
];

const features = [
  {
    title: "Vertical Anime Viewing",
    description:
      "Full-screen vertical episodes built for one-handed watching.",
  },
  {
    title: "1–2 Minute Microdramas",
    description:
      "Cliffhanger stories you can finish in minutes.",
  },
  {
    title: "Regional Languages",
    description:
      "Enjoy anime in the language you love.",
  },
  {
    title: "Binge-Worthy Series",
    description:
      "Follow complete narratives across episode series.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pb-14">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-white/3 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-5 pt-8 sm:pt-12 lg:px-8 lg:pt-14">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-anyme-border bg-anyme-card px-4 py-1.5 text-sm text-anyme-silver-mid sm:mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-anyme-silver" />
              India&apos;s First Vertical Anime Platform
            </div>

            <h1
              className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Anime in{" "}
              <span className="text-gradient">Microdrama</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-anyme-silver-mid sm:text-lg">
              Original anime microdramas in 1–2 minute episodes — made for your
              phone, binge-ready, in regional languages.
            </p>

            <div className="mt-8 sm:mt-10">
              <AppStoreButtons size="lg" className="justify-center" />
            </div>

            <p className="mt-4 text-sm text-anyme-silver-dark">
              Free to download · Available on Android &amp; iOS
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-anyme-border bg-anyme-card p-6 text-center"
              >
                <p
                  className="text-3xl font-bold text-gradient sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-anyme-silver-mid">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-anyme-silver-mid">
                The Gap
              </p>
              <h2
                className="text-3xl font-bold leading-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                120 Million Anime Fans.{" "}
                <span className="text-anyme-silver-mid">
                  Zero Platforms Built for Them.
                </span>
              </h2>
              <p className="mt-4 leading-relaxed text-anyme-silver-mid">
                India watches anime — but microdramas deserved a dedicated
                vertical platform. That&apos;s AnyMe.
              </p>
            </div>
            <div className="rounded-2xl border border-anyme-border bg-anyme-card p-8 sm:p-10">
              <p className="text-lg leading-relaxed text-anyme-silver sm:text-xl">
                Original anime microdramas in 1–2 minutes — cliffhanger stories
                with regional language accessibility.
              </p>
              <div className="mt-8">
                <AppStoreButtons size="md" className="sm:justify-start" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-anyme-silver-mid">
              Why AnyMe
            </p>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for the Mobile Generation
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-anyme-border bg-anyme-card p-7 transition-colors hover:border-anyme-border-light"
              >
                <h3
                  className="mt-3 text-xl font-semibold text-anyme-silver-light"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-anyme-silver-mid">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Download */}
      <section className="py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-anyme-silver-mid">
                Community
              </p>
              <h2
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Join the AnyMe Community
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-anyme-silver-mid sm:text-lg">
                Connect with fellow anime fans, get updates on new series, and be
                part of India&apos;s growing vertical anime movement.
              </p>
              <a
                href={COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-anyme-border bg-anyme-card px-6 py-4 text-sm font-medium text-anyme-silver-light transition-all hover:border-anyme-border-light hover:bg-anyme-elevated sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                Join on WhatsApp
              </a>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-anyme-silver-mid">
                Download
              </p>
              <h2
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start Binging{" "}
                <span className="text-gradient">Today</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-anyme-silver-mid sm:text-lg">
                Download AnyMe and experience India&apos;s first vertical anime
                microdrama platform.
              </p>
              <div className="mt-8">
                <AppStoreButtons size="lg" className="sm:justify-start" />
              </div>
              <p className="mt-6 text-sm text-anyme-silver-dark">
                Questions?{" "}
                <Link
                  href="/contact"
                  className="text-anyme-silver transition-colors hover:text-anyme-silver-light"
                >
                  Get in touch
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
