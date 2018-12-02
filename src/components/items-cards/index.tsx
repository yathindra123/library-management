import React, { Component } from 'react';
import { Row, Col, Layout, Card, Button, message, Avatar, Tooltip, Badge } from 'antd';
import { itemsAction, TypeItemAction, State } from 'src/store/items';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import BorrowItemForm from 'src/components/borrow-item';
import { ItemType } from 'src/enums/item';
import './borrow-modal.css';
import ReserveItemForm from 'src/components/reserve-item';

interface Props {
  action: TypeItemAction;
  items: State;
}

/**
 * calculate debt
 * @param dateDiff
 */
function calculateDebt(dateDiff: any) {
  let tempDiff = dateDiff;
  let debt = 0;

  if (tempDiff > 3) {
    debt += 3 * 24 * 0.2;
    tempDiff -= 3;
  } else {
    debt += tempDiff * 24 * 0.2;
  }

  if (tempDiff > 0) {
    debt += tempDiff * 24 * 0.5;
  }

  return debt;
}

/**
 * add days for a given date
 * @param strDate
 * @param daysToAdd
 */
function addDays(strDate: string, daysToAdd: number): string {
  const date = new Date(strDate);
  const newDate = new Date(date.setDate(date.getDate() + daysToAdd));

  const strNewDate = newDate
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '-');
  return strNewDate;
}

/**
 * get date difference
 */
function getDateDifference(startDate: string, endDate: string) {
  const diff = Math.floor(
    (Date.parse(endDate.replace(/-/g, '/')) - Date.parse(startDate.replace(/-/g, '/'))) / 86400000
  );
  console.log(diff);
  return diff;
}

/**
 * get current date
 */
const getCurrentDate = () => {
  // format current date
  let today = new Date();
  let dd = today.getDate();

  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    // @ts-ignore
    dd = '0' + dd;
  }

  if (mm < 10) {
    // @ts-ignore
    mm = '0' + mm;
  }

  // @ts-ignore
  today = yyyy + '-' + mm + '-' + dd;

  return today;
};

/**
 * cards view of items
 */
class ItemCards extends Component<Props> {
  public state = {
    data: [],
    // reservations: [],
    visibleBorrow: false,
    visibleReturn: false,
    visibleReserve: false,
    borrowingItem: {},
    returningItem: {},
    reservationItem: {}
  };

  private borrowFormRef: any;
  private reserveFormRef: any;

  componentDidMount() {
    this.getItems();
  }

  /**
   * get all items
   */
  getItems = () => {
    axios.get(`${process.env.BACK_END_URL}/items`).then(res => {
      this.props.action.setItemsList(res.data);
      this.setState({
        data: this.props.items
      });
    });
  };

  borrowItemFormRef = (formRef: any) => {
    this.borrowFormRef = formRef;
  };

  reserveItemFormRef = (formRef: any) => {
    this.reserveFormRef = formRef;
  };

  showBorrowModal = (card: any) => {
    if (card.currentReader) {
      message.error('Return before borrowing this item');
      return;
    }
    this.setState({
      visibleBorrow: true,
      borrowingItem: card
    });
  };

  /**
   * show reservation modal
   */
  showReservationModal = (card: any) => {
    if (!card.currentReader) {
      message.error('You can borrow this. No need to reserve');
      return;
    }
    this.setState({
      visibleReserve: true,
      reservationItem: card
    });
  };

  handleCancelBorrowModal = () => {
    this.setState({
      visibleBorrow: false
    });
  };

  handleCancelReserveModal = () => {
    this.setState({
      visibleReserve: false
    });
  };

  showReturnModal = (card: any) => {
    this.setState({
      visibleReturn: true,
      returningItem: card
    });

    this.handleReturn();
  };

  /**
   * handle borrow function
   */
  handleBorrow = () => {
    const form = this.borrowFormRef.props.form;
    form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }
      const borrowingDate = new Date(values.borrowingDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-');

      // @ts-ignore
      if (this.state.borrowingItem.type === ItemType.BOOK) {
        axios
          .post(
            // @ts-ignore
            `${process.env.BACK_END_URL}/borrowBook/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`
          )
          .then(() => {
            // get items after borrowing book
            this.getItems();
          })
          .catch(() => {
            message.error('Invalid borrower ID');
          });

        form.resetFields();
        this.setState({ visibleBorrow: false });
        // @ts-ignore
      } else if (this.state.borrowingItem.type === ItemType.DVD) {
        // @ts-ignore
        axios
          .post(
            // @ts-ignore
            `${process.env.BACK_END_URL}/borrowDvd/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`
          )
          .then(() => {
            // get items after borrowing dvd
            this.getItems();
          })
          .catch(() => {
            message.error('Invalid borrower ID');
          });

        // @ts-ignore
        form.resetFields();
        this.setState({ visibleBorrow: false });
      }
    });
    // this.setState({ visibleBorrow: false });
  };

  /**
   * handle the return function
   */
  handleReturn = () => {
    setTimeout(() => {
      // @ts-ignore
      if (!this.state.returningItem.currentReader) {
        message.error('This item does not borrowed to return');
        return;
      }
      const returningDate = getCurrentDate();

      // check if due are there to pay
      const dateDifference = getDateDifference(
        // @ts-ignore
        this.state.returningItem.borrowedDate,
        returningDate.toString()
      );
      // @ts-ignore
      if (this.state.returningItem.type === ItemType.BOOK) {
        if (dateDifference > 7) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference));
        } else {
          message.info('Successfully returned the book');
        }

        axios
          // @ts-ignore
          .post(`${process.env.BACK_END_URL}/returnBook/${this.state.returningItem.id}`)
          .then(() => {
            // get items after returning book
            this.getItems();
          });
      } else {
        if (dateDifference > 3) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference));
        } else {
          message.info('Successfully returned the book');
        }

        axios
          // @ts-ignore
          .post(`${process.env.BACK_END_URL}/returnDvd/${this.state.returningItem.id}`)
          .then(() => {
            // get items after returning dvd
            this.getItems();
          });
      }
      this.setState({ visibleReturn: false });
    }, 1000);
  };

  /**
   * handle reservation
   */
  handleReserve = () => {
    const form = this.reserveFormRef.props.form;
    form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      let normalReturnDate = '';

      // @ts-ignore
      if (this.state.reservationItem.type === ItemType.DVD) {
        // @ts-ignore
        normalReturnDate = addDays(this.state.reservationItem.borrowedDate, 3);
        // TODO all the reservation dates sholud add to this normal return date (here or below)
        // @ts-ignore
      } else if (this.state.reservationItem.type === ItemType.BOOK) {
        // TODO all the reservation dates sholud add to this normal return date (here or below)
        // @ts-ignore
        normalReturnDate = addDays(this.state.reservationItem.borrowedDate, 7);
      }

      // @ts-ignore
      if (getDateDifference(getCurrentDate(), normalReturnDate) > 0) {
        message.info('This item will normally return on : ' + normalReturnDate);
      } else {
        message.info('Return date of this item has already exceeded');
      }

      axios
        .post(
          // @ts-ignore
          `${process.env.BACK_END_URL}/reservation`,
          {
            id: null,
            // @ts-ignore
            isbn: this.state.reservationItem.isbn,
            reservedReader: {
              id: values.borrowerID,
              name: '',
              mobile: '',
              email: ''
            }
          }
        )
        .then(() => {
          message.success('Successfully made the reservation');
          // get items after a reservation (Not Mandatory)
          this.getItems();
        })
        .catch(() => {
          message.error('Invalid reader ID');
        });

      // @ts-ignore
      form.resetFields();
      this.setState({ visibleReserve: false });
    });
  };

  // create cards set
  createTable = () => {
    const cardList: any[] = [];
    const cards = this.state.data;

    cards.map((card: any, i: number) => {
      cardList.push(
        <Col span={8} key={i} style={{ width: '25em', marginTop: '3em' }}>
          <Card title={card.title} bordered={true}>
            <div style={{ position: 'relative', left: '40%', width: '20%', marginBottom: '1em' }}>
              {card.type === ItemType.BOOK ? (
                card.borrowedDate ? (
                  <Badge dot={true}>
                    <Avatar shape="square" size="large" icon="book" />
                  </Badge>
                ) : (
                  <Badge dot={true} style={{ backgroundColor: '#52c41a' }}>
                    <Avatar shape="square" size="large" icon="book" />
                  </Badge>
                )
              ) : card.borrowedDate ? (
                <Badge dot={true}>
                  <Avatar shape="square" size="large" icon="play-circle" />
                </Badge>
              ) : (
                <Badge dot={true} style={{ backgroundColor: '#52c41a' }}>
                  <Avatar shape="square" size="large" icon="play-circle" />
                </Badge>
              )}
            </div>
            {card.currentReader ? 'Borrower : ' : 'No one taken yet'}
            {card.currentReader ? card.currentReader : null}
            <br />
            {card.borrowedDate ? 'Borrowed Date : ' : null}
            {card.borrowedDate ? card.borrowedDate : null}
            <br />
            <Col style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: '1em' }}>
              <Tooltip placement="bottom" title={'Borrow'}>
                <Button
                  icon="plus-square-o"
                  style={{ marginRight: '1em' }}
                  onClick={() => this.showBorrowModal(card)}
                />
              </Tooltip>
              <Tooltip placement="bottom" title={'Return'}>
                <Button
                  icon="minus-square"
                  style={{ marginRight: '1em' }}
                  onClick={() => this.showReturnModal(card)}
                />
              </Tooltip>
              {card.borrowedDate ? (
                <Tooltip placement="bottom" title={'Make Reservation'}>
                  <Button
                    icon="save"
                    style={{ marginRight: '1em', position: 'absolute', right: '0px' }}
                    onClick={() => this.showReservationModal(card)}
                  />
                </Tooltip>
              ) : null}
            </Col>
            <div>
              <BorrowItemForm
                wrappedComponentRef={this.borrowItemFormRef}
                visible={this.state.visibleBorrow}
                onCancel={this.handleCancelBorrowModal}
                onCreate={this.handleBorrow}
                borrowingItem={card}
              />
            </div>
            <div>
              <ReserveItemForm
                wrappedComponentRef={this.reserveItemFormRef}
                visible={this.state.visibleReserve}
                onCancel={this.handleCancelReserveModal}
                onCreate={this.handleReserve}
              />
            </div>
          </Card>
        </Col>
      );
    });

    return cardList;
  };

  public render() {
    return (
      <Layout>
        <div style={{ background: '#ECECEC', padding: '30px' }}>
          <Row gutter={16}>{this.createTable()}</Row>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (store: Store) => ({
  items: store.items.items
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...itemsAction }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDisptachToProps
  // @ts-ignore
)(ItemCards);
