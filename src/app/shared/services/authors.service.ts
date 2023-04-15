import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
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
@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  authorsCollection: CollectionReference<any>;

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore
  ) {
    this.authorsCollection = collection(this.firestore, 'authors');
  }

  getAuthors(): Observable<(Author)[]> {
    return collectionData<Author>(this.authorsCollection, { idField: 'id' });
  }

  addAuthor(author: Author): Observable<Author> {
    return from(
      this.angularFirestore.collection<Author>('authors').add(author)
    ).pipe(
      switchMap((authorRef) => {
        return authorRef.get();
      }),
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

    return from(deleteDoc(authorRef));
  }
}
