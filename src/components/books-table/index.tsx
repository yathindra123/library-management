import React, { Component } from 'react';
import { Table, Row, Col, Button, Layout, message, Tag, Divider, AutoComplete } from 'antd';
import { itemsAction, TypeItemAction, State } from 'src/store/items';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import AddItemForm from 'src/components/books-table/add-item-modal';
import DeleteItem from 'src/components/books-table/delete-item-modal';
import BorrowItemForm from 'src/components/borrow-item';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ISBN from 'isbn-verify';
import ReturnItemForm from 'src/components/return-item';
import axios from 'axios';
import { ItemType } from 'src/enums/item';
import { Item } from 'src/model/item';

interface Props {
  action: TypeItemAction;
  items: State;
}
// maximum possible items
const maximumPossibleItems = 150;
const maximumPossibleBooks = 100;
const maximumPossibleDVDs = 50;

/**
 * get current date
 * return current date
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
 * sort data list by due date
 * @param index
 */
function sortBy(index: any) {
  return (left: any, right: any) => {
    if (left[index] > right[index]) {
      return 1;
    } else if (left[index] < right[index]) {
      return -1;
    }
    return 0;
  };
}

/**
 * get date difference
 * @param startDate
 * @param endDate
 */
function getDateDifference(startDate: string, endDate: string) {
  const diff = Math.floor(
    (Date.parse(endDate.replace(/-/g, '/')) - Date.parse(startDate.replace(/-/g, '/'))) / 86400000
  );

  return diff;
}

/**
 * calculate debt
 * @param dateDiff - difference of days
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
 * Books table
 */
class BooksTable extends Component<Props> {
  public state = {
    selectedRowKeys: [],
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
      title: 'ID',
      dataIndex: 'id'
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn'
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
              this.setState({
                borrowingItem: record
              });
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
          <DeleteItem confirm={() => this.confirm(record)} cancel={this.cancel} />
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

  /**
   * get all items from the api
   */
  getItems = () => {
    axios.get(`${process.env.BACK_END_URL}/items`).then(res => {
      this.props.action.setItemsList(res.data);
      this.setState({
        data: this.props.items,
        filteredData: this.props.items
      });
    });
  };

  /**
   * Show add modal
   */
  showAddModal = () => {
    this.setState({
      visibleAdd: true
    });
  };

  /**
   * Show borrow modal
   */
  showBorrowModal = () => {
    this.setState({
      visibleBorrow: true
    });
  };

  /**
   * Show return modal
   */
  showReturnModal = () => {
    this.setState({
      visibleReturn: true
    });
  };

  /**
   * hide add modal
   */
  handleCancelAddModal = () => {
    this.setState({
      visibleAdd: false
    });
  };

  /**
   * hide borrow modal
   */
  handleCancelBorrowModal = () => {
    this.setState({
      visibleBorrow: false
    });
  };

  /**
   * calls when the items add form submits
   */
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

      /*
      * send new item to the api
      * */
      if (values.type === ItemType.BOOK) {
        axios
          .post(`${process.env.BACK_END_URL}/items/savebook`, {
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
            this.handleCancelAddModal();
            // get items after adding book
            this.getItems();
          })
          .catch(() => {
            message.error('Error in entered values');
          });
      } else if (values.type === ItemType.DVD) {
        axios
          .post(`${process.env.BACK_END_URL}/items/savedvd`, {
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
            this.handleCancelAddModal();
            // get items after adding dvd
            this.getItems();
          })
          .catch(() => {
            message.error('Error in entered values');
          });
      } else {
        message.error('Invalid type: ' + values.type);
      }
    });
  };

  /**
   * calls when borrow button clicked
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
        // @ts-ignore
        axios
          .post(
            // @ts-ignore
            `${process.env.BACK_END_URL}/borrowBook/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`
          )
          .then(() => {
            this.handleCancelBorrowModal();
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
              `${process.env.BACK_END_URL}/borrowDvd/${this.state.borrowingItem.id}/${borrowingDate}/${values.borrowerId}`
            )
            .then(() => {
              this.handleCancelBorrowModal();
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

  /**
   * calls when return button clicked
   */
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

        // @ts-ignore
        axios
          .post(`${process.env.BACK_END_URL}/returnDvd/${this.state.returningItem.id}`)
          .then(() => {
            // get items after returning dvd
            this.getItems();
          });
      }

      this.setState({ visibleBorrow: false });
    }, 1000);
  };

  /**
   * when confirm the delete confirmation
   */
  confirm = (record: any) => {
    if (record.type === ItemType.DVD) {
      axios
        .delete(`${process.env.BACK_END_URL}/items/dvd/${record.id}`)
        .then(() => {
          message.success('Successfully deleted the DVD');
          // get items after deleting dvd
          this.getItems();
        })
        .catch(err => {
          console.log(err);
          message.error('Error in deleting');
        });
    } else if (record.type === ItemType.BOOK) {
      axios
        .delete(`${process.env.BACK_END_URL}/items/book/${record.id}`)
        .then(() => {
          message.success('Successfully deleted the book');
          // get items after deleting book
          this.getItems();
        })
        .catch(err => {
          console.log(err);
          message.error('Error in deleting');
        });
    }
  };

  /**
   * when cancel the delete confirmation
   */
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

  /**
   * generate report with overdue items
   */
  generateReport = () => {
    const doc = new jsPDF({
      orientation: 'landscape'
    });

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
    doc.autoTable(columns, arr);
    doc.output('dataurlnewwindow');

    doc.save('overdue-report.pdf');
  };

  /**
   * when select changes
   */
  public onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  };

  public render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };

    /**
     * handles add
     */
    const handleAdd = () => {
      checkForItemsLimits();
      this.showAddModal();
    };

    /**
     * check item limits
     */
    const checkForItemsLimits = () => {
      // if items count is higher than 150
      if (this.state.data.length >= maximumPossibleItems) {
        message.error('150 max items limit has been exceeded');
        message.error('Try again by deleting unwanted items');
        return;
      }

      let booksCount = 0;
      let dvdCount = 0;

      // find reservations and dvds count
      for (const item of this.state.data) {
        // @ts-ignore
        if (item.type === ItemType.BOOK) {
          booksCount++;
        } else {
          dvdCount++;
        }
      }

      // check reservations and dvds for maximum possible count
      if (booksCount > maximumPossibleBooks) {
        message.error(`${maximumPossibleBooks} items of books limit has been exceeded`);
        message.error('Try again by deleting unwanted reservations');
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
      this.setState({ filteredData: filteredItems });
    };
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
              }
            }}
            onSearch={value => {
              console.log('Entered: ' + value);
            }}
            onChange={value => {
              if (typeof value === 'string') {
                updateTable(value);
              } else {
                updateTable(value.toString());
              }
            }}
          />

          {/*add item modal*/}
          <div>
            <AddItemForm
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
