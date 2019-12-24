import React, { Component } from 'react';
import { compose } from 'recompose';
import {  Link } from 'react-router-dom';

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';

class HomePage extends Component {
  state = {
    text: '',
    users: [],
    loading: false,
    limit: 15,
    messages: []
  }

  componentDidMount() {
    this.onListenForUsers();
    this.onListenMessages();
  }

  onListenMessages = () => {
    this.setState({ loading: true })
    this.props.firebase
    .messages()
    .orderByKey()
      .limitToLast(this.state.limit)
      .on('value', snapshot => {
        const messagesObject = snapshot.val();

        if (messagesObject) {
          const messagesList = Object.keys(messagesObject).map(key => ({
            ...messagesObject[key],
            uid: key,
          })).reverse();
          console.log("messagesList:  ", messagesList);
          this.setState({
            messages: messagesList,
            loading: false,
          });
        } else {
          this.setState({ messages: null, loading: false });
        }
      });
  }

  onListenForUsers = () => {
    this.setState({ loading: true });

    this.props.firebase
      .users()
      .orderByKey()
      .limitToLast(this.state.limit)
      .on('value', snapshot => {
        const usersObject = snapshot.val();

        if (usersObject) {
          const usersList = Object.keys(usersObject).map(key => ({
            ...usersObject[key],
            uid: key,
          }));
          console.log("usersList:  ", usersList);
          this.setState({
            users: usersList,
            loading: false,
          });
        } else {
          this.setState({ users: null, loading: false });
        }
      });
  };
  componentWillUnmount() {
    this.props.firebase.users().off();
  }
  handleDetail = (id) => {
    this.props.history.push(`/detail/${id}`);
    console.log("id in handle detail: ", id);
  }
  onChangeText = event => {
    this.setState({ text: event.target.value });
  }

  onCreateMessage =  (event, authUser) => {
    const newKey = this.props.firebase.messages().push({
      text: this.state.text,
      userId: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
    });
   
    
    this.setState({ text: '' });

    event.preventDefault();
    console.log("USER: ", authUser);
    console.log("New Key: ", newKey.key);
  }

  render() {
    const { users, messages, text } = this.state
   // console.log(this.props);
    return (
    
      <AuthUserContext.Consumer>
        
          {authUser => (
          <>
            <div>Home Page Jesteś zalogowany jako {authUser.email}</div>
            <ul>
              {users.map(user => 
              <li key={user.uid}>
                <button type="link" onClick={() => this.handleDetail(user.uid)}>{user.email}</button>
              </li> )}
            </ul>
            <ul>
              {messages.map(message => 
              <li key={message.uid}>
                <Link to={{
                  pathname:`/detail/${message.uid}`,
                  message
                  
                  }}>{message.uid}</Link>
                
                {message.comments && <ul>
                  {Object.keys(message.comments).map(comment => <li key={comment}> 
                    {message.comments[comment].body} {new Date(message.comments[comment].createdAt).toDateString()}
                    </li>)}
                    </ul>
                }
                  </li>
                )}
            </ul>
            <hr/>
            <form
              onSubmit={event =>
                this.onCreateMessage(event, authUser)
              }
            >
              <input
                type="text"
                value={text}
                onChange={this.onChangeText}
              />
              <button type="submit">Send</button>
            </form>
          </>
          
          
          )}
      
      </AuthUserContext.Consumer>
      
     

      
    )
    
    
  }
}

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(HomePage);