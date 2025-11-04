import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * PUBLIC_INTERFACE
 */
@Injectable({ providedIn: 'root' })
export class TagsService {
  /** Tags are represented by their name (unique). */
  tags = signal<string[]>([]);

  private readonly storageKey = 'tags';

  constructor(private storage: StorageService) {
    const stored = this.storage.get<string[]>(this.storageKey, null);
    if (stored) {
      this.tags.set(stored);
    } else {
      this.tags.set(['todo', 'idea', 'research']);
      this.persist();
    }
  }

  private persist(): void {
    this.storage.set(this.storageKey, this.tags());
  }

  // PUBLIC_INTERFACE
  /** Ensure the provided tags exist in the tag list. */
  ensure(names: string[]): void {
    const current = new Set(this.tags());
    let changed = false;
    for (const n of names) {
      if (!current.has(n)) {
        current.add(n);
        changed = true;
      }
    }
    if (changed) {
      this.tags.set([...current].sort((a, b) => a.localeCompare(b)));
      this.persist();
    }
  }

  // PUBLIC_INTERFACE
  /** Remove a tag from the global list (does not remove from notes). */
  remove(name: string): void {
    this.tags.update(list => list.filter(t => t !== name));
    this.persist();
  }
}
