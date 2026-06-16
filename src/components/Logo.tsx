import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
};

const sizes = {
  sm: { icon: 32, text: "text-lg" },
  md: { icon: 40, text: "text-xl" },
  lg: { icon: 56, text: "text-2xl" },
};

export function Logo({ showText = true, size = "md", href = "/" }: LogoProps) {
  const { icon, text } = sizes[size];

  const content = (
    <>
      <Image
        src="/anyme-logo.png"
        alt="AnyMe"
        width={icon}
        height={icon}
        className="shrink-0"
        priority
      />
      {showText && (
        <span
          className={`${text} font-semibold tracking-tight text-anyme-silver-light`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          AnyMe
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2.5">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5">{content}</div>;
}
