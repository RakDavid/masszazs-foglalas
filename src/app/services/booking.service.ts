import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, CollectionReference } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { Timestamp } from '@angular/fire/firestore';
import { updateDoc } from '@angular/fire/firestore';
import { DocumentData } from '@angular/fire/firestore';
import moment from 'moment-timezone';


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsCollection: CollectionReference;
  private availableTimes: { time: string; disabled: boolean }[] = [];

  constructor(private firestore: Firestore, private userService: UserService) {
    this.bookingsCollection = collection(this.firestore, 'bookings');
  }

  async updateBooking(bookingId: string, newDate: string | Date, newTime: string): Promise<boolean> {
    try {
      const bookingRef = doc(this.firestore, 'bookings', bookingId);
  
      const formattedDate = moment(newDate).format('YYYY-MM-DD');
      const localDate = moment.tz(`${formattedDate} ${newTime}`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest');
      const utcTimestamp = Timestamp.fromDate(localDate.toDate());
  
      await updateDoc(bookingRef, { date: utcTimestamp, time: newTime });
      return true;
    } catch (error) {
      console.error('Foglalás módosítási hiba:', error);
      return false;
    }
  }
  
  async getAvailableTimes(date: string): Promise<{ time: string; disabled: boolean }[]> {
    const bookedTimes = await this.getBookedTimes(date);

    const allTimes: { time: string; disabled: boolean }[] = [];
    for (let hour = 8; hour < 20; hour++) {
        allTimes.push({ time: `${hour.toString().padStart(2, '0')}:00`, disabled: false });
        allTimes.push({ time: `${hour.toString().padStart(2, '0')}:30`, disabled: false });
    }
    allTimes.push({ time: `20:00`, disabled: false });

    return allTimes.map((slot) => {
        const isBooked = bookedTimes.includes(slot.time);

        const isBlocked = bookedTimes.some((bookedTime) => {
            const [bookedHour, bookedMinute] = bookedTime.split(':').map(Number);
            const [slotHour, slotMinute] = slot.time.split(':').map(Number);

            const bookedMinutes = bookedHour * 60 + bookedMinute;
            const slotMinutes = slotHour * 60 + slotMinute;

            return (
                Math.abs(slotMinutes - bookedMinutes) <= 30
            );
        });

        return { ...slot, disabled: isBooked || isBlocked };
    });
}


async addBooking(date: string, time: string, service: string): Promise<boolean> {
  try {
      const userEmail = this.userService.getUserEmail();
      if (!userEmail) throw new Error('Nincs bejelentkezett felhasználó.');

      const localDate = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest');
      const utcTimestamp = Timestamp.fromDate(localDate.toDate());
      await addDoc(this.bookingsCollection, {
          userEmail,
          date: utcTimestamp,
          time,
          service
      });

      return true;
  } catch (error: any) {
      console.error('Foglalás mentési hiba:', error.message || error);
      return false;
  }
}



async getBookedTimes(date: string): Promise<string[]> {
  const startDate = moment.tz(`${date} 00:00`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest').utc();
  const endDate = moment.tz(`${date} 23:59`, 'YYYY-MM-DD HH:mm', 'Europe/Budapest').utc();

  console.log(`Lekérdezés kezdete UTC: ${startDate.format()}, vége UTC: ${endDate.format()}`);

  const q = query(
      this.bookingsCollection, 
      where("date", ">=", Timestamp.fromDate(startDate.toDate())),
      where("date", "<=", Timestamp.fromDate(endDate.toDate()))
  );

  const snapshot = await getDocs(q);
  
  snapshot.docs.forEach(doc => {
      console.log(`Firestore adat: `, doc.data());
  });

  return snapshot.docs.map(doc => {
      const data = doc.data();
      const localDate = moment(data['date'].toDate()).tz('Europe/Budapest');
      console.log(`Eredeti UTC idő: ${data['date'].toDate()} -> Helyi idő: ${localDate.format()}`);
      return data['time'];
  });
}

  async getBookings(): Promise<any[]> {
    const snapshot = await getDocs(this.bookingsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateAvailableTimes(date: string) {
    this.availableTimes = [];
    this.availableTimes = await this.getAvailableTimes(date);
}

async getUserBookings(): Promise<any[]> {
  const userEmail = this.userService.getUserEmail();
  if (!userEmail) return [];

  const q = query(this.bookingsCollection, where("userEmail", "==", userEmail));
  const snapshot = await getDocs(q);
  const bookings = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const serviceName = data['service'];

    const servicesSnapshot = await getDocs(collection(this.firestore, 'massage_services'));
    const matchedService = servicesSnapshot.docs.find(doc => doc.data()['name'] === serviceName);
    const serviceData = matchedService?.data() || {};

    bookings.push({
      id: docSnap.id,
      userEmail: data['userEmail'],
      date: data['date'] instanceof Timestamp
        ? moment(data['date'].toDate()).tz('Europe/Budapest').format('YYYY-MM-DD')
        : data['date'],
      time: data['time'],
      service: serviceName,
      price: serviceData['price'] || null,
      location: serviceData['location'] || 'Szeged 6726, Hargitai utca 60.'
    });
  }

  return bookings;
}


private formatTimestampToLocalString(timestamp: Timestamp, adjustDay: boolean = false): string {
  let localDate = moment(timestamp.toDate()).tz('Europe/Budapest');

  if (adjustDay) {
      const today = moment().tz('Europe/Budapest').format('YYYY-MM-DD');
      if (localDate.format('YYYY-MM-DD') !== today) {
          localDate.add(1, 'days'); 
      }
  }

  return localDate.format('YYYY-MM-DD');
}



  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const bookingRef = doc(this.firestore, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Foglalás törlési hiba:', error.message);
      } else {
        console.error('Foglalás törlési hiba:', error);
      }
      return false;
    }
  }
}