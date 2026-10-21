"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main section, main article, main [data-scroll-reveal]",
      ),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const inViewport = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > 0;
    };
    elements.forEach((element) => {
      if (inViewport(element)) {
        element.classList.add("is-visible");
      } else {
        element.classList.add("scroll-reveal");
      }
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -35px 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return <div key={pathname} className={pathname.startsWith("/admin") ? undefined : "page-enter"}>{children}</div>;
}
