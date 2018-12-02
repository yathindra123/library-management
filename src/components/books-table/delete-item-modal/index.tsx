import React, { Component } from 'react';
import { Button, Popconfirm } from 'antd';

interface Props {
  confirm: any;
  cancel: any;
}

/**
 * Delete item modal
 */
class DeleteItem extends Component<Props> {
  render() {
    return (
      <Popconfirm
        title="Are you sure delete this item?"
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
export default DeleteItem;
