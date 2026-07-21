"use client";
import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  className?: string;
}

const Tabs = ({ tabs, activeTab, className, setActiveTab }: TabsProps) => {
  const [hoveredTab, setHoveredTab] = useState<
    (typeof tabs)[number]["id"] | null
  >(null);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const hoveredIndex = hoveredTab
    ? tabs.findIndex((tab) => tab.id === hoveredTab)
    : -1;

  let stretchX = 0;
  let scaleX = 1;

  if (hoveredIndex !== -1 && hoveredIndex !== activeIndex) {
    const distance = Math.abs(hoveredIndex - activeIndex);
    const isRight = hoveredIndex > activeIndex;
    scaleX = 1 + distance * 0.02;
    stretchX = (isRight ? 3 : -3) * distance;
  }

  return (
    <div className="relative flex p-1 bg-muted-foreground/10 dark:bg-muted/80 shadow-[0_1px_1px_0_var(--color-muted)_inset] rounded-xl max-w-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => {
              setHoveredTab(tab.id);
            }}
            onMouseLeave={() => {
              setHoveredTab(null);
            }}
            className={cn(
              "relative flex-1 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 rounded-lg select-none duration-100 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 z-0",
              isActive
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-background shadow-[0_0_0_1px_var(--color-background)] rounded-lg -z-10"
                animate={{
                  scaleX,
                  x: stretchX,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
