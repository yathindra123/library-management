import React, { Component } from 'react'
import { Modal, Form, Button } from 'antd'

interface Props {
  handleReturn: any
  form: any
  returningItem: any
  visible: boolean
}

const ReturnItemForm = Form.create()(
  class extends Component<Props> {
    state = {
      loading: false,
      visible: this.props.visible
    }
    handleOk = () => {
      // this.setState({ loading: true })
      // setTimeout(() => {
      //   this.setState({ loading: false, visible: false })
      // }, 3000)

      this.props.handleReturn()
    }

    handleCancel = () => {
      this.setState({ visible: false })
      console.log(this.state.visible)
    }

    render() {
      const { visible, returningItem } = this.props

      const isbn = returningItem.key

      return (
        <div>
          <Modal
            visible={this.state.visible}
            title="Title"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
              <Button key="Back" onClick={this.handleCancel}>
                Return
              </Button>,
              <Button key="Return" type="primary" onClick={this.handleOk}>
                Submit
              </Button>
            ]}
          >
            ISBN : <span>{isbn}</span>
          </Modal>
        </div>
      )
    }
  }
)

export default ReturnItemForm
