import React, { Component } from 'react'
import { Button, message, Popconfirm } from 'antd'

function confirm(e: any) {
  console.log(e)
  message.success('Successfully deleted')
}

function cancel(e: any) {
  console.log(e)
  message.error('Canceled deleting')
}

class DeleteBook extends Component {
  render() {
    return (
      <Popconfirm
        title="Are you sure delete this book?"
        onConfirm={confirm}
        onCancel={cancel}
        okText="Yes"
        cancelText="No"
        placement="bottom"
      >
        <Button shape="circle" icon="delete" />
      </Popconfirm>
    )
  }
}
export default DeleteBook
