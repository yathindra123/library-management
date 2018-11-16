import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
const actionCreator = actionCreatorFactory('booksList');

// export class Book {
//   name: string
//   description: string
//   author: string
// }

// export interface ITaskState {
//   books: Book[];
// }

export interface Book {
  name: string;
  description: string;
  author: string;
}

export interface TypeBooksState {
  books: Book[];
  temp: any;
}

export const booksInitialState: TypeBooksState = {
  books: [],
  temp: []
};

export const booksAction = {
  setBooksList: actionCreator<any>('SET_BOOKS'),
  reset: actionCreator('RESET'),
  add: actionCreator<any>('ADD'),
  edit: actionCreator<any>('EDIT'),
  delete: actionCreator<string>('DELETE')
};

export type TypeBooksAction = typeof booksAction;

export const booksReducer = reducerWithInitialState(booksInitialState)
  // @ts-ignore
  .case(booksAction.setBooksList, setBookHandler)
  .case(booksAction.reset, () => booksInitialState)
  // @ts-ignore
  .case(booksAction.add, addBookHandler)
  // @ts-ignore
  .case(booksAction.edit, (state, payload) => ({
    ...state,
    name: payload
  }))
  // @ts-ignore
  .case(booksAction.delete, (state, payload) => ({
    ...state,
    name: payload
  }))
  .build();

function addBookHandler(state: TypeBooksState, book: any): TypeBooksState {
  state.books.push({
    name: book[0],
    description: book[1],
    author: book[2]
  });

  return {
    ...state
  };
}

function setBookHandler(state: TypeBooksState, bookList: any) {
  // format data
  let dateString = '';
  bookList.map((item: any) => {
    // publication date
    if (item.publicationDate) {
      const date = item.publicationDate;
      dateString = `${date.year}-${date.month}-${date.day}`;
      item.publicationDate = dateString;
    }

    // borrowed date
    if (item.borrowedDate) {
      const date = item.borrowedDate;
      dateString = `${date.year}-${date.month}-${date.day}`;
      item.borrowedDate = dateString;
    }

    // current reader
    if (item.currentReader) {
      const reader = item.currentReader;
      item.currentReader = reader.name;
    }

    // if available languages attribute not in the object
    if (!item.availLanguages) {
      item.availLanguages = [];
    }

    // if available subtitles attribute not in the object
    if (!item.availSubtitles) {
      item.availSubtitles = [];
    }

    // if producer attribute not in the object
    if (!item.producer) {
      item.producer = '';
    }

    // current author
    if (item.author) {
      item.author = item.author.name;
      item.authorId = item.author.id;
    } else {
      item.author = '';
      item.authorId = '';
    }
  });

  state.books = bookList;

  return {
    ...state
  };
}
