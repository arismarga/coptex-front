import Image from "next/image";
import Link from "next/link";
import { getFrontendProductPath, getProductDisplayPrice, type WooProduct } from "@/lib/wp/store";

type Props = {
  product: WooProduct;
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (match, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
    });
}

export default function ProductCard({ product }: Props) {
  const image = product.images[0];
  const productPath = getFrontendProductPath(product);
  const displayPrice = getProductDisplayPrice(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/8 bg-white transition duration-200 hover:-translate-y-1">
      <Link href={productPath} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#f4f7f5_0%,#d3d3d3_100%)]">
          {image?.src ? (
            <Image
              src={image.src}
              alt={decodeHtml(image.alt || product.name)}
              fill
              unoptimized
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/35">
              Δεν υπάρχει εικόνα
            </div>
          )}
        </div>
      </Link>

      <div className="flex min-h-[140px] flex-col px-5 py-5">
        <div className="min-h-[3.5rem]">
          <Link href={productPath} className="block">
            <h2 className="line-clamp-2 text-xl font-semibold text-black">
              {decodeHtml(product.name)}
            </h2>
          </Link>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <span className="text-xs text-black/55">(χωρίς Φ.Π.Α.)</span>

          <div className="flex shrink-0 items-end gap-1.5 whitespace-nowrap">
            <span className="pb-0.5 text-[12px] font-medium text-black/45">από</span>
            <div className="text-lg font-semibold text-primary">{displayPrice.amount}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
