import { ChangeDetectionStrategy, Component, DestroyRef, EnvironmentInjector, computed, createEnvironmentInjector, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyForm } from '@ngx-formly/core';
import { BuilderEngineService, CORE_FORM_STORE, PropertyChangeType, provideBuilderEngine } from '@ngx-formly/builder';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BuilderStore } from '../demo/builder-store';
import { DemoFormState } from '../demo/demo-form-state';

@Component({
  selector: 'app-form-builder-editor',
  imports: [ReactiveFormsModule, FormlyForm, TranslatePipe],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormBuilderEditor {
  readonly engine = inject(BuilderEngineService);
  private readonly store = inject(CORE_FORM_STORE);
  private readonly state = inject(DemoFormState);
  private readonly translate = inject(TranslateService);
  readonly types = ['input', 'textarea', 'select'] as const;
  readonly fields = this.engine.activePreviewFormFields;
  readonly selectedIndex = computed(() => this.engine.activeRootFieldIds().indexOf(this.engine.activeFieldId() ?? ''));
  readonly error = signal(false);
  form = new FormGroup({});
  model: Record<string, unknown> = {};

  constructor() {
    this.reset();
  }

  reset() {
    this.error.set(false);
    this.engine.setActiveForm(null);
    this.form = new FormGroup({});
    this.model = { ...structuredClone(this.state.model()) };
    this.store.updateForm$('presentation', {
      id: 'registration', name: 'Event registration', libraryId: 'presentation',
      fields: this.state.exportFields(), model: this.model,
    }).subscribe({
      next: () => this.engine.setActiveForm('registration'),
      error: () => this.error.set(true),
    });
  }

  add(type: typeof this.types[number]) {
    this.engine.addField(type, undefined, undefined, { field: {
      type,
      props: {
        label: this.translate.instant(`demo.visualBuilder.new.${type}`),
        ...(type === 'select' ? { options: [
          { value: 'first', label: this.translate.instant('demo.visualBuilder.firstOption') },
          { value: 'second', label: this.translate.instant('demo.visualBuilder.secondOption') },
        ] } : {}),
      },
    } });
  }

  setLabel(value: string) {
    if (value.trim()) this.setProperty('label', value);
  }

  setProperty(property: 'label' | 'required', value: string | boolean) {
    this.engine.modifyActiveField({ type: PropertyChangeType.VALUE, path: ['props', property], value });
  }

  move(direction: -1 | 1) {
    const index = this.selectedIndex();
    const id = this.engine.activeFieldId();
    if (!id || index + direction < 0 || index + direction >= this.engine.activeRootFieldIds().length) return;
    // The engine takes an insertion boundary before removing the source field.
    this.engine.moveField(id, index, direction === 1 ? index + 2 : index - 1);
  }

  remove() {
    const id = this.engine.activeFieldId();
    if (!id) return;
    const index = this.selectedIndex();
    this.engine.setActiveModel(structuredClone(this.model));
    this.engine.removeField(id);
    this.model = structuredClone(this.engine.activeModel());
    const ids = this.engine.activeRootFieldIds();
    this.engine.setActiveField(ids[Math.min(index, ids.length - 1)] ?? null);
  }

  download() {
    const url = URL.createObjectURL(new Blob([this.engine.activeFormFieldsJSON()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registration.fields.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

@Component({
  selector: 'app-form-builder',
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="editor; environmentInjector: environment" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilder {
  readonly editor = FormBuilderEditor;
  readonly environment = createEnvironmentInjector([
    provideBuilderEngine({
      editorType: 'presentation', autoSave: false, formStore: BuilderStore,
      libraries: [{ id: 'presentation', fieldTypes: ['input', 'textarea', 'select'].map(name => ({
        name, displayName: name, defaultConfig: {},
      })) }],
    }),
  ], inject(EnvironmentInjector));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.environment.destroy());
  }
}
