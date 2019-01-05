import React, { Component } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
// import { Reservation } from 'src/store/reservations';
import { ItemType } from 'src/enums/item';

const FormItem = Form.Item;

interface Props {
  visible: any;
  onCancel: any;
  onCreate: any;
  form: any;
  reservationType: string;
}

const ReserveItemForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate, form, reservationType } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="Reserve the item"
          okText="Reserve"
          onCancel={onCancel}
          onOk={onCreate}
          style={{ backgroundColor: 'transparent' }}
        >
          <Form layout="vertical">
            <FormItem label="Borrower ID">
              {getFieldDecorator('borrowerID', {
                rules: [{ required: true, message: 'Please enter the borrower ID' }]
              })(<Input />)}
            </FormItem>
            {reservationType === ItemType.BOOK ? (
              <FormItem label="For how long(In hrs)?">
                {getFieldDecorator('timePeriod', {
                  rules: [{ required: true, message: 'Please enter the borrower ID' }]
                })(<InputNumber min={1} max={168} defaultValue={3} />)}
              </FormItem>
            ) : (
              <FormItem label="For how long(In hrs)?">
                {getFieldDecorator('timePeriod', {
                  rules: [{ required: true, message: 'Please enter the borrower ID' }]
                })(<InputNumber min={10} max={72} defaultValue={9} />)}
              </FormItem>
            )}
          </Form>
        </Modal>
      );
    }
  }
);

export default ReserveItemForm;
