import { Directive, ElementRef, HostListener, input, OnInit, Optional, Self } from '@angular/core';
import { ControllerType } from '../intefaces/controller-type.type';
import { InputControllerService } from '../services/input-controller.service';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[inputController]',
  standalone: true,    
})
export class InputControllerDirective implements OnInit{    
  public isToPreventDefaultEvent: boolean = false;
  public inputController = input<ControllerType>();

  constructor(    
    private elementRef: ElementRef,
    @Optional() @Self() private control: NgControl,
    private inputControllerServ: InputControllerService
  ) {}

  ngOnInit():void{
    this.isToPreventDefaultEvent = this.inputControllerServ.isToPreventDefaultEvent(this.inputController() || 'alphanumeric');    
  }
  
  @HostListener('input', ['$event'])
  validateInput(event: InputEvent): void {    
    const value = (event as InputEvent).data;
    const inputElement = event.target as HTMLInputElement;
    let regex: RegExp = this.inputControllerServ.getMask(this.inputController() || 'alphanumeric');

    if(this.isToPreventDefaultEvent && value) this.preventDefaultEvent(value, event, regex, inputElement);
    if(this.inputController() === 'email' && this.control) this.validationEmail(regex, inputElement);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    this.clearAfterPasteOrFocusOut(inputElement);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {        
    const inputElement = this.elementRef.nativeElement as HTMLInputElement;    
    setTimeout(() => {
      this.clearAfterPasteOrFocusOut(inputElement);
    }, 10);
  }

  preventDefaultEvent(value: string, event: InputEvent, regex: RegExp, inputElement: HTMLInputElement){
    if (!regex.test(value)) {
      event.preventDefault();      
      (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.slice(0, -1);
    }    
  }

  validationEmail(regex: RegExp, inputElement: HTMLInputElement):void{
    if (!regex.test(inputElement.value)) {
      this.control.control?.setErrors({ invalidInput: true });
    } else {
      this.control.control?.setErrors(null); 
    }
  }

  clearAfterPasteOrFocusOut(input: HTMLInputElement):void{    
    const regex: RegExp = this.inputControllerServ.getMaskToCleanInput(this.inputController() || 'alphanumeric');
    const originalValue = input.value;
    const sanitizedText = originalValue.replace(regex, '');
    input.value = sanitizedText.trim();
  }
}
