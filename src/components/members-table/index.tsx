import React, { Component } from 'react';
import { Table, Row, Layout, Col, Button, message } from 'antd';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import { membersAction, TypeMembersAction, TypeMembersState } from 'src/store/members';
import AddMemberForm from 'src/components/members-table/add-member-modal';
interface Props {
  action: TypeMembersAction;
  members: TypeMembersState;
}

/**
 * Members table
 */
class MembersTable extends Component<Props> {
  public state = {
    selectedRowKeys: [],
    data: [],
    loading: false,
    visibleAdd: false,
    filteredData: [],
    editableData: {},
    borrowingItem: {},
    returningItem: {}
  };

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

  /**
   * Validate a given email
   * @param email - String need to check
   * Returns a Boolean
   */
  validateEmail = (email: string) => {
    const emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegExp.test(email);
  };

  componentDidMount() {
    this.getMembers();
  }

  /**
   * get all members from the api
   */
  getMembers = () => {
    axios.get(`${process.env.BACK_END_URL}/members`).then(res => {
      this.props.action.setMembersList(res.data);
      this.setState({
        data: this.props.members
      });
    });
  };

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

  /**
   * calls when the items add form submits
   */
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

      // validate email
      if (!this.validateEmail(values.email)) {
        message.error('Invalid email entered');
        return;
      }

      /*
      * send new item to the api
      * */
      axios
        .post(`${process.env.BACK_END_URL}/member`, payload)
        .then(response => {
          console.log(response);
          this.setState({
            visibleAdd: false
          });
          this.getMembers();
        })
        .catch(() => {
          message.error('Error adding member');
        });
    });
  };

  saveFormRef = (formRef: any) => {
    this.addFormRef = formRef;
  };

  public onSelectChange = (selectedRowKeys: any) => {
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
