import React, { Component } from 'react';
import { compose } from 'recompose';
import {  Link } from 'react-router-dom';

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';

import * as ROLES from '../../constants/roles';

class HomePage extends Component {
  state = {
    text: '',
    users: [],
    loading: false,
    limit: 15,
    messages: [],
    editedMessage: "",
    editedMessageID: ""
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
    console.log("TEST");
    this.setState({ loading: true });

    this.props.firebase
      .users()
      .orderByKey()
      .limitToLast(this.state.limit)
      .on('value', snapshot => {
        const usersObject = snapshot.val();
        console.log("users obj", snapshot.val());

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
    this.props.firebase.messages().off();
  }
  handleDetail = (id) => {
   // this.props.history.push(`/detail/${id}`);
    console.log("id in handle detail: ", id);
  }
  onChangeText = event => {
    this.setState({ text: event.target.value });
  }

  onChangeEditedMessage = event => {
    this.setState({ editedMessage: event.target.value });
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

  onCreateEditMessage =(event)=> {
    event.preventDefault();
    const editedMessage = this.state.messages.find(element => element.uid===this.state.editedMessageID)
    console.log("edited message: ", editedMessage);
    this.props.firebase.message(this.state.editedMessageID).set({
      ...editedMessage,
     text: this.state.editedMessage,
      editedAt: this.props.firebase.serverValue.TIMESTAMP,
    });

  }

  onRemoveMessage = id => {
    this.props.firebase.message(id).remove();
  }

  onEditMessage =(id, text) => {
    this.setState({ editedMessage: text, editedMessageID: id})
  }

  onTest = (uid) => {
    console.log("UID", uid)
    this.props.firebase.user(uid).update( {isAdmin : true} );
  }

  render() {
    const { users, messages, text, editedMessage } = this.state
   // console.log(this.props);
    return (
    
      <AuthUserContext.Consumer>
        
          {authUser => (
          <>
            <div>Home Page Jesteś zalogowany jako {authUser.email}</div>
            <ul>
              {users.map(user => 
              <li key={user.uid}>
                <button type="link" onClick={() => this.handleDetail(user.uid)}>{user.username}</button>
              </li> )}
            </ul>
            <ul>
              {messages.map((message,index) => 
              <li key={message.uid}>
                <Link to={{
                  pathname:`/detail/${message.uid}`,
                  message
                  
                  }}>{message.text}</Link>
                  {(authUser.uid === message.userId || authUser.isAdmin) &&
                  <span><button onClick={()=>this.onEditMessage(message.uid, message.text)}>Edit</button>
                   <button onClick={()=>this.onRemoveMessage(message.uid)}>Delete</button></span>}
                
                {message.comments && <ul>
                  {Object.keys(message.comments).map(comment => <li key={comment}> 
                    {message.comments[comment].body} {new Date(message.comments[comment].createdAt).toDateString()}
                    </li>)}
                    </ul>
                }
                  </li>
                )}
            </ul>
              {editedMessage && 
              <>
              <hr/>
               <form
              onSubmit={event =>
                this.onCreateEditMessage(event)
              }
            >
              <input
                type="text"
                value={editedMessage}
                onChange={this.onChangeEditedMessage}
              />
              <button type="submit">Edit</button>
            </form>
              </>
              }
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
            <Link to={{
                  pathname:`/image`,
                 
                  
                  }}>IMAGE</Link>

            {/* <button onClick={() => this.onTest("bpbZeqKaztMdLej75sgcZpOl7bF2")}>TEST</button> */}
          </>
          
          
          )}
      
      </AuthUserContext.Consumer>
      
     

      
    )
    
    
  }
}

const condition = authUser => !!authUser;


// const condition = authUser =>
//   authUser && authUser.roles.includes(ROLES.ADMIN);

  // const condition = authUser =>
  // authUser && authUser.isAdmin;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(HomePage);