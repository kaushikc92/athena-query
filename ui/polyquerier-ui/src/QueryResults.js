import React from 'react';
import axios from 'axios';
import { backendUrl } from './GlobalVariables';

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
            url: `${backendUrl}query-status/?query_id=${this.props.queryExecutionId}`,
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
        let downloadLink;
        if(this.state.isComplete) {
            downloadLink = <a className="btn btn-primary btn-lg" href={this.state.downloadUrl}> Download Results </a> ;
        } else {
            downloadLink = '';
        }
        //let runtimeStat;
        return(
            <div>
                <h1 className="h5 mb-3 font-weight-normal">Query Status: {this.state.status}</h1>
                <h1 className="h5 mb-3 font-weight-normal">Elapsed Time: {this.state.runtime/1000 }s</h1>
                {downloadLink}
            </div>
        );
    }
}

export default QueryResults;
