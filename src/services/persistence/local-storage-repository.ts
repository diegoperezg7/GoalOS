import { createSeedSnapshot, shouldUseSeedSnapshot } from "@/data/seed-snapshot";
import type { AppSnapshot } from "@/types";
import { normalizeSnapshot } from "@/services/persistence/snapshot-normalizer";

import type { AppRepository } from "./app-repository";

const STORAGE_KEY = "goalos.snapshot.v2";

export class LocalStorageRepository implements AppRepository {
  private scope = "default";

  setScope(scope?: string) {
    const normalized = scope?.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    this.scope = normalized && normalized.length > 0 ? normalized : "default";
  }

  loadExisting() {
    const raw = window.localStorage.getItem(this.resolveStorageKey());
    if (!raw) return null;

    try {
      const snapshot = normalizeSnapshot(JSON.parse(raw));
      const nextSnapshot = shouldUseSeedSnapshot(snapshot) ? createSeedSnapshot() : snapshot;
      this.save(nextSnapshot);
      return nextSnapshot;
    } catch {
      return null;
    }
  }

  load() {
    const raw = window.localStorage.getItem(this.resolveStorageKey());

    if (!raw) {
      const snapshot = createSeedSnapshot();
      this.save(snapshot);
      return snapshot;
    }

    try {
      const snapshot = normalizeSnapshot(JSON.parse(raw));
      const nextSnapshot = shouldUseSeedSnapshot(snapshot) ? createSeedSnapshot() : snapshot;
      this.save(nextSnapshot);
      return nextSnapshot;
    } catch {
      const snapshot = createSeedSnapshot();
      this.save(snapshot);
      return snapshot;
    }
  }

  save(snapshot: AppSnapshot) {
    window.localStorage.setItem(this.resolveStorageKey(), JSON.stringify(snapshot));
  }

  reset() {
    const snapshot = createSeedSnapshot();
    this.save(snapshot);
    return snapshot;
  }

  private resolveStorageKey() {
    return this.scope === "default" ? STORAGE_KEY : `${STORAGE_KEY}.${this.scope}`;
  }
}
