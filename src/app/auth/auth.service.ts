import {Injectable, NgZone} from '@angular/core';
import {Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {User} from "../objects/user";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any
  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private _snackBar: MatSnackBar
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  canActivate(): boolean {
    if (!this.userData){
      this.router.navigate(['Home']);
      return false;
    }
    if (!this.userData.emailVerified) {
      this.verifyEmail()
      this.router.navigate(['Home']);
      return false;
    }
    return true;
  }

  SendForgotEmail(email: string){
    this.afAuth.sendPasswordResetEmail(email).then(() =>{
        this._snackBar.open("Password reset email sent", "OK")
      }, error =>{
        this._snackBar.open(error.message)
      }
    )
  }

  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['Home']);
        });
        this.SetUserData(result.user);
        this._snackBar.open("Successfully logged in!", "OK");
      }, error =>{
        this._snackBar.open(error.message)
      })
  }
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SendVerificationMail();
        this.SetUserData(result.user);
        this._snackBar.open("Successfully registered!", "OK");
      })
      .catch((error) => {
        this._snackBar.open(error.message)
      });
  }

  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null ;
  }

  get isVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user.emailVerified !== false;
  }

  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
  }

  Logout() {
    this.userData = undefined
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['Login']);
    });
  }

  verifyEmail(){
    if (this.isLoggedIn){
      if (!this.isVerified){
        this._snackBar.open("You've not verified your email yet", "RESEND").onAction().subscribe(() => {
          this.SendVerificationMail();
        }, error => {
          this._snackBar.open(error.message, "ok")
        })
      }
    }
  }
}
