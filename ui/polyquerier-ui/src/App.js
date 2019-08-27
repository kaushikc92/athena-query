import React from 'react';
import { Link } from "react-router-dom";
import './App.css';
import Cookies from 'universal-cookie';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
    };
  }
  authenticateUser() {
    const cookies = new Cookies();
    var columbus_token = cookies.get('pquery_token');
    if (columbus_token !== undefined) {
      this.setState({isLoggedIn: true});
      return(null);
    }
    var url_string = window.location.href;
    var url = new URL(url_string);
    var code = url.searchParams.get("code");
    var redirect_uri = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
    if (code == null) {
      const request = axios({
        method: 'GET',
        url: redirect_uri + "api/client-id/"
      });
      request.then(
        response => {
          var client_id = response.data.client_id;
          window.location.href = "https://authentication.columbusecosystem.com/o/authorize/?response_type=code&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&state=1234xyz";
        },
      );
    } else {
      const request = axios({
        method: 'POST',
        url: redirect_uri + "api/authentication-token/",
        data: {
          code: code,
          redirect_uri: redirect_uri
        }
      });
      request.then(
        response => {
          cookies.set('pquery_token', response.data.access_token);
          this.setState({isLoggedIn: true});
        },
        err => {
        }
      );
    }
  }
    render() {
      if (!this.state.isLoggedIn) {
        this.authenticateUser();
        return(null);
      } else {
        return(
            <div className="pq-container" >
                <h1 className="h3 mb-3 font-weight-normal">Welcome to Athena Query Interface</h1>
                <br />
                <Link className="btn btn-primary btn-lg btn-block" to="/upload/">Upload a Table</Link>
                <br />
                <Link className="btn btn-primary btn-lg btn-block" to="/query/">Query the Database</Link>
            </div>
        );
      }
    }
}

export default App;
