import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div class="invalid-feedback d-block" *ngFor="let err of errors()">
      {{ err }}
    </div>
  `
})
export class FormErrorComponent {
  @Input() control!: AbstractControl | null;

  errors(): string[] {
    if (!this.control || !this.control.errors) return [];
    const errs: string[] = [];
    const errors = this.control.errors;

    if (errors['required']) errs.push('This field is required.');
    if (errors['minlength'])
      errs.push(`Minimum length is ${errors['minlength'].requiredLength}.`);
    if (errors['maxlength'])
      errs.push(`Maximum length is ${errors['maxlength'].requiredLength}.`);
    if (errors['pattern']) errs.push('Invalid format.');
    if (errors['min']) errs.push(`Value too low (min: ${errors['min'].min}).`);
    if (errors['max']) errs.push(`Value too high (max: ${errors['max'].max}).`);

    return errs;
  }
}