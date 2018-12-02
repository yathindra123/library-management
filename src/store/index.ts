import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { counterReducer, TypeCounterState } from 'src/store/counter';
import { itemsReducer, State } from 'src/store/items';
import { membersReducer, TypeMembersState } from 'src/store/members';
import { reservationsReducer, TypeReservationState } from 'src/store/reservations';

export interface Store {
  counter: TypeCounterState;
  items: State;
  members: TypeMembersState;
  reservations: TypeReservationState;
}

const reducers = combineReducers({
  counter: counterReducer,
  items: itemsReducer,
  members: membersReducer,
  reservations: reservationsReducer
});

export const history = createBrowserHistory();

export const store = createStore(
  connectRouter(history)(reducers),
  composeWithDevTools(applyMiddleware(routerMiddleware(history), thunk))
);
