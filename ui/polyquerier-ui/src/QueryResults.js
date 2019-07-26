import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';

class QueryResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            runtime: 0,
            isComplete: false,
            isSaved: false,
            downloadUrl: '',
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this);
        this.saveToCdrive = this.saveToCdrive.bind(this);
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
    saveToCdrive() {
      const cookies = new Cookies();
      const request = axios({
        method: 'POST',
        url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/save/",
        data: {
          access_token: cookies.get('columbus_token'),
          download_url: this.state.downloadUrl
        }
      });
      request.then(
          response => {
            this.setState({isSaved: true});
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
                <button className="btn btn-primary btn-lg ml-4" onClick={this.saveToCdrive}> Save to CDrive </button> 
              </div> ;
        } else {
            downloadLinks = '';
        }
        let cdriveLink;
        if(this.state.isSaved) {
          cdriveLink = 
            <div>
              <h1 className="h5 mb-3 font-weight-normal">Saved!</h1>
              <a href="https://cdrive.columbusecosystem.com"> View in CDrive</a>
            </div> ;
        } else {
        }
        return(
            <div>
                <h1 className="h5 mb-3 font-weight-normal">Query Status: {this.state.status}</h1>
                <h1 className="h5 mb-3 font-weight-normal">Elapsed Time: {this.state.runtime/1000 }s</h1>
                {downloadLinks}
                {cdriveLink}
            </div>
        );
    }
}

export default QueryResults;
