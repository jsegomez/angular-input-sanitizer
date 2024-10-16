import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputControllerDirective } from '../../../input-controller/src/public-api';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    InputControllerDirective,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private formBuilder = inject(FormBuilder);

  public formValidator = this.formBuilder.group({
    number: [''],
    onlyText: [''],
    alpha: [''],
    email: ['', [Validators.required]]
  });
}
