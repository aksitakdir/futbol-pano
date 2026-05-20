"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { WC_TEAMS } from "@/lib/wc-2026-teams";
import { POSITION_BUCKET_ORDER, positionBucket, positionBucketLabel, type PositionBucket } from "@/lib/position-buckets";
import { WC_SQUAD_SEEDS } from "@/lib/wc-squad-seeds";
import { fetchWcSquadFromDb, saveWcSquadTeam, type WcSquadDraftRow } from "@/lib/wc-squad-db";

const POSITION_PRESETS = [
  "GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF",
];

function emptyRow(bucket: PositionBucket, sort: number): WcSquadDraftRow {
  return {
    player_name: "",
    position: bucket === "GK" ? "GK" : bucket === "DEF" ? "CB" : bucket === "MID" ? "CM" : "ST",
    position_bucket: bucket,
    club: "",
    sort_order: sort,
    overall_override: null,
  };
}

function rowsFromSeed(teamSlug: string): WcSquadDraftRow[] {
  const seed = WC_SQUAD_SEEDS[teamSlug] ?? [];
  return seed.map((p, i) => ({
    player_name: p.name,
    position: p.position,
    position_bucket: positionBucket(p.position),
    club: p.club ?? "",
    sort_order: i,
    overall_override: null,
  }));
}

function groupByBucket(rows: WcSquadDraftRow[]): Record<PositionBucket, WcSquadDraftRow[]> {
  const out = Object.fromEntries(POSITION_BUCKET_ORDER.map((b) => [b, [] as WcSquadDraftRow[]])) as Record<
    PositionBucket,
    WcSquadDraftRow[]
  >;
  for (const r of rows) {
    const b = r.position_bucket || positionBucket(r.position);
    out[b].push({ ...r, position_bucket: b });
  }
  for (const b of POSITION_BUCKET_ORDER) {
    out[b].sort((a, c) => a.sort_order - c.sort_order);
  }
  return out;
}

function flattenGroups(g: Record<PositionBucket, WcSquadDraftRow[]>): WcSquadDraftRow[] {
  const all: WcSquadDraftRow[] = [];
  let order = 0;
  for (const b of POSITION_BUCKET_ORDER) {
    for (const r of g[b]) {
      all.push({ ...r, position_bucket: b, sort_order: order++ });
    }
  }
  return all;
}

export default function AdminKadrolarPage() {
  const [teamSlug, setTeamSlug] = useState("turkiye");
  const [groups, setGroups] = useState<Record<PositionBucket, WcSquadDraftRow[]>>(() =>
    groupByBucket([]),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadTeam = useCallback(async (slug: string) => {
    setLoading(true);
    setMessage(null);
    const db = await fetchWcSquadFromDb(slug);
    if (db.length > 0) {
      setGroups(
        groupByBucket(
          db.map((r) => ({
            id: r.id,
            player_name: r.player_name,
            position: r.position,
            position_bucket: r.position_bucket,
            club: r.club ?? "",
            sort_order: r.sort_order,
            overall_override: r.overall_override,
          })),
        ),
      );
    } else {
      const seedRows = rowsFromSeed(slug);
      setGroups(seedRows.length ? groupByBucket(seedRows) : groupByBucket([]));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTeam(teamSlug);
  }, [teamSlug, loadTeam]);

  function updateRow(bucket: PositionBucket, index: number, patch: Partial<WcSquadDraftRow>) {
    setGroups((prev) => {
      const next = { ...prev, [bucket]: [...prev[bucket]] };
      const row = { ...next[bucket][index]!, ...patch };
      if (patch.position) row.position_bucket = positionBucket(patch.position);
      next[bucket][index] = row;
      return next;
    });
  }

  function addRow(bucket: PositionBucket) {
    setGroups((prev) => ({
      ...prev,
      [bucket]: [...prev[bucket], emptyRow(bucket, prev[bucket].length)],
    }));
  }

  function removeRow(bucket: PositionBucket, index: number) {
    setGroups((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveWcSquadTeam(teamSlug, flattenGroups(groups));
    setSaving(false);
    setMessage(result.ok ? "Squad saved." : `Error: ${result.error}`);
    if (result.ok) loadTeam(teamSlug);
  }

  function handleImportSeed() {
    setGroups(groupByBucket(rowsFromSeed(teamSlug)));
    setMessage("Seed data loaded — click Save to write to database.");
  }

  const team = WC_TEAMS.find((t) => t.slug === teamSlug);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          WC 2026 Squads
        </h1>
        <p style={{ color: "var(--sg-text-muted)", fontSize: 14, marginBottom: 24 }}>
          Enter players by position. Default view on site is OVR colored list; FC card only opens on click.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 240px" }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
              TEAM
            </span>
            <select
              value={teamSlug}
              onChange={(e) => setTeamSlug(e.target.value)}
              className="admin-input"
              style={{ padding: "10px 12px" }}
            >
              {WC_TEAMS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.nameEn} ({t.code})
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn" onClick={handleImportSeed} disabled={loading}>
            Load from Seed
          </button>
          <button type="button" className="btn btn-solid" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {message ? (
          <p className="mono" style={{ fontSize: 12, marginBottom: 20, color: "var(--accent)" }}>
            {message}
          </p>
        ) : null}

        {loading ? (
          <p className="mono" style={{ fontSize: 12, color: "var(--sg-text-muted)" }}>
            Loading...
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {POSITION_BUCKET_ORDER.map((bucket) => (
              <section
                key={bucket}
                style={{
                  border: "1px solid var(--sg-border)",
                  borderRadius: 6,
                  padding: 16,
                  background: "var(--sg-surface)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", margin: 0 }}>
                    {positionBucketLabel(bucket, "en").toUpperCase()}
                  </h2>
                  <button type="button" className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => addRow(bucket)}>
                    + Player
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {groups[bucket].length === 0 ? (
                    <p className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)" }}>
                      Empty
                    </p>
                  ) : null}
                  {groups[bucket].map((row, idx) => (
                    <div
                      key={`${bucket}-${idx}`}
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: 10,
                        border: "1px solid var(--sg-border)",
                        borderRadius: 4,
                        background: "var(--sg-surface-low)",
                      }}
                    >
                      <input
                        placeholder="Player name"
                        value={row.player_name}
                        onChange={(e) => updateRow(bucket, idx, { player_name: e.target.value })}
                        className="admin-input"
                        style={{ width: "100%" }}
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <select
                          value={row.position}
                          onChange={(e) => updateRow(bucket, idx, { position: e.target.value })}
                          className="admin-input"
                        >
                          {POSITION_PRESETS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Club"
                          value={row.club}
                          onChange={(e) => updateRow(bucket, idx, { club: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          placeholder="OVR (opt.)"
                          value={row.overall_override ?? ""}
                          onChange={(e) =>
                            updateRow(bucket, idx, {
                              overall_override: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="admin-input"
                          style={{ width: 72 }}
                          title="Manual OVR for list color if no FC card"
                        />
                        <button
                          type="button"
                          onClick={() => removeRow(bucket, idx)}
                          style={{
                            marginLeft: "auto",
                            background: "transparent",
                            border: "none",
                            color: "var(--rose)",
                            cursor: "pointer",
                            fontSize: 11,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {team ? (
          <p className="mono" style={{ marginTop: 32, fontSize: 10, color: "var(--sg-text-muted)" }}>
            Preview: /world-cup-2026/squads/{team.slug}
          </p>
        ) : null}
      </div>
    </AdminLayout>
  );
}
