import React, { Component } from 'react'
import { Modal, Form, Input, Radio, DatePicker, TimePicker } from 'antd'

const FormItem = Form.Item

interface Props {
  visible: any
  onCancel: any
  onCreate: any
  form: any
  editableData: any
}

const EditBookForm = Form.create()(
  class extends Component<Props> {
    render() {
      const { visible, onCancel, onCreate, form, editableDate } = this.props
      const { getFieldDecorator } = form
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      }
      const config = {
        rules: [{ type: 'object', required: true, message: 'Please select time!' }]
      }

      console.log(editableDate)
      return (
        <Modal
          visible={visible}
          title="Edit the book item"
          okText="Update"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="Title">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: 'Please input the title of collection!' }]
              })(<Input />)}
            </FormItem>
            <FormItem label="Description">
              {getFieldDecorator('description')(<Input type="textarea" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="DatePicker">
              {getFieldDecorator('date-picker', config)(<DatePicker />)}
            </FormItem>
            <FormItem {...formItemLayout} label="TimePicker">
              {getFieldDecorator('time-picker', config)(<TimePicker />)}
            </FormItem>
            <FormItem className="collection-create-form_last-form-item">
              {getFieldDecorator('modifier', {
                initialValue: 'public'
              })(
                <Radio.Group>
                  <Radio value="public">Public</Radio>
                  <Radio value="private">Private</Radio>
                </Radio.Group>
              )}
            </FormItem>
          </Form>
        </Modal>
      )
    }
  }
)

export default EditBookForm
