import { Directive, ElementRef, HostListener, input, Optional, Self } from '@angular/core';
import { ControllerType } from '../intefaces/controller-type.type';
import { InputControllerService } from '../services/input-controller.service';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[inputController]',
  standalone: true,
})
export class InputControllerDirective {
  public isToPreventDefaultEvent: boolean = false;
  public inputController = input<ControllerType>('alphanumeric');

  constructor(
    private elementRef: ElementRef,
    private inputCtrllerServ: InputControllerService,
    @Optional() @Self() private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  validateInput(event: InputEvent): void {
    const value = (event as InputEvent).data;
    const inputElement = event.target as HTMLInputElement;    
    this.isToPreventDefaultEvent = this.inputCtrllerServ.isToPreventDefaultEvent(this.inputController());

    if(this.isToPreventDefaultEvent && value) this.inputCtrllerServ.preventDefaultEvent(value, event, this.inputController());
    if(this.inputController() == 'financial') this.inputCtrllerServ.financialFormat(inputElement, this.control);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {    
    const inputElement = event.target as HTMLInputElement;
    this.inputCtrllerServ.clearAfterPasteOrFocusOut(inputElement, this.inputController(), this.control);
  }

  @HostListener('paste', ['$event'])
  onPaste(): void {    
    const inputElement = this.elementRef.nativeElement as HTMLInputElement;
    setTimeout(() => {
      this.inputCtrllerServ.clearAfterPasteOrFocusOut(inputElement, this.inputController(), this.control);
    }, 10);
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {    
    const inputElement = event.target as HTMLInputElement;
    this.inputCtrllerServ.clearAfterPasteOrFocusOut(inputElement, this.inputController(), this.control);
  }
}
