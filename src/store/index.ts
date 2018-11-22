import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { counterReducer, TypeCounterState } from 'src/store/counter';
import { booksReducer, TypeBooksState } from 'src/store/books';
import { membersReducer, TypeMembersState } from 'src/store/members';

export interface Store {
  counter: TypeCounterState;
  books: TypeBooksState;
  members: TypeMembersState;
}

const reducers = combineReducers({
  counter: counterReducer,
  books: booksReducer,
  members: membersReducer
});

export const history = createBrowserHistory();

export const store = createStore(
  connectRouter(history)(reducers),
  composeWithDevTools(applyMiddleware(routerMiddleware(history), thunk))
);
