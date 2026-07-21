"use client";

import { NotiRoot } from "noti-toast";
import { ThemeProvider } from "./theme/ThemeProvider";
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotiRoot position="bottom-right" />
      {children}
    </ThemeProvider>
  );
}
