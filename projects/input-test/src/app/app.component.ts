import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputControllerDirective } from '../../../input-controller/src/public-api';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    InputControllerDirective,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private formBuilder = inject(FormBuilder);

  public formValidator = this.formBuilder.group({
    numbers: ['', Validators.required],
    onlyText: ['', Validators.required],
    alpha: ['', Validators.required],
    financial: ['0.00', [Validators.required]]
  });
}
