import { afterRenderEffect, Component, effect, input, signal, untracked, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxMatInputTelComponent } from 'ngx-mat-input-tel';

@Component({
  selector: 'app-phone-input',
  imports: [NgxMatInputTelComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: PhoneInput, multi: true }],
  template: `
    <ngx-mat-input-tel autocomplete="tel" format="international" defaultCountry="CH" enableSearch
      [maxLength]="undefined" [disabled]="disabled()" [required]="required()"
      [class.invalid]="invalid()" />
  `,
  styles: `
    ngx-mat-input-tel {
      --ngxMatInputTel-height: 2.75rem;
      --ngxMatInputTel-selector-opacity: 1;
      display: block;
      padding-inline: .65rem;
      border: 1px solid var(--muted);
      border-radius: 6px;
      background: var(--surface);
      color: var(--ink);
    }
    ngx-mat-input-tel.invalid { border-color: var(--red); }
    ngx-mat-input-tel:focus-within { outline: 3px solid var(--red); outline-offset: 2px; }
  `,
})
export class PhoneInput implements ControlValueAccessor {
  readonly inputId = input.required<string>();
  readonly required = input(false);
  readonly invalid = input(false);
  protected readonly disabled = signal(false);
  private readonly phone = viewChild(NgxMatInputTelComponent);
  private readonly writtenValue = signal({ value: null as string | null });
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const phone = this.phone();
      const { value } = this.writtenValue();
      if (!phone) return;

      untracked(() => {
        // The library emits during writeValue and needs an explicit reset for empty values.
        phone.registerOnChange(() => {});
        if (value) phone.writeValue(value);
        else phone.reset();
        phone.registerOnChange((number: string | null) => this.onChange(number));
        phone.registerOnTouched(() => this.onTouched());
      });
    });

    afterRenderEffect(() => {
      const element: HTMLInputElement | undefined = this.phone()?.focusable?.nativeElement;
      const invalid = this.invalid();
      const id = this.inputId();
      const required = this.required();
      if (!element) return;

      // The library exposes these settings on its host and renders the native input internally.
      element.id = id;
      element.required = required;
      element.setAttribute('aria-required', String(required));
      element.setAttribute('aria-invalid', String(invalid));
      if (invalid) element.setAttribute('aria-describedby', id + '-error');
      else element.removeAttribute('aria-describedby');
    });
  }

  writeValue(value: string | null) {
    this.writtenValue.set({ value });
  }

  registerOnChange(callback: (value: string | null) => void) {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void) {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
}
