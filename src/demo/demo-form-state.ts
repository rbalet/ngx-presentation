import { computed, inject, Injectable, signal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

export const generatedFields: FormlyFieldConfig[] = [
  {
    key: 'name', type: 'input',
    props: { label: 'Full name', required: true, minLength: 3, maxLength: 80 },
    validation: { messages: { minLength: 'demo.errors.nameMinLength' } },
  },
  { key: 'email', type: 'input', props: { label: 'Email', type: 'email', required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } },
  { key: 'attendance', type: 'select', defaultValue: 'onsite', props: { label: 'Attendance', required: true, options: [
    { value: 'onsite', label: 'In person' }, { value: 'remote', label: 'Online' },
  ] } },
  { key: 'dietary', type: 'textarea', props: { label: 'Dietary requirements', maxLength: 200 }, expressions: { hide: "model.attendance !== 'onsite'" } },
];

export interface Registration {
  name?: string;
  email?: string;
  attendance?: 'onsite' | 'remote';
  dietary?: string;
}

@Injectable({ providedIn: 'root' })
export class DemoFormState {
  private readonly translate = inject(TranslateService);
  readonly configuration = signal(structuredClone(generatedFields));
  readonly model = signal<Registration>({ attendance: 'onsite' });
  readonly revision = signal(0);
  readonly exportFields = computed(() => {
    this.translate.currentLang();
    return this.configuration().map((field, index) => ({
      ...structuredClone(field),
      props: {
        ...structuredClone(field.props),
        label: field.props?.label === generatedFields[index].props?.label
          ? this.translate.instant(`demo.fields.${field.key}`) : field.props?.label,
        ...(field.key === 'attendance' ? { options: [
          { value: 'onsite', label: this.translate.instant('demo.fields.onsite') },
          { value: 'remote', label: this.translate.instant('demo.fields.remote') },
        ] } : {}),
      },
    }));
  });
  readonly json = computed(() => JSON.stringify(this.exportFields(), null, 2));

  updateField(key: string, props: { label?: string; required?: boolean; maxLength?: number }) {
    this.configuration.update(fields => fields.map(field => field.key === key
      ? { ...field, props: { ...field.props, ...props } } : field));
  }

  reset() {
    this.configuration.set(structuredClone(generatedFields));
    this.model.set({ attendance: 'onsite' });
    this.revision.update(value => value + 1);
  }
}
