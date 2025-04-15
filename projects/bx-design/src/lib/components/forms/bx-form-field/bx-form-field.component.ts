import { Component, inject, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';

export interface BxFormFieldOptions {
  type?:
    | 'text'
    | 'email'
    | 'search'
    | 'url'
    | 'password'
    | 'number'
    | 'tel'
    | 'date'
    | 'time';
  label?: string;
  ico?: string;
  placeholder?: string;
  mask?: {
    tomask: (value: string) => string;
    unmask: (value: string) => string;
  };
}

@Component({
  selector: 'bx-form-field',
  imports: [FormsModule],
  templateUrl: './bx-form-field.component.html',
  styleUrl: './bx-form-field.component.scss',
})
export class BxFormFieldComponent implements ControlValueAccessor {
  error = input<string | undefined>();
  options = input<BxFormFieldOptions>({});

  inputValue = '';

  hide = true;
  get type() {
    const { type } = this.options();
    if (type === 'password') return this.hide ? 'password' : 'text';
    return type ?? 'text';
  }

  private ngControl = inject(NgControl);
  protected onChange?: (value: string) => void;
  protected onTouched?: () => void;
  protected isDisabled = false;

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  onKeyup(e: KeyboardEvent) {
    const input = e.target as HTMLInputElement;
    const { mask } = this.options();
    const value = mask ? mask.tomask(input.value) : input.value;

    input.value = value;

    if (this.onChange) this.onChange(mask ? mask.unmask(value) : value);
  }

  // ControlValueAccessor
  writeValue(obj: any): void {
    this.inputValue = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
