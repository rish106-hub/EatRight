import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getRuntimeEnvironment } from "@/lib/runtime-config";
import "./styles.css";

export const metadata: Metadata = {
  title: "Finish My Dinner",
  description: "Read-only validation shell for Finish My Dinner.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  getRuntimeEnvironment();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
