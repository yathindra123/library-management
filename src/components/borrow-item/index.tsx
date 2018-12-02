import React, { Component } from 'react';
import { Modal, Form, Input, DatePicker } from 'antd';

const FormItem = Form.Item;

interface Props {
  visible: any;
  onCancel: any;
  onCreate: any;
  form: any;
  borrowingItem: any;
}

/**
 * Borrow item modal
 */
const BorrowItemForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      };
      const config = {
        rules: [{ type: 'object', required: true, message: 'Please select time!' }]
      };
      return (
        <Modal
          visible={visible}
          title="Borrow the book item"
          okText="Borrow"
          onCancel={onCancel}
          onOk={onCreate}
          style={{ backgroundColor: 'transparent' }}
        >
          <Form layout="vertical">
            <FormItem label="Borrower">
              {getFieldDecorator('borrowerId', {
                rules: [{ required: true, message: 'Please enter the details of the borrower' }]
              })(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Borrowing date">
              {getFieldDecorator('borrowingDate', config)(<DatePicker />)}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

export default BorrowItemForm;
