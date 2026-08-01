import { Component, signal, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { InactivityService } from './services/inactivity.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly inactivity = inject(InactivityService);
  
  title = 'catalogo-utensilios';
  showHeader = signal<boolean>(true);

  private rutasSinHeader = ['/prospeccion'];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        this.showHeader.set(!this.rutasSinHeader.includes(currentUrl));
      });
      effect(() => {
      const loggedIn = this.auth.isLoggedIn();

      if (loggedIn) {
        this.inactivity.startMonitoring();
      } else {
        this.inactivity.stopMonitoring();
      }
    });
  }

  ngOnInit(): void {
    this.inactivity.restartIfLoggedIn();
  }

  ngOnDestroy(): void {
    this.inactivity.stopMonitoring();
  }
}