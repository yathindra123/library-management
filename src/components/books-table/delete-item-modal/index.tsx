import React, { Component } from 'react';
import { Button, Popconfirm } from 'antd';

interface Props {
  confirm: any;
  cancel: any;
}

class DeleteBook extends Component<Props> {
  render() {
    return (
      <Popconfirm
        title="Are you sure delete this book?"
        onConfirm={this.props.confirm}
        onCancel={this.props.cancel}
        okText="Yes"
        cancelText="No"
        placement="bottom"
      >
        <Button shape="circle" icon="delete" />
      </Popconfirm>
    );
  }
}
export default DeleteBook;
