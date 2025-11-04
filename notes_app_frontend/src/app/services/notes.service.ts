import { Injectable, signal, computed } from '@angular/core';
import { Note } from '../models/note.model';
import { StorageService } from './storage.service';
import { nowIso, uid } from '../shared/utils';
import { TagsService } from './tags.service';

/**
 * PUBLIC_INTERFACE
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  /** Signal store for notes. */
  notes = signal<Note[]>([]);

  /** Optional current filter state. */
  filterNotebookId = signal<string | null>(null);
  filterTag = signal<string | null>(null);
  query = signal<string>('');

  filteredNotes = computed<Note[]>(() => {
    const q = this.query().trim().toLowerCase();
    const nb = this.filterNotebookId();
    const tag = this.filterTag();

    return this.notes()
      .filter(n => (nb ? n.notebookId === nb : true))
      .filter(n => (tag ? n.tags.includes(tag) : true))
      .filter(n => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some(t => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  private readonly storageKey = 'notes';

  constructor(private storage: StorageService, private tagsSvc: TagsService) {
    const stored = this.storage.get<Note[]>(this.storageKey, null);
    if (stored && stored.length >= 0) {
      this.notes.set(stored);
    } else {
      this.seedDemo();
    }
    // ensure tags are present in the tag service
    this.tagsSvc.ensure([...new Set(this.notes().flatMap(n => n.tags))]);
  }

  private persist(): void {
    this.storage.set(this.storageKey, this.notes());
  }

  private seedDemo(): void {
    const demo: Note[] = [
      {
        id: uid('nt_'),
        title: 'Welcome to Your Notes',
        content:
          'This is a demo note. Use the sidebar to filter by notebooks and tags. Edit this content freely!',
        notebookId: null,
        tags: ['idea'],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: uid('nt_'),
        title: 'Work: Weekly Planning',
        content:
          '- [ ] Review sprint board\n- [ ] Prepare slides for Monday update\n- [ ] Draft proposal for new feature',
        notebookId: null,
        tags: ['todo', 'work'],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ];
    this.notes.set(demo);
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Create a new empty note. */
  create(notebookId: string | null = null): Note {
    const now = nowIso();
    const note: Note = {
      id: uid('nt_'),
      title: 'Untitled note',
      content: '',
      notebookId,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    this.notes.update(list => [note, ...list]);
    this.persist();
    return note;
  }

  // PUBLIC_INTERFACE
  /** Update title/content/notebook/tags of a note. */
  update(id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'notebookId' | 'tags'>>): void {
    let updated: Note | null = null;
    this.notes.update(list =>
      list.map(n => {
        if (n.id !== id) return n;
        const next: Note = { ...n, ...patch, updatedAt: nowIso() };
        updated = next;
        return next;
      }),
    );
    if (updated && Array.isArray((updated as Note).tags)) {
      this.tagsSvc.ensure((updated as Note).tags as string[]);
    }
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Delete a note by id. */
  delete(id: string): void {
    this.notes.update(list => list.filter(n => n.id !== id));
    this.persist();
  }

  // PUBLIC_INTERFACE
  /** Get a note by id. */
  getById(id: string | null | undefined): Note | null {
    if (!id) return null;
    return this.notes().find(n => n.id === id) ?? null;
  }
}
