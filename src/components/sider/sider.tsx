import { Layout, Menu, Icon } from 'antd';
import React, { Component } from 'react';

const { Sider } = Layout;

export class LeftSider extends Component {
  state = {
    collapsed: false
  };

  onCollapse = (collapsed: any) => {
    this.setState({ collapsed });
  };

  render() {
    return (
      <Sider
        style={{ marginTop: '4.3em' }}
        collapsible={true}
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="logo" />
        <Menu theme="dark" /*defaultSelectedKeys={['1']}*/ mode="inline">
          <Menu.Item key="1">
            <a href="/">
              <Icon type="book" theme="outlined" />
              <span>Items Manager</span>
            </a>
          </Menu.Item>
          <Menu.Item key="2">
            <a href="/members">
              <Icon type="book" theme="outlined" />
              <span>Members Manager</span>
            </a>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}
