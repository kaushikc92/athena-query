import React from 'react';
import axios from 'axios';
import QueryResults from './QueryResults';
import './Query.css';

class Query extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            queryExecutionId: '',
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleSubmit(event) {
        event.preventDefault();
        const data = new FormData();
        data.append('query', this.state.query);
        this.setState({queryExecutionId: ''});
        const request = axios({
            method: 'POST',
            url:  window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/run-query/",
            data: data
        });
        request.then(
            response => {
                this.setState({queryExecutionId: response.data.queryExecutionId});
            },
        );
    }
    handleChange(event) {
        this.setState({query: event.target.value});
    }
    render() {
        let queryResults;
        if (this.state.queryExecutionId === '') {
            queryResults = ''
        } else {
            queryResults = <QueryResults queryExecutionId={this.state.queryExecutionId} /> ;
        }
        return(
            <div className="query-container">
                <form className="form-query" onSubmit={this.handleSubmit} >
                    <h1 className="h3 mb-3 font-weight-normal">Query the Database</h1>
                    <textarea rows="10" className="form-control" placeholder="Enter SQL Query" 
                    value={this.state.query} onChange={this.handleChange} required autoFocus > 
                    </textarea>
                    <br />
                    <button className="btn btn-lg btn-primary btn-block" type="submit">
                        Run Query
                    </button>
                </form>
                <br />
                {queryResults}
            </div>
        );
    }
}

export default Query;
