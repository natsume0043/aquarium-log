// localStorageを使ったデータ永続化ユーティリティ

import type { Aquarium } from "./types";

const STORAGE_KEY = "aquarium-log-data";

export function loadAquariums(): Aquarium[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAquariums(aquariums: Aquarium[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(aquariums));
}
