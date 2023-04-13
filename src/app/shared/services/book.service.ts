import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { Book } from '../models/book.model';
import {
  Firestore,
  collectionData,
  collection,
  CollectionReference,
  query,
  where,
  documentId,
} from '@angular/fire/firestore';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  booksCollection: CollectionReference<any>;
  authorsCollection: CollectionReference<any>;
  apiUrl: string = 'url';

  constructor(private firestore: Firestore) {
    this.booksCollection = collection(this.firestore, 'books');
    this.authorsCollection = collection(this.firestore, 'authors');
  }

  getBooks(): Observable<Book[]> {
    return combineLatest([
      collectionData<Book>(this.booksCollection),
      collectionData<Author>(this.authorsCollection, {idField: 'id'}),
    ]).pipe(
      map(([books, authors]) => {
        console.log('authors', authors);
        books.forEach((book) => {
          const relatedAuthors = authors.filter(author=> book.authors.map(a=>a.id).includes(author.id));
          book.authors = relatedAuthors;
        });
        return books;
      })
    );
  }

  getBook(id: number): Observable<Book> {
    return of();
  }

  createBook(book: Book): Observable<Book> {
    return of();
  }

  updateBook(id: number, book: Book): Observable<Book> {
    return of();
  }

  deleteBook(id: number): Observable<void> {
    return of();
  }
}
