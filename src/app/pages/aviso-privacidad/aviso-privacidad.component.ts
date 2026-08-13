// src/app/pages/aviso-privacidad/aviso-privacidad.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aviso-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aviso-privacidad.component.html',
  styleUrls: ['./aviso-privacidad.component.scss']
})
export class AvisoPrivacidadComponent {}