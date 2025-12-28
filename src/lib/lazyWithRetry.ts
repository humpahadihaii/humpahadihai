import React from "react";

type LazyFactory<T extends React.ComponentType<any>> = () => Promise<{ default: T }>;

type LazyWithRetryOptions = {
  /** sessionStorage key suffix */
  key?: string;
  /** allow one auto-reload by default */
  maxReloads?: number;
};

/**
 * Wrap React.lazy to auto-reload once on Vite chunk/dynamic import fetch failures
 * (common after deployments when old chunks are cached).
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: LazyFactory<T>,
  options?: LazyWithRetryOptions
) {
  const key = options?.key ?? "chunk_reload";
  const maxReloads = options?.maxReloads ?? 1;

  return React.lazy(async () => {
    const storageKey = `lovable:${key}`;
    try {
      const mod = await factory();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(storageKey);
      }
      return mod;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isChunkError =
        /dynamically imported module|Loading chunk|ChunkLoadError|Importing a module script failed/i.test(
          message
        );

      if (typeof window !== "undefined" && isChunkError) {
        const prev = Number(window.sessionStorage.getItem(storageKey) ?? "0");
        if (prev < maxReloads) {
          window.sessionStorage.setItem(storageKey, String(prev + 1));
          // Force a full reload to refresh hashed asset references.
          window.location.reload();
        }
      }

      throw err;
    }
  });
}
