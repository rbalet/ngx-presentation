import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { createEmptyWorkspaceHierarchy, type DefaultForm, type FormStoreService, type WorkspaceHierarchy } from '@ngx-formly/builder';

/** A chapter-local store: demo edits never reach local storage or a server. */
@Injectable()
export class BuilderStore implements FormStoreService {
  private readonly forms = new Map<string, DefaultForm>();
  private hierarchy = createEmptyWorkspaceHierarchy('presentation');

  addForm$(_editorType: string, form: DefaultForm) {
    this.forms.set(form.id!, structuredClone(form));
    return of(undefined);
  }

  updateForm$(editorType: string, form: DefaultForm) {
    return this.addForm$(editorType, form);
  }

  removeForm$(_editorType: string, id: string) {
    this.forms.delete(id);
    return of(undefined);
  }

  getForm$(_editorType: string, id: string) {
    return of(structuredClone(this.forms.get(id)));
  }

  getFormList$() {
    return of([...this.forms].map(([id, form]) => ({
      id, name: form.name, libraryId: form.libraryId, fieldCount: form.fieldCount ?? form.fields.length,
    })));
  }

  getHierarchy$() {
    return of(structuredClone(this.hierarchy));
  }

  saveHierarchy$(_editorType: string, hierarchy: WorkspaceHierarchy) {
    this.hierarchy = structuredClone(hierarchy);
    return of(undefined);
  }
}
