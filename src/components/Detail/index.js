import React, { Component } from "react";
import { compose } from "recompose";

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification
} from "../Session";
import { withFirebase } from "../Firebase";


class DetailPage extends Component {
  state = {
    message: null,
    username: "",
    addedComment: "",
    comments: []
  };
  componentDidMount() {
    if (this.props.location.message) {
      this.setState({ message: this.props.location.message }, () =>
        this.getUsername(this.state.message.userId)
      );
    } else {
      this.props.firebase
        .message(this.props.match.params.id)
        .once("value", snapshot => {
          const messagesObject = snapshot.val();
          this.setState({ message: messagesObject }, () =>
            this.getUsername(this.state.message.userId)
          );
        });
    }
  }

  getUsername = id => {
    this.props.firebase.userName(id).once("value", snapshot => {
      const username = snapshot.val();
      this.setState({ username });
      console.log("USERNAME: ", username);
    });
  };

  onChangeComment = event => {
    this.setState({ addedComment: event.target.value });
  };
  onCreateComment =(event, userId)  => {
     event.preventDefault();
    console.log("in create: ", this.state.addedComment)
    this.props.firebase.comments(this.props.match.params.id).push({
      body: this.state.addedComment,
      userId: userId,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
    });

    this.setState({ addedComment: '' });

   
  }
  onRemoveComment = id => {
    console.log(id);
    this.props.firebase.comment(this.props.match.params.id,id).remove();
  }
  render() {
    //  console.log("props in detail: ", this.props.location.message)
    const { message, username, addedComment } = this.state;
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <>
            <h2>Detail Page</h2>
            {this.state.message && (
              <div>
                <p>Zadanie: {message.text}</p>
                <p> Utworzone przez {username}</p>
                <p>
                  
                  Utworzone dnia: {new Date(message.createdAt).toDateString()}
                </p>
                {message.comments ? (
                  <ul>
                    {Object.keys(message.comments).map(comment => (
                      <li key={comment}>
                        {message.comments[comment].body}{" "}
                        {new Date(
                          message.comments[comment].createdAt
                        ).toDateString()}{" "}{(authUser.uid === message.userId || authUser.roles.includes("ADMIN")) && 
                        <span><button onClick={()=>this.onRemoveComment(comment)}>Delete</button></span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nie ma jeszcze komentarzy</p>
                )}
              </div>
            )}

            <form onSubmit={event => this.onCreateComment(event, authUser.uid)}>
              <input
                type="text"
                value={addedComment}
                onChange={this.onChangeComment}
              />
              <button type="submit">Dodaj</button>
            </form>
          </>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition)
)(DetailPage);
