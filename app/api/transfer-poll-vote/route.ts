import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pollId = String(body.pollId ?? "");
    const choice = body.choice === "b" ? "b" : body.choice === "a" ? "a" : null;
    if (!pollId || !choice) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, localOnly: true });
    }

    const { error } = await supabase.from("transfer_ab_votes").insert({
      poll_id: pollId,
      choice,
    });

    if (error) {
      console.warn("[transfer-poll-vote]", error.message);
      return NextResponse.json({ ok: true, localOnly: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const pollId = new URL(req.url).searchParams.get("pollId");
  if (!pollId) return NextResponse.json({ a: 0, b: 0 });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ a: 0, b: 0 });

  const { data } = await supabase.from("transfer_ab_votes").select("choice").eq("poll_id", pollId);

  let a = 0;
  let b = 0;
  for (const row of data ?? []) {
    if (row.choice === "a") a++;
    else if (row.choice === "b") b++;
  }
  return NextResponse.json({ a, b });
}
