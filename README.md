# Coptex Front

Headless Next.js frontend for **Coptex Hellas** — a Greek cutting tools & equipment company. This is **not a standalone project**. It requires a WordPress + WooCommerce backend to function, as all content (products, pages, navigation, branding) is fetched from the WordPress REST API and WooCommerce Store API.

---

## Requirements

- Node.js 18+
- A running **WordPress** instance with:
  - **WooCommerce** installed and active
  - **Contact Form 7** plugin (for product inquiry forms)
  - A custom headless plugin that exposes the `/wp-json/headless/v1/` endpoints (site settings, homepage, about, contact, brands, legal pages)
  - The **WP REST API Sidebars** plugin for footer content (`/wp-json/sidebars/v1/footer`)
  - A `slide` custom post type for the hero slider

---

## Environment Variables

Create a `.env.local` file inside the `frontend/` folder with the following variables:

```env
# Required — base URL of your WordPress installation
NEXT_PUBLIC_WP_BASE_URL=http://your-wordpress-site.local

# Required — public URL of this Next.js frontend
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — override default WordPress API endpoints
NEXT_PUBLIC_WP_MENU_ENDPOINT=/wp-json/menus/v1/menus/main_menu
NEXT_PUBLIC_WP_NAVIGATION_ENDPOINT=/wp-json/wp/v2/navigation?status=publish&per_page=100
NEXT_PUBLIC_WP_NAVIGATION_SLUG=
NEXT_PUBLIC_WP_SITE_SETTINGS_ENDPOINT=/wp-json/headless/v1/site-settings
NEXT_PUBLIC_WP_FOOTER_ENDPOINT=/wp-json/sidebars/v1/footer
```

> **Important:** The `next.config.ts` also has the WordPress domain hardcoded under `remotePatterns` for Next.js image optimization. Update that domain to match your WordPress host.

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

### `app/`
Next.js App Router pages and API routes.

| Path | Description |
|------|-------------|
| `page.tsx` | Homepage — hero slider, featured products, about section, machines/tools carousels, CTA |
| `shop/page.tsx` | Shop page — full product listing with attribute and brand filtering |
| `search/page.tsx` | Search results page |
| `product/[...slug]/page.tsx` | Dynamic product detail page — gallery, specs, PDFs, related products, inquiry form |
| `product-category/[...slug]/page.tsx` | Dynamic category page — filtered product grid |
| `epikoinwnia/page.tsx` | Contact page (Greek: "Επικοινωνία") |
| `sxetika-me-emas/page.tsx` | About page (Greek: "Σχετικά με εμάς") |
| `politiki-aporritou/page.tsx` | Privacy policy page — content loaded dynamically from WordPress |
| `layout.tsx` | Root layout — wraps all pages with header, footer, and global styles |
| `robots.ts` | Generates `robots.txt` |
| `sitemap.xml/route.ts` | Sitemap index |
| `products-sitemap.xml/route.ts` | Sitemap for all products |
| `product-categories-sitemap.xml/route.ts` | Sitemap for product categories |
| `pages-sitemap.xml/route.ts` | Sitemap for static pages |

### `app/api/`
Internal Next.js API routes used by the frontend.

| Route | Description |
|-------|-------------|
| `api/media/route.ts` | Image proxy — rewrites WordPress media URLs so Next.js Image optimization works in development |
| `api/search/route.ts` | Product search endpoint (`GET ?q=query&limit=N`) — used by the search overlay |
| `api/contact-availability/route.ts` | Relays product inquiry form submissions (`POST`) to WordPress Contact Form 7 |

### `components/`

| Folder | Description |
|--------|-------------|
| `header/` | Site header: logo, navigation links, search overlay, mobile menu |
| `footer/` | Site footer with reveal-on-scroll layout and footer sidebar widgets from WordPress |
| `sections/` | Homepage sections: hero slider, about, CTA, machines slider, products carousel, brands carousel, stats grid |
| `shop/` | E-commerce components: product card, category listing, product detail, image gallery, inquiry modal |
| `common/` | Shared utilities — Greek uppercase text normalizer |

### `lib/`
All data-fetching logic and business utilities. All WordPress/WooCommerce communication happens here.

| File | Description |
|------|-------------|
| `wp/store.ts` | Core WooCommerce functions — fetch products, categories, attributes, resolve product by slug, format prices |
| `wp/menu.ts` | Fetch and parse the main navigation menu from WordPress (supports multiple menu API formats) |
| `wp/homepage.ts` | Fetch all homepage content sections from the headless WordPress plugin |
| `wp/search.ts` | Client-side product search with a scoring algorithm (weights SKU, name, identifiers, categories, descriptions) and Greek text normalization |
| `wp/about.ts` | Fetch about page content — hero, story, stats, expertise, showcase gallery |
| `wp/contact.ts` | Fetch contact page content — details, form ID, embedded map |
| `wp/site.ts` | Fetch global site settings — logo, site name, favicon |
| `wp/footer.ts` | Fetch footer sidebar widgets from WordPress |
| `wp/brands.ts` | Fetch brand listings |
| `wp/slides.ts` | Fetch hero slider slides (custom `slide` post type in WordPress) |
| `wp/media.ts` | Transform WordPress media URLs into proxied `/api/media` URLs for local development |
| `wp/legal-page.ts` | Fetch dynamic legal/policy page content (privacy, terms, etc.) |
| `wp/types.ts` | Shared TypeScript types for all WordPress/WooCommerce API responses |
| `site-url.ts` | Resolves the correct frontend URL from environment variables |
| `sitemap.ts` | XML sitemap generation helpers |

### `types/`

| File | Description |
|------|-------------|
| `styles.d.ts` | TypeScript declarations for CSS module imports |
| `swiper-css.d.ts` | TypeScript declarations for Swiper carousel CSS imports |

### Root Config Files

| File | Description |
|------|-------------|
| `next.config.ts` | Next.js config — remote image domains, WooCommerce URL rewrites |
| `tsconfig.json` | TypeScript config — includes `@/*` path alias for imports |
| `eslint.config.mjs` | ESLint configuration |
| `postcss.config.mjs` | PostCSS config for Tailwind CSS |
| `package.json` | Dependencies and scripts |

---

## Key WordPress API Endpoints Used

The frontend depends on the following WordPress REST API endpoints being available:

```
/wp-json/headless/v1/site-settings
/wp-json/headless/v1/homepage
/wp-json/headless/v1/about-page
/wp-json/headless/v1/contact-page
/wp-json/headless/v1/brands
/wp-json/headless/v1/legal-page?slug={slug}
/wp-json/wc/store/v1/products
/wp-json/wc/store/v1/products/categories
/wp-json/wc/store/v1/products/attributes
/wp-json/wp/v2/product
/wp-json/wp/v2/slide
/wp-json/wp/v2/navigation
/wp-json/sidebars/v1/footer
/wp-json/contact-form-7/v1/contact-forms/{id}/feedback
```
