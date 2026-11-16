import { declareExperimentalWebMcpTool, Directive, ErrorHandler, inject } from '@angular/core';
import { FormlyForm } from '@ngx-formly/core';

// shortcut: Formly 11.2 lacks WebMCP; replace this phone-only adapter when Formly ships support.
@Directive({ selector: 'formly-form[appPhoneWebMcp]' })
export class PhoneWebMcp {
  private readonly formly = inject(FormlyForm);

  constructor() {
    const errors = inject(ErrorHandler);
    void declareExperimentalWebMcpTool({
      name: 'fill_phone_number',
      description: 'Fill the phone number in the WebMCP demo and report its validation state.',
      inputSchema: {
        type: 'object',
        properties: { phoneNumber: { type: 'string', description: 'Phone number to enter in the demo.' } },
        required: ['phoneNumber'],
        additionalProperties: false,
      },
      execute: async (args: unknown, { signal }) => {
        if (!args || typeof args !== 'object' || Array.isArray(args)
          || !('phoneNumber' in args) || typeof args.phoneNumber !== 'string'
          || Object.keys(args).some(key => key !== 'phoneNumber')) {
          return { status: 'rejected', message: 'Supply only phoneNumber as a string.' };
        }
        const control = this.formly.form.get('phoneNumber');
        if (signal.aborted || !control || control.disabled) return { status: 'unavailable' };

        control.markAsDirty();
        control.markAsTouched();
        control.setValue(args.phoneNumber);
        return {
          status: control.valid ? 'filled' : 'validation-failed',
          valid: control.valid,
          errors: control.errors,
        };
      },
    }).catch(error => errors.handleError(error));
  }
}
