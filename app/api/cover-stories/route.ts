import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildCoverStoriesPatch,
  type CoverStoryScope,
} from "@/lib/cover-story";
import {
  createSupabaseAdmin,
  readCoverStoryPins,
  writeCoverStoryPins,
} from "@/lib/cover-story-store";

function isAdminAuthed(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const session = cookieStore.get("sg_admin");
  return session?.value === expected;
}

export async function GET() {
  try {
    const sb = createSupabaseAdmin();
    const pins = await readCoverStoryPins(sb);
    return NextResponse.json({ pins });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load cover stories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!isAdminAuthed(cookieStore)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      contentId?: string;
      category?: string;
      scopes?: CoverStoryScope[];
    };

    const contentId = body.contentId?.trim();
    const category = body.category?.trim();
    const scopes = Array.isArray(body.scopes) ? body.scopes : [];

    if (!contentId || !category) {
      return NextResponse.json({ error: "contentId and category required" }, { status: 400 });
    }

    const sb = createSupabaseAdmin();
    const current = await readCoverStoryPins(sb);
    const next = buildCoverStoriesPatch(current, contentId, category, scopes);
    await writeCoverStoryPins(sb, next);

    return NextResponse.json({ ok: true, pins: next });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save cover stories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
