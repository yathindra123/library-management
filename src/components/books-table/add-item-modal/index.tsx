import React, { Component } from 'react';
import { Modal, Form, Input, Radio, DatePicker, Icon, Button } from 'antd';
import moment from 'moment';
import { ItemType } from 'src/enums/item';

const FormItem = Form.Item;
// const Option = Select.Option

interface Props {
  visible: any;
  onCancel: any;
  onCreate: any;
  form: any;
}

const AddBookForm = Form.create()(
  class extends Component<Props> {
    public state = {
      addItemType: 'book'
    };

    remove = (k: any) => {
      const { form } = this.props;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      // We need at least one passenger
      if (keys.length === 1) {
        return;
      }

      // can use data-binding to set
      // @ts-ignore
      form.setFieldsValue({
        keys: keys.filter((key: any) => key !== k)
      });
    };

    add = () => {
      const { form } = this.props;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      const nextKeys = keys.concat(keys.length);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        keys: nextKeys
      });
    };

    handleSubmit = (e: any) => {
      e.preventDefault();
      this.props.form.validateFields((err: any, values: any) => {
        if (!err) {
          console.log('Received values of form: ', values);
        }
      });
    };

    // choose book or dvd
    handleBookDvdChange = (e: any) => {
      this.setState({
        addItemType: e.target.value
      });
    };

    render() {
      const { visible, onCancel, onCreate } = this.props;
      // const { getFieldDecorator } = form
      // const formItemLayout = {
      //   labelCol: {
      //     xs: { span: 24 },
      //     sm: { span: 8 }
      //   },
      //   wrapperCol: {
      //     xs: { span: 24 },
      //     sm: { span: 16 }
      //   }
      // }
      const config = {
        rules: [{ type: 'object', required: true, message: 'Please select time!' }],
        onChange: (item: any) => {
          // let javaScriptRelease = Date.parse(item)
          console.log(
            new Date(item)
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, '/')
          );
        }
      };

      const { getFieldDecorator, getFieldValue } = this.props.form;
      // @ts-ignore
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 }
        }
      };
      const formItemLayoutWithOutLabel = {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 4 }
        }
      };
      getFieldDecorator('keys', { initialValue: [] });
      const keys = getFieldValue('keys');
      const formItems = keys.map((k: any, index: any) => {
        return (
          <FormItem
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            label={index === 0 ? 'authors' : ''}
            required={false}
            key={k}
          >
            {getFieldDecorator(`names[${k}]`, {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "Please enter or delete authors/entertainers' names"
                }
              ]
            })(<Input placeholder="name" style={{ width: '60%', marginRight: 8 }} />)}
            {keys.length > 1 ? (
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                // @ts-ignore
                disabled={keys.length === 1}
                onClick={() => this.remove(k)}
              />
            ) : null}
          </FormItem>
        );
      });

      const dateFormat = 'YYYY/MM/DD';

      return (
        <Modal
          visible={visible}
          title="Create a new collection"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="Isbn">
              {getFieldDecorator('isbn', {
                rules: [{ required: true, message: 'Please enter the isbn!' }]
              })(<Input />)}
            </FormItem>
            <FormItem label="Title">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: 'Please enter the title of the item!' }]
              })(<Input />)}
            </FormItem>
            <FormItem label="Sector">
              {getFieldDecorator('sector', {
                rules: [{ required: true, message: 'Please enter the sector of the item!' }]
              })(<Input />)}
            </FormItem>
            <span>Add authors/entertainers below</span>
            <br />
            <br />
            {formItems}
            <FormItem {...formItemLayoutWithOutLabel}>
              <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                <Icon type="plus" /> Add field
              </Button>
            </FormItem>
            <FormItem label="Publisher">
              {getFieldDecorator('publisher', {
                rules: [{ required: true, message: 'Please enter the publisher!' }]
              })(<Input />)}
            </FormItem>
            <h4>Borrowed date</h4>
            <FormItem {...formItemLayout}>
              {getFieldDecorator('borrowedDate', config)(
                <DatePicker defaultValue={moment('2018/11/08', dateFormat)} format={dateFormat} />
              )}
            </FormItem>
            <FormItem className="collection-create-form_last-form-item">
              {getFieldDecorator('type', {
                initialValue: 'BOOK'
              })(
                <Radio.Group onChange={this.handleBookDvdChange}>
                  <Radio value="BOOK">
                    <Icon type="book" /> Book
                  </Radio>
                  <Radio value="DVD">
                    <Icon type="play-circle" /> DVD
                  </Radio>
                </Radio.Group>
              )}
            </FormItem>
            {this.state.addItemType === ItemType.BOOK ? (
              <FormItem label="Num of pages">
                {getFieldDecorator('numOfPages', {
                  getValueFromEvent: (e: React.FormEvent<HTMLInputElement>) => {
                    const val = Number(e.currentTarget.value);
                    if (isNaN(val)) {
                      return Number(this.props.form.getFieldValue('numOfPages'));
                    } else {
                      return val;
                    }
                  },
                  rules: [
                    { required: true, type: 'number', message: 'Please enter the number of pages' }
                  ]
                })(<Input />)}
              </FormItem>
            ) : null}

            {this.state.addItemType === ItemType.DVD ? (
              <FormItem label="Actors">
                {getFieldDecorator('actors', {
                  rules: [{ required: true, message: 'Please enter the actors(comma separated)!' }]
                })(<Input />)}
              </FormItem>
            ) : null}

            {this.state.addItemType === ItemType.DVD ? (
              <FormItem label="Languages">
                {getFieldDecorator('languages', {
                  rules: [
                    { required: true, message: 'Please enter the languages(comma separated)!' }
                  ]
                })(<Input />)}
              </FormItem>
            ) : null}

            {this.state.addItemType === ItemType.DVD ? (
              <FormItem label="Subtitles">
                {getFieldDecorator('subtitles', {
                  rules: [
                    { required: true, message: 'Please enter the subtitles(comma separated)!' }
                  ]
                })(<Input />)}
              </FormItem>
            ) : null}

            <h4>Publication Date</h4>
            <FormItem {...formItemLayout} label="">
              {getFieldDecorator('publicationDate', config)(
                <DatePicker defaultValue={moment('2018/11/08', dateFormat)} format={dateFormat} />
              )}
            </FormItem>

            <FormItem label="Borrower ID">
              {getFieldDecorator('borrower', {
                rules: [{ required: true, message: 'Please enter the subtitles(comma separated)!' }]
              })(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

export default AddBookForm;
