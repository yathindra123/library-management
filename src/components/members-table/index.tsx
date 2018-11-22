import React, { Component } from 'react';
import { Table, Row, Layout, message, Col, Button } from 'antd';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
// import mocks
import items from '../../../mocks/items.json';
import axios from 'axios';
import { membersAction, TypeMembersAction, TypeMembersState } from 'src/store/members';
import AddMemberForm from 'src/components/members-table/add-member-modal';

interface Props {
  action: TypeMembersAction;
  members: TypeMembersState;
}

class MembersTable extends Component<Props> {
  // create a new array from for searching purpose
  public state = {
    selectedRowKeys: [], // Check here to configure the default column
    data: [],
    loading: false,
    visibleAdd: false,
    filteredData: [],
    editableData: {},
    borrowingItem: {},
    returningItem: {}
  };

  dataRender: any = Object.assign([], this.state.data);

  dataSource = this.dataRender.map((item: any) => {
    return item.name;
  });

  columns = [
    {
      title: 'id',
      dataIndex: 'id'
    },
    {
      title: 'name',
      dataIndex: 'name'
    },
    {
      title: 'mobile',
      dataIndex: 'mobile'
    },
    {
      title: 'email',
      dataIndex: 'email'
    }
  ];

  private addFormRef: any;

  componentDidMount() {
    axios.get(`http://localhost:9000/members`).then(res => {
      this.props.action.setMembersList(res.data);
      this.setState({
        data: this.props.members
      });
    });
  }

  showAddModal = () => {
    this.setState({
      visibleAdd: true
    });
  };

  handleCancelAddModal = (e: any) => {
    console.log(e);
    this.setState({
      visibleAdd: false
    });
  };

  // calls when the items add form submits
  handleCreate = () => {
    const form = this.addFormRef.props.form;
    form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      const payload = {
        id: null,
        name: values.name,
        email: values.email,
        mobile: values.mobile
      };

      form.resetFields();
      // this.setState({ visibleAdd: false, filteredData: itemsList });

      /*
      * send new item to the api
      * */
      axios
        .post('http://localhost:9000/member', payload)
        .then(response => {
          console.log(response);
          this.setState({
            visibleAdd: false
          });
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  // when confirm the delete confirmation
  confirm = (e: any) => {
    console.log(e);
    console.log(this.state.selectedRowKeys);
    const hasSelected = this.state.selectedRowKeys.length > 0;
    if (hasSelected) {
      items.items.map((item, index) => {
        this.state.selectedRowKeys.map(isbn => {
          if (item.key === isbn) {
            console.log('index : ', index, ' item: ', item);
            // delete items.items[index]
            items.items.splice(index, 1);
            console.log(items.items);
            this.setState({ filteredData: items.items });
          }
        });
      });
      // delete items.items[0]

      message.success('Successfully deleted');
    } else {
      message.error('Please pick items to delete');
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
            <AddMemberForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visibleAdd}
              onCancel={this.handleCancelAddModal}
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
  members: store.members.members
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...membersAction }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDisptachToProps
  // @ts-ignore
)(MembersTable);
