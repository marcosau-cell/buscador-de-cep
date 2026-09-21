import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Formcep } from './features/form-cep/form-cep';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Formcep],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('buscador-de-cep');
}