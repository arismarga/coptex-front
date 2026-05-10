// components/header/Logo.tsx
import Image from "next/image";
import Link from "next/link";

type Props = {
  text?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoWidth?: number | null;
  logoHeight?: number | null;
};

export default function Logo({
  text = "Coptex Hellas",
  logoUrl,
  logoAlt,
  logoWidth,
  logoHeight,
}: Props) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={logoAlt || text}
          width={logoWidth || 180}
          height={logoHeight || 56}
          unoptimized
          className="h-11 w-auto object-contain"
          priority
        />
      ) : (
        <>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight">{text}</span>
        </>
      )}
    </Link>
  );
}
