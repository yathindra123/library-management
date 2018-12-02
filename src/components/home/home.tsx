import React, { Component } from 'react';
import './home.css';
import { Route, Switch, withRouter } from 'react-router';
import * as Routes from 'src/routes';
import { LeftSider } from 'src/components/sider/sider';
import { Avatar, Badge, Button, Layout, Popover } from 'antd';
import { itemsAction, TypeItemAction, State } from 'src/store/items';
import { Store } from 'src/store';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
const { Header, Content, Footer } = Layout;

import Login from '../../components/login';
import BooksTable from 'src/components/books-table';
import MembersTable from 'src/components/members-table';
import ReservationsTable from 'src/components/reservations-table';
import ItemCards from 'src/components/items-cards';
import { TypeMembersState } from 'src/store/members';

interface Props {
  action: TypeItemAction;
  items: State;
  members: TypeMembersState;
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
              <div>
                <img
                  style={{ position: 'absolute', left: '1em', height: '4em' }}
                  src={require('../../resources/images/westminsterLogo.png')}
                  alt="Westminster Library Logo"
                />
              </div>
              {/*Avatar*/}
              <div style={{ position: 'absolute', top: '0.5em', right: '3em' }}>
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
                <Route exact={true} path="/members" component={MembersTable} />
                <Route exact={true} path="/reservations" component={ReservationsTable} />
                <Route exact={true} path="/cards" component={ItemCards} />
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
  items: state.items
});

const mapDisptachToProps = (dispatch: Dispatch) => ({
  action: bindActionCreators({ ...itemsAction }, dispatch)
});

export default withRouter(
  // @ts-ignore
  connect(
    mapStateToProps,
    mapDisptachToProps
  )(Home)
);

// export default Home
