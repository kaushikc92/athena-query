import React from 'react';
import { Link } from "react-router-dom";
import './App.css';

class App extends React.Component {
    render() {
        return(
            <div className="pq-container" >
                <h1 className="h3 mb-3 font-weight-normal">Welcome to Polyquerier</h1>
                <br />
                <Link className="btn btn-primary btn-lg btn-block" to="/upload/">Upload a Table</Link>
                <br />
                <Link className="btn btn-primary btn-lg btn-block" to="/query/">Query the Database</Link>
            </div>
        );
    }
}

export default App;
