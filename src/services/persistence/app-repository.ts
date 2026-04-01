import type { AppSnapshot } from "@/types";

export interface AppRepository {
  load(): AppSnapshot;
  save(snapshot: AppSnapshot): void;
  reset(): AppSnapshot;
}
