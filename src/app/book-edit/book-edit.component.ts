import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Book } from '../shared/models/book.model';
import { Author } from '../shared/models/author.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BookService } from '../shared/services/book.service';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.scss'],
})
export class BookEditComponent {
  bookForm: FormGroup;
  book: Book;
  isNewBook: boolean = false;
  bookId: string = '';
  authors: Author[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.isNewBook = params['id'] === 'new';
      this.bookId = params['id'];
      this.initForm();
    });

    this.bookService.getAuthors().subscribe((authors) => {
      this.authors = authors;
    });
  }

  private initForm(): void {
    let bookName = '';
    let bookAuthors: Author[] = [];
    let bookPublicationYear;
    let bookRating;
    let bookIsbn;

    if (!this.isNewBook) {
      this.bookService.getBook(this.bookId).subscribe((book) => {
        this.book = book;
        bookName = book.name;
        bookAuthors = book.authors;
        bookPublicationYear = book.publicationYear;
        bookRating = book.rating;
        bookIsbn = book.isbn;

        this.bookForm.patchValue({
          name: bookName,
          authors: bookAuthors.map((author) => author.id),
          publicationYear: bookPublicationYear,
          rating: bookRating,
          isbn: bookIsbn,
        });
      });
    }

    this.bookForm = this.fb.group({
      name: [bookName, [Validators.required, Validators.maxLength(255)]],
      authors: [bookAuthors, [Validators.required]],
      publicationYear: [bookPublicationYear, Validators.min(1800)],
      rating: [bookRating, [Validators.min(0), Validators.max(10)]],
      isbn: [bookIsbn],
    });
  }

  onSubmit(): void {
    const newBook: Book = {
      name: this.bookForm.value['name'],
      authors: this.bookForm.value['authors'],
      publicationYear: this.bookForm.value['publicationYear'],
      rating: this.bookForm.value['rating'],
      isbn: this.bookForm.value['isbn'],
    };

    if (this.isNewBook) {
      this.bookService.addBook(newBook).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.bookService.updateBook(this.bookId, newBook).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}
