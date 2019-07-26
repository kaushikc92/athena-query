import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import UploadFile from './UploadFile';
import Query from './Query';
import App from './App';

class AppRouter extends React.Component {
    render() {
        return(
            <Router>
                <Switch>
                    <Route path="/home/" component={App} />
                    <Route path="/upload/" component={UploadFile} />
                    <Route path="/query/" component={Query} />
                    <Redirect from='*' to='/home/' />
                </Switch>
            </Router>
        );
    }
}

export default AppRouter;
