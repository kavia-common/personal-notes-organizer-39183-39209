import { Injectable, signal } from '@angular/core';
import { Notebook } from '../models/notebook.model';
import { StorageService } from './storage.service';
import { nowIso, uid } from '../shared/utils';

/**
 * PUBLIC_INTERFACE
 */
@Injectable({ providedIn: 'root' })
export class NotebooksService {
  /** Signal store for notebooks list. */
  notebooks = signal<Notebook[]>([]);

  private readonly storageKey = 'notebooks';

  constructor(private storage: StorageService) {
    const stored = this.storage.get<Notebook[]>(this.storageKey, null);
    if (stored && stored.length >= 0) {
      this.notebooks.set(stored);
    } else {
      // Seed some demo notebooks
      const demo = [
        { id: uid('nb_'), name: 'Personal', createdAt: nowIso() },
        { id: uid('nb_'), name: 'Work', createdAt: nowIso() },
      ] satisfies Notebook[];
      this.notebooks.set(demo);
      this.persist();
    }
  }

  private persist(): void {
    this.storage.set(this.storageKey, this.notebooks());
  }

  // PUBLIC_INTERFACE
  /** Create a new notebook. */
  create(name: string): Notebook {
    const item: Notebook = { id: uid('nb_'), name, createdAt: nowIso() };
    this.notebooks.update(list => [item, ...list]);
    this.persist();
    return item;
  }

  // PUBLIC_INTERFACE
  /** Rename an existing notebook. */
  rename(id: string, name: string): void {
    this.notebooks.update(list => list.map(n => (n.id === id ? { ...n, name } : n)));
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Delete a notebook by id. */
  delete(id: string): void {
    this.notebooks.update(list => list.filter(n => n.id !== id));
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Get a notebook by id. */
  getById(id: string | null | undefined): Notebook | null {
    if (!id) return null;
    return this.notebooks().find(n => n.id === id) ?? null;
    }
}
