import { AbstractControl, ValidationErrors } from '@angular/forms';

export function isbnValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const isbnRegex10 = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
  const isbnRegex13 = /^(?=(?:\D*\d){13}(?:(?:\D*\d){5})?$)[\d-]+$/;

  if (!value || (isbnRegex10.test(value) || isbnRegex13.test(value))) {
    return null;
  }

  return { invalidIsbn: true };
}
