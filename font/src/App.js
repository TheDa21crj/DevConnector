import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Fragment, useEffect } from "react";
import Nav from "./Components/Nav";
import "./App.css";
import Home from "./Pages/Home";
import Register from "./Components/Auth/Register";
import Login from "./Components/Auth/Login";
import Alert from "./Components/Home/Alert";
import Dashboard from "./Components/Dashboard/Dashboard";
import CreateProfile from "./Components/Profile/CreateProfile";
import PrivateRoute from "./Components/Routing/PrivateRoute";
// Redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Nav />
          <Route exact path="/">
            <Home />
          </Route>{" "}
          <section className="container">
            <Alert />
            <Switch>
              <Route exact path="/register">
                <Register />
              </Route>{" "}
              <Route exact path="/login">
                <Login />
              </Route>{" "}
              <PrivateRoute exact path="/dashboard" component={Dashboard} />{" "}
            </Switch>{" "}
          </section>{" "}
        </Fragment>{" "}
      </Router>{" "}
    </Provider>
  );
}

export default App;
