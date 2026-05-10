import React from "react";
import type { FooterSidebar } from "@/lib/wp/footer";

type FooterProps = React.ComponentPropsWithoutRef<"footer"> & {
  sidebars?: FooterSidebar[];
};

function getSidebarHtml(sidebars: FooterSidebar[] | undefined, id: string) {
  return sidebars?.find((sidebar) => sidebar.id === id)?.html ?? "";
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(function Footer(
  { sidebars = [], className, ...props },
  ref,
) {
  const footerOne = getSidebarHtml(sidebars, "footer-1");
  const footerTwo = getSidebarHtml(sidebars, "footer-2");
  const footerThree = getSidebarHtml(sidebars, "footer-3");
  const footerFour = getSidebarHtml(sidebars, "footer-4");
  const bottomFooterOne = getSidebarHtml(sidebars, "bottom-footer-1");
  const bottomFooterTwo = getSidebarHtml(sidebars, "bottom-footer-2");

  return (
    <footer
      ref={ref}
      {...props}
      className={[
        "relative w-full overflow-hidden bg-[var(--footer-bg)] text-white/80",
        "md:fixed md:bottom-0 md:left-0 md:z-0",
        className ?? "",
      ].join(" ")}
    >
      <div className="w-full px-4 py-14 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div
              className="footer-widget-content footer-widget-content--primary"
              dangerouslySetInnerHTML={{ __html: footerOne }}
            />
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[footerTwo, footerThree, footerFour].map((html, index) => (
                <div
                  key={`footer-col-${index + 2}`}
                  className="footer-widget-content footer-widget-content--info"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-white/10" />

        <div className="mt-6 flex flex-col gap-3 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <div
            className="footer-widget-content footer-widget-content--bottom flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white"
            dangerouslySetInnerHTML={{ __html: bottomFooterOne }}
          />
          <div
            className="footer-widget-content footer-widget-content--bottom text-xs text-white"
            dangerouslySetInnerHTML={{ __html: bottomFooterTwo }}
          />
        </div>
      </div>
    </footer>
  );
});

export default Footer;
