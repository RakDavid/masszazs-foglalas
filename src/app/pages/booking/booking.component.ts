import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingService } from '../../services/booking.service';
import { MassageServiceService, MassageService } from '../../services/massage-services.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule, 
    PriceFormatPipe
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit, OnDestroy {
  selectedDate: Date | null = null;
  selectedTime: string = '';
  selectedServiceId: string = '';
  availableTimes: { time: string; disabled: boolean }[] = [];
  services: MassageService[] = [];
  selectedService: string | null = null;
  minDate: Date = new Date();

  constructor(
    private bookingService: BookingService,
    private massageServiceService: MassageServiceService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar 
  ) {}

  async ngOnInit() {
    this.selectedDate = new Date(); 
    await this.updateAvailableTimes();
    this.loadServices();
    this.route.queryParamMap.subscribe(params => {
      this.selectedService = params.get('service');
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 BookingComponent elhagyva – állapot alaphelyzetbe állítva.');

    this.selectedDate = null;
    this.selectedTime = '';
    this.selectedServiceId = '';
  }

  async loadServices() {
    this.massageServiceService.getMassageServices().subscribe(services => {
      this.services = services;
      if (this.selectedService) {
        this.selectedServiceId = this.selectedService;
      }
    });
  }

  async updateAvailableTimes() {
    if (!this.selectedDate) return;
    const formattedDate = this.selectedDate.toISOString().split('T')[0];
    this.availableTimes = await this.bookingService.getAvailableTimes(formattedDate);
  }

  selectTime(time: string) {
    if (this.availableTimes.find(t => t.time === time)?.disabled) return;
    this.selectedTime = time;
  }

  async bookAppointment() {
    if (!this.selectedDate || !this.selectedTime || !this.selectedServiceId) {
      this.snackBar.open('Kérlek, töltsd ki az összes mezőt!', 'Bezárás', { duration: 3000 });
      return;
    }

    const selectedService = this.services.find(service => service.id === this.selectedServiceId);
    if (!selectedService) {
      this.snackBar.open('Hiba a szolgáltatás kiválasztásával.', 'Bezárás', { duration: 3000 });
      return;
    }

    const formattedDate = this.selectedDate.toISOString().split('T')[0];
    const success = await this.bookingService.addBooking(formattedDate, this.selectedTime, selectedService.name);
    
    if (success) {
      this.snackBar.open(
        `Foglalás sikeresen mentve: ${selectedService.name} (${selectedService.price} Ft)`,
        'Bezárás',
        { duration: 4000, panelClass: ['snackbar-success'] }
      );
      await this.updateAvailableTimes();
    } else {
      this.snackBar.open('Hiba történt a foglalás során.', 'Bezárás', { duration: 3000, panelClass: ['snackbar-error'] });
    }
  }
}
