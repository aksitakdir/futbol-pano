"use client";

import SiteHeader from "../components/site-header";
import Breadcrumb from "../components/breadcrumb";

export default function TurnuvaPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <SiteHeader activeNav="turnuva" maxWidth="max-w-7xl" />

      <div className="mx-auto max-w-7xl px-4 py-3">
        <Breadcrumb items={[{ label: "Turnuva" }]} />
      </div>

      <iframe
        src="/ucl-bracket.html"
        className="flex-1 border-none"
        style={{ minHeight: "calc(100vh - 97px)" }}
        title="Gelecek Yıldızlar Turnuvası"
      />
    </main>
  );
}
