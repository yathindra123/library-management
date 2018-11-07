import React, { Component } from 'react'
import './home.css'
import { Route, Switch } from 'react-router'
import * as Routes from 'src/routes'
import { LeftSider } from 'src/components/sider/sider'
import { Avatar, Badge, Button, Layout, Popover } from 'antd'
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books'
import { Store } from 'src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
const { Header, Content, Footer } = Layout

import Login from '../../components/login'
import BooksTable from 'src/components/books-table'
import Temp from 'src/components/temp'

interface Props {
  action: TypeBooksAction
  books: TypeBooksState
}

const content = (
  <div>
    <p>User Name</p>
    <Button
      onClick={(e: any) => {
        e.preventDefault()
        console.log('Signed out')
      }}
    >
      Sign Out
    </Button>
  </div>
)

class Home extends Component<Props> {
  public render() {
    return (
      <div>
        <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
          {/*Left sider*/}
          <LeftSider />
          {/*Right section*/}
          <Layout>
            <Header style={{ background: 'black', padding: 0 }}>
              {/*Avatar*/}
              <div style={{ position: 'absolute', right: '3em' }}>
                <Popover placement={'bottom'} content={content} title="User">
                  <span style={{ marginRight: 0 }}>
                    <Badge count={1}>
                      <Avatar shape="square" icon="user" />
                    </Badge>
                  </span>
                </Popover>
              </div>
            </Header>
            <Content style={{ margin: '0 16px' }}>
              <Switch>
                <Route exact={true} path="/abc" component={Routes.Counter} />
                <Route exact={true} path="/login" component={Login} />
                <Route exact={true} path="/books" component={BooksTable} />
                <Route exact={true} path="/temp" component={Temp} />
                <Route render={Routes.NotFoundRedirectToRoot} />
              </Switch>

              {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
              {/*<Breadcrumb.Item>User</Breadcrumb.Item>*/}
              {/*<Breadcrumb.Item>Bill</Breadcrumb.Item>*/}
              {/*</Breadcrumb>*/}
              {/*<form onSubmit={this.handleForm}>*/}
              {/*<input type="text" />*/}
              {/*<button type="submit">Add</button>*/}
              {/*</form>*/}
              {/*<div style={{ padding: 24, background: '#fff', minHeight: 360 }}>{this.props.books.name} is a book.</div>*/}
            </Content>
            <Footer style={{ textAlign: 'center' }}>Created by Yathindra Kodithuwakku</Footer>
          </Layout>
        </Layout>
      </div>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  books: state.books
})

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...booksAction }, dispatch)
})

export default connect(
  mapStateToProps,
  mapDisptachToProps
)(Home)

// export default Home
