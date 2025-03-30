import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map, take, switchMap, filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar) {}

  canActivate(): Observable<boolean> {
    return this.userService.isAuthResolved$.pipe(
      filter(resolved => resolved),    
      take(1),
      switchMap(() =>
        this.userService.getAuthState().pipe(
          take(1),
          map(isLoggedIn => {
            if (isLoggedIn) {
              return true;
            } else {
              this.snackBar.open('Hozzáférés megtagadva – Jelentkezz be!', 'Bezárás', {
                duration: 4000
              });
              this.router.navigate(['/login']);
              return false;
            }
          })
        )
      )
    );
  }
  
}
