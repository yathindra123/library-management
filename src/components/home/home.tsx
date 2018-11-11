import React, { Component } from 'react';
import './home.css';
import { Route, Switch } from 'react-router';
import * as Routes from 'src/routes';
import { LeftSider } from 'src/components/sider/sider';
import { Avatar, Badge, Button, Layout, Popover } from 'antd';
import { booksAction, TypeBooksAction, TypeBooksState } from 'src/store/books';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
const { Header, Content, Footer } = Layout;

import Login from '../../components/login';
import BooksTable from 'src/components/books-table';

interface Props {
  action: TypeBooksAction;
  books: TypeBooksState;
}

const content = (
  <div>
    <p>User Name</p>
    <Button
      onClick={(e: any) => {
        e.preventDefault();
        console.log('Signed out');
      }}
    >
      Sign Out
    </Button>
  </div>
);

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
                <Route exact={true} path="/" component={BooksTable} />
                <Route exact={true} path="/abc" component={Routes.Counter} />
                <Route exact={true} path="/login" component={Login} />
                <Route exact={true} path="/books" component={BooksTable} />
                <Route render={Routes.NotFoundRedirectToRoot} />
              </Switch>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Created by Yathindra Kodithuwakku</Footer>
          </Layout>
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = (state: Store) => ({
  books: state.books
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...booksAction }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDisptachToProps
)(Home);

// export default Home
