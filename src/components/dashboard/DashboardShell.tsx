"use client";

import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  noPadding?: boolean;
};

export function DashboardShell({ children, noPadding = false }: Props) {
  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div className="shrink-0 z-50">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0">
          <Sidebar />
        </div>
        <main className={noPadding ? "flex-1 overflow-hidden" : "flex-1 p-8 overflow-auto"}>{children}</main>
      </div>
    </div>
  );
}
