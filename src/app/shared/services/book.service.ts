import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, map, of, switchMap } from 'rxjs';
import { Book } from '../models/book.model';
import {
  Firestore,
  collectionData,
  collection,
  CollectionReference,
  doc,
  docData,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Author } from '../models/author.model';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  booksCollection: CollectionReference<any>;
  authorsCollection: CollectionReference<any>;
  apiUrl: string = 'url';

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore
  ) {
    this.booksCollection = collection(this.firestore, 'books');
    this.authorsCollection = collection(this.firestore, 'authors');
  }

  getBooks(): Observable<Book[]> {
    return combineLatest([
      collectionData<Book>(this.booksCollection, { idField: 'id' }),
      collectionData<Author>(this.authorsCollection, { idField: 'id' }),
    ]).pipe(
      map(([books, authors]) => {
        books.forEach((book) => this.setRelatedAuthors(book, authors));
        return books;
      })
    );
  }

  setRelatedAuthors(book: Book, authors: Author[]) {
    const relatedAuthors = authors.filter((author) =>
      book.authors.map((a) => a.id).includes(author.id)
    );
    book.authors = relatedAuthors;
  }

  getAuthors(): Observable<Author[]> {
    return collectionData<Author>(this.authorsCollection, { idField: 'id' });
  }

  getBook(id: string): Observable<Book> {
    const bookRef = doc<Book>(this.booksCollection, id);
    return docData<Book>(bookRef);
  }

  addBook(book: Book): Observable<DocumentReference<Book>> {
    return from(this.angularFirestore.collection<Book>('books').add(book));
  }

  updateBook(id: string, book: Book): Observable<void> {
    const bookRef = doc<Book>(this.booksCollection, id);

    return from(updateDoc(bookRef, book));
  }

  deleteBook(id: string): Observable<void> {
    const bookRef = doc<Book>(this.booksCollection, id);

    return from(deleteDoc(bookRef));
  }
}
