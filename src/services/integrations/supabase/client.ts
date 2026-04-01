import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { shouldRequireAIdentityAuth } from "@/services/auth/aidentity";

let cachedClient: SupabaseClient | null = null;
const AUTH_SUPABASE_URL = import.meta.env.VITE_AUTH_SUPABASE_URL || "";

function resolveSafeSupabaseUrl(value?: string) {
  if (!value) return null;
  if (typeof window === "undefined") return value;

  try {
    const resolved = new URL(value, window.location.href);
    if (window.location.protocol === "https:" && resolved.protocol === "http:") {
      return null;
    }
    return resolved.toString();
  } catch {
    return null;
  }
}

function isLocalSupabaseUrl(value: string) {
  try {
    const url = typeof window === "undefined" ? new URL(value) : new URL(value, window.location.href);
    return ["127.0.0.1", "localhost", "host.docker.internal"].includes(url.hostname);
  } catch {
    return false;
  }
}

function resolveSupabaseUrl() {
  const configuredUrl = resolveSafeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);

  if (shouldRequireAIdentityAuth() && (!configuredUrl || isLocalSupabaseUrl(configuredUrl))) {
    return AUTH_SUPABASE_URL;
  }

  return configuredUrl;
}

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = resolveSupabaseUrl();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          credentials: "include",
        }),
    },
  });

  return cachedClient;
}
