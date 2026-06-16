import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, COMMUNITY_LINK } from "@/lib/constants";
import { AppStoreButtons } from "@/components/AppStoreButtons";

export const metadata: Metadata = {
  title: "Contact | AnyMe",
  description:
    "Get in touch with the AnyMe team. Reach us by phone, email, or visit us in Jaipur, Rajasthan.",
};

const contactItems = [
  {
    label: "Phone",
    items: CONTACT.phones.map((phone) => ({
      text: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    })),
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "Email",
    items: [{ text: CONTACT.email, href: `mailto:${CONTACT.email}` }],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Location",
    items: [{ text: CONTACT.location, href: undefined }],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <section className="relative min-h-screen pt-28 pb-20">
      <div className="hero-grid absolute inset-0 opacity-30 pointer-events-none" />
      <div className="absolute top-20 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
        <div className="text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-anyme-silver-mid">
            Contact Us
          </p>
          <h1
            className="text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="mt-5 text-lg text-anyme-silver-mid">
            Have questions about AnyMe? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {contactItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-anyme-border bg-anyme-card p-7 text-center"
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-anyme-border bg-anyme-elevated text-anyme-silver">
                {item.icon}
              </div>
              <h2 className="font-medium text-anyme-silver-light">{item.label}</h2>
              <div className="mt-3 space-y-1">
                {item.items.map((entry) =>
                  entry.href ? (
                    <a
                      key={entry.text}
                      href={entry.href}
                      className="block text-sm text-anyme-silver-mid transition-colors hover:text-anyme-silver-light"
                    >
                      {entry.text}
                    </a>
                  ) : (
                    <p key={entry.text} className="text-sm text-anyme-silver-mid">
                      {entry.text}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-anyme-border bg-anyme-card p-8 text-center">
          <h2
            className="text-xl font-semibold text-anyme-silver-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AnyMe Community
          </h2>
          <p className="mt-2 text-sm text-anyme-silver-mid">
            Join our WhatsApp community for updates and discussions.
          </p>
          <a
            href={COMMUNITY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-anyme-border bg-anyme-elevated px-5 py-2.5 text-sm font-medium text-anyme-silver-light transition-all hover:border-anyme-border-light"
          >
            Join on WhatsApp
          </a>
        </div>

        <div className="mt-8 rounded-xl border border-anyme-border bg-anyme-surface p-8 text-center sm:p-12">
          <h2
            className="text-2xl font-semibold text-anyme-silver-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Download AnyMe
          </h2>
          <p className="mt-3 text-anyme-silver-mid">
            Experience India&apos;s first vertical anime microdrama platform.
          </p>
          <div className="mt-8 flex justify-center">
            <AppStoreButtons size="lg" />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-anyme-silver-dark">
          <Link
            href="/"
            className="text-anyme-silver transition-colors hover:text-anyme-silver-light"
          >
            ← Back to Home
          </Link>
        </p>
      </div>
    </section>
  );
}
