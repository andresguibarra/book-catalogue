import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, map, tap } from 'rxjs';
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
import { AuthorService } from './authors.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  booksCollection: CollectionReference<any>;

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore,
    private authorService: AuthorService,
    private loadingService: LoadingService
  ) {
    this.booksCollection = collection(this.firestore, 'books');
  }

  getBooks(): Observable<Book[]> {
    this.loadingService.showSpinner();

    return combineLatest([
      collectionData<Book>(this.booksCollection, { idField: 'id' }),
      this.authorService.getAuthors(),
    ]).pipe(
      tap(() => this.loadingService.hideSpinner()),
      map(([books, authors]) => {
        books.forEach((book) => this.setRelatedAuthors(book, authors));
        return books;
      })
    );
  }

  setRelatedAuthors(book: Book, authors: Author[]) {
    const relatedAuthors = authors.filter((author) =>
      book.authors.some((a) => (a as any) === author.id)
    );
    book.authors = relatedAuthors;
  }

  getBook(id: string): Observable<Book> {
    const bookRef = doc<Book>(this.booksCollection, id);
    this.loadingService.showSpinner();
    return combineLatest([
      docData<Book>(bookRef),
      this.authorService.getAuthors(),
    ]).pipe(
      tap(() => this.loadingService.hideSpinner()),
      map(([book, authors]) => {
        this.setRelatedAuthors(book, authors);
        return book;
      })
    );
  }

  addBook(book: Book): Observable<DocumentReference<Book>> {
    this.loadingService.showSpinner();
    return from(this.angularFirestore.collection<Book>('books').add(book)).pipe(
      tap(() => this.loadingService.hideSpinner())
    );
  }

  updateBook(id: string, book: Book): Observable<void> {
    const bookRef = doc<Book>(this.booksCollection, id);
    this.loadingService.showSpinner();

    return from(updateDoc(bookRef, book)).pipe(
      tap(() => this.loadingService.hideSpinner())
    );
  }

  deleteBook(id: string): Observable<void> {
    const bookRef = doc<Book>(this.booksCollection, id);
    this.loadingService.showSpinner();

    return from(deleteDoc(bookRef)).pipe(
      tap(() => this.loadingService.hideSpinner())
    );
  }
}
