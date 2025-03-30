import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { EditBookingDialogComponent } from './edit-booking-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Timestamp } from '@angular/fire/firestore';
import moment from 'moment-timezone';
import { Auth, reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword, sendEmailVerification } from '@angular/fire/auth';
import { EmailMaskPipe } from '../../pipes/email-mask.pipe';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-profile',
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
    MatNativeDateModule,
    MatCardModule,
    EmailMaskPipe,
    BookingCardComponent,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  editingBooking: any = null;
  newDate: Date | null = null;
  newTime: string = '';
  userName: string = '';
  userEmail: string | null = '';

  constructor(
    private bookingService: BookingService, 
    private userService: UserService, 
    private firestore: Firestore, 
    public dialog: MatDialog,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  formatDateToLocal(timestamp: Timestamp): string {
    return moment(timestamp.toDate()).tz('Europe/Budapest').format('YYYY-MM-DD');
  }

  formatDate(date: any): string {
    if (date instanceof Timestamp) {
      return this.formatDateToLocal(date);
    }
    return date;
  }

  async ngOnInit() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userEmail = currentUser.email || '';
      const userRef = doc(this.firestore, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        this.userName = userSnap.data()?.['name'] || '';
      }
    }

    const allBookings = await this.bookingService.getUserBookings();
    const now = moment().tz('Europe/Budapest');

    this.upcomingBookings = allBookings.filter(b => {
      const bookingDate = moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest');
      return bookingDate.isSameOrAfter(now);
    });

    this.pastBookings = allBookings.filter(b => {
      const bookingDate = moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest');
      return bookingDate.isBefore(now);
    });
  }

  async updateAvailableTimes(date: string) {
    await this.bookingService.updateAvailableTimes(date);
  }

  async updateUserEmail(newEmail: string, currentPassword: string) {
    if (!this.auth.currentUser) return;

    try {
        const credential = EmailAuthProvider.credential(this.auth.currentUser.email!, currentPassword);
        await reauthenticateWithCredential(this.auth.currentUser, credential);
        console.log("Hitelesítés sikeres!");

        await updateEmail(this.auth.currentUser, newEmail);
        console.log("E-mail sikeresen frissítve:", newEmail);

        this.snackBar.open("Az e-mail cím sikeresen frissítve!", "Bezárás", { duration: 3000 });
    } catch (error) {
        console.error("Hiba az e-mail frissítése során:", error);
        this.snackBar.open("Hiba történt az e-mail frissítésekor. Kérlek, ellenőrizd a jelszavad.", "Bezárás", { duration: 3000 });
    }
}

  async editBooking(booking: any) {
    const availableTimes = await this.bookingService.getAvailableTimes(booking.date);

    const dialogRef = this.dialog.open(EditBookingDialogComponent, {
      width: '400px',
      data: {
        bookingId: booking.id,
        newDate: booking.date,
        newTime: booking.time,
        availableTimes: availableTimes
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const success = await this.bookingService.updateBooking(
          result.bookingId,
          result.newDate,
          result.newTime
        );

        if (success) {
          this.upcomingBookings = await this.bookingService.getUserBookings();
          this.snackBar.open("Sikeresen módosítottad a foglalásodat", "Bezárás", { duration: 3000 });
        } else {
          this.snackBar.open("Hiba történt a módosítás során.", "Bezárás", { duration: 3000 });
        }
      }
    });
  }

  async saveChanges() {
    if (!this.editingBooking || !this.newDate || !this.newTime) return;

    const formattedDate = this.newDate.toISOString().split('T')[0];

    console.error('Date ', this.newDate);

    const success = await this.bookingService.updateBooking(
      this.editingBooking.id,
      formattedDate,
      this.newTime
    );

    if (success) {
      this.upcomingBookings = await this.bookingService.getUserBookings();
      await this.bookingService.updateAvailableTimes(formattedDate);
      this.editingBooking = null;
    } else {
      this.snackBar.open("Hiba történt a módosítás során.", "Bezárás", { duration: 3000 });
    }
  }

  async cancelBooking(bookingId: string) {
    const success = await this.bookingService.cancelBooking(bookingId);
    if (success) {
      this.upcomingBookings = this.upcomingBookings.filter(b => b.id !== bookingId);
      this.snackBar.open('A foglalás törlése sikeres volt.', 'Bezárás', { duration: 3000 });
    } else {
      this.snackBar.open('A foglalás törlése sikertelen.', 'Bezárás', { duration: 3000 });
    }
  }

  async saveUserData() {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    try {
      const userRef = doc(this.firestore, 'users', currentUser.uid);
      await updateDoc(userRef, { name: this.userName });
      this.snackBar.open("Felhasználói név sikeresen mentve!", "Bezárás", { duration: 3000 });
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      this.snackBar.open("Hiba történt a név mentése során.", "Bezárás", { duration: 3000 });
    }
  }

  viewDetails(booking: any) {
    const details = `Dátum: ${booking.date}, Időpont: ${booking.time}, Szolgáltatás: ${booking.service}, Ár: ${booking.price ? booking.price + ' Ft' : 'Ismeretlen'}, Helyszín: Szeged, Hargitai utca 60.`;
    this.snackBar.open(details, 'Bezárás', {
      duration: 5000,
      panelClass: ['snackbar-details']
    });
  }
}



