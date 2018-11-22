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

const BorrowItemForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate, form, borrowingItem } = this.props;
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

      const isbn = borrowingItem.key;
      console.log(this.props.borrowingItem);
      return (
        <Modal
          visible={visible}
          title="Borrow the book item"
          okText="Borrow"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="Isbn">
              {getFieldDecorator('isbn', {
                rules: [{ required: true, message: 'Please enter the isbn' }],
                initialValue: isbn
              })(
                <Input
                  value={this.props.borrowingItem.isbn}
                  placeholder={this.props.borrowingItem.isbn}
                />
              )}
            </FormItem>
            <FormItem label="Borrower">
              {getFieldDecorator('borrowerId', {
                rules: [{ required: true, message: 'Please enter the details of the borrower' }]
              })(<Input />)}
            </FormItem>
            {/*<FormItem label="Description">*/}
            {/*{getFieldDecorator('description')(<Input type="textarea" />)}*/}
            {/*</FormItem>*/}
            <FormItem {...formItemLayout} label="Borrowing date">
              {getFieldDecorator('borrowingDate', config)(<DatePicker />)}
            </FormItem>
            {/*<FormItem {...formItemLayout} label="TimePicker">*/}
            {/*{getFieldDecorator('time-picker', config)(<TimePicker />)}*/}
            {/*</FormItem>*/}
            {/*<FormItem className="collection-create-form_last-form-item">*/}
            {/*{getFieldDecorator('modifier', {*/}
            {/*initialValue: 'public'*/}
            {/*})(*/}
            {/*<Radio.Group>*/}
            {/*<Radio value="public">Public</Radio>*/}
            {/*<Radio value="private">Private</Radio>*/}
            {/*</Radio.Group>*/}
            {/*)}*/}
            {/*</FormItem>*/}
          </Form>
        </Modal>
      );
    }
  }
);

export default BorrowItemForm;
