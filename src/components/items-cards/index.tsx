import React, { Component } from 'react';
import { Row, Col, Layout, Card, Button, message, Avatar, Tooltip } from 'antd';
import { itemsAction, TypeItemAction, State } from 'src/store/items';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import BorrowItemForm from 'src/components/borrow-item';
import { ItemType } from 'src/enums/item';
import './borrow-modal.css';

interface Props {
  action: TypeItemAction;
  items: State;
}

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

function getDateDifference(startDate: string, endDate: string) {
  const diff = Math.floor(
    (Date.parse(endDate.replace(/-/g, '/')) - Date.parse(startDate.replace(/-/g, '/'))) / 86400000
  );

  return diff;
}

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

class ItemCards extends Component<Props> {
  public state = {
    data: [],
    visibleBorrow: false,
    visibleReturn: false,
    borrowingItem: {},
    returningItem: {}
  };

  private borrowFormRef: any;

  componentDidMount() {
    this.getItems();
  }

  getItems = () => {
    axios.get(`http://localhost:9000/items`).then(res => {
      this.props.action.setItemsList(res.data);
      this.setState({
        data: this.props.items
      });
    });
  };

  borrowItemFormRef = (formRef: any) => {
    this.borrowFormRef = formRef;
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

  handleCancelBorrowModal = () => {
    this.setState({
      visibleBorrow: false
    });
  };

  showReturnModal = (card: any) => {
    this.setState({
      visibleReturn: true,
      returningItem: card
    });

    this.handleReturn();
  };

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
            `http://localhost:9000/borrowBook/${this.state.borrowingItem.id}/${borrowingDate}/${
              values.borrowerId
            }`
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
            `http://localhost:9000/borrowDvd/${this.state.borrowingItem.id}/${borrowingDate}/${
              values.borrowerId
            }`
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
        // @ts-ignore
        axios.post(`http://localhost:9000/returnBook/${this.state.returningItem.id}`).then(() => {
          // get items after returning book
          this.getItems();
        });
      } else {
        if (dateDifference > 3) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference));
        } else {
          message.info('Successfully returned the book');
        }

        // @ts-ignore
        axios.post(`http://localhost:9000/returnDvd/${this.state.returningItem.id}`).then(() => {
          // get items after returning dvd
          this.getItems();
        });
      }
      this.setState({ visibleReturn: false });
    }, 1000);
  };

  createTable = () => {
    const cardList: any[] = [];
    const cards = this.state.data;

    cards.map((card: any, i: number) => {
      cardList.push(
        <Col span={8} key={i} style={{ width: '25em', marginTop: '3em' }}>
          <Card title={card.title} bordered={false}>
            <div style={{ position: 'relative', left: '40%', width: '20%', marginBottom: '1em' }}>
              {card.type === ItemType.BOOK ? (
                <Avatar shape="square" size="large" icon="book" />
              ) : (
                <Avatar shape="square" size="large" icon="play-circle" />
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
