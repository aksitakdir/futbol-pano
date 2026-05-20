import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header";
  id?: string;
  style?: React.CSSProperties;
};

/** Site geneli yatay padding + max-width (mobil: 16px, masaüstü: 32px) */
export default function PageShell({ children, className = "", as: Tag = "div", id, style }: Props) {
  const El = Tag as ElementType;
  return (
    <El id={id} className={`sg-page-shell ${className}`.trim()} style={style}>
      {children}
    </El>
  );
}
