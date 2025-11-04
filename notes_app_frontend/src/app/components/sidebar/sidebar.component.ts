import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notebook } from '../../models/notebook.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() notebooks: Notebook[] = [];
  @Input() tags: string[] = [];

  @Input() activeNotebookId: string | null = null;
  @Input() activeTag: string | null = null;

  @Output() selectNotebook = new EventEmitter<string | null>();
  @Output() selectTag = new EventEmitter<string | null>();

  // PUBLIC_INTERFACE
  /** Toggle notebook filter. */
  onNotebookClick(id: string): void {
    this.selectNotebook.emit(this.activeNotebookId === id ? null : id);
  }

  // PUBLIC_INTERFACE
  /** Toggle tag filter. */
  onTagClick(tag: string): void {
    this.selectTag.emit(this.activeTag === tag ? null : tag);
  }
}
