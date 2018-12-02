import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
const actionCreator = actionCreatorFactory('reservationsList');

export interface Reservation {
  isbn: string;
  currentReader: any;
}

export interface TypeReservationState {
  reservations: Reservation[];
}

export const reservationsInitialState: TypeReservationState = {
  reservations: []
};

export const reservationsAction = {
  setReservationsList: actionCreator<any>('SET_RESERVATIONS'),
  reset: actionCreator('RESET'),
  add: actionCreator<any>('ADD'),
  edit: actionCreator<any>('EDIT'),
  delete: actionCreator<string>('DELETE')
};

export type TypeReservationsAction = typeof reservationsAction;

export const reservationsReducer = reducerWithInitialState(reservationsInitialState)
  // @ts-ignore
  .case(reservationsAction.setReservationsList, setReservationsHandler)
  .case(reservationsAction.reset, () => reservationsInitialState)
  // @ts-ignore
  .case(reservationsAction.add, addReservationsHandler)
  // @ts-ignore
  .case(reservationsAction.delete, (state, payload) => ({
    ...state,
    name: payload
  }))
  .build();

function addReservationsHandler(
  state: TypeReservationState,
  reservation: any
): TypeReservationState {
  state.reservations.push({
    isbn: reservation[0],
    currentReader: reservation[1]
  });

  return {
    ...state
  };
}

function setReservationsHandler(state: TypeReservationState, reservationsList: any) {
  state.reservations = reservationsList;

  return {
    ...state
  };
}
