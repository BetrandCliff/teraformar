"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ImageLightboxProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export default function ImageLightbox({
  src,
  alt,
  className = "",
  imageClassName = "",
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`View image: ${alt}`}
        title="View image"
        onClick={() => setOpen(true)}
        className={`group/image relative block cursor-zoom-in overflow-hidden ${className}`}
      >
        <img src={src} alt={alt} className={imageClassName} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center overflow-auto bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview: ${alt}`}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-6 sm:top-6"
          >
            <X size={22} />
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            className="block h-auto w-auto max-h-[calc(100dvh-1.5rem)] max-w-[calc(100vw-1.5rem)] cursor-default rounded-lg object-contain shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:max-w-[calc(100vw-3rem)]"
          />
        </div>,
        document.body,
      )}
    </>
  );
}
