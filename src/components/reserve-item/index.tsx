import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

interface Props {
  visible: any;
  onCancel: any;
  onCreate: any;
  form: any;
}

const ReserveItemForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
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
          </Form>
        </Modal>
      );
    }
  }
);

export default ReserveItemForm;
