import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, collectionData, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: User | null = null;
  private authStateChanged = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();
  private userNameSubject = new BehaviorSubject<string | null>(null);
  userName$ = this.userNameSubject.asObservable();
  private isAuthResolvedSubject = new BehaviorSubject<boolean>(false);
  isAuthResolved$ = this.isAuthResolvedSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      this.authStateChanged.next(!!user);

      if (user) {
        const userData = await this.getUserData(user.uid);
        console.log("User data:", userData);  
        if (userData) {
          this.isAdminSubject.next(userData.isAdmin);
          this.userNameSubject.next(userData.name);
        }
      } else {
        this.isAdminSubject.next(false);
        this.userNameSubject.next(null);
      }
      this.isAuthResolvedSubject.next(true);
    });
  }

  
  getUsers(): Observable<AppUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<AppUser[]>;
  }

  
  async updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, { isAdmin });
      console.log(`Felhasználó admin státusza frissítve: ${isAdmin}`);
    } catch (error) {
      console.error("Admin jogosultság frissítési hiba:", error);
    }
  }

 
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await deleteDoc(userRef);
      console.log("Felhasználó törölve:", userId);
    } catch (error) {
      console.error("Felhasználó törlési hiba:", error);
    }
  }

  
  async registerUser(email: string, password: string, name: string): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (!user) return false; 

      const userRef = doc(this.firestore, 'users', user.uid); 
      await setDoc(userRef, { email, name, isAdmin: false });

      this.authStateChanged.next(true);
      this.userNameSubject.next(name);
      return true;
    } catch (error) {
      console.error("Regisztrációs hiba:", error);
      return false;
    }
  }

  
  async loginUser(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
  
      if (!user) return false;
  
      const userData = await this.getUserData(user.uid);
      if (userData) {
        this.isAdminSubject.next(userData.isAdmin);
        this.userNameSubject.next(userData.name);
  
        this.router.navigate([userData.isAdmin ? '/admin' : '/']);
      }
  
      return true;
    } catch (error: any) {
      console.error("Bejelentkezési hiba:", error.code, error.message);
      return false;
    }
  }
  
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser = null;
    this.authStateChanged.next(false);
    this.isAdminSubject.next(false);
    this.userNameSubject.next(null);
  }


  async getUserData(uid: string): Promise<{ name: string; isAdmin: boolean } | null> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as { name: string; isAdmin: boolean };
        
        this.isAdminSubject.next(userData.isAdmin || false);
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Hiba a felhasználói adatok lekérése közben:", error);
      return null;
    }
  }
  
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getUserEmail(): string | null {
    return this.currentUser ? this.currentUser.email : null;
  }


  getAuthState() {
    return this.authStateChanged.asObservable();
  }
}
