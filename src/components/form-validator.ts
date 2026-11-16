import { afterNextRender, afterRenderEffect, Component, computed, DestroyRef, ElementRef, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { basicSetup, EditorView } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { tags } from '@lezer/highlight';
import { applyEdits, format } from 'jsonc-parser';
import { DemoFormState } from '../demo/demo-form-state';
import { ConfigurationDiagnostic, validateFormlyJson } from '../demo/formly-validator/validate-formly-json';
import { locateDiagnostics } from '../demo/formly-validator/diagnostic-location';

@Component({
  imports: [TranslatePipe],
  selector: 'app-form-validator',
  styleUrl: './form-validator.css',
  templateUrl: './form-validator.html',
})
export class FormValidator {
  readonly state = inject(DemoFormState);
  readonly source = linkedSignal<{ json: string; revision: number }, string>({
    source: () => ({ json: this.state.json(), revision: this.state.revision() }),
    computation: (current, previous) => previous && current.revision === previous.source.revision
      && previous.value !== previous.source.json ? previous.value : current.json,
  });
  readonly result = computed(() => validateFormlyJson(this.source()));
  readonly errorCount = computed(() => this.result().diagnostics.filter(item => item.severity === 'error').length);
  readonly warningCount = computed(() => this.result().diagnostics.length - this.errorCount());
  readonly diagnostics = computed(() => locateDiagnostics(this.source(), this.result().diagnostics));
  private readonly editorHost = viewChild.required<ElementRef<HTMLElement>>('editorHost');
  private readonly editor = signal<EditorView | null>(null);

  constructor() {
    afterNextRender(() => this.editor.set(new EditorView({
      parent: this.editorHost().nativeElement,
      doc: this.source(),
      extensions: [
        basicSetup,
        json(),
        lintGutter(),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          'aria-labelledby': 'builder-editor-title',
          'aria-describedby': 'builder-editor-note',
          spellcheck: 'false',
        }),
        syntaxHighlighting(HighlightStyle.define([
          { tag: tags.propertyName, color: 'var(--ink)' },
          { tag: tags.string, color: 'var(--red)' },
          { tag: [tags.number, tags.bool, tags.null], color: 'var(--success)' },
          { tag: tags.punctuation, color: 'var(--muted)' },
        ])),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'var(--surface)', color: 'var(--ink)' },
          '&.cm-focused': { outline: '2px solid var(--red)', outlineOffset: '-2px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: '"SFMono-Regular", Consolas, monospace', fontSize: '14px', lineHeight: '1.6', scrollbarColor: 'var(--muted) var(--surface)' },
          '.cm-content': { padding: '16px 0', caretColor: 'var(--red)' },
          '.cm-line': { padding: '0 16px 0 8px' },
          '.cm-gutters': { backgroundColor: 'var(--group)', color: 'var(--muted)', borderRight: '1px solid var(--group-rule)' },
          '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--highlight)' },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'var(--group-rule)' },
          '.cm-cursor': { borderLeftColor: 'var(--red)' },
          '.cm-tooltip, .cm-panels': { backgroundColor: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--group-rule)' },
          '.cm-searchMatch': { backgroundColor: 'var(--highlight)', outline: '1px solid var(--red)' },
        }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) this.source.set(update.state.doc.toString());
        }),
      ],
    })));
    afterRenderEffect(() => {
      const editor = this.editor();
      const source = this.source();
      if (!editor) return;
      if (editor.state.doc.toString() !== source) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: source } });
      }
      editor.dispatch(setDiagnostics(editor.state, this.result().diagnostics.map(item => ({
        from: item.offset, to: item.offset + item.length, severity: item.severity, message: item.message,
      }))));
      editor.contentDOM.setAttribute('aria-invalid', String(this.errorCount() > 0));
    });
    inject(DestroyRef).onDestroy(() => this.editor()?.destroy());
  }

  loadExample() {
    this.source.set(this.state.json());
  }

  formatJson() {
    if (this.result().syntaxValid) {
      this.source.set(applyEdits(this.source(), format(this.source(), undefined, { insertSpaces: true, tabSize: 2 })));
    }
  }

  selectDiagnostic(diagnostic: ConfigurationDiagnostic) {
    const editor = this.editor();
    if (!editor) return;
    const from = Math.min(diagnostic.offset, editor.state.doc.length);
    const to = Math.min(from + diagnostic.length, editor.state.doc.length);
    editor.dispatch({ selection: { anchor: from, head: to }, effects: EditorView.scrollIntoView(from, { y: 'center' }) });
    editor.focus();
  }
}
