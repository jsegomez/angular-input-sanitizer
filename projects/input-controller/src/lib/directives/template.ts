import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ControllerType } from '../intefaces/controller-type.type';
import { InputControllerService } from '../services/input-controller.service';

@Directive({
  selector: '[inputController]',
  standalone: true,
})
export class InputControllerDirective {
  @Input() inputController: ControllerType = 'alphanumeric';
  public isToPreventDefaultEvent: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private inputControllerServ: InputControllerService,
    @Optional() @Self() private ngControl: NgControl
  ) {}

  ngOnInit(): void {
    this.isToPreventDefaultEvent = this.inputControllerServ.isToPreventDefaultEvent(this.inputController || 'alphanumeric');
  }

  @HostListener('input', ['$event'])
  validateInput(event: InputEvent): void {
    const value = (event as InputEvent).data;
    const inputElement = event.target as HTMLInputElement;
    let regex: RegExp = this.inputControllerServ.getMask(this.inputController || 'alphanumeric');

    if (this.isToPreventDefaultEvent && value) this.preventDefaultEvent(value, event, regex);
    if (this.inputController === 'financial') this.financialFormat(inputElement, event);
  }

  private preventDefaultEvent(value: string, event: InputEvent, regex: RegExp) {
    if (!regex.test(value)) {
      event.preventDefault();
      (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.slice(0, -1);
    }
  }

  private sanitizeInput(input: HTMLInputElement): void {
    const originalValue = input.value;
    const regex: RegExp = this.inputControllerServ.getMaskToCleanInput(this.inputController || 'alphanumeric');

    if (this.inputController === 'financial') {
      const sanitizeValue = originalValue.replace(regex, '');
      if (sanitizeValue && sanitizeValue.length > 0) {
        const onlyNumbers = sanitizeValue.replaceAll(',', '').trim();
        const decimals = parseFloat(onlyNumbers).toFixed(2);
        this.updateInputValue(input, this.addThousandSeparators(decimals));
      } else {
        this.updateInputValue(input, '');
      }
    } else {
      const sanitizedText = originalValue.replace(regex, '');
      this.updateInputValue(input, sanitizedText.trim());
    }
  }

  private updateInputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    if (this.ngControl && this.ngControl.control && this.ngControl.control.value !== value) {
      this.ngControl.control.setValue(value, { emitEvent: false }); // Sincroniza el valor del NgControl
    }
  }

  private financialFormat(input: HTMLInputElement, event: InputEvent): void {
    const value = input.value;
    const rawValue = value.replace(/\D/g, '');
    const regexNumber = this.inputControllerServ.getMask('number');

    if (rawValue && value.length <= 16) {
      this.updateInputValue(input, this.formatToDecimalWithCommas(rawValue));
    } else {
      this.preventDefaultEvent(value, event, regexNumber);
    }
  }

  private formatToDecimalWithCommas(value: string): string {
    const numberValue = (parseFloat(value) / 100).toFixed(2);
    return this.addThousandSeparators(numberValue);
  }

  private addThousandSeparators(value: string): string {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
}
