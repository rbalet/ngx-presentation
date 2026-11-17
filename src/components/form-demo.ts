import { Component, computed, DestroyRef, effect, inject, input, linkedSignal, signal, untracked, viewChild } from '@angular/core';
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyForm, FormlyFormOptions } from '@ngx-formly/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemoFormState, Registration } from '../demo/demo-form-state';
import { Languages } from '../languages';
import { CodeEditor } from './code-editor';

@Component({
  selector: 'app-form-demo',
  imports: [FormlyForm, ReactiveFormsModule, JsonPipe, KeyValuePipe, TranslatePipe, CodeEditor],
  templateUrl: './form-demo.html',
  styleUrl: './form-demo.css',
  host: { '(window:popstate)': 'restoreCapability()' },
})
export class FormDemo {
  readonly mode = input<'intro' | 'skill' | 'validation'>('intro');
  readonly capabilities = [
    { id: 'skill', title: 'Skill', href: 'https://github.com/ngx-formly/ngx-formly/blob/main/skills/ngx-formly/SKILL.md' },
    { id: 'mcp', title: 'MCP', href: 'https://formly.dev/guide/mcp' },
    { id: 'webmcp', title: 'WebMCP', href: 'https://formly.dev/guide/web-mcp' },
  ];
  readonly capabilitySelection = signal<{ current: number; previous: number | null }>({ current: this.capabilityFromUrl(), previous: null });
  readonly mcpTools = [
    { name: 'formly_search', icon: 'M20 20l-4.5-4.5M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z' },
    { name: 'formly_lookup', icon: 'M12 6v14M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z' },
    { name: 'formly_examples', icon: 'm8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18' },
    { name: 'formly_validate_fields', icon: 'M9 4H6v16h12V4h-3M9 3h6v4H9Zm0 10 2 2 4-4' },
  ];
  readonly webMcpExample = `fields: FormlyFieldConfig[] = [
  {
    key: 'phoneNumber',
    type: 'phone',
    webMcp: true,
    props: { label: 'Phone number', required: true },
  },
];`;
  readonly webMcpPrompt = 'Use WebMCP in the browser tab I’m currently viewing. Fill the phone field with +1 202-555-0147, report its validation state, and show me a screenshot of that same tab. If you can’t access my tab, tell me and stop.';
  readonly state = inject(DemoFormState);
  readonly languages = inject(Languages);
  readonly translate = inject(TranslateService);
  readonly phoneModel = signal({ phoneNumber: '' });
  readonly phoneOptions: FormlyFormOptions = {
    webMcp: { name: 'phone_number', description: 'Fill the phone number in the WebMCP demo' },
    // WebMCP writes mark controls dirty without a blur event.
    showValidation: ({ formControl }) => formControl.dirty || formControl.touched,
  };
  readonly phoneFields = computed<FormlyFieldConfig[]>(() => {
    this.translate.currentLang();
    return [{
      key: 'phoneNumber', id: 'webmcp-phone-number', type: 'phone',
      webMcp: true,
      props: { label: this.translate.instant('demo.fields.phoneNumber'), required: true },
    }];
  });
  readonly form = new FormGroup({});
  readonly options: FormlyFormOptions = {};
  readonly fields = computed(() => structuredClone(this.state.exportFields()));
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
  readonly introSetup = `const form = new FormGroup({});

const fields: FormlyFieldConfig[] = [`;
  readonly introErrorBinding = `import { AsyncPipe } from '@angular/common';
import { FormlyValidationMessagesPipe } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';

// Add to the custom field component's imports:
imports: [FormlyValidationMessagesPipe, AsyncPipe, TranslatePipe]`;
  readonly introErrorTemplate = `@if (showError) {
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
  readonly commandCopied = signal<'idle' | 'done' | 'failed'>('idle');
  readonly apiStatus = signal<'idle' | 'invalid' | 'pending' | 'rejected' | 'success'>('idle');
  readonly submitted = signal<Registration | null>(null);
  readonly formDirective = viewChild(FormGroupDirective);
  private pendingRequest?: ReturnType<typeof setTimeout>;
  private capabilityTransition?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.pendingRequest);
      clearTimeout(this.capabilityTransition);
    });
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

  selectCapability(index: number) {
    const url = new URL(location.href);
    url.searchParams.set('selected', this.capabilities[index].id);
    if (url.href !== location.href) history.replaceState(history.state, '', url);
    this.copied.set('idle');
    this.commandCopied.set('idle');
    const { current } = this.capabilitySelection();
    if (index === current) return;

    clearTimeout(this.capabilityTransition);
    const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.capabilitySelection.set({ current: index, previous: animate ? current : null });
    if (animate) {
      this.capabilityTransition = setTimeout(() => this.capabilitySelection.set({ current: index, previous: null }), 380);
    }
  }

  restoreCapability() {
    clearTimeout(this.capabilityTransition);
    this.capabilitySelection.set({ current: this.capabilityFromUrl(), previous: null });
  }

  private capabilityFromUrl() {
    const selected = new URLSearchParams(location.search).get('selected');
    return Math.max(0, this.capabilities.findIndex(capability => capability.id === selected));
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

  async copy(value: string, status = this.copied) {
    status.set('idle');
    try {
      await navigator.clipboard.writeText(value);
      status.set('done');
    } catch {
      status.set('failed');
    }
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
