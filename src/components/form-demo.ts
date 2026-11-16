import { Component, computed, DestroyRef, effect, inject, input, linkedSignal, signal, untracked, viewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { FormlyForm, FormlyFormOptions } from '@ngx-formly/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemoFormState, Registration } from '../demo/demo-form-state';

@Component({
  selector: 'app-form-demo',
  imports: [FormlyForm, ReactiveFormsModule, JsonPipe, TranslatePipe],
  templateUrl: './form-demo.html',
  styleUrl: './form-demo.css',
})
export class FormDemo {
  readonly mode = input<'intro' | 'skill' | 'builder' | 'validation'>('intro');
  readonly state = inject(DemoFormState);
  readonly translate = inject(TranslateService);
  readonly form = new FormGroup({});
  readonly options: FormlyFormOptions = {};
  readonly fields = computed(() => structuredClone(this.state.exportFields()));
  readonly selectedKey = signal('name');
  readonly selectedField = computed(() => this.state.exportFields().find(field => field.key === this.selectedKey())!);
  readonly introConfiguration = linkedSignal(() => {
    this.state.revision();
    return JSON.stringify(this.state.exportFields()[0], null, 2);
  });
  readonly introConfigurationError = linkedSignal(() => {
    this.introConfiguration();
    return false;
  });
  readonly introAdditionalFields = computed(() => this.state.exportFields().slice(1)
    .map(field => JSON.stringify(field, null, 2)).join(',\n'));
  readonly introTemplate = `<formly-form
  [form]="form"
  [fields]="fields"
  [model]="model"
/>`;
  readonly introErrorBinding = `import { AsyncPipe } from '@angular/common';
import { FormlyValidationMessagesPipe } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';

// Add to the custom field component's imports:
imports: [FormlyValidationMessagesPipe, AsyncPipe, TranslatePipe]

// Inside the custom field component's template:
@if (showError) {
  @if ((field | validationMessages | async)?.[0]; as error) {
    <p [id]="id + '-error'">
      {{ error.message | translate: formControl.getError(error.error) }}
    </p>
  }
}`;
  readonly introTranslationCatalogue = computed(() => JSON.stringify({
    demo: { errors: { nameMinLength: this.translate.instant('demo.errors.nameMinLength') } },
  }, null, 2));
  readonly copied = signal<'idle' | 'done' | 'failed'>('idle');
  readonly apiStatus = signal<'idle' | 'invalid' | 'pending' | 'rejected' | 'success'>('idle');
  readonly submitted = signal<Registration | null>(null);
  readonly formDirective = viewChild(FormGroupDirective);
  private pendingRequest?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.pendingRequest));
    effect(() => {
      this.state.revision();
      const directive = this.formDirective();
      untracked(() => {
        clearTimeout(this.pendingRequest);
        directive?.resetForm(this.state.model());
        this.apiStatus.set('idle');
        this.submitted.set(null);
      });
    });
  }

  updateLabel(value: string) {
    if (value.trim()) this.state.updateField(this.selectedKey(), { label: value.slice(0, 80) });
  }

  updateIntroConfiguration(value: string) {
    this.introConfiguration.set(value);
    let field;
    try {
      field = JSON.parse(value);
    } catch {
      this.introConfigurationError.set(true);
      return;
    }
    const valid = field?.key === 'name' && field.type === 'input'
      && Object.keys(field).every(key => ['key', 'type', 'props', 'validation'].includes(key))
      && typeof field.props?.label === 'string' && field.props.label.trim().length > 0 && field.props.label.length <= 80
      && typeof field.props.required === 'boolean'
      && Number.isInteger(field.props.maxLength) && field.props.maxLength > 0 && field.props.maxLength <= 2_147_483_647
      && Number.isInteger(field.props.minLength) && field.props.minLength > 0 && field.props.minLength <= field.props.maxLength
      && Object.keys(field.props).every(key => ['label', 'required', 'minLength', 'maxLength'].includes(key))
      && typeof field.validation?.messages?.minLength === 'string'
      && field.validation.messages.minLength.trim().length > 0 && field.validation.messages.minLength.length <= 200
      && Object.keys(field.validation).every(key => key === 'messages')
      && Object.keys(field.validation.messages).every(key => key === 'minLength');
    if (valid) {
      this.state.configuration.update(fields => fields.map(existing => existing.key === 'name' ? field : existing));
      this.introConfiguration.set(value);
    }
    this.introConfigurationError.set(!valid);
  }

  updateName(value: string) {
    this.state.model.update(model => ({ ...model, name: value }));
  }

  async copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set('done');
    } catch {
      this.copied.set('failed');
    }
  }

  download() {
    const url = URL.createObjectURL(new Blob([this.state.json()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event-registration.formly.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  useExample(duplicate: boolean) {
    clearTimeout(this.pendingRequest);
    this.state.model.set({ name: 'Alex Example', email: duplicate ? 'taken@example.test' : 'alex@example.test', attendance: 'onsite' });
    this.apiStatus.set('idle');
    this.submitted.set(null);
  }

  submit() {
    if (this.apiStatus() === 'pending') return;
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.apiStatus.set('invalid');
      return;
    }
    const payload = structuredClone(this.state.model());
    this.apiStatus.set('pending');
    this.submitted.set(null);
    // A deterministic local response keeps this stage demo independent of a backend.
    this.pendingRequest = setTimeout(() => {
      if (payload.email?.toLowerCase() === 'taken@example.test') {
        if (this.state.model().email === payload.email) {
          this.form.get('email')?.setErrors({ emailTaken: true });
          this.form.get('email')?.markAsTouched();
        }
        this.apiStatus.set('rejected');
      } else {
        this.submitted.set(payload);
        this.apiStatus.set('success');
      }
    }, 650);
  }
}
