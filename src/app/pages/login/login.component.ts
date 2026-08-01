import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  error = signal('');
  info = signal('');
  loading = signal(false);

  ngOnInit(): void {
    const expired = this.route.snapshot.queryParamMap.get('expired');

    if (expired === '1') {
      this.info.set('Tu sesión expiró. Inicia sesión de nuevo.');
    }
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.info.set('');
    this.loading.set(true);

    const result = await this.auth.login(this.email(), this.password());

    if (!result.ok) {
      this.loading.set(false);
      this.error.set(result.message ?? 'No fue posible iniciar sesión.');
      return;
    }

    this.loading.set(false);

    if (!result.profileComplete) {
      await this.router.navigate(['/completar-perfil']);
      return;
    }
    
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/catalogo';
    await this.router.navigateByUrl(returnUrl);

    await this.router.navigateByUrl(returnUrl);
  }
}