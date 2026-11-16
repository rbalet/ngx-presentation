import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfigOption, FieldType, FieldTypeConfig, FormlyAttributes, FormlyValidationMessagesPipe } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-demo-field',
  imports: [ReactiveFormsModule, FormlyAttributes, FormlyValidationMessagesPipe, AsyncPipe, TranslatePipe],
  template: `
    <label [for]="id">{{ props.label }} @if (props.required) { <span aria-hidden="true">*</span> }</label>
    @switch (field.type) {
      @case ('select') {
        <select [id]="id" [formControl]="formControl" [formlyAttributes]="field" [attr.aria-invalid]="showError" [attr.aria-describedby]="showError ? id + '-error' : null">
          @for (option of selectOptions; track option.value) { <option [value]="option.value">{{ option.label }}</option> }
        </select>
      }
      @case ('textarea') {
        <textarea [id]="id" rows="2" [formControl]="formControl" [formlyAttributes]="field" [attr.aria-invalid]="showError" [attr.aria-describedby]="showError ? id + '-error' : null"></textarea>
      }
      @default {
        <input [id]="id" [type]="props.type || 'text'" [formControl]="formControl" [formlyAttributes]="field" [attr.aria-invalid]="showError" [attr.aria-describedby]="showError ? id + '-error' : null" />
      }
    }
    @if (showError) {
      @if ((field | validationMessages | async)?.[0]; as error) {
        <p class="field-error" [id]="id + '-error'">{{ error.message | translate: formControl.getError(error.error) }}</p>
      }
    }
  `,
  styles: `
    :host { display: block; margin-bottom: .85rem; }
    label { display: block; margin-bottom: .35rem; font-size: .9rem; font-weight: 700; }
    label span, .field-error { color: var(--red); }
    input, select, textarea { width: 100%; min-height: 2.75rem; padding: .55rem .65rem; border: 1px solid var(--muted); border-radius: 6px; background: var(--surface); color: var(--ink); font: inherit; caret-color: var(--red); }
    textarea { resize: vertical; }
    [aria-invalid="true"] { border-color: var(--red); }
    .field-error { margin: .35rem 0 0; font-size: .85rem; line-height: 1.4; }
  `,
})
export class DemoField extends FieldType<FieldTypeConfig> {
  get selectOptions(): { label: string; value: string }[] {
    return Array.isArray(this.props.options) ? this.props.options : [];
  }
}

export const demoFormlyConfig: ConfigOption = {
  types: ['input', 'select', 'textarea'].map(name => ({ name, component: DemoField })),
  validationMessages: [
    { name: 'required', message: 'demo.errors.required' },
    { name: 'pattern', message: 'demo.errors.email' },
    { name: 'emailTaken', message: 'demo.errors.taken' },
    { name: 'maxLength', message: 'demo.errors.invalid' },
  ],
};
