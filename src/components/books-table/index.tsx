import React, { Component } from 'react';
import { Table, Row, Col, Button, Layout, message, Tag, Divider } from 'antd';
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import AddBookForm from 'src/components/books-table/add-item-modal';
import DeleteBook from 'src/components/books-table/delete-item-modal';
import BorrowItemForm from 'src/components/borrow-item';
// import jsPDF from 'jspdf'
// import mocks
import items from '../../../mocks/items.json';
import ReturnItemForm from 'src/components/return-item';
import axios from 'axios';
import { ItemType } from 'src/enums/item';

interface Props {
  action: TypeBooksAction;
  books: TypeBooksState;
}

const maximumPossibleItems = 150;
const maximumPossibleBooks = 100;
const maximumPossibleDVDs = 50;

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

// sort data list by due date
function sortBy(index: any) {
  // @ts-ignore
  return (left, right) => {
    if (left[index] > right[index]) {
      return 1;
    } else if (left[index] < right[index]) {
      return -1;
    }
    return 0;
  };
}

function getDateDifference(startDate: string, endDate: string) {
  const diff = Math.floor(
    (Date.parse(endDate.replace(/-/g, '/')) - Date.parse(startDate.replace(/-/g, '/'))) / 86400000
  );

  return diff;
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
class BooksTable extends Component<Props> {
  // data: any = Array.from(this.props.members.temp);

  // create a new array from for searching purpose
  public state = {
    selectedRowKeys: [], // Check here to configure the default column
    data: [],
    loading: false,
    visibleAdd: false,
    visibleBorrow: false,
    visibleReturn: false,
    filteredData: [],
    borrowingItem: {},
    returningItem: {},
    deletingItem: {}
  };

  dataRender: any = Object.assign([], this.state.data);

  dataSource = this.dataRender.map((item: any) => {
    return item.name;
  });

  filteredBooks: string[] = this.dataSource;

  columns = [
    {
      title: 'ISBN',
      dataIndex: 'id'
    },
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Sector',
      dataIndex: 'sector'
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => (
        <span>
          {author.map((guy: any) => (
            <Tag color="blue" key={guy.id}>
              {guy.name}
            </Tag>
          ))}
        </span>
      )
    },
    {
      title: 'Producer',
      dataIndex: 'producer'
    },
    {
      title: 'Borrowed Date',
      dataIndex: 'borrowedDate'
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'type'
    // },
    // {
    //   title: 'Num of pages',
    //   dataIndex: 'numOfPages'
    // },
    {
      title: 'Available languages',
      dataIndex: 'availLanguages',
      key: 'availLanguages',
      render: (availLanguages: any) => (
        <span>
          {availLanguages.map((lng: any) => (
            <Tag color="blue" key={lng}>
              {lng}
            </Tag>
          ))}
        </span>
      )
    },
    {
      title: 'Available subtitles',
      dataIndex: 'availSubtitles',
      key: 'availSubtitles',
      render: (availSubtitles: any) => (
        <span>
          {availSubtitles.map((sub: any) => (
            <Tag color="blue" key={sub}>
              {sub}
            </Tag>
          ))}
        </span>
      )
    },
    {
      title: 'Publication date',
      dataIndex: 'publicationDate'
    },
    {
      title: 'Person borrowed',
      dataIndex: 'currentReader'
    },
    {
      title: 'Action',
      key: 'action',
      width: 360,
      render: (text: any, record: any) => (
        <span>
          <Button
            type="primary"
            onClick={() => {
              console.log(text);
              // @ts-ignore
              this.setState({
                borrowingItem: record
              });
              // console.log(this.state.visibleAdd)
              // currentBorrowReadyItem = record
              this.showBorrowModal();
            }}
          >
            Borrow
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            onClick={() => {
              // console.log(record)
              // @ts-ignore
              this.setState({
                returningItem: record
              });

              this.showReturnModal();
              this.handleReturn();
            }}
          >
            Return
          </Button>
          <Divider type="vertical" />
          <DeleteBook confirm={() => this.confirm(record)} cancel={this.cancel} />
        </span>
      )
    }
  ];

  private addFormRef: any;
  // @ts-ignore
  private borrowFormRef: any;

  componentDidMount() {
    axios.get(`http://localhost:9000/items`).then(res => {
      this.props.action.setBooksList(res.data);
      this.setState({
        data: this.props.books
      });
    });
  }

  showAddModal = () => {
    this.setState({
      visibleAdd: true
    });
  };

  showBorrowModal = () => {
    this.setState({
      visibleBorrow: true
    });
  };

  showReturnModal = () => {
    this.setState({
      visibleReturn: true
    });
  };

  handleOk = (e: any) => {
    console.log(e);
    this.setState({
      visibleAdd: false
    });
  };

  handleCancelAddModal = (e: any) => {
    console.log(e);
    this.setState({
      visibleAdd: false
    });
  };

  handleCancelBorrowModal = (e: any) => {
    console.log(e);
    this.setState({
      visibleBorrow: false
    });
  };

  // calls when the items add form submits
  handleCreate = () => {
    const form = this.addFormRef.props.form;
    form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      let actorNames: string[] = [];
      let languages: string[] = [];
      let subtitles: string[] = [];

      if (values.actors) {
        actorNames = values.actors.split(',');
      }
      if (values.languages) {
        languages = values.languages.split(',');
      }
      if (values.subtitles) {
        subtitles = values.subtitles.split(',');
      }

      const publicationDateTemp = new Date(values.publicationDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-');

      const publicationDate: any[] = publicationDateTemp.split('-');

      const borrowedDateTemp = new Date(values.borrowedDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-');

      const borrowedDate: any[] = borrowedDateTemp.split('-');

      const authorNames = values.names;

      const authors: any[] = [];
      const actors: any[] = [];

      authorNames.map((name: any) => {
        authors.push({
          id: null,
          name
        });
      });

      actorNames.map((name: any) => {
        actors.push({
          id: null,
          name
        });
      });

      const book = {
        key: values.isbn,
        title: values.title,
        sector: values.sector,
        author: values.names,
        publisher: values.publisher,
        borrowedDate: borrowedDateTemp,
        type: values.type,
        numOfPages: values.numOfPages,
        actors,
        availLanguages: languages,
        availSubtitles: subtitles,
        publicationDate: publicationDateTemp,
        personBorrowed: values.borrower
      };

      const itemsList = items.items;
      form.resetFields();
      this.setState({ visibleAdd: false, filteredData: itemsList });

      /*
      * send new item to the api
      * */
      if (values.type === ItemType.BOOK) {
        axios
          .post('http://localhost:9000/items/savebook', {
            id: null,
            isbn: values.isbn,
            title: book.title,
            sector: book.sector,
            publicationDate: {
              year: publicationDate[0],
              month: publicationDate[1],
              day: publicationDate[2]
            },
            borrowedDate: {
              year: borrowedDate[0],
              month: borrowedDate[1],
              day: borrowedDate[2]
            },
            currentReader: {
              id: values.borrower,
              name: '',
              mobile: '',
              email: ''
            },
            author: authors
          })
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        axios
          .post('http://localhost:9000/items/savedvd', {
            id: null,
            isbn: values.isbn,
            title: book.title,
            sector: book.sector,
            publicationDate: {
              year: publicationDate[0],
              month: publicationDate[1],
              day: publicationDate[2]
            },
            borrowedDate: {
              year: borrowedDate[0],
              month: borrowedDate[1],
              day: borrowedDate[2]
            },
            currentReader: {
              id: values.borrower,
              name: '',
              mobile: '',
              email: ''
            },
            availLanguages: languages,
            availSubtitles: subtitles,
            producer: 'I am the producer',
            actors
          })
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
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

      // update json
      items.items.map(item => {
        if (item.key === values.isbn) {
          // update record
          item.borrowedDate = borrowingDate;
          item.personBorrowed = values.borrowerId;
        }
      });

      if (this.state.borrowingItem.type === 'BOOK'){
        // @ts-ignore
        axios
          .post(
            `http://localhost:9000/borrowBook/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`
          )
          .then(res => {
            this.props.action.setBooksList(res.data);
            // this.setState({
            //   data: this.props.members
            // });
          });

        // @ts-ignore
        form.resetFields();
        this.setState({ visibleBorrow: false });
      } else if (this.state.borrowingItem.type === 'DVD') {
        // @ts-ignore
        axios
          .post(`http://localhost:9000/borrowDvd/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`)
          .then(res => {
            this.props.action.setBooksList(res.data);
            // this.setState({
            //   data: this.props.members
            // });
          });

        // @ts-ignore
        form.resetFields();
        this.setState({ visibleBorrow: false });
      }
    });
  };

  handleReturn = () => {
    // doc.save('a4.pdf')
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
        axios.post(`http://localhost:9000/returnBook/${this.state.returningItem.id}`).then(res => {
          // this.props.action.setBooksList(res.data);
          // this.setState({
          //   data: this.props.members
          // });
        });
      } else {
        if (dateDifference > 3) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference));
        } else {
          message.info('Successfully returned the book');
        }

        // @ts-ignore
        axios.post(`http://localhost:9000/returnDvd/${this.state.returningItem.id}`).then(res => {
          // this.props.action.setBooksList(res.data);
          // this.setState({
          //   data: this.props.members
          // });
        });
      }

      // update json
      // items.items.map(item => {
      //   // @ts-ignore
      //   if (item.key === this.state.returningItem.key) {
      //     // update record
      //     item.borrowedDate = '';
      //     item.personBorrowed = '';
      //   }
      // });

      this.setState({ visibleBorrow: false });
    }, 1000);
  };

  // when confirm the delete confirmation
  confirm = (record: any) => {
    if (record.type === ItemType.DVD) {
      axios
        .delete(`http://localhost:9000/items/dvd/${record.id}`)
        .then(res => {
          message.success('Successfully deleted');
          // this.setState({
          //   data: this.props.members
          // });
        })
        .catch(err => {
          console.log(err);
          message.error('Error in deleting');
        });
    } else if (record.type === ItemType.BOOK) {
      axios
        .delete(`http://localhost:9000/items/book/${record.id}`)
        .then(res => {
          message.success('Successfully deleted');
          // this.setState({
          //   data: this.props.members
          // });
        })
        .catch(err => {
          console.log(err);
          message.error('Error in deleting');
        });
    }
  };

  // when cancel the delete confirmation
  cancel = (e: any) => {
    console.log(e);
    message.error('Canceled deleting');
  };

  saveFormRef = (formRef: any) => {
    this.addFormRef = formRef;
  };

  borrowItemFormRef = (formRef: any) => {
    this.borrowFormRef = formRef;
  };

  returnItemFormRef = (formRef: any) => {
    console.log(formRef);
  };

  generateReport = () => {
    console.log(this.props);
    console.log(this.props.books);
    console.log(this.state.data);
    const tempReportData: any[] = [];
    const tableData = this.state.data;
    const currentDate = getCurrentDate();

    // get only items which reached due dates
    tableData.map((item: any) => {
      const dateDifference = getDateDifference(item.borrowedDate, currentDate.toString());

      if (item.type === 'book') {
        if (dateDifference > 7) {
          const debt = calculateDebt(dateDifference);
          tempReportData.push({
            dateDifference,
            debt,
            ...item
          });
        }
      } else {
        if (dateDifference > 3) {
          const debt = calculateDebt(dateDifference);
          tempReportData.push({
            dateDifference,
            debt,
            ...item
          });
        }
      }
    });

    // sort by dateDifference
    tempReportData.sort(sortBy('dateDifference'));

    console.table(tempReportData);
  };

  public onSelectChange = (selectedRowKeys: any) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  public render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };

    const handleAdd = () => {
      checkForItemsLimits();
      this.showAddModal();
      // this.props.action.add(['namez' + Math.ceil(Math.random() * 8), 'sth', 'someother'])
    };

    const checkForItemsLimits = () => {
      // if items count is higher than 150
      if (items.items.length >= maximumPossibleItems) {
        message.error('150 max items limit has been exceeded');
        message.error('Try again by deleting unwanted items');
        return;
      }

      let booksCount = 0;
      let dvdCount = 0;

      // find members and dvds count
      for (const item of items.items) {
        if (item.type === 'book') {
          booksCount++;
        } else {
          dvdCount++;
        }
      }

      // check members and dvds for maximum possible count
      if (booksCount > maximumPossibleBooks) {
        message.error(`${maximumPossibleBooks} items of books limit has been exceeded`);
        message.error('Try again by deleting unwanted members');
        return;
      } else if (dvdCount > maximumPossibleDVDs) {
        message.error(`${maximumPossibleDVDs} items of DVDs limit has been exceeded`);
        message.error('Try again by deleting unwanted DVDs');
        return;
      }
    };

    // const hasSelected = selectedRowKeys.length > 0
    // console.log('size: ', items.items.length)
    // @ts-ignore
    return (
      <Layout>
        <Row type="flex" justify="end" style={{ height: '5em' }}>
          {/*<AutoComplete*/}
          {/*style={{ marginRight: '5em', width: 200, marginTop: 'auto', marginBottom: 'auto' }}*/}
          {/*dataSource={dataSource}*/}
          {/*placeholder="Search by book name"*/}
          {/*filterOption={(inputValue, option) =>*/}
          {/*// @ts-ignore*/}
          {/*option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1*/}
          {/*}*/}
          {/*onSelect={value => {*/}
          {/*if (typeof value !== 'string') {*/}
          {/*value = value.toString()*/}
          {/*}*/}
          {/*// this will execute when an item is selected from the search list*/}
          {/*this.updateTable(value)*/}
          {/*}}*/}
          {/*onSearch={value => {*/}
          {/*this.updateTable(value)*/}
          {/*}}*/}
          {/*/>*/}

          {/*add modal*/}
          {/*<h1>{this.props.members.temp ? JSON.stringify(this.props.members.temp) : 'sdfio'}</h1>*/}
          <div>
            <AddBookForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visibleAdd}
              onCancel={this.handleCancelAddModal}
              onCreate={this.handleCreate}
            />
          </div>

          <div>
            <BorrowItemForm
              wrappedComponentRef={this.borrowItemFormRef}
              visible={this.state.visibleBorrow}
              onCancel={this.handleCancelBorrowModal}
              onCreate={this.handleBorrow}
              borrowingItem={this.state.borrowingItem}
            />
          </div>
          <div>
            <ReturnItemForm
              wrappedComponentRef={this.returnItemFormRef}
              visible={this.state.visibleReturn}
              handleReturn={this.handleReturn}
              returningItem={this.state.returningItem}
            />
          </div>

          {/*content*/}
          <Col span={4} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <Button
              shape="circle"
              icon="file-pdf"
              style={{ marginRight: '1em' }}
              onClick={this.generateReport}
            />
            <Button shape="circle" icon="plus" style={{ marginRight: '1em' }} onClick={handleAdd} />
            <DeleteBook confirm={this.confirm} cancel={this.cancel} />
          </Col>
        </Row>
        <Table
          style={{ overflowX: 'auto' }}
          rowSelection={rowSelection}
          columns={this.columns}
          dataSource={this.state.data}
        />
      </Layout>
    );
  }
}

const mapStateToProps = (store: Store) => ({
  books: store.books.books
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...booksAction }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDisptachToProps
  // @ts-ignore
)(BooksTable);

// export default BooksTable
