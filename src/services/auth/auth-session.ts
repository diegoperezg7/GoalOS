import type { AuthSession } from "@/types";

interface AuthSessionResponse {
  userId?: string;
  email?: string;
  role?: string;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export async function fetchAuthSession(signal?: AbortSignal): Promise<AuthSession | null> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as AuthSessionResponse;
    const userId = readString(payload.userId);
    if (!userId) {
      return null;
    }

    return {
      userId,
      email: readString(payload.email),
      role: readString(payload.role),
    };
  } catch {
    return null;
  }
}
