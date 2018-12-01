import React, { Component } from 'react';
import { Table, Row, Col, Button, Layout, message, Tag, Divider, AutoComplete } from 'antd';
import { itemsAction, TypeItemAction, State } from 'src/store/items';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import AddBookForm from 'src/components/books-table/add-item-modal';
import DeleteBook from 'src/components/books-table/delete-item-modal';
import BorrowItemForm from 'src/components/borrow-item';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ISBN from 'isbn-verify';
// import mocks
import items from '../../../mocks/items.json';
import ReturnItemForm from 'src/components/return-item';
import axios from 'axios';
import { ItemType } from 'src/enums/item';
import { Item } from 'src/model/item';

interface Props {
  action: TypeItemAction;
  items: State;
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
// @ts-ignore
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
      // @ts-ignore
      render: (text: any, record: any) => (
        <span>
          <Button
            type="primary"
            onClick={() => {
              if (record.currentReader) {
                message.error('Return before borrowing this item');
                return;
              }
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
              if (!record.currentReader) {
                message.error('This item does not borrowed to return');
                return;
              }
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
    this.getItems();
  }

  getItems = () => {
    axios.get(`http://localhost:9000/items`).then(res => {
      this.props.action.setItemsList(res.data);
      this.setState({
        data: this.props.items,
        filteredData: this.props.items
      });
    });
  };

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

      // validate ISBN
      const isValidISBN = ISBN.Verify(values.isbn);

      if (!isValidISBN) {
        message.error('Invalid ISBN Entered');
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

      // const borrowedDateTemp = new Date(values.borrowedDate)
      //   .toISOString()
      //   .slice(0, 10)
      //   .replace(/-/g, '-');
      //
      // const borrowedDate: any[] = borrowedDateTemp.split('-');

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
        borrowedDate: null,
        type: values.type,
        numOfPages: values.numOfPages,
        actors,
        availLanguages: languages,
        availSubtitles: subtitles,
        publicationDate: publicationDateTemp,
        personBorrowed: null
      };
      form.resetFields();
      // this.setState({ visibleAdd: false, filteredData: itemsList });

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
              year: 0,
              month: 0,
              day: 0
            },
            currentReader: {
              id: values.borrower,
              name: '',
              mobile: '',
              email: ''
            },
            author: authors
          })
          .then(() => {
            // get items after adding book
            this.getItems();
          })
          .catch(error => {
            console.log(error);
          });
      } else if (values.type === ItemType.DVD) {
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
              year: 0,
              month: 0,
              day: 0
            },
            currentReader: {
              id: '',
              name: '',
              mobile: '',
              email: ''
            },
            availLanguages: languages,
            availSubtitles: subtitles,
            producer: 'I am the producer',
            actors
          })
          .then(() => {
            // get items after adding dvd
            this.getItems();
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        message.error('Invalid type: ' + values.type);
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
      // @ts-ignore
      if (this.state.borrowingItem.type === ItemType.BOOK) {
        // @ts-ignore
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
          });

        // @ts-ignore
        form.resetFields();
        this.setState({ visibleBorrow: false });
      } else {
        // @ts-ignore
        if (this.state.borrowingItem.type === ItemType.DVD) {
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
            });

          // @ts-ignore
          form.resetFields();
          this.setState({ visibleBorrow: false });
        }
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

      this.setState({ visibleBorrow: false });
    }, 1000);
  };

  // when confirm the delete confirmation
  confirm = (record: any) => {
    if (record.type === ItemType.DVD) {
      axios
        .delete(`http://localhost:9000/items/dvd/${record.id}`)
        .then(() => {
          message.success('Successfully deleted');
          // get items after deleting dvd
          this.getItems();
        })
        .catch(err => {
          console.log(err);
          message.error('Error in deleting');
        });
    } else if (record.type === ItemType.BOOK) {
      axios
        .delete(`http://localhost:9000/items/book/${record.id}`)
        .then(() => {
          message.success('Successfully deleted');
          // get items after deleting book
          this.getItems();
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
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    // const data = [
    //   [1, 'Denmark', 7.526, 'Copenhagen'],
    //   [2, 'Switzerland', 7.509, 'Bern'],
    //   [3, 'Iceland', 7.501, 'Reykjavík'],
    //   [4, 'Norway', 7.498, 'Oslo'],
    //   [5, 'Finland', 7.413, 'Helsinki']
    // ];
    //
    // doc.autoTable(columns, data);
    // doc.output('dataurlnewwindow');
    // let res = doc.autoTableHtmlToJson(document.getElementById('basic-table'));
    // doc.autoTable(res.columns, res.data, { margin: { top: 80 } });
    //
    // let header = function(data) {
    //   doc.setFontSize(18);
    //   doc.setTextColor(40);
    //   doc.setFontStyle('normal');
    //   doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
    //   doc.text('Testing Report', data.settings.margin.left, 50);
    // };
    //
    // let options = {
    //   beforePageContent: header,
    //   margin: {
    //     top: 80
    //   },
    //   startY: doc.autoTableEndPosY() + 20
    // };
    //
    // doc.autoTable(res.columns, res.data, options);

    const tempReportData: Item[] = [];
    const tableData = this.state.filteredData;
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

    // columns in the pdf table
    const columns = [
      'ID',
      'ISBN',
      'Reader',
      'Title',
      'Type',
      'Sector',
      'Debt',
      'Date diff',
      'Borrowed on'
    ];

    const arr: string[] = [];
    tempReportData.map((item: Item) => {
      const borrowedDate = item.borrowedDate;
      const currentReader = item.currentReader;
      // @ts-ignore
      const dateDifference = item.dateDifference;
      const title = item.title;
      // @ts-ignore
      const debt = item.debt;
      const id: string = item.id;
      const isbn = item.isbn;
      const sector = item.sector;
      // @ts-ignore
      const type = item.type;

      const tempArr: string[] = [];

      for (let i = 0; i < 5; i++) {
        (tempArr[0] = id),
          (tempArr[1] = isbn),
          (tempArr[2] = currentReader),
          (tempArr[3] = title),
          (tempArr[4] = type),
          (tempArr[5] = sector),
          (tempArr[6] = debt),
          (tempArr[7] = dateDifference),
          (tempArr[8] = borrowedDate);
      }
      // @ts-ignore
      arr.push(tempArr);
    });
    console.log(arr);
    doc.autoTable(columns, arr);
    doc.output('dataurlnewwindow');

    doc.save('overdue-report.pdf');
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
        if (item.type === ItemType.BOOK) {
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
    const dataTableTitles = this.state.data.map(item => {
      // @ts-ignore
      return item.title;
    });

    const updateTable = (value: string) => {
      const filteredItems: any[] = [];
      this.state.data.map((item: string) => {
        // @ts-ignore
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
          filteredItems.push(item);
        }
      });
      console.log(filteredItems);
      // filteredBooks = filteredItems;
      // const tempData: any[] = [];
      // data.filter((item: any) => {
      //   filteredBooks.map(book => {
      //     if (book === item.name) {
      //       tempData.push(item);
      //     }
      //   });
      // });
      this.setState({ filteredData: filteredItems });
    };

    // const hasSelected = selectedRowKeys.length > 0
    // console.log('size: ', items.items.length)
    // @ts-ignore
    return (
      <Layout>
        <Row type="flex" justify="end" style={{ height: '5em' }}>
          <AutoComplete
            style={{ marginRight: '5em', width: 200, marginTop: 'auto', marginBottom: 'auto' }}
            dataSource={dataTableTitles}
            placeholder="Search by item name"
            filterOption={(inputValue, option) =>
              // @ts-ignore
              option.props.children.toUpperCase().indexOf(inputValue.toUpperCase().trim()) !== -1
            }
            onSelect={value => {
              if (typeof value !== 'string') {
                value = value.toString();
                console.log('Selected: ' + value);
              }
              // this will execute when an item is selected from the search list
              // this.updateTable(value);
            }}
            onSearch={value => {
              console.log('Entered: ' + value);
              // this.updateTable(value);
            }}
            onChange={value => {
              if (typeof value === 'string') {
                updateTable(value);
              } else {
                updateTable(value.toString());
              }
            }}
          />

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
          </Col>
        </Row>
        <Table
          style={{ overflowX: 'auto' }}
          rowSelection={rowSelection}
          columns={this.columns}
          dataSource={this.state.filteredData}
        />
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
)(BooksTable);
