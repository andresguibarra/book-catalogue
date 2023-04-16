import { ValidatorFn, AbstractControl } from '@angular/forms';

export function atLeastOneAuthor(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value;
    if (Array.isArray(value) && value.length > 0) {
      console.log('null')
      return null;
    }
    console.log('no authors')
    return { noAuthors: true };
  };
}
