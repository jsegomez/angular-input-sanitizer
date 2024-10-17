import { Directive, ElementRef, HostListener, Input, input, OnInit, Optional, Self } from '@angular/core';
import { ControllerType } from '../intefaces/controller-type.type';
import { InputControllerService } from '../services/input-controller.service';
import { FormControl, NgControl } from '@angular/forms';

@Directive({
  selector: '[inputController]',
  standalone: true,
})
export class InputControllerDirective implements OnInit{
  public isToPreventDefaultEvent: boolean = false;
  public inputController = input<ControllerType>();

  constructor(
    private elementRef: ElementRef,
    private inputControllerServ: InputControllerService,
    @Optional() @Self() private formControl: NgControl
  ) {}

  ngOnInit():void{
    this.isToPreventDefaultEvent = this.inputControllerServ.isToPreventDefaultEvent(this.inputController() || 'alphanumeric');
  }

  @HostListener('input', ['$event'])
  validateInput(event: InputEvent): void {
    const value = (event as InputEvent).data;
    const inputElement = event.target as HTMLInputElement;
    let regex: RegExp = this.inputControllerServ.getMask(this.inputController() || 'alphanumeric');

    if(this.isToPreventDefaultEvent && value) this.preventDefaultEvent(value, event, regex);
    if(this.inputController() == 'financial') this.financialFormat(inputElement, event);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    this.clearAfterPasteOrFocusOut(inputElement);
  }

  @HostListener('paste', ['$event'])
  onPaste(): void {
    const inputElement = this.elementRef.nativeElement as HTMLInputElement;
    setTimeout(() => {
      this.clearAfterPasteOrFocusOut(inputElement);
    }, 10);
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.clearAfterPasteOrFocusOut(inputElement);
  }

  private preventDefaultEvent(value: string, event: InputEvent, regex: RegExp){
    if (!regex.test(value)) {
      event.preventDefault();
      (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.slice(0, -1);
    }
  }

  private clearAfterPasteOrFocusOut(input: HTMLInputElement):void{
    const validationRegex: RegExp = this.inputControllerServ.getMask(this.inputController() || 'alphanumeric');
    const isAllowedValue = validationRegex.test(input.value);

    if(!isAllowedValue) this.sanitizeInput(input);
  }

  sanitizeInput(input: HTMLInputElement){
    const originalValue = input.value;
    const regex: RegExp = this.inputControllerServ.getMaskToCleanInput(this.inputController() || 'alphanumeric');

    if(this.inputController() == 'financial'){
      const sanitizeValue = originalValue.replace(regex, '');

      if(sanitizeValue && sanitizeValue.length > 0){
        const onlyNumbers = sanitizeValue.replaceAll(',', '').trim();
        const decimals = (parseFloat(onlyNumbers)).toFixed(2);
        // input.value = this.addThousandSeparators(decimals);
        this.formControl.control?.setValue(decimals);
      }else{
        input.value = '';
      }
    }else{
      const sanitizedText = originalValue.replace(regex, '');
      input.value = sanitizedText.trim();
    }
  }

  private financialFormat(input: HTMLInputElement, event: InputEvent):void{
    const value = input.value;
    const rawValue = value.replace(/\D/g, '');
    const regexNumber = this.inputControllerServ.getMask('number');

    if (rawValue && value.length <= 16) input.value = this.formatToDecimalWithCommas(rawValue)
    else this.preventDefaultEvent(value, event, regexNumber);
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
