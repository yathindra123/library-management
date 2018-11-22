import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

interface Props {
  visible: any;
  onCancel: any;
  onCreate: any;
  form: any;
}

const AddMemberForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate } = this.props;

      const { getFieldDecorator } = this.props.form;

      getFieldDecorator('keys', { initialValue: [] });

      return (
        <Modal
          visible={visible}
          title="Add new member"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="name">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please enter the name!' }]
              })(<Input />)}
            </FormItem>
            <FormItem label="email">
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please enter the email!' }]
              })(<Input />)}
            </FormItem>
            <FormItem label="mobile">
              {getFieldDecorator('mobile', {
                rules: [{ required: true, message: 'Please enter the mobile!' }]
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

export default AddMemberForm;
