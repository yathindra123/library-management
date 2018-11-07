import React, { Component } from 'react'
// import { Layout } from 'antd';
// const { Header, Footer } = Layout;
// import SideMenu from '../side-menu/side-menu';
import './home.css'
import { Route, Switch } from 'react-router'
import * as Routes from 'src/routes'
import { LeftSider } from 'src/components/sider/sider'
import { Layout } from 'antd'
// import { TypeCounterAction, TypeCounterState } from 'src/store/counter'
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books'
import { Store } from 'src/store'
import { bindActionCreators, Dispatch } from 'redux'
// import { counterAction } from 'src/store/counter'
import { connect } from 'react-redux'
// import { Counter } from 'src/components/pages/counter'
const { Header, Content, Footer } = Layout

import Login from '../../components/login'
import BooksTable from 'src/components/books-table'
import Temp from 'src/components/temp'
// import {Route} from "react-router";
// import Index from "../books-table/books-table";

interface Props {
  action: TypeBooksAction
  books: TypeBooksState
}

class Home extends Component<Props> {
  public render() {
    return (
      <div>
        <Layout style={{ minHeight: '100vh', backgroundColor: 'black' }}>
          {/*Left sider*/}
          <LeftSider />
          {/*Right section*/}
          <Layout>
            <Header style={{ background: 'black', padding: 0 }} />
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
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
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
