import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private userService: UserService, 
    private router: Router,
    private snackBar: MatSnackBar 
  ) {}

  async login() {
    const success = await this.userService.loginUser(this.email, this.password);
    
    if (success) {
      const userData = await this.userService.getUserData(this.email);

      if (userData) {
        console.log('Bejelentkezett felhasználó:', userData);
      } else {
        console.warn('Nem sikerült lekérni a felhasználói adatokat.');
      }

      this.snackBar.open('Sikeres bejelentkezés!', 'Bezárás', { duration: 3000 });
      this.router.navigate(['/']);
    } else {
      this.snackBar.open('Hibás e-mail vagy jelszó!', 'Bezárás', { duration: 3000 });
    }
  }
}
