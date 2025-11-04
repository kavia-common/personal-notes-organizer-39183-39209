import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounce } from '../../shared/utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() appTitle = 'Ocean Notes';
  @Input() search = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() newNote = new EventEmitter<void>();
  @Output() newNotebook = new EventEmitter<void>();

  // Keep an internal model bound to input, emit debounced to parent
  model = '';

  ngOnChanges(): void {
    this.model = this.search || '';
  }

  private emitDebounced = debounce((value: string) => {
    this.searchChange.emit(value);
  }, 250);

  // PUBLIC_INTERFACE
  /** Called on ngModel change for search box. */
  onModelChange(v: string): void {
    this.emitDebounced(v);
  }

  // PUBLIC_INTERFACE
  /** Focus handler to show any future search help. */
  onSearchFocus(): void {
    // Placeholder for future
  }
}
