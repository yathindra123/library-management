import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { ItemType } from 'src/enums/item';
import { Item } from 'src/model/item';
const actionCreator = actionCreatorFactory('itemList');

export interface State {
  items: Item[];
}

export const initialState: State = {
  items: []
};

export const itemsAction = {
  setItemsList: actionCreator<any>('SET_ITEMS'),
  reset: actionCreator('RESET'),
  add: actionCreator<any>('ADD'),
  edit: actionCreator<any>('EDIT'),
  delete: actionCreator<string>('DELETE')
};

export type TypeItemAction = typeof itemsAction;

export const itemsReducer = reducerWithInitialState(initialState)
  // @ts-ignore
  .case(itemsAction.setItemsList, setItemHandler)
  .case(itemsAction.reset, () => initialState)
  // @ts-ignore
  .case(itemsAction.add, addItemHandler)
  // @ts-ignore
  .case(itemsAction.edit, (state, payload) => ({
    ...state,
    name: payload
  }))
  // @ts-ignore
  .case(itemsAction.delete, (state, payload) => ({
    ...state,
    name: payload
  }))
  .build();

// @ts-ignore
function addItemHandler(state: State, item: any): State {
  // state.items.push({
  //   name: item[0],
  //   description: item[1],
  //   author: item[2]
  // });

  return {
    ...state
  };
}

function setItemHandler(state: State, bookList: Item[]) {
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

      if (item.borrowedDate === '0-0-0') {
        item.borrowedDate = '';
      }
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
      // should be a book
      item.type = ItemType.BOOK;
    } else {
      // should be a dvd
      item.type = ItemType.DVD;
    }

    // if producer attribute not in the object
    if (!item.producer) {
      item.producer = '';
    }

    // current author
    if (!item.author) {
      item.author = [];
      item.authorId = [];
    }
  });
  state.items = bookList;
  return {
    ...state
  };
}
