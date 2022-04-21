import {Injectable, NgZone} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../auth/auth.service";
import {User} from "../objects/user";
import {Invoice} from "../objects/invoice";
import {InvoiceLists} from "../objects/invoiceLists";
import {collection, getDocs, orderBy, query, where} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private _snackBar: MatSnackBar,
    private authService: AuthService) { }

  addInvoiceListToUser(user: User, list: InvoiceLists){
    let uid = this.afs.createId();
    const invoiceRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}/invoiceLists/${uid}`
    )
    let invoiceList : InvoiceLists = {
      uid: uid,
      name: list.name,
      name_lowercase: list.name.toLowerCase(),
      balance: list.balance,
      startDate: list.startDate,
      endDate: list.endDate

    }
    return invoiceRef.set(invoiceList, {
      merge: true
    })

  }

  addInvoiceToInvoiceList(user: User, invoiceListUid: string, invoice: Invoice){
    let uid = this.afs.createId();
    const invoiceRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}/invoiceLists/${invoiceListUid}/invoices/${uid}`
    )
    invoice["uid"] = uid;
    return invoiceRef.set(invoice, {
      merge: true
    })

  }
  getAllInvoiceListsByUser(user: User, search: string) {
    return this.afs.collection(`users/${user.uid}/invoiceLists`).ref
      .where('name_lowercase', '>=', search.toLowerCase()).where('name_lowercase', '<=', search.toLowerCase() + '~')
      .orderBy("name_lowercase")
      .get()
  }

  getAllInvoices(user: User, invoiceUID: string) {
    return this.afs.collection(`users/${user.uid}/invoiceLists/${invoiceUID}/invoices`).valueChanges();
  }

  deleteInvoiceList(user: User, uid: string) {
    return this.afs.collection(`users`).doc(user.uid).collection("invoiceLists").doc(uid).delete();
  }

  deleteInvoice(user: User, uid: string, invoiceUid: string) {
    return this.afs.collection(`users`).doc(user.uid).collection("invoiceLists").doc(uid).collection("invoices").doc(invoiceUid).delete();
  }

  updateInvoiceListName(user: User, uid: string, text: string) {
    const invoiceRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}/invoiceLists/${uid}`
    )
    const invoiceList = {
      name: text
    }
    return invoiceRef.set(invoiceList, {
      merge: true
    })
  }

  updateInvoiceOnInvoiceList(user: User, uid: string, invoice: Invoice) {
    const invoiceRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}/invoiceLists/${uid}/invoices/${invoice.uid}`
    )
    console.log(user, uid, invoice)
    return invoiceRef.set(invoice, {
      merge: true
    })
  }

  updateInvoiceList(user: any, list: InvoiceLists) {
    const invoiceRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}/invoiceLists/${list.uid}`
    )
    return invoiceRef.set(list, {
      merge: true
    })

  }
}
