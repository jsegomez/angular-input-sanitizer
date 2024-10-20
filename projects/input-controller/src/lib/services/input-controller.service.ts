import { Injectable } from '@angular/core';
import { ControllerType } from '../intefaces/controller-type.type';
import { NgControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InputControllerService {
  isToPreventDefaultEvent(inputType: ControllerType):boolean{
    return inputType === 'number' || inputType === 'only-letters' || inputType === 'alphanumeric';
  }

  private getRegex(inputType: ControllerType):RegExp{
    switch (inputType) {
      case 'only-letters':
        return /^[A-Za-z\s]+$/;        
      case 'alphanumeric':
        return /^[A-Za-z0-9\s]+$/;        
      case 'number':
        return /^[0-9]+$/;
      case 'financial':
        return /^[1-9][0-9.,]*$/;
      default:
        return /^[A-Za-z0-9\s]+$/;        
    }
  }

  private getRegexToCleanInput(inputType: ControllerType):RegExp{          
    switch (inputType) {
      case 'only-letters':
        return /[^A-Za-z\s]/g;        
      case 'alphanumeric':
        return /[^A-Za-z0-9\s]/g;        
      case 'number':
        return /[^0-9]/g;              
      case 'financial':
        return /[^0-9.,]/g;
      default:
        return /^[A-Za-z0-9\s]+$/
    }
  }

  preventDefaultEvent(value: string, event: InputEvent, formatType: ControllerType){
    const regex = this.getRegex(formatType);

    if (!regex.test(value)) {
      event.preventDefault();
      (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.slice(0, -1);
    }
  }

  clearAfterPasteOrFocusOut(input: HTMLInputElement, formatType: ControllerType, control: NgControl):void{
    const validationRegex: RegExp = this.getRegex(formatType);
    const isAllowedValue = validationRegex.test(input.value);
    
    if(!isAllowedValue) this.sanitizeInput(input, formatType, control);
  }

  private sanitizeInput(input: HTMLInputElement, formatType: ControllerType, control: NgControl){
    const originalValue = input.value;
    const regex: RegExp = this.getRegexToCleanInput(formatType);    

    if(formatType == 'financial'){
      const sanitizeValue = originalValue.replace(regex, '');           

      if(sanitizeValue && sanitizeValue.length > 0){
        const onlyNumbers = sanitizeValue.replaceAll(',', '').trim();
        const decimals = (parseFloat(onlyNumbers)).toFixed(2);
        const financial = this.addThousandSeparators(decimals);
        this.setValueInControl(financial, input, control);
      }else{
        this.setValueInControl('0.00', input, control);
      }
    }else{
      const sanitizedText = originalValue.replace(regex, '');
      this.setValueInControl(sanitizedText, input, control);
    }
  }

  financialFormat(input: HTMLInputElement, control: NgControl):void{    
    input.setAttribute('maxlength', 'maxlength');
    const value = input.value;
    const rawValue = value.replace(/\D/g, '').replace(/^0+/, '');
    
    if (rawValue && rawValue.length <= 16) {         
      const formattedValue = this.formatToDecimalWithCommas(rawValue);      
      this.setValueInControl(formattedValue, input);
    }else this.sanitizeInput(input, 'financial', control);
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

  setValueInControl(value: string, input: HTMLInputElement, control?: NgControl):void{
    if(control) control.control?.setValue(value.trim());
    else input.value = value.trim();
  }
}
