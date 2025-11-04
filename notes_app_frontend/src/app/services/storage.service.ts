import { Injectable } from '@angular/core';

type Json = any;

interface StorageNamespaceConfig {
  version: number;
  namespace: string;
}

const DEFAULT_CONFIG: StorageNamespaceConfig = {
  version: 1,
  namespace: 'notesApp',
};

function getWindow(): any | null {
  try {
    // eslint-disable-next-line no-undef
    return typeof window !== 'undefined' ? (window as any) : null;
  } catch {
    return null;
  }
}

function getLocalStorage(): any | null {
  const w = getWindow();
  // Some SSR or restricted contexts may not have localStorage
  return w && 'localStorage' in w ? (w.localStorage as any) : null;
}

/**
 * PUBLIC_INTERFACE
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** This service wraps localStorage with JSON parsing and a namespaced key. */
  private cfg: StorageNamespaceConfig;

  constructor() {
    // Respect optional environment variable NG_APP_NODE_ENV to create separate namespaces per env
    const w = getWindow() as any;
    const env = (w && w['NG_APP_NODE_ENV']) || (import.meta as any).env?.NG_APP_NODE_ENV || '';
    const suffix = env ? `:${env}` : '';
    this.cfg = { ...DEFAULT_CONFIG, namespace: `${DEFAULT_CONFIG.namespace}${suffix}` };

    // Migrate or initialize version key (only if storage is available)
    const ls = getLocalStorage();
    if (ls) {
      const versionKey = this.key('__version');
      const storedVersion = this.get(versionKey);
      if (storedVersion == null) {
        ls.setItem(versionKey, JSON.stringify(this.cfg.version));
      }
    }
  }

  private key(k: string): string {
    return `${this.cfg.namespace}:${k}`;
  }

  // PUBLIC_INTERFACE
  /** Save a structured JSON value under a namespaced key. */
  set(k: string, value: Json): void {
    try {
      const ls = getLocalStorage();
      if (!ls) return;
      ls.setItem(this.key(k), JSON.stringify(value));
    } catch (err) {
      console.error('StorageService.set error', err);
    }
  }

  // PUBLIC_INTERFACE
  /** Retrieve a structured JSON value under a namespaced key. */
  get<T = Json>(k: string, fallback: T | null = null): T | null {
    try {
      const ls = getLocalStorage();
      if (!ls) return fallback;
      const raw = ls.getItem(this.key(k));
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error('StorageService.get error', err);
      return fallback;
    }
  }

  // PUBLIC_INTERFACE
  /** Remove a key from storage. */
  remove(k: string): void {
    try {
      const ls = getLocalStorage();
      if (!ls) return;
      ls.removeItem(this.key(k));
    } catch (err) {
      console.error('StorageService.remove error', err);
    }
  }
}
