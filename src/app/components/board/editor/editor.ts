import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../../services/boards';
import { Editor, JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-editor',
  imports: [CommonModule],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  private boardService = inject(BoardService);

  currentBoard = this.boardService.currentBoard;
  newSubBoardTitle = signal('');

  @ViewChild('editorHost', { static: true })
  editorHost!: ElementRef<HTMLDivElement>;

  savedContent = input<JSONContent | null>(null);
  boardId = input<string | null>(null);

  editor = signal<Editor | null>(null);

  private contentChange$ = new Subject<JSONContent>();
  private destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.initializeEditor();
    this.setupAutoSave();
  }

  initializeEditor() {
    const editor = new Editor({
      element: this.editorHost.nativeElement,
      extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
      content: this.savedContent() ?? '<p>Start typing...</p>',
      onUpdate: ({ editor }) => {
        this.contentChange$.next(editor.getJSON());
      },
    });

    this.editor.set(editor);
  }

  setupAutoSave() {
    this.contentChange$.pipe(debounceTime(1500), takeUntil(this.destroy$)).subscribe((content) => {
      this.saveContent(content);
    });
  }

  saveContent(content: JSONContent) {
    const id = this.boardId();

    if (id === null) return;

    this.boardService.updateBoardItem(id, content);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor()?.destroy();
    this.editor.set(null);
  }
}
