import Link from "next/link";
import { getHubConfig, type HubId } from "@/lib/hub-config";

type Props = {
  hubId: HubId;
  locale?: string;
};

/** Shown on category article pages when content belongs to a hub */
export default function HubArticleBreadcrumb({ hubId }: Props) {
  const hub = getHubConfig(hubId);
  const label = "← Back to hub";

  return (
    <Link
      href={hub.basePath}
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
      {label}: {hub.pillarTitle}
    </Link>
  );
}
