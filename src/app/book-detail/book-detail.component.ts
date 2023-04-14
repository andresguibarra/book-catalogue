import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Author } from '../shared/models/author.model';
import { Book } from '../shared/models/book.model';
import { BookService } from '../shared/services/book.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
})
export class BookDetailComponent {
  book$: Observable<Book>;
  authors$: Observable<Author[]>;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.book$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const bookId = params.get('id')!;
        return this.bookService.getBook(bookId);
      })
    );
  }
}
