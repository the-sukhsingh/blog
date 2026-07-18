"use client";

import { ThemeProvider } from "./theme/ThemeProvider";
import { NotiRoot } from "noti-toast"
export default function Provider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>
    <NotiRoot position="bottom-right"/>
    {children}
  </ThemeProvider>;
}
