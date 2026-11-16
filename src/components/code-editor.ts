import { afterNextRender, afterRenderEffect, Component, DestroyRef, ElementRef, inject, input, output, signal } from '@angular/core';
import { basicSetup, EditorView } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { angular } from '@codemirror/lang-angular';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const languages = { json: json(), typescript: javascript({ typescript: true }), angular: angular() };
const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: [tags.keyword, tags.bool, tags.null], color: '#c5a5e8' },
  { tag: [tags.propertyName, tags.attributeName], color: '#9cdcfe' },
  { tag: [tags.string, tags.attributeValue], color: '#e9b998' },
  { tag: tags.number, color: '#b5cea8' },
  { tag: [tags.typeName, tags.tagName], color: '#83d6c5' },
  { tag: tags.function(tags.variableName), color: '#e4d69c' },
  { tag: tags.comment, color: '#a8b3c2' },
]));
const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--dark-surface)', color: 'var(--on-dark)' },
  '&.cm-focused': { outline: '2px solid var(--on-dark)', outlineOffset: '-2px' },
  '.cm-scroller': { maxHeight: '28rem', overflow: 'auto', fontFamily: '"SFMono-Regular", Consolas, monospace', fontSize: '14px', lineHeight: '1.6', scrollbarColor: '#a8b3c2 var(--dark-surface)' },
  '.cm-content': { padding: '12px 0', caretColor: 'var(--on-dark)' },
  '.cm-line': { padding: '0 12px 0 8px' },
  '.cm-gutters': { backgroundColor: 'var(--dark-surface)', color: '#a8b3c2', borderRight: '1px solid #465463' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#ffffff0d' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: '#3b5169' },
  '.cm-cursor': { borderLeftColor: 'var(--on-dark)' },
  '.cm-tooltip, .cm-panels': { backgroundColor: 'var(--dark-surface)', color: 'var(--on-dark)', borderColor: '#465463' },
  '.cm-searchMatch': { backgroundColor: '#3b5169', outline: '1px solid #9cdcfe' },
}, { dark: true });

@Component({
  selector: 'app-code-editor',
  styles: `:host { display: block; min-width: 0; overflow: hidden; color-scheme: dark; }`,
  template: '',
})
export class CodeEditor {
  readonly value = input.required<string>();
  readonly language = input.required<keyof typeof languages>();
  readonly label = input.required<string>();
  readonly editable = input(false);
  readonly invalid = input(false);
  readonly describedBy = input('');
  readonly valueChange = output<string>();
  private readonly editor = signal<EditorView | null>(null);
  private readonly settings = new Compartment();

  constructor() {
    const host = inject(ElementRef<HTMLElement>);
    afterNextRender(() => this.editor.set(new EditorView({
      parent: host.nativeElement,
      doc: this.value(),
      extensions: [
        basicSetup, highlighting, theme, EditorView.lineWrapping,
        this.settings.of([]),
        EditorView.updateListener.of(update => {
          const value = update.state.doc.toString();
          if (update.docChanged && value !== this.value()) this.valueChange.emit(value);
        }),
      ],
    })));
    afterRenderEffect(() => {
      this.editor()?.dispatch({ effects: this.settings.reconfigure([
        languages[this.language()],
        EditorState.readOnly.of(!this.editable()),
        EditorView.editable.of(this.editable()),
        EditorView.contentAttributes.of({
          role: 'textbox', tabindex: '0', spellcheck: 'false',
          'aria-label': this.label(),
          'aria-readonly': String(!this.editable()),
          'aria-invalid': String(this.invalid()),
          'aria-describedby': this.describedBy(),
        }),
      ]) });
    });
    afterRenderEffect(() => {
      const editor = this.editor();
      const value = this.value();
      if (editor && editor.state.doc.toString() !== value) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
      }
    });
    inject(DestroyRef).onDestroy(() => this.editor()?.destroy());
  }
}
