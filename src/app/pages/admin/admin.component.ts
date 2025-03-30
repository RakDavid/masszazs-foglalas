import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { MassageServiceService, MassageService } from '../../services/massage-services.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { EmailMaskPipe } from '../../pipes/email-mask.pipe';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, PriceFormatPipe, EmailMaskPipe, MatSnackBarModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  bookings: any[] = [];
  massageServices: MassageService[] = [];
  users: any[] = [];
  isAdmin: boolean = false;

  newService: MassageService = { id: '', name: '', description: '', price: 0, image: '' };
  editingService: MassageService | null = null;
  constructor(
    private bookingService: BookingService, 
    private massageService: MassageServiceService,
    private userService: UserService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userService.isAdmin$.subscribe((adminStatus) => {
      console.log("Admin státusz:", adminStatus);
      this.isAdmin = adminStatus;

      if (!this.isAdmin) {
        this.router.navigate(['/']);
      } else {
        this.loadMassageServices();
        this.loadBookings();
        this.loadUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.users = [];
    this.massageServices = [];
    console.log('🔁 Admin oldal bezárva, adatok kiürítve');
  }

  async loadMassageServices() {
    this.massageService.getMassageServices().subscribe(services => {
      this.massageServices = services;
    });
  }

  async loadBookings() {
    this.bookings = await this.bookingService.getBookings();
    this.bookings = this.bookings.map(booking => ({
      ...booking,
      date: booking.date?.toDate ? booking.date.toDate().toISOString().split('T')[0] : booking.date
    }));
  }
  

  async loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  async addService() {
    await this.massageService.addMassageService(this.newService);
    this.loadMassageServices();
    this.newService = { id: '', name: '', description: '', price: 0, image: '' };
    this.snackBar.open('Szolgáltatás sikeresen hozzáadva!', 'Bezárás', { duration: 3000, panelClass: 'snackbar-success' });
  }
  
  async deleteService(serviceId: string) {
    await this.massageService.deleteMassageService(serviceId);
    this.loadMassageServices();
    this.snackBar.open('Szolgáltatás törölve.', 'Bezárás', { duration: 3000, panelClass: 'snackbar-error' });
  }
  
  async deleteBooking(bookingId: string) {
    await this.bookingService.cancelBooking(bookingId);
    this.loadBookings();
    this.snackBar.open('Foglalás törölve.', 'Bezárás', { duration: 3000, panelClass: 'snackbar-error' });
  }
  
  async deleteUser(userId: string) {
    await this.userService.deleteUser(userId);
    this.loadUsers();
    this.snackBar.open('Felhasználó törölve.', 'Bezárás', { duration: 3000, panelClass: 'snackbar-error' });
  }
  
  async toggleAdmin(user: any) {
    await this.userService.updateUserRole(user.id, !user.isAdmin);
    this.loadUsers();
    const msg = user.isAdmin ? 'Admin jogosultság visszavonva.' : 'Admin jogosultság megadva.';
    this.snackBar.open(msg, 'Bezárás', { duration: 3000 });
  }
  
  async saveService() {
    if (this.editingService) {
      await this.massageService.updateMassageService(this.editingService);
      this.loadMassageServices();
      this.editingService = null;
      this.snackBar.open('Szolgáltatás módosítva.', 'Bezárás', { duration: 3000, panelClass: 'snackbar-success' });
    }
  }

  editService(service: MassageService) {
    this.editingService = { ...service };
  }
  
  cancelEdit() {
    this.editingService = null;
  }
}
