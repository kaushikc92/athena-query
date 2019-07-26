import React from 'react';
import axios from 'axios';

class QueryResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            runtime: 0,
            isComplete: false,
            downloadUrl: '',
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this);
    }
    componentDidMount() {
        this.interval = setInterval(this.handleStatusUpdate, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    handleStatusUpdate() {
        if(this.props.queryExecutionId === '') return (null);

        const request = axios({
            method: 'GET',
            url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/query-status/?query_id=" + this.props.queryExecutionId,
        });
        request.then(
            response => {
                if(response.data.state === 'SUCCEEDED') {
                    clearInterval(this.interval);
                    this.setState({
                        status: response.data.state,
                        runtime: response.data.runtime,
                        isComplete: true,
                        downloadUrl: response.data.downloadUrl
                    });
                } else {
                    this.setState({
                        status: response.data.state,
                        runtime: typeof response.data.runtime === "undefined" ? 0 : response.data.runtime
                    });
                }
            },
        );
    }
    render() {
        if(this.props.queryExecutionId === '') return (null);
        let downloadLinks;
        if(this.state.isComplete) {
            downloadLinks = 
              <div>
                <a className="btn btn-primary btn-lg" href={this.state.downloadUrl}> Download to Local </a>
                <a className="btn btn-primary btn-lg ml-4" href""> Save to CDrive </a> 
              </div> ;
        } else {
            downloadLinks = '';
        }
        return(
            <div>
                <h1 className="h5 mb-3 font-weight-normal">Query Status: {this.state.status}</h1>
                <h1 className="h5 mb-3 font-weight-normal">Elapsed Time: {this.state.runtime/1000 }s</h1>
                {downloadLinks}
            </div>
        );
    }
}

export default QueryResults;
