import React, { Component } from 'react';
import { compose } from 'recompose';

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from '../Session';
import { withFirebase } from '../Firebase';

class DetailPage extends Component {
 
    render(){
        console.log("props in detail: ", this.props.location.message)
        return(
            <h2>Detail Page</h2>
        )
    }
    
}

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition),
)(DetailPage);
