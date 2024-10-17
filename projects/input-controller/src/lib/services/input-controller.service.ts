import { Injectable } from '@angular/core';
import { ControllerType } from '../intefaces/controller-type.type';

@Injectable({
  providedIn: 'root'
})
export class InputControllerService {
  isToPreventDefaultEvent(inputType: ControllerType):boolean{
    return inputType === 'number' || inputType === 'only-letters' || inputType === 'alphanumeric';
  }

  getMask(inputType: ControllerType):RegExp{
    switch (inputType) {
      case 'only-letters':
        return /^[A-Za-z\s]+$/;        
      case 'alphanumeric':
        return /^[A-Za-z0-9\s]+$/;        
      case 'number':
        return /^[0-9]+$/;        
      case 'financial':
        return /^[0-9.,]*$/;
      default:
        return /^[A-Za-z0-9\s]+$/;        
    }
  }

  getMaskToCleanInput(inputType: ControllerType):RegExp{          
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
}
