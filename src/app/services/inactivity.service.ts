import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  private activitySub?: Subscription;
  private readonly inactivityMs = 60 * (180 * 1000); // 3 horas

  startMonitoring(): void {
    this.stopMonitoring();

    this.ngZone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(document, 'click'),
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'scroll'),
        fromEvent(document, 'touchstart')
      );

      this.activitySub = activity$
        .pipe(
          startWith(null),
          switchMap(() => timer(this.inactivityMs))
        )
        .subscribe(() => {
          this.ngZone.run(async () => {
            if (!this.auth.isLoggedIn()) {
              return;
            }

            await this.auth.logout();
            await this.router.navigate(['/login'], {
              queryParams: { expired: '1', reason: 'inactive' }
            });
          });
        });
    });
  }

  stopMonitoring(): void {
    this.activitySub?.unsubscribe();
    this.activitySub = undefined;
  }

  restartIfLoggedIn(): void {
    if (this.auth.isLoggedIn()) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }
}