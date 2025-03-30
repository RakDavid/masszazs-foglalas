import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-edit-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2>Foglalás módosítása</h2>
    <mat-form-field appearance="fill">
      <mat-label>Új dátum</mat-label>
      <input matInput [matDatepicker]="picker" [(ngModel)]="data.newDate" [min]="minDate">
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Új időpont</mat-label>
      <mat-select [(ngModel)]="data.newTime">
        <mat-option *ngFor="let time of data.availableTimes" [value]="time.time" [disabled]="time.disabled">
          {{ time.time }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div class="actions">
      <button mat-button (click)="dialogRef.close()">Mégse</button>
      <button mat-raised-button color="primary" (click)="save()">Mentés</button>
    </div>
  `,
  styles: [
    `.actions { display: flex; justify-content: space-between; margin-top: 15px; }`
  ]
})
export class EditBookingDialogComponent {
  minDate: Date = new Date(); // Mai nap

  constructor(
    public dialogRef: MatDialogRef<EditBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (typeof data.newDate === 'string') {
      this.data.newDate = new Date(data.newDate);
    }
  }

  save() {
    this.dialogRef.close(this.data);
  }
}
