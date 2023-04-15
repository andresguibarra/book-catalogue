import { Component, OnDestroy, OnInit } from '@angular/core';
import { Book } from '../shared/models/book.model';
import { Router } from '@angular/router';
import { BookService } from '../shared/services/book.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  groupedBooks: any[] = [];
  groupingCriteria: string = 'publicationYear';
  private subscription = new Subscription();

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadBooks(): void {
    this.subscription.add(
      this.bookService.getBooks().subscribe((books: Book[]) => {
        this.books = books;
        this.groupBooks();
      })
    );
  }

  groupBooks(): void {
    this.groupedBooks = [];
    const grouped = new Map<string, Book[]>();

    this.books.forEach((book) => {
      let key = '';
      switch (this.groupingCriteria) {
        case 'publicationYear':
          key = book.publicationYear
            ? book.publicationYear.toString()
            : 'Missing publication year';
          break;
        case 'rating':
          key = book.rating ? book.rating.toString() : 'No rating';
          break;
        case 'authors':
          key = book.authors.map((author) => author.fullName).join(', ');
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(book);
    });

    Array.from(grouped.entries())
      .sort((a, b) => {
        if (this.groupingCriteria === 'authors') {
          return a[0].localeCompare(b[0]);
        }
        return b[0].localeCompare(a[0], undefined, { numeric: true });
      })
      .forEach(([title, books]) => {
        books.sort((a, b) => a.name.localeCompare(b.name));
        this.groupedBooks.push({ title, books });
      });
  }

  recommendBook(): void {
    const currentYear = new Date().getFullYear();
    const oldBooks = this.books.filter((book) => {
      const isOldEnough =
        book.publicationYear && book.publicationYear <= currentYear - 3;
      return isOldEnough;
    });

    if (oldBooks.length > 0) {
      let highestRatedBooks: Book[] = [oldBooks[0]];

      for (let i = 1; i < oldBooks.length; i++) {
        if ((oldBooks[i].rating || 0) > (highestRatedBooks[0].rating || 0)) {
          highestRatedBooks = [oldBooks[i]];
        } else if (oldBooks[i].rating === highestRatedBooks[0].rating) {
          highestRatedBooks.push(oldBooks[i]);
        }
      }

      const randomIndex = Math.floor(Math.random() * highestRatedBooks.length);
      const recommendedBook = highestRatedBooks[randomIndex];
      this.router.navigate(['/book', recommendedBook.id]);
    } else {
      console.log('Not found');
    }
  }

  onGroupingChange(): void {
    this.groupBooks();
  }

  deleteBook(bookId: string): void {
    this.bookService
      .deleteBook(bookId)
      .pipe(take(1))
      .subscribe(() => {
        this.loadBooks();
      });
  }
}
