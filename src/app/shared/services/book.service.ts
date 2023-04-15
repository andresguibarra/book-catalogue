import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, map } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class BookService {
  booksCollection: CollectionReference<any>;

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore,
    private authorService: AuthorService
  ) {
    this.booksCollection = collection(this.firestore, 'books');
  }

  getBooks(): Observable<Book[]> {
    return combineLatest([
      collectionData<Book>(this.booksCollection, { idField: 'id' }),
      this.authorService.getAuthors(),
    ]).pipe(
      map(([books, authors]) => {
        books.forEach((book) => this.setRelatedAuthors(book, authors));
        return books;
      })
    );
  }

  setRelatedAuthors(book: Book, authors: Author[]) {
    const relatedAuthors = authors.filter((author) =>
      book.authors.some(a => a as any === author.id)
    );
    book.authors = relatedAuthors;
  }

  getBook(id: string): Observable<Book> {
    const bookRef = doc<Book>(this.booksCollection, id);
    return combineLatest([
      docData<Book>(bookRef),
      this.authorService.getAuthors(),
    ]).pipe(
      map(([book, authors]) => {
        this.setRelatedAuthors(book, authors);
        return book;
      })
    );
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
