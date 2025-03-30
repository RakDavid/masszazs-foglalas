import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {
    const now = new Date();
    console.log("🌍 Böngésző helyi idő:", now.toString());
    console.log("🌍 UTC idő:", now.toISOString());
    
    const firebaseTime = new Date("2025-03-20T16:00:00Z");
    console.log("🔥 Firestore Timestamp:", firebaseTime.toString());
    

  }

  navigateToBooking() {
    this.router.navigate(['/booking']);
  }

  
}
