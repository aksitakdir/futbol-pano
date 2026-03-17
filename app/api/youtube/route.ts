import { NextRequest, NextResponse } from "next/server";

export type YouTubeSearchItem = {
  title: string;
  thumbnail: string;
  videoId: string;
  channelTitle: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 }
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "3");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "YouTube API error", details: text },
      { status: res.status }
    );
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: { default?: { url?: string }; medium?: { url?: string }; high?: { url?: string } };
      };
    }>;
  };

  const items: YouTubeSearchItem[] = [];
  for (const item of data.items ?? []) {
    const videoId = item.id?.videoId;
    if (!videoId || !item.snippet) continue;
    const thumb = item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url ?? "";
    items.push({
      title: item.snippet.title ?? "",
      thumbnail: thumb,
      videoId,
      channelTitle: item.snippet.channelTitle ?? "",
    });
    if (items.length >= 3) break;
  }

  return NextResponse.json(items);
}
