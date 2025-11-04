import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note.model';
import { Notebook } from '../../models/notebook.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css'],
})
export class NoteEditorComponent {
  @Input() note: Note | null = null;
  @Input() notebooks: Notebook[] = [];
  @Input() allTags: string[] = [];

  @Output() changeTitle = new EventEmitter<string>();
  @Output() changeContent = new EventEmitter<string>();
  @Output() changeNotebook = new EventEmitter<string | null>();
  @Output() changeTags = new EventEmitter<string[]>();

  tagInput = '';

  // PUBLIC_INTERFACE
  /** Add a tag from the input field. */
  addTag(): void {
    const t = this.tagInput.trim();
    if (!this.note || !t) return;
    const next = Array.from(new Set([...(this.note.tags || []), t]));
    this.changeTags.emit(next);
    this.tagInput = '';
  }

  // PUBLIC_INTERFACE
  /** Remove a tag from the note. */
  removeTag(tag: string): void {
    if (!this.note) return;
    const next = (this.note.tags || []).filter(t => t !== tag);
    this.changeTags.emit(next);
  }
}
