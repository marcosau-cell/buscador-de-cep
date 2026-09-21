import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CepService } from '../../core/services/cep.services';
import { Cep } from '../../shared/model/cep.model';

@Component({
  selector: 'app-form-cep',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-cep.html',
  styleUrl: './form-cep.css'
})
export class Formcep {

  private cepService = inject(CepService);

  cepControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{8}$/)
  ]);

  endereco = signal<Cep | null>(null);
  loading = signal(false);
  erro = signal('');

  buscar() {
    if (this.cepControl.invalid) {
      this.erro.set('Digite um CEP válido com 8 números.');
      return;
    }

    this.loading.set(true);
    this.erro.set('');
    this.endereco.set(null);

    const cep = this.cepControl.value!;

    this.cepService.buscarCep(cep).subscribe({
      next: (resposta) => {
        this.loading.set(false);

        if (resposta.erro) {
          this.erro.set('CEP não encontrado.');
          return;
        }

        this.endereco.set(resposta);
      },

      error: () => {
        this.loading.set(false);
        this.erro.set('Erro ao consultar API.');
      }
    });
  }
}