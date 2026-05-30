"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type ActionResult = { ok: boolean; error?: string };

type TransferPayload = {
  player_name: string;
  from_club: string;
  to_club: string;
  fee_tr: string;
  fee_en: string;
  transfer_date: string;
  sort_order: number;
  is_published: boolean;
  source: string;
  updated_at: string;
};

/** Create or update a completed transfer (admin only). */
export async function saveCompletedTransfer(
  payload: TransferPayload,
  id?: string,
): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = id
    ? await supabaseAdmin.from("hub_completed_transfers").update(payload).eq("id", id)
    : await supabaseAdmin.from("hub_completed_transfers").insert(payload);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Delete a completed transfer (admin only). */
export async function deleteCompletedTransfer(id: string): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = await supabaseAdmin
    .from("hub_completed_transfers")
    .delete()
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
