import React, { Component } from 'react'
import { Table, Divider, Icon, Row, Col, Button, Layout, AutoComplete } from 'antd'
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books'
import { Store } from 'src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import CollectionCreateForm from 'src/components/books-table/add-book-modal'

interface Props {
  action: TypeBooksAction
  books: TypeBooksState
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address'
  },
  {
    title: 'Action',
    key: 'action',
    width: 360,
    render: () => (
      <span>
        <a
          href="javascript:;"
          onClick={() => {
            console.log('handle edit')
          }}
        >
          Edit
        </a>
        <Divider type="vertical" />
        <a href="javascript:;">Delete</a>
        <Divider type="vertical" />
        <a href="javascript:;" className="ant-dropdown-link">
          More actions <Icon type="down" />
        </a>
      </span>
    )
  }
]

const data: any = []
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`
  })
}

// create a new array from for searching purpose
const dataRender: any = Object.assign([], data)

const dataSource = dataRender.map((item: any) => {
  return item.name
})

let filteredBooks: string[] = dataSource

class BooksTable extends Component<Props> {
  public state = {
    selectedRowKeys: [], // Check here to configure the default column
    visibleAdd: false,
    filteredData: data
  }

  private formRef: any

  showAddModal = () => {
    this.setState({
      visibleAdd: true
    })
  }

  handleOk = (e: any) => {
    console.log(e)
    this.setState({
      visibleAdd: false
    })
  }

  handleCancel = (e: any) => {
    console.log(e)
    this.setState({
      visibleAdd: false
    })
  }

  handleCreate = () => {
    const form = this.formRef.props.form
    form.validateFields((err: any, values: any) => {
      if (err) {
        return
      }

      console.log('Received values of form: ', values)
      form.resetFields()
      this.setState({ visibleAdd: false })
    })
  }

  saveFormRef = (formRef: any) => {
    this.formRef = formRef
  }

  public onSelectChange = (selectedRowKeys: any) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys)
    this.setState({ selectedRowKeys })
  }

  public render() {
    const handleAdd = () => {
      this.props.action.add(['namez' + Math.ceil(Math.random() * 8), 'sth', 'someother'])
    }

    // @ts-ignore
    return (
      <Layout>
        <Row type="flex" justify="end" style={{ height: '5em' }}>
          <AutoComplete
            style={{ marginRight: '5em', width: 200, marginTop: 'auto', marginBottom: 'auto' }}
            dataSource={dataSource}
            placeholder="Search by book name"
            filterOption={(inputValue, option) =>
              // @ts-ignore
              option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            onSelect={value => {
              console.log('sel ', value)
            }}
            onSearch={value => {
              const filteredItems: string[] = []
              dataSource.map((item: string) => {
                if (item.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                  filteredItems.push(item)
                }
              })
              // data_render = dataSource.filter((item: any) => {
              //   item ==
              // })

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
            }}
          />

          {/*add modal*/}
          <div>
            <CollectionCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visibleAdd}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
            />
          </div>

          {/*content*/}
          <Col span={4} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <Button
              shape="circle"
              icon="plus"
              style={{ marginRight: '1em' }}
              onClick={this.showAddModal}
            />
            <Button onClick={handleAdd} shape="circle" icon="edit" style={{ marginRight: '1em' }} />
            <Button shape="circle" icon="delete" />
          </Col>
        </Row>
        <Table columns={columns} dataSource={this.state.filteredData} />
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
