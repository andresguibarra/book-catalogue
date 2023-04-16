import { ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Book } from '../shared/models/book.model';
import { Author } from '../shared/models/author.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BookService } from '../shared/services/book.service';
import { AuthorService } from '../shared/services/authors.service';
import { isbnValidator } from '../shared/validators/isbn.validator';
import { Observable, iif, of, take } from 'rxjs';
import { atLeastOneAuthor } from '../shared/validators/author.validator';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.scss'],
})
export class BookEditComponent {
  separatorKeysCodes: number[] = [ENTER];
  bookForm: FormGroup;
  book: Book;
  isNewBook: boolean = false;
  bookId: string = '';
  authors: Author[] = [];
  authorControl = new FormControl();
  authors$: Observable<Author[]> = of();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.isNewBook = params['id'] === 'new';
      this.bookId = params['id'];
      this.initForm();
    });
    this.authors$ = this.authorService.getAuthors();
  }

  private initForm(): void {
    let bookName = '';
    let bookAuthors: Author[] = [];
    let bookPublicationYear;
    let bookRating;
    let bookIsbn;

    if (!this.isNewBook) {
      this.bookService
        .getBook(this.bookId)
        .pipe(take(1))
        .subscribe((book) => {
          this.book = book;
          bookName = book.name;
          bookAuthors = book.authors;
          bookPublicationYear = book.publicationYear;
          bookRating = book.rating;
          bookIsbn = book.isbn;

          this.bookForm.patchValue({
            name: bookName,
            authors: bookAuthors,
            publicationYear: bookPublicationYear,
            rating: bookRating,
            isbn: bookIsbn,
          });
        });
    }

    this.bookForm = this.fb.group({
      name: [bookName, [Validators.required, Validators.maxLength(255)]],
      authors: [bookAuthors, [atLeastOneAuthor()]],
      publicationYear: [bookPublicationYear, Validators.min(1800)],
      rating: [bookRating, [Validators.min(0), Validators.max(10)]],
      isbn: [bookIsbn, isbnValidator],
    });
  }

  onSubmit(): void {
    const newBook: Book = {
      name: this.bookForm.value['name'],
      authors: this.bookForm.value['authors'].map((a: Author) => a.id),
      publicationYear: this.bookForm.value['publicationYear'],
      rating: this.bookForm.value['rating'],
      isbn: this.bookForm.value['isbn'],
    };
    iif(
      () => this.isNewBook,
      this.bookService.addBook(newBook),
      this.bookService.updateBook(this.bookId, newBook)
    )
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  addAuthorToBook(author: Author): void {
    const authors = this.bookForm.get('authors')!.value;
    if (!authors.find((a: Author) => a.id === author.id)) {
      this.bookForm.get('authors')!.setValue([...authors, author]);
      this.authorControl.patchValue('');
    }
  }

  addNewAuthorAndSelect(fullName: string): void {
    this.authorService
      .addAuthor({ fullName })
      .pipe(take(1))
      .subscribe((author) => {
        this.addAuthorToBook(author);
      });
  }

  removeAuthorFromBook(authorToRemove: Author) {
    const authors = this.bookForm.get('authors')!.value;
    const updatedAuthors = authors.filter(
      (author: Author) => author.id !== authorToRemove.id
    );
    this.bookForm.get('authors')!.setValue(updatedAuthors);
  }
}
