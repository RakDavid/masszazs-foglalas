import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterModule, NgIf, CommonModule, MatSidenavModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin$: Observable<boolean>;

  constructor(public userService: UserService, private router: Router) {
    this.isAdmin$ = this.userService.isAdmin$;
  }

  ngOnInit() {
    this.userService.getAuthState().subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
