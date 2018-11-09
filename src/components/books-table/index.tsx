import React, { Component } from 'react'
import { Table, Row, Col, Button, Layout, message, Tag, Divider } from 'antd'
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books'
import { Store } from 'src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import AddBookForm from 'src/components/books-table/add-item-modal'
import DeleteBook from 'src/components/books-table/delete-item-modal'
import EditBookForm from 'src/components/books-table/edit-item-modal'
import BorrowItemForm from 'src/components/borrow-item'
// import jsPDF from 'jspdf'
// import mocks
import items from '../../../mocks/items.json'
import ReturnItemForm from 'src/components/return-item'

interface Props {
  action: TypeBooksAction
  books: TypeBooksState
}

const maximumPossibleItems = 150
const maximumPossibleBooks = 100
const maximumPossibleDVDs = 50
const currentBorrowReadyItem: any

let data: any = []
// for (let i = 0; i < 46; i++) {
//   data.push({
//     key: i,
//     name: `Edward King ${i}`,
//     age: 32,
//     address: `London, Park Lane no. ${i}`
//   })
// }

data = Array.from(items.items)

// create a new array from for searching purpose
const dataRender: any = Object.assign([], data)

const dataSource = dataRender.map((item: any) => {
  return item.name
})

let filteredBooks: string[] = dataSource

const getCurrentDate = () => {
  // format current date
  let today = new Date()
  let dd = today.getDate()

  let mm = today.getMonth() + 1
  const yyyy = today.getFullYear()
  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = yyyy + '-' + mm + '-' + dd

  return today
}

// sort data list by due date
function sortBy(index: any) {
  // @ts-ignore
  return (left, right) => {
    if (left[index] > right[index]) {
      return 1
    } else if (left[index] < right[index]) {
      return -1
    }
    return 0
  }
}

function getDateDifference(startDate: string, endDate: string) {
  const diff = Math.floor(
    (Date.parse(endDate.replace(/-/g, '/')) - Date.parse(startDate.replace(/-/g, '/'))) / 86400000
  )

  return diff
}

function calculateDebt(dateDiff: any) {
  let tempDiff = dateDiff
  let debt = 0

  if (tempDiff > 3) {
    debt += 3 * 24 * 0.2
    tempDiff -= 3
  } else {
    debt += tempDiff * 24 * 0.2
  }

  if (tempDiff > 0) {
    debt += tempDiff * 24 * 0.5
  }

  return debt
}
class BooksTable extends Component<Props> {
  columns = [
    {
      title: 'ISBN',
      dataIndex: 'key'
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
      dataIndex: 'author'
    },
    {
      title: 'Publisher',
      dataIndex: 'publisher'
    },
    {
      title: 'Borrowed Date',
      dataIndex: 'borrowedDate'
    },
    {
      title: 'Type',
      dataIndex: 'type'
    },
    {
      title: 'Num of pages',
      dataIndex: 'numOfPages'
    },
    {
      title: 'Actors',
      dataIndex: 'actors'
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
      dataIndex: 'personBorrowed'
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
              // console.log(record)
              // @ts-ignore
              this.setState({
                borrowingItem: record
              })
              // console.log(this.state.visibleAdd)
              // currentBorrowReadyItem = record
              this.showBorrowModal()
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
              })
              // console.log(this.state.visibleAdd)
              // currentBorrowReadyItem = record
              this.showReturnModal()
              this.handleReturn()
            }}
          >
            Return
          </Button>
        </span>
      )
    }
  ]
  public state = {
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
    visibleAdd: false,
    visibleEdit: false,
    visibleBorrow: false,
    visibleReturn: false,
    filteredData: data,
    editableData: {},
    borrowingItem: {},
    returningItem: {}
  }

  private addFormRef: any
  // @ts-ignore
  private editFormRef: any
  private borrowFormRef: any
  private returnFormRef: any

  showAddModal = () => {
    this.setState({
      visibleAdd: true
    })
  }

  showEditModal = () => {

    message.info('Not implemented yet')
    let tempItem = {}
    // get item by isbn
    items.items.map((item: any) => {
      // console.log('KY ', item.key, ' N ', this.state.selectedRowKeys[0])
      if (item.key === this.state.selectedRowKeys[0]) {
        tempItem = item
        // message.info('Not implemented yet')
      }
    })
    this.setState({
      visibleEdit: true,
      editableData: tempItem
    })
  }

  showBorrowModal = () => {
    this.setState({
      visibleBorrow: true
    })
  }

  showReturnModal = () => {
    this.setState({
      visibleReturn: true
    })
  }

  handleOk = (e: any) => {
    console.log(e)
    this.setState({
      visibleAdd: false
    })
  }

  handleCancelAddModal = (e: any) => {
    console.log(e)
    this.setState({
      visibleAdd: false
    })
  }

  handleCancelEditModal = (e: any) => {
    console.log(e)
    this.setState({
      visibleEdit: false
    })
  }

  handleCancelBorrowModal = (e: any) => {
    console.log(e)
    this.setState({
      visibleBorrow: false
    })
  }

  handleCancelReturnModal = (e: any) => {
    console.log(e)
    this.setState({
      visibleReturn: false
    })
  }

  // calls when the items add form submits
  handleCreate = () => {
    const form = this.addFormRef.props.form
    form.validateFields((err: any, values: any) => {
      if (err) {
        return
      }

      const actors = values.actors.split(',')
      const languages = values.languages.split(',')
      const subtitles = values.subtitles.split(',')

      const publicationDate = new Date(values.publicationDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-')

      const borrowedDate = new Date(values.borrowedDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-')

      const book = {
        key: values.isbn,
        title: values.title,
        sector: values.sector,
        author: values.names,
        publisher: values.publisher,
        borrowedDate,
        type: values.type,
        numOfPages: values.numOfPages,
        actors,
        availLanguages: languages,
        availSubtitles: subtitles,
        publicationDate,
        personBorrowed: values.borrower
      }

      items.items.push(book)

      const itemsList = items.items
      form.resetFields()
      this.setState({ visibleAdd: false, filteredData: itemsList })
    })
  }

  handleUpdate = () => {
    const form = this.editFormRef.props.form
    form.validateFields((err: any, values: any) => {
      if (err) {
        return
      }

      const hasSelectedMoreOrLessThanOne = this.state.selectedRowKeys.length !== 1

      if (hasSelectedMoreOrLessThanOne) {
        message.error('Please pick only one book to update')
        return
      }

      console.log('Updated values of form: ', values)
      form.resetFields()
      this.setState({ visibleAdd: false })
    })
  }

  handleBorrow = () => {
    const form = this.borrowFormRef.props.form
    form.validateFields((err: any, values: any) => {
      if (err) {
        return
      }

      const borrowingDate = new Date(values.borrowingDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '-')

      // update json
      items.items.map(item => {
        if (item.key === values.isbn) {
          // update record
          item.borrowedDate = borrowingDate
          item.personBorrowed = values.borrowerId
        }
      })

      form.resetFields()
      this.setState({ visibleBorrow: false })
    })
  }

  handleReturn = () => {
    // doc.save('a4.pdf')
    setTimeout(() => {
      console.log('please wait 1 sec', this.state.returningItem)
      if (!this.state.returningItem.personBorrowed) {
        message.error('This item does not borrowed to return')
        return
      }
      const returningDate = getCurrentDate()

      // check if due are there to pay
      const dateDifference = getDateDifference(
        this.state.returningItem.borrowedDate,
        returningDate.toString()
      )

      if (this.state.returningItem.type === 'book') {
        if (dateDifference > 7) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference))
        } else {
          message.info('Successfully returned the book')
        }
      } else {
        if (dateDifference > 3) {
          message.error('There is a debt to pay of ' + calculateDebt(dateDifference))
        } else {
          message.info('Successfully returned the book')
        }
      }

      // update json
      items.items.map(item => {
        if (item.key === this.state.returningItem.key) {
          // update record
          item.borrowedDate = ''
          item.personBorrowed = ''
        }
      })

      this.setState({ visibleBorrow: false })
    }, 1000)
  }

  // when confirm the delete confirmation
  confirm = (e: any) => {
    console.log(e)
    const hasSelected = this.state.selectedRowKeys.length > 0
    if (hasSelected) {
      items.items.map((item, index) => {
        this.state.selectedRowKeys.map(isbn => {
          if (item.key === isbn) {
            console.log('index : ', index, ' item: ', item)
            // delete items.items[index]
            items.items.splice(index, 1)
            console.log(items.items)
            this.setState({ filteredData: items.items })
          }
        })
      })
      // delete items.items[0]

      message.success('Successfully deleted')
    } else {
      message.error('Please pick items to delete')
    }
  }

  // when cancel the delete confirmation
  cancel = (e: any) => {
    console.log(e)
    message.error('Canceled deleting')
  }

  saveFormRef = (formRef: any) => {
    this.addFormRef = formRef
  }

  updateFormRef = (formRef: any) => {
    this.editFormRef = formRef
  }

  borrowItemFormRef = (formRef: any) => {
    this.borrowFormRef = formRef
  }

  returnItemFormRef = (formRef: any) => {
    this.returnFormRef = formRef
  }

  generateReport = () => {
    const tempReportData: any[] = []
    const tableData = this.state.filteredData
    const currentDate = getCurrentDate()

    // get only items which reached due dates
    tableData.map((item: any) => {
      const dateDifference = getDateDifference(item.borrowedDate, currentDate.toString())

      if (item.type === 'book') {
        if (dateDifference > 7) {
          const debt = calculateDebt(dateDifference)
          tempReportData.push({
            dateDifference,
            debt,
            ...item
          })
        }
      } else {
        if (dateDifference > 3) {
          const debt = calculateDebt(dateDifference)
          tempReportData.push({
            dateDifference,
            debt,
            ...item
          })
        }
      }
    })

    // sort by dateDifference
    tempReportData.sort(sortBy('dateDifference'))

    console.table(tempReportData)
  }

  public onSelectChange = (selectedRowKeys: any) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys)
    this.setState({ selectedRowKeys })
  }

  public updateTable = (value: string) => {
    const filteredItems: string[] = []
    dataSource.map((item: string) => {
      if (item.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        filteredItems.push(item)
      }
    })

    filteredBooks = filteredItems

    const tempData: any[] = []
    data.filter((item: any) => {
      filteredBooks.map(book => {
        if (book === item.name) {
          tempData.push(item)
        }
      })
    })

    this.setState({ filteredData: tempData })
  }

  public render() {
    const { selectedRowKeys } = this.state
    console.log(items)
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }

    const handleEdit = () => {
      this.showEditModal()
      // this.props.action.add(['namez' + Math.ceil(Math.random() * 8), 'sth', 'someother'])
    }

    const handleAdd = () => {
      checkForItemsLimits()
      this.showAddModal()
      // this.props.action.add(['namez' + Math.ceil(Math.random() * 8), 'sth', 'someother'])
    }

    const checkForItemsLimits = () => {
      // if items count is higher than 150
      if (items.items.length >= maximumPossibleItems) {
        message.error('150 max items limit has been exceeded')
        message.error('Try again by deleting unwanted items')
        return
      }

      let booksCount = 0
      let dvdCount = 0

      // find books and dvds count
      for (const item of items.items) {
        if (item.type === 'book') {
          booksCount++
        } else {
          dvdCount++
        }
      }

      // check books and dvds for maximum possible count
      if (booksCount > maximumPossibleBooks) {
        message.error(`${maximumPossibleBooks} items of books limit has been exceeded`)
        message.error('Try again by deleting unwanted books')
        return
      } else if (dvdCount > maximumPossibleDVDs) {
        message.error(`${maximumPossibleDVDs} items of DVDs limit has been exceeded`)
        message.error('Try again by deleting unwanted DVDs')
        return
      }
    }

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
          <div>
            <AddBookForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visibleAdd}
              onCancel={this.handleCancelAddModal}
              onCreate={this.handleCreate}
            />
          </div>

          <div>
            <EditBookForm
              wrappedComponentRef={this.updateFormRef}
              visible={this.state.visibleEdit}
              onCancel={this.handleCancelEditModal}
              onCreate={this.handleUpdate}
              editableData={this.state.editableData}
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
            <Button
              onClick={handleEdit}
              shape="circle"
              icon="edit"
              style={{ marginRight: '1em' }}
            />
            <DeleteBook confirm={this.confirm} cancel={this.cancel} />
          </Col>
        </Row>
        <Table
          style={{ overflowX: 'auto' }}
          rowSelection={rowSelection}
          columns={this.columns}
          dataSource={this.state.filteredData}
        />
      </Layout>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  books: state.books
})

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...booksAction }, dispatch)
})

export default connect(
  mapStateToProps,
  mapDisptachToProps
)(BooksTable)

// export default BooksTable
