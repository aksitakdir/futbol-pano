"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransferAbPoll } from "@/lib/transfer-polls";

type Props = {
  poll: TransferAbPoll;
};

function localKey(pollId: string) {
  return `sg-transfer-poll-${pollId}`;
}

export default function TransferAbPollCard({ poll }: Props) {
  const [votes, setVotes] = useState({ a: 50, b: 50 });
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const labelA = poll.labelA ?? poll.clubA;
  const labelB = poll.labelB ?? poll.clubB;
  const question = `Where will ${poll.playerName} go?`;

  const loadVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/transfer-poll-vote?pollId=${encodeURIComponent(poll.id)}`);
      const data = await res.json();
      const a = Number(data.a) || 0;
      const b = Number(data.b) || 0;
      const total = a + b || 1;
      setVotes({ a: Math.round((a / total) * 100), b: Math.round((b / total) * 100) });
    } catch {
      const raw = localStorage.getItem(`${localKey(poll.id)}-counts`);
      if (raw) {
        try {
          const { a, b } = JSON.parse(raw) as { a: number; b: number };
          const total = a + b || 1;
          setVotes({ a: Math.round((a / total) * 100), b: Math.round((b / total) * 100) });
        } catch { /* ignore */ }
      }
    }
    const prev = localStorage.getItem(localKey(poll.id));
    if (prev === "a" || prev === "b") setPicked(prev);
  }, [poll.id]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  async function vote(choice: "a" | "b") {
    if (picked || submitting) return;
    setSubmitting(true);
    setPicked(choice);

    const countsRaw = localStorage.getItem(`${localKey(poll.id)}-counts`);
    let a = 1;
    let b = 1;
    if (countsRaw) {
      try {
        const c = JSON.parse(countsRaw) as { a: number; b: number };
        a = c.a;
        b = c.b;
      } catch { /* ignore */ }
    }
    if (choice === "a") a++;
    else b++;
    localStorage.setItem(`${localKey(poll.id)}-counts`, JSON.stringify({ a, b }));
    localStorage.setItem(localKey(poll.id), choice);
    const total = a + b;
    setVotes({ a: Math.round((a / total) * 100), b: Math.round((b / total) * 100) });

    await fetch("/api/transfer-poll-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, choice }),
    }).catch(() => {});

    loadVotes();
    setSubmitting(false);
  }

  return (
    <article className="transfer-ab-card lift">
      <div className="transfer-ab-card__top">
        <span className="eyebrow transfer-eyebrow">DESTINATION?</span>
        <h3 className="display transfer-ab-card__player">{poll.playerName}</h3>
        <p className="transfer-ab-card__q">{question}</p>
      </div>

      <div className="transfer-ab-options">
        <button
          type="button"
          disabled={!!picked || submitting}
          className={`btn transfer-ab-opt${picked === "a" ? " transfer-ab-opt--picked" : ""}`}
          onClick={() => vote("a")}
        >
          <span className="transfer-ab-opt__club">{labelA}</span>
          <span className="mono transfer-ab-opt__pct">{votes.a}%</span>
        </button>
        <button
          type="button"
          disabled={!!picked || submitting}
          className={`btn transfer-ab-opt${picked === "b" ? " transfer-ab-opt--picked" : ""}`}
          onClick={() => vote("b")}
        >
          <span className="transfer-ab-opt__club">{labelB}</span>
          <span className="mono transfer-ab-opt__pct">{votes.b}%</span>
        </button>
      </div>

      <div className="transfer-ab-bar" aria-hidden>
        <span className="transfer-ab-bar__a" style={{ width: `${votes.a}%` }} />
        <span className="transfer-ab-bar__b" style={{ width: `${votes.b}%` }} />
      </div>
    </article>
  );
}
