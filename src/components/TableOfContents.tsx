"use client";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

interface TocProps {
  currentIndex: number;
  setCurrentIndex: (val: number) => void;
  works: Array<{ title: string }>;
  bgColorLight?: string | null;
  bgColorDark?: string | null;
}

const Toc = ({
  currentIndex,
  setCurrentIndex,
  works,
  bgColorLight,
  bgColorDark,
}: TocProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tocRef = React.useRef<HTMLDivElement>(null);
  const [showTopMask, setShowTopMask] = React.useState(false);
  const [showBottomMask, setShowBottomMask] = React.useState(false);

  const getNumberToShow = (num: number) => {
    return num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
  };

  const updateMasks = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    // Use a small 2px threshold to avoid issues with subpixel rendering
    const canScrollUp = scrollTop > 2;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 2;

    setShowTopMask(canScrollUp);
    setShowBottomMask(canScrollDown);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateMasks();

    el.addEventListener("scroll", updateMasks);

    // ResizeObserver ensures the masks update when the container size or list length changes
    const observer = new ResizeObserver(() => {
      updateMasks();
    });
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateMasks);
      observer.disconnect();
    };
  }, [works, updateMasks, isOpen]);

  // Detect click outside and Escape key to close the TOC panel
  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: PointerEvent) => {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active item into view inside the TOC container if it is not visible
  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const activeElement = containerRef.current.querySelector(
        '[data-active="true"]',
      ) as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentIndex, isOpen]);

  const maskStyle = React.useMemo(() => {
    let contentGradient = "linear-gradient(to bottom, ";

    if (showTopMask && showBottomMask) {
      contentGradient +=
        "transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)";
    } else if (showTopMask) {
      contentGradient += "transparent 0%, black 24px)";
    } else if (showBottomMask) {
      contentGradient += "black calc(100% - 24px), transparent 100%)";
    } else {
      contentGradient = "linear-gradient(black, black)";
    }

    // 12px covers the scrollbar width area to prevent it from being masked/faded
    const scrollbarWidth = "12px";
    const maskImageValue = `${contentGradient}, linear-gradient(black, black)`;
    const maskSizeValue = `calc(100% - ${scrollbarWidth}) 100%, ${scrollbarWidth} 100%`;
    const maskPositionValue = `left top, right top`;
    const maskRepeatValue = `no-repeat, no-repeat`;

    return {
      maskImage: maskImageValue,
      WebkitMaskImage: maskImageValue,
      maskSize: maskSizeValue,
      WebkitMaskSize: maskSizeValue,
      maskPosition: maskPositionValue,
      WebkitMaskPosition: maskPositionValue,
      maskRepeat: maskRepeatValue,
      WebkitMaskRepeat: maskRepeatValue,
    };
  }, [showTopMask, showBottomMask]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.025,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.015,
        staggerDirection: -1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.1,
      },
    },
  } as const;

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-100 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-foreground select-none">
      <motion.div
        ref={tocRef}
        layout
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 32,
        }}
        className="pointer-events-auto flex flex-col overflow-hidden border border-border/80 bg-background/20 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] ring-1 ring-border/50 ring-offset-2 ring-inset ring-offset-background backdrop-blur-2xl rounded-xl toc-container"
        style={
          {
            "--toc-bg-light": bgColorLight || "var(--background)",
            "--toc-bg-dark": bgColorDark || "var(--background)",
          } as React.CSSProperties
        }
      >
        <motion.div
          layout
          className="flex items-center justify-center p-2"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isOpen ? (
              <motion.div
                key="open-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                ref={containerRef}
                style={maskStyle}
                className="flex flex-col items-start justify-start min-h-30 max-h-60 w-64 overflow-y-auto scrollbar-thumb-accent dark:scrollbar-thumb-neutral-400 scrollbar-thin scrollbar-track-transparent"
              >
                {works.map((work, idx) => {
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      data-active={idx === currentIndex}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "space-x-2 w-full p-2 rounded-md cursor-pointer flex items-center px-2 relative transition-colors duration-75",
                        idx === currentIndex
                          ? "bg-accent/20 text-foreground font-semibold"
                          : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="opacity-60 text-xs font-mono">
                        {getNumberToShow(idx + 1)}
                      </span>
                      <span className="text-sm truncate">{work.title}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key={`closed-title-${currentIndex}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="px-3 py-1 flex items-center gap-2 max-w-[240px] sm:max-w-[320px] text-xs cursor-pointer select-none"
              >
                <span className="opacity-50 text-[10px] font-mono shrink-0">
                  {getNumberToShow(currentIndex + 1)}
                </span>
                <span className="font-semibold truncate">
                  {works[currentIndex]?.title || "Contents"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <style jsx>{`
                .toc-container {
                    background-color: var(--toc-bg-light);
                }
                :global(.dark) .toc-container {
                    background-color: var(--toc-bg-dark);
                }
            `}</style>
    </div>
  );
};

interface TableOfContentsProps {
  articleTitle: string;
  articleSubtitle?: string | null;
  bgColorLight?: string | null;
  bgColorDark?: string | null;
}

export default function TableOfContents({
  articleTitle,
  articleSubtitle,
  bgColorLight,
  bgColorDark,
}: TableOfContentsProps) {
  const [works, setWorks] = React.useState<{ title: string }[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const headingsRef = React.useRef<{ element: HTMLElement; title: string }[]>(
    [],
  );
  const isScrollingRef = React.useRef(false);

  React.useEffect(() => {
    const gathered: { element: HTMLElement; title: string }[] = [];

    // 1. Title
    const titleEl = document.getElementById("article-title");
    if (titleEl) {
      gathered.push({
        element: titleEl,
        title: titleEl.textContent || articleTitle,
      });
    }

    // 2. Subtitle
    const subtitleEl = document.getElementById("article-subtitle");
    if (subtitleEl && articleSubtitle) {
      gathered.push({
        element: subtitleEl,
        title: subtitleEl.textContent || articleSubtitle,
      });
    }

    // 3. Content Headings
    const contentHeadings = document.querySelectorAll(
      "article h1, article h2, article h3, article h4",
    );
    contentHeadings.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.id) {
        htmlEl.id = `heading-${index}`;
      }
      gathered.push({
        element: htmlEl,
        title: htmlEl.textContent || `Section ${index + 1}`,
      });
    });

    headingsRef.current = gathered;
    setWorks(gathered.map((h) => ({ title: h.title })));

    if (gathered.length === 0) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollOffset = 150;
      let currentIdx = 0;

      for (let i = 0; i < gathered.length; i++) {
        const rect = gathered[i].element.getBoundingClientRect();
        if (rect.top <= scrollOffset) {
          currentIdx = i;
        } else {
          break;
        }
      }
      setCurrentIndex(currentIdx);
    };

    // Run once on load to set initial active heading
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [articleTitle, articleSubtitle]);

  const handleSetCurrentIndex = (idx: number) => {
    if (idx < 0 || idx >= headingsRef.current.length) return;

    const target = headingsRef.current[idx].element;
    if (target) {
      isScrollingRef.current = true;
      setCurrentIndex(idx);

      const offset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  if (works.length === 0) return null;

  return (
    <Toc
      currentIndex={currentIndex}
      setCurrentIndex={handleSetCurrentIndex}
      works={works}
      bgColorLight={bgColorLight}
      bgColorDark={bgColorDark}
    />
  );
}
