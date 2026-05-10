"use client";

import { useMemo, useState } from "react";
import ProductInquiryModal from "@/components/shop/ProductInquiryModal";
import { getProductDisplayPrice, type WooProduct } from "@/lib/wp/store";

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

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function formatVariationName(
  productName: string,
  attributes: Array<{ name: string; value: string; valueLabel?: string }>,
) {
  if (!attributes.length) {
    return productName;
  }

  const suffix = attributes
    .map(
      (attribute) =>
        `${decodeHtml(attribute.name)}: ${decodeHtml(attribute.valueLabel || attribute.value)}`,
    )
    .join(" / ");

  return `${productName} - ${suffix}`;
}

export default function ProductDetailClient({ product }: Props) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const isVariableProduct =
    product.type === "variable" || Boolean(product.has_options) || Boolean(product.variations?.length);

  const variationAttributes = useMemo(
    () =>
      isVariableProduct
        ? (product.attributes ?? []).filter((attribute) => attribute.has_variations)
        : [],
    [isVariableProduct, product.attributes],
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const selectedVariation = useMemo(() => {
    if (!isVariableProduct || !product.variations?.length || !variationAttributes.length) {
      return null;
    }

    const hasAllSelections = variationAttributes.every(
      (attribute) => typeof selectedOptions[attribute.name] === "string" && selectedOptions[attribute.name],
    );

    if (!hasAllSelections) {
      return null;
    }

    return (
      product.variations.find((variation) =>
        variation.attributes.every(
          (attribute) =>
            selectedOptions[attribute.name] === normalizeValue(attribute.value),
        ),
      ) ?? null
    );
  }, [isVariableProduct, product.variations, selectedOptions, variationAttributes]);

  const displayProduct = selectedVariation
    ? {
        ...product,
        sku: selectedVariation.sku || product.sku,
        price_html: selectedVariation.price_html || product.price_html,
        prices: selectedVariation.prices || product.prices,
        stock_availability: selectedVariation.stock_availability || product.stock_availability,
      }
    : isVariableProduct
      ? null
      : product;

  const displayPrice = displayProduct ? getProductDisplayPrice(displayProduct) : null;
  const inquiryProductName = selectedVariation
    ? formatVariationName(
        decodeHtml(product.name),
        selectedVariation.attributes.map((attribute) => ({
          name: attribute.name,
          value: attribute.value,
          valueLabel: attribute.valueLabel,
        })),
      )
    : decodeHtml(product.name);

  const onOptionChange = (attributeName: string, value: string) => {
    setSelectedOptions((current) => ({
      ...current,
      [attributeName]: value,
    }));
  };

  return (
    <>
      {isVariableProduct && variationAttributes.length ? (
        <div className="mt-6 space-y-5 border-t border-black/8 pt-6">
          {variationAttributes.map((attribute) => (
            <div key={attribute.id}>
              <label className="mb-2 block text-sm font-semibold text-black">
                {decodeHtml(attribute.name)}
              </label>
              <select
                value={selectedOptions[attribute.name] ?? ""}
                onChange={(event) => onOptionChange(attribute.name, event.target.value)}
                className="w-full rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
              >
                <option value="">Επιλέξτε</option>
                {attribute.terms.map((term) => (
                  <option key={term.id} value={normalizeValue(term.slug)}>
                    {decodeHtml(term.name)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {displayPrice ? (
        <div className="mt-6 flex items-end gap-2">
          {!isVariableProduct ? (
            <span className="text-xs font-medium text-black/45">Από</span>
          ) : null}
          <div className="text-3xl font-semibold text-primary">{displayPrice.amount}</div>
        </div>
      ) : isVariableProduct ? (
        <p className="mt-6 text-sm text-black/50">
          Επιλέξτε παραλλαγή για να δείτε την τιμή.
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setInquiryOpen(true)}
          disabled={isVariableProduct && !selectedVariation}
          className="inline-flex items-center justify-center rounded-[1rem] border border-primary/15 bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Ρωτήστε για διαθεσιμότητα
        </button>
      </div>

      {displayProduct && (displayProduct.sku || displayProduct.stock_availability?.text) ? (
        <div className="mt-6 grid gap-4 border-t border-black/8 pt-6 sm:grid-cols-2">
          {displayProduct.sku ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                SKU
              </p>
              <p className="mt-2 text-sm text-black/68">{displayProduct.sku}</p>
            </div>
          ) : null}

          {displayProduct.stock_availability?.text ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                Διαθεσιμότητα
              </p>
              <p className="mt-2 text-sm text-black/68">{displayProduct.stock_availability.text}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <ProductInquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        productName={inquiryProductName}
      />
    </>
  );
}
