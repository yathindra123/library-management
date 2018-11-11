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
  state.books = bookList;

  return {
    ...state
  };
}
