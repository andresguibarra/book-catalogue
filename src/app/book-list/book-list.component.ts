import { Component } from '@angular/core';
import { Book } from '../shared/models/book.model';
import { Router } from '@angular/router';
import { BookService } from '../shared/services/book.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent {
  books: Book[] = [];
  groupedBooks: any[] = [];
  groupingCriteria: string = 'publicationYear';

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe((books: Book[]) => {
      this.books = books;
      this.groupBooks();
    });
  }

  groupBooks(): void {
    this.groupedBooks = [];
    const grouped = new Map<string, Book[]>();

    this.books.forEach((book) => {
      let key = '';
      switch (this.groupingCriteria) {
        case 'publicationYear':
          key = book.publicationYear ? book.publicationYear.toString() : 'Missing publication year';
          break;
        case 'rating':
          key = book.rating ? book.rating.toString() : 'No rating';
          break;
        case 'authors':
          key = book.authors.map(author => author.fullName).join(', ');
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(book);
    });

    Array.from(grouped.entries()).sort((a, b) => {
      if (this.groupingCriteria === 'authors') {
        return a[0].localeCompare(b[0]);
      }
      return b[0].localeCompare(a[0], undefined, { numeric: true });
    }).forEach(([title, books]) => {
      books.sort((a, b) => a.name.localeCompare(b.name));
      this.groupedBooks.push({ title, books });
    });
  }

  onGroupingChange(): void {
    this.groupBooks();
  }

  deleteBook(bookId: string): void {
    this.bookService.deleteBook(bookId).subscribe(() => {
      this.loadBooks();
    });
  }
}
