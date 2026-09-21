import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

import { CepService } from '../../core/services/cep.services';

@Component({
  selector: 'app-form-cep',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-cep.html',
  styleUrl: './form-cep.css'
})
export class Formcep {

  private cepService = inject(CepService);
  private http = inject(HttpClient);

  paises = [
    { codigo: 'BR', nome: 'Brasil', bandeira: '🇧🇷', tamanho: 8, formato: '########', exemplo: '20040002' },
    { codigo: 'US', nome: 'Estados Unidos', bandeira: '🇺🇸', tamanho: 5, formato: '#####', exemplo: '90210' },
    { codigo: 'JP', nome: 'Japão', bandeira: '🇯🇵', tamanho: 7, formato: '#######', exemplo: '1000001' },
    { codigo: 'MX', nome: 'México', bandeira: '🇲🇽', tamanho: 5, formato: '#####', exemplo: '01000' },
    { codigo: 'KR', nome: 'Coreia do Sul', bandeira: '🇰🇷', tamanho: 5, formato: '#####', exemplo: '03051' },
    { codigo: 'ZA', nome: 'África do Sul', bandeira: '🇿🇦', tamanho: 4, formato: '####', exemplo: '2001' },
    { codigo: 'DE', nome: 'Alemanha', bandeira: '🇩🇪', tamanho: 5, formato: '#####', exemplo: '10115' },
    { codigo: 'PG', nome: 'Papua-Nova Guiné', bandeira: '🇵🇬', tamanho: 3, formato: '###', exemplo: '111' }
  ];

  paisSelecionado = signal('BR');

  cepControl = new FormControl('');

  endereco = signal<any>(null);
  loading = signal(false);
  erro = signal('');

  cepDigitado = toSignal(this.cepControl.valueChanges, {
    initialValue: ''
  });

  constructor() {

    effect(() => {

      const cep = this.limpar(this.cepDigitado() || '');

      if (cep.length === this.paisAtual().tamanho) {
        this.buscar();
      }

    });

  }

  paisAtual() {
    return this.paises.find(
      p => p.codigo === this.paisSelecionado()
    )!;
  }

  trocarPais(event: Event) {

    const select = event.target as HTMLSelectElement;

    this.paisSelecionado.set(select.value);

    this.cepControl.setValue('');
    this.endereco.set(null);
    this.erro.set('');
  }

  limpar(cep: string) {
    return cep.replace(/\D/g, '');
  }

  buscar() {

    const cep = this.limpar(this.cepControl.value || '');
    const pais = this.paisAtual();

    this.loading.set(true);
    this.erro.set('');
    this.endereco.set(null);


    // BRASIL - ViaCEP
    if (pais.codigo === 'BR') {

      this.cepService.buscarCep(cep).subscribe({

        next: (res) => {

          this.loading.set(false);

          if (res.erro) {
            this.erro.set('CEP não encontrado.');
            return;
          }

          this.endereco.set({
            codigo: res.cep,
            rua: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            estado: res.uf,
            pais: 'Brasil'
          });

        },

        error: () => {

          this.loading.set(false);
          this.erro.set('Erro ao consultar CEP.');

        }
      });

      return;
    }


    // OUTROS PAÍSES - OpenStreetMap
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?postalcode=${cep}` +
      `&countrycodes=${pais.codigo.toLowerCase()}` +
      `&format=jsonv2` +
      `&addressdetails=1` +
      `&limit=1`;


    this.http.get<any[]>(url).subscribe({

      next: (res) => {

        this.loading.set(false);

        if (!res.length) {
          this.erro.set('Código postal não encontrado.');
          return;
        }

        const endereco = res[0].address;

        this.endereco.set({

          codigo:
            endereco.postcode || cep,

          cidade:
            endereco.city ||
            endereco.town ||
            endereco.village ||
            endereco.municipality ||
            'Não informado',

          estado:
            endereco.state ||
            endereco.region ||
            endereco.county ||
            'Não informado',

          pais:
            endereco.country || pais.nome

        });

      },

      error: () => {

        this.loading.set(false);
        this.erro.set('Erro ao consultar código postal.');

      }

    });

  }

}