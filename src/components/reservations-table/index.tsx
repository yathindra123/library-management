import React, { Component } from 'react';
import { Table, Row, Layout, Col } from 'antd';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import {
  reservationsAction,
  TypeReservationsAction,
  TypeReservationState
} from 'src/store/reservations';
interface Props {
  action: TypeReservationsAction;
  reservations: TypeReservationState;
}

class ReservationsTable extends Component<Props> {
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
      title: 'Item ISBN',
      dataIndex: 'isbn'
    },
    {
      title: 'UserID',
      dataIndex: 'reservedReader.id'
    },
    {
      title: 'User Name',
      dataIndex: 'reservedReader.name'
    },
    {
      title: 'mobile',
      dataIndex: 'reservedReader.mobile'
    }
  ];

  private addFormRef: any;

  componentDidMount() {
    axios.get(`http://localhost:9000/reservations`).then(res => {
      this.props.action.setReservationsList(res.data);
      this.setState({
        data: this.props.reservations
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

    // @ts-ignore
    const dataSource = this.state.data.map(person => person.name);

    return (
      <Layout>
        <Row type="flex" justify="end" style={{ height: '5em' }}>
          {/*content*/}
          <Col span={4} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            {/*<Button*/}
            {/*shape="circle"*/}
            {/*icon="plus"*/}
            {/*style={{ marginRight: '1em' }}*/}
            {/*onClick={this.showAddModal}*/}
            {/*/>*/}
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
  reservations: store.reservations.reservations
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...reservationsAction }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDisptachToProps
  // @ts-ignore
)(ReservationsTable);
