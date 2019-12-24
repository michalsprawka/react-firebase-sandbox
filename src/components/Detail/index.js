import React, { Component } from 'react';
import { compose } from 'recompose';

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';

class DetailPage extends Component {

    state = { 
      message: null,
      username: ""
    }
    componentDidMount() {
      if(this.props.location.message){
        this.setState({ message: this.props.location.message }, ()=>this.getUsername())
        
      }
      else {
        this.props.firebase.message(this.props.match.params.id)
        .once('value', snapshot => {
          const messagesObject = snapshot.val();
          this.setState({ message: messagesObject }, ()=>this.getUsername()
            );
        }
        )
      }

   
    }  

    getUsername = () => {
      this.props.firebase.userName(this.state.message.userId)
      .once('value', snapshot => {
        const username = snapshot.val();
        this.setState({username});
        console.log("USERNAME: ",username)
      }
      )
    }
    render(){
        console.log("props in detail: ", this.props.location.message)
        const { message, username } = this.state
        return(
            <>
            <h2>Detail Page</h2>
            { this.state.message && <div>
              <p>Zadanie: {message.text}</p>
              <p> Utworzone przez {username}</p>
              <p> Utworzone dnia: {new Date(message.createdAt).toDateString()}</p>
              { message.comments ?
                <ul>
                   {Object.keys(message.comments).map(comment => <li key={comment}> 
                  {message.comments[comment].body} {new Date(message.comments[comment].createdAt).toDateString()}
                  </li>)}
                </ul> :
                <p>Nie ma jeszcze komentarzy</p>
              }
              </div>}
            </>
        )
    }
    
}

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(DetailPage);
