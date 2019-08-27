import React from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'universal-cookie';
import './UploadFile.css';

class UploadFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToQueryPage: false,
            isLoading: false,
            tableName: '',
            dataPath: '',
            schemaPath: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDataPathChange = this.handleDataPathChange.bind(this);
        this.handleSchemaPathChange = this.handleSchemaPathChange.bind(this);
    }
    handleSubmit(event) {
        event.preventDefault();
        
        this.setState({
            isLoading: true,
        });

        var cdriveApiUrl = "https://api.cdrive.columbusecosystem.com/";
        const data = new FormData();
        data.append('table_name', this.state.tableName);

        const cookies = new Cookies();
        var auth_header = 'Bearer ' + cookies.get('pquery_token');

        const request = axios({
          method: 'GET',
          url: `${cdriveApiUrl}download/?path=${this.state.dataPath}`,
          headers: {'Authorization': auth_header}
        });

        request.then(
          response => {
            data.append('data_url', response.data.download_url);
            axios({
              method: 'GET',
              url: `${cdriveApiUrl}download/?path=${this.state.schemaPath}`,
              headers: {'Authorization': auth_header}
            }).then(
              resp2 => {
                data.append('schema_url', resp2.data.download_url);
                const req3 = axios({
                    method: 'POST',
                    url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/upload/",
                    data: data
                });
                req3.then(
                    resp3 => {
                        this.setState({
                            redirectToQueryPage: true,
                        });
                    },
                );
              },
            );
          },
        );
    }
    handleChange(event) {
        this.setState({tableName: event.target.value});
    }
    handleDataPathChange(event) {
      this.setState({dataPath: event.target.value});
    }
    handleSchemaPathChange(event) {
      this.setState({schemaPath: event.target.value});
    }
    render() {
        if (this.state.redirectToQueryPage) {
            return <Redirect to='/query'/>;
        }
        let createButton;
        if(this.state.isLoading) {
            createButton = <button className="btn btn-lg btn-primary btn-block" type="submit" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></button>;
        } else {
            createButton = <button className="btn btn-lg btn-primary btn-block" type="submit">Create Table</button>;
        }
        return(
            <div className="upload-container">
                <form className="form-upload" onSubmit={this.handleSubmit}>
                    <h1 className="h3 mb-3 font-weight-normal">Upload a Table</h1>
                    <input type="text" className="form-control" placeholder="Enter Table Name" 
                        value={this.state.tableName} onChange={this.handleChange} required autoFocus>
                    </input>
                    <br />
                    <input type="text" className="form-control" placeholder="Enter CDrive Path to CSV File" 
                        value={this.state.dataPath} onChange={this.handleDataPathChange} required>
                    </input>
                    <br />
                    <input type="text" className="form-control" placeholder="Enter CDrive Path to Schema File" 
                        value={this.state.schemaPath} onChange={this.handleSchemaPathChange} required>
                    </input>
                    <br />
                    {createButton}
                </form>
            </div>
        );
    }
}

export default UploadFile;
