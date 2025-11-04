import { Component, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NotesListComponent } from '../../components/notes-list/notes-list.component';
import { NoteEditorComponent } from '../../components/note-editor/note-editor.component';
import { NotesService } from '../../services/notes.service';
import { NotebooksService } from '../../services/notebooks.service';
import { TagsService } from '../../services/tags.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, NotesListComponent, NoteEditorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private notesSvc = inject(NotesService);
  private notebooksSvc = inject(NotebooksService);
  private tagsSvc = inject(TagsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Derived signals
  notebooks = computed(() => this.notebooksSvc.notebooks());
  tags = computed(() => this.tagsSvc.tags());
  notes = computed(() => this.notesSvc.filteredNotes());
  query = computed(() => this.notesSvc.query());
  activeNotebookId = computed(() => this.notesSvc.filterNotebookId());
  activeTag = computed(() => this.notesSvc.filterTag());

  selectedNoteId: string | null = null;

  ngOnInit(): void {
    // React to routing params to set filters and selected note
    this.route.paramMap.subscribe(params => {
      const nb = params.get('id');
      const tag = params.get('name');
      const note = params.get('noteId');

      if (this.route.snapshot.routeConfig?.path?.startsWith('notebook')) {
        this.notesSvc.filterNotebookId.set(nb);
        this.notesSvc.filterTag.set(null);
      } else if (this.route.snapshot.routeConfig?.path?.startsWith('tag')) {
        this.notesSvc.filterTag.set(tag);
        this.notesSvc.filterNotebookId.set(null);
      } else {
        this.notesSvc.filterNotebookId.set(null);
        this.notesSvc.filterTag.set(null);
      }
      this.selectedNoteId = note;
    });

    // Also read query param q for search
    this.route.queryParamMap.subscribe(qp => {
      const q = qp.get('q') || '';
      this.notesSvc.query.set(q);
    });
  }

  // PUBLIC_INTERFACE
  /** Create a new note and open it. */
  createNote(): void {
    const nb = this.activeNotebookId();
    const n = this.notesSvc.create(nb);
    this.openNote(n.id);
  }

  // PUBLIC_INTERFACE
  /** Create a new notebook and filter by it. */
  createNotebook(): void {
    const g: any = typeof globalThis !== 'undefined' ? globalThis : null;
    const name = g && g.prompt ? g.prompt('Enter notebook name:') : null;
    if (!name) return;
    const nb = this.notebooksSvc.create(name);
    this.router.navigate(['/notebook', nb.id], { queryParamsHandling: 'preserve' });
  }

  // PUBLIC_INTERFACE
  /** Updates global search query and preserves route. */
  updateSearch(q: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q }, queryParamsHandling: 'merge' });
  }

  // PUBLIC_INTERFACE
  /** Select a notebook filter. */
  onSelectNotebook(id: string | null): void {
    if (id) {
      this.router.navigate(['/notebook', id], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
    }
  }

  // PUBLIC_INTERFACE
  /** Select a tag filter. */
  onSelectTag(tag: string | null): void {
    if (tag) {
      this.router.navigate(['/tag', tag], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
    }
  }

  // PUBLIC_INTERFACE
  /** Open a note detail within current filter route. */
  openNote(id: string): void {
    this.selectedNoteId = id;
    const base = this.route.snapshot.routeConfig?.path || '';
    const params = this.route.snapshot.params;
    if (base.startsWith('notebook')) {
      this.router.navigate(['/notebook', params['id'], 'note', id], { queryParamsHandling: 'preserve' });
    } else if (base.startsWith('tag')) {
      this.router.navigate(['/tag', params['name'], 'note', id], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/note', id], { queryParamsHandling: 'preserve' });
    }
  }

  // PUBLIC_INTERFACE
  /** Delete a note and clear selection if needed. */
  deleteNote(id: string): void {
    const g: any = typeof globalThis !== 'undefined' ? globalThis : null;
    const ok = g && g.confirm ? g.confirm('Delete this note? This cannot be undone.') : true;
    if (!ok) return;
    this.notesSvc.delete(id);
    if (this.selectedNoteId === id) {
      this.selectedNoteId = null;
      // navigate to base of current filter
      this.onSelectNotebook(this.activeNotebookId());
    }
  }

  get selectedNote() {
    return this.notesSvc.getById(this.selectedNoteId);
  }

  // PUBLIC_INTERFACE
  /** Update selected note fields */
  updateTitle(v: string) {
    if (!this.selectedNoteId) return;
    this.notesSvc.update(this.selectedNoteId, { title: v });
  }
  // PUBLIC_INTERFACE
  updateContent(v: string) {
    if (!this.selectedNoteId) return;
    this.notesSvc.update(this.selectedNoteId, { content: v });
  }
  // PUBLIC_INTERFACE
  updateNotebook(v: string | null) {
    if (!this.selectedNoteId) return;
    this.notesSvc.update(this.selectedNoteId, { notebookId: v || null });
  }
  // PUBLIC_INTERFACE
  updateTags(tags: string[]) {
    if (!this.selectedNoteId) return;
    this.notesSvc.update(this.selectedNoteId, { tags });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: any) {
    const e = ev as any;
    if ((e.ctrlKey || e.metaKey) && typeof e.key === 'string' && e.key.toLowerCase() === 'n') {
      if (e.preventDefault) e.preventDefault();
      this.createNote();
    }
  }
}
