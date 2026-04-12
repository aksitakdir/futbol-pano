import type { ReactNode } from "react";
import EnDocumentLang from "../components/en-document-lang";

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en">
      <EnDocumentLang />
      {children}
    </div>
  );
}
