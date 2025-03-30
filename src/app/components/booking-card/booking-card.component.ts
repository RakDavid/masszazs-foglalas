import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="booking-card">
      <mat-card-content>
        <p><strong>Dátum:</strong> {{ booking.date }}</p>
        <p><strong>Időpont:</strong> {{ booking.time }}</p>
        <p><strong>Szolgáltatás:</strong> {{ booking.service }}</p>
      </mat-card-content>
      <mat-card-actions class="booking-actions">
        <button mat-button color="primary" (click)="onEdit()" [disabled]="disabled">Módosítás</button>
        <button mat-button class="details-button" (click)="onViewDetails()">Részletek</button>
        <button mat-button color="warn" (click)="onCancel()" [disabled]="disabled">Lemondás</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./booking-card.component.scss']
})
export class BookingCardComponent {
  @Input() booking!: {
    id: string;
    date: string;
    time: string;
    service: string;
    price?: number;
  };
  @Input() disabled: boolean = false;
  @Output() edit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<any>();

  onEdit() {
    this.edit.emit(this.booking);
  }

  onCancel() {
    this.cancel.emit(this.booking.id);
  }

  onViewDetails() {
    this.viewDetails.emit(this.booking);
  }
}