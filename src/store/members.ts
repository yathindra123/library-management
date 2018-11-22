import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
const actionCreator = actionCreatorFactory('membersList');

export interface Member {
  name: string;
  mobile: string;
  email: string;
}

export interface TypeMembersState {
  members: Member[];
}

export const membersInitialState: TypeMembersState = {
  members: []
};

export const membersAction = {
  setMembersList: actionCreator<any>('SET_MEMBERS'),
  reset: actionCreator('RESET'),
  add: actionCreator<any>('ADD'),
  edit: actionCreator<any>('EDIT'),
  delete: actionCreator<string>('DELETE')
};

export type TypeMembersAction = typeof membersAction;

export const membersReducer = reducerWithInitialState(membersInitialState)
  // @ts-ignore
  .case(membersAction.setMembersList, setMembersHandler)
  .case(membersAction.reset, () => membersInitialState)
  // @ts-ignore
  .case(membersAction.add, addMembersHandler)
  // @ts-ignore
  .case(membersAction.delete, (state, payload) => ({
    ...state,
    name: payload
  }))
  .build();

function addMembersHandler(state: TypeMembersState, book: any): TypeMembersState {
  state.members.push({
    name: book[0],
    mobile: book[1],
    email: book[2]
  });

  return {
    ...state
  };
}

function setMembersHandler(state: TypeMembersState, membersList: any) {
  // format data
  // let dateString = '';
  // membersList.map((item: any) => {
  //   // publication date
  //   if (item.publicationDate) {
  //     const date = item.publicationDate;
  //     dateString = `${date.year}-${date.month}-${date.day}`;
  //     item.publicationDate = dateString;
  //   }
  //
  //   // borrowed date
  //   if (item.borrowedDate) {
  //     const date = item.borrowedDate;
  //     dateString = `${date.year}-${date.month}-${date.day}`;
  //     item.borrowedDate = dateString;
  //
  //     if (item.borrowedDate === '0-0-0') {
  //       item.borrowedDate = '';
  //     }
  //   }
  //
  //   // current reader
  //   if (item.currentReader) {
  //     const reader = item.currentReader;
  //     item.currentReader = reader.name;
  //   }
  //
  //   // if available languages attribute not in the object
  //   if (!item.availLanguages) {
  //     item.availLanguages = [];
  //   }
  //
  //   // if available subtitles attribute not in the object
  //   if (!item.availSubtitles) {
  //     item.availSubtitles = [];
  //   }
  //
  //   // if producer attribute not in the object
  //   if (!item.producer) {
  //     item.producer = '';
  //   }
  //
  //   // current author
  //   if (!item.author) {
  //     item.author = [];
  //     item.authorId = [];
  //   }
  // });
  state.members = membersList;

  return {
    ...state
  };
}
