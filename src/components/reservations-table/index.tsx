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

  columns = [
    {
      title: 'Item ISBN',
      dataIndex: 'isbn'
    },
    {
      title: 'Time (In Hours)',
      dataIndex: 'timeInHours'
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

  componentDidMount() {
    axios.get(`${process.env.BACK_END_URL}/reservations`).then(res => {
      this.props.action.setReservationsList(res.data);
      this.setState({
        data: this.props.reservations
      });
    });
  }

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
          {/*content*/}
          <Col span={4} style={{ marginTop: 'auto', marginBottom: 'auto' }} />
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
