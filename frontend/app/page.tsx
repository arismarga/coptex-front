import type { Metadata } from "next";
import HeroSlider from "../components/sections/HeroSlider";
import HomepageAboutSection from "../components/sections/HomepageAboutSection";
import HomepageCtaSection from "../components/sections/HomepageCtaSection";
import HomepageMachinesSlider from "../components/sections/HomepageMachinesSlider";
import HomepageProductsCarousel from "../components/sections/HomepageProductsCarousel";
import {
  getHomepageContent,
  getHomepageFeaturedProducts,
  getHomepageMachinesProducts,
  getHomepageToolsProducts,
} from "../lib/wp/homepage";
import { getSlides } from "../lib/wp/slides";

export async function generateMetadata(): Promise<Metadata> {
  const homepageContent = await getHomepageContent();
  const title = homepageContent?.seo?.metaTitle || "Coptex Hellas";
  const description =
    homepageContent?.seo?.metaDescription ||
    homepageContent?.featured?.description ||
    homepageContent?.about?.description ||
    "Coptex Hellas - κοπτικός εξοπλισμός για τόρνους, φρέζες CNC και βιομηχανικές εφαρμογές.";
  const ogImage = homepageContent?.seo?.ogImage?.url;

  return {
    title,
    description,
    openGraph: ogImage
      ? {
          title,
          description,
          images: [{ url: ogImage }],
        }
      : undefined,
  };
}

export default async function HomePage() {
  const [slides, homepageContent] = await Promise.all([getSlides(), getHomepageContent()]);
  const featuredProducts = await getHomepageFeaturedProducts(homepageContent?.featured);
  const machinesProducts = await getHomepageMachinesProducts(homepageContent?.machines);
  const toolsProducts = await getHomepageToolsProducts(homepageContent?.tools);

  const featured = homepageContent?.featured;
  const about = homepageContent?.about;
  const machines = homepageContent?.machines;
  const tools = homepageContent?.tools;
  const cta = homepageContent?.cta;

  return (
    <main>
      {homepageContent?.showSlider === false ? null : <HeroSlider slides={slides} />}

      {featured?.enabled ? (
        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-12 2xl:px-16 first-carousel-products">
          <div className="w-full">
            <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {featured.eyebrow ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/75">
                    {featured.eyebrow}
                  </p>
                ) : null}

                {featured.title ? (
                  <h2 className="section-title mt-4 text-4xl font-bold text-black">{featured.title}</h2>
                ) : null}

                {featured.description ? (
                  <p className="mt-4 text-base leading-7 text-black/65">
                    {featured.description}
                  </p>
                ) : null}
              </div>

              {featured.buttonLabel && featured.buttonUrl ? (
                <a
                  href={featured.buttonUrl}
                  className="inline-flex items-center justify-center self-start rounded-[1rem] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm hover:border-primary hover:bg-primary hover:text-white"
                >
                  {featured.buttonLabel}
                </a>
              ) : null}
            </div>

            <div className="homepage-featured-shell overflow-hidden rounded-[0.5rem] border border-black/8 p-5 shadow-sm sm:p-6 lg:p-7">
              <HomepageProductsCarousel products={featuredProducts} />
            </div>
          </div>
        </section>
      ) : null}

      {about?.enabled ? (
        <HomepageAboutSection
          eyebrow={about.eyebrow}
          title={about.title}
          description={about.description}
          buttonLabel={about.buttonLabel}
          buttonUrl={about.buttonUrl}
          leftImage={about.leftImage}
          rightImage={about.rightImage}
        />
      ) : null}

      {machines?.enabled ? (
        <HomepageMachinesSlider
          sliderId="homepage-machines"
          eyebrow={machines.eyebrow}
          title={machines.title}
          description={machines.description}
          buttonLabel={machines.buttonLabel}
          buttonUrl={machines.buttonUrl}
          products={machinesProducts}
        />
      ) : null}

      {tools?.enabled ? (
        <HomepageMachinesSlider
          sliderId="homepage-tools"
          eyebrow={tools.eyebrow}
          title={tools.title}
          description={tools.description}
          buttonLabel={tools.buttonLabel}
          buttonUrl={tools.buttonUrl}
          products={toolsProducts}
        />
      ) : null}

      {cta?.enabled ? (
        <HomepageCtaSection
          eyebrow={cta.eyebrow}
          title={cta.title}
          description={cta.description}
          buttonLabel={cta.buttonLabel}
          buttonUrl={cta.buttonUrl}
          backgroundImage={cta.backgroundImage}
        />
      ) : null}
    </main>
  );
}
