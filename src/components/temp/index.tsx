import React from 'react'
import { Table, Input, Button, Icon } from 'antd'

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park'
  },
  {
    key: '2',
    name: 'Joe Black',
    age: 42,
    address: 'London No. 1 Lake Park'
  },
  {
    key: '3',
    name: 'Jim Green',
    age: 32,
    address: 'Sidney No. 1 Lake Park'
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park'
  }
]

class Temp extends React.Component {
  state = {
    searchText: ''
  }

  searchInput: any
  handleSearch = (selectedKeys: any, confirm: any) => () => {
    confirm()
    this.setState({ searchText: selectedKeys[0] })
  }

  handleReset = (clearFilters: any) => () => {
    clearFilters()
    this.setState({ searchText: '' })
  }

  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        // @ts-ignore
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Search name"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={this.handleSearch(selectedKeys, confirm)}
            />
            <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>
              Search
            </Button>
            <Button onClick={this.handleReset(clearFilters)}>Reset</Button>
          </div>
        ),
        filterIcon: (filtered: any) => (
          <Icon type="smile-o" style={{ color: filtered ? '#108ee9' : '#aaa' }} />
        ),
        onFilter: (value: any, record: any) =>
          record.name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible: any) => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus()
            })
          }
        },
        render: (text: any) => {
          const { searchText } = this.state
          return searchText ? (
            <span>
              {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map(
                (fragment: any, i: any) =>
                  fragment.toLowerCase() === searchText.toLowerCase() ? (
                    <span key={i} className="highlight">
                      {fragment}
                    </span>
                  ) : (
                    fragment
                  ) // eslint-disable-line
              )}
            </span>
          ) : (
            text
          )
        }
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age'
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        filters: [
          {
            text: 'London',
            value: 'London'
          },
          {
            text: 'New York',
            value: 'New York'
          }
        ],
        onFilter: (value: any, record: any) => record.address.indexOf(value) === 0
      }
    ]
    return <Table columns={columns} dataSource={data} />
  }
}

export default Temp
