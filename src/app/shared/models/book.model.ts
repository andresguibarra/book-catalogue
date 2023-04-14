import { Author } from './author.model';

export interface Book {
  id?: string;
  name: string;
  authors: Author[];
  publicationYear?: number;
  rating?: number;
  isbn?: string;
}
