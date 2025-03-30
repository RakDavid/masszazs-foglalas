import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface MassageService {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class MassageServiceService {
  constructor(private firestore: Firestore) {}

  getMassageServices(): Observable<MassageService[]> {
    const servicesCollection = collection(this.firestore, 'massage_services');
    return collectionData(servicesCollection, { idField: 'id' }) as Observable<MassageService[]>;
  }

  async addMassageService(service: MassageService) {
    service.id = uuidv4();
    const serviceDoc = doc(this.firestore, `massage_services/${service.id}`);
    return await setDoc(serviceDoc, service);
  }

  async deleteMassageService(serviceId: string) {
    const serviceDoc = doc(this.firestore, `massage_services/${serviceId}`);
    return await deleteDoc(serviceDoc);
  }

  async updateMassageService(service: MassageService) {
    const serviceDoc = doc(this.firestore, `massage_services/${service.id}`);
    return await updateDoc(serviceDoc, { 
      name: service.name, 
      description: service.description, 
      price: service.price, 
      image: service.image 
    });
  }
}
