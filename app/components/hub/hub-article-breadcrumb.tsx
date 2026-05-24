import Link from "next/link";
import { categoryPublicPath, CAT_LABEL } from "@/lib/category-config";

type Props = {
  hubId: string;
  locale?: string;
};

export default function HubArticleBreadcrumb({ hubId }: Props) {
  const basePath = categoryPublicPath(hubId);
  const title = CAT_LABEL[hubId] ?? hubId;

  return (
    <Link
      href={basePath}
      className="mono"
      style={{
        display: "inline-block",
        fontSize: 11,
        letterSpacing: "0.14em",
        color: "var(--sg-text-muted)",
        marginBottom: 20,
        textDecoration: "none",
      }}
    >
      ← Back to {title}
    </Link>
  );
}
