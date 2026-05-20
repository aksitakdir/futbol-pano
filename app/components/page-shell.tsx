import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header";
  id?: string;
  style?: React.CSSProperties;
  /** Override the base shell class. Defaults to "sg-page-shell" */
  shellClass?: "sg-page-shell" | "sg-editorial-shell" | "sg-hero-text-block" | "sg-site-container";
};

export default function PageShell({ children, className = "", as: Tag = "div", id, style, shellClass = "sg-page-shell" }: Props) {
  const El = Tag as ElementType;
  return (
    <El id={id} className={`${shellClass} ${className}`.trim()} style={style}>
      {children}
    </El>
  );
}
