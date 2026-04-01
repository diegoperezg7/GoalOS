import type { AppSnapshot } from "@/types";

import { getSupabaseClient } from "./client";

const TABLE_NAME = "app_snapshots";

export async function pushSnapshotToSupabase(snapshot: AppSnapshot, userId: string) {
  const client = getSupabaseClient();
  if (!client) return;

  await client.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      payload: snapshot,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );
}

export async function pullSnapshotFromSupabase(userId: string) {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from(TABLE_NAME)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;

  return (data?.payload as AppSnapshot | undefined) ?? null;
}
