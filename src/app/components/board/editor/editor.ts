import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../../services/boards';
import { Editor, JSONContent } from '@tiptap/core';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ListIconComponent } from '../../../icons/listIcon';
import { TaskIconComponent } from '../../../icons/taskIcon';

@Component({
  selector: 'app-editor',
  imports: [CommonModule, ListIconComponent, TaskIconComponent],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
  encapsulation: ViewEncapsulation.None,
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
  isEditing = signal(false);
  editorState = signal(0);

  private contentChange$ = new Subject<JSONContent>();
  private destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.initializeEditor();
    this.setupAutoSave();
    this.setupCheckboxHandler();
  }

  initializeEditor() {
    const editor = new Editor({
      element: this.editorHost.nativeElement,
      autofocus: false,
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        BulletList,
        ListItem,
        Heading,
        TaskList,
        Link.configure({
          autolink: true,
        }),
        TaskItem.configure({
          nested: true,
          onReadOnlyChecked() {
            return false;
          },
        }),
      ],
      content: this.savedContent() ?? '<p>Start typing...</p>',
      onUpdate: ({ editor }) => {
        this.contentChange$.next(editor.getJSON());
        this.editorState.update((v) => v + 1);
        editor.commands.scrollIntoView();
      },
      onSelectionUpdate: () => {
        this.editorState.update((v) => v + 1);
        editor.commands.scrollIntoView();
      },
      onFocus: () => {
        this.isEditing.set(true);
      },
      onBlur: () => {
        this.isEditing.set(false);
      },
    });

    this.editor.set(editor);
  }

  setupAutoSave() {
    this.contentChange$.pipe(debounceTime(1500), takeUntil(this.destroy$)).subscribe((content) => {
      this.saveContent(content);
    });
  }

  setupCheckboxHandler() {
    const editorElement = this.editorHost.nativeElement;

    const handleCheckboxClick = (target: HTMLElement, event: Event) => {
      let checkbox: HTMLInputElement | null = null;

      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        checkbox = target as HTMLInputElement;
      } else if (target.tagName === 'SPAN') {
        const parent = target.parentElement;
        if (parent?.tagName === 'LABEL') {
          checkbox = parent.querySelector('input[type="checkbox"]');
        }
      } else if (target.tagName === 'LABEL') {
        checkbox = target.querySelector('input[type="checkbox"]');
      }

      if (checkbox) {
        event.preventDefault();
        event.stopPropagation();

        const pos = this.editor()?.view.posAtDOM(checkbox, 0);

        if (pos !== undefined && pos !== null && this.editor()) {
          const { state } = this.editor()!;
          const $pos = state.doc.resolve(pos);

          for (let d = $pos.depth; d > 0; d--) {
            const node = $pos.node(d);
            if (node.type.name === 'taskItem') {
              const taskItemPos = $pos.before(d);

              const tr = state.tr.setNodeMarkup(taskItemPos, undefined, {
                ...node.attrs,
                ['checked']: !node.attrs['checked'],
              });

              this.editor()!.view.dispatch(tr);
              break;
            }
          }
        }
      }
    };

    editorElement.addEventListener(
      'mousedown',
      (event) => {
        handleCheckboxClick(event.target as HTMLElement, event);
      },
      true,
    );

    editorElement.addEventListener(
      'click',
      (event) => {
        const target = event.target as HTMLElement;
        const isCheckboxArea =
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') ||
          (target.tagName === 'SPAN' &&
            target.parentElement?.tagName === 'LABEL' &&
            target.parentElement.querySelector('input[type="checkbox"]')) ||
          (target.tagName === 'LABEL' && target.querySelector('input[type="checkbox"]'));

        if (isCheckboxArea) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true,
    );

    editorElement.addEventListener(
      'touchstart',
      (event: TouchEvent) => {
        handleCheckboxClick(event.target as HTMLElement, event);
      },
      { capture: true },
    );
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
