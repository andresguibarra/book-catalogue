import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import {
  Firestore,
  collectionData,
  collection,
  CollectionReference,
  doc,
  deleteDoc
} from '@angular/fire/firestore';
import { Author } from '../models/author.model';
import {
  AngularFirestore
} from '@angular/fire/compat/firestore';
import { LoadingService } from './loading.service';
@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  authorsCollection: CollectionReference<any>;

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore,
    private loadingService: LoadingService
  ) {
    this.authorsCollection = collection(this.firestore, 'authors');
  }

  getAuthors(): Observable<(Author)[]> {
    return collectionData<Author>(this.authorsCollection, { idField: 'id' });
  }

  addAuthor(author: Author): Observable<Author> {
    this.loadingService.showSpinner();
    return from(
      this.angularFirestore.collection<Author>('authors').add(author)
    ).pipe(
      switchMap((authorRef) => {
        return authorRef.get();
      }),
      tap(() => this.loadingService.hideSpinner()),
      map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Author;
      })
    );
  }


  deleteAuthor(id: string): Observable<void> {
    const authorRef = doc<Author>(this.authorsCollection, id);
    this.loadingService.showSpinner();

    return from(deleteDoc(authorRef)).pipe(
      tap(() => this.loadingService.hideSpinner()),
    );
  }
}
