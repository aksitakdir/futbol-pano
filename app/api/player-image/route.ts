import { NextRequest, NextResponse } from "next/server";

/** Varsayılan: next.config.ts remotePatterns ile aynı kaynak */
const DEFAULT_ALLOWED_HOSTS = ["cdn.sofifa.net"];

function allowedHosts(): string[] {
  const raw = process.env.PLAYER_IMAGE_ALLOWED_HOSTS?.trim();
  if (!raw) return DEFAULT_ALLOWED_HOSTS;
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function isHostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return allowedHosts().some((a) => h === a || h.endsWith(`.${a}`));
}

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("url");
  if (!param) {
    return NextResponse.json({ error: "url parametresi gerekli" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(param);
  } catch {
    try {
      target = new URL(decodeURIComponent(param));
    } catch {
      return NextResponse.json({ error: "geçersiz url" }, { status: 400 });
    }
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "yalnızca http(s) desteklenir" }, { status: 400 });
  }

  if (!isHostAllowed(target.hostname)) {
    return NextResponse.json({ error: "izin verilmeyen host" }, { status: 403 });
  }

  const upstream = await fetch(target.href, {
    headers: {
      Accept: "image/*",
      "User-Agent": "ScoutIntelligence-ImageProxy/1.0",
      Referer: "https://sofifa.com",
    },
    next: { revalidate: 86_400 },
  });

  if (!upstream.ok) {
    return new NextResponse(null, {
      status: upstream.status === 404 ? 404 : 502,
    });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "yanıt görsel değil" }, { status: 400 });
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
