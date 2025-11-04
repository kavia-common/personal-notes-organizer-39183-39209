import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent {
  @Input() notes: Note[] = [];
  @Input() activeNoteId: string | null = null;

  @Output() selectNote = new EventEmitter<string>();
  @Output() deleteNote = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  /** Friendly date formatting */
  fmt(d: string): string {
    const dt = new Date(d);
    return dt.toLocaleString();
  }
}
