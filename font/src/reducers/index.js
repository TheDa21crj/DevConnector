import { combineReducers } from "redux";
import alert from "./alert";
import auth from "./auth";
import { logout } from "./../actions/auth";

export default combineReducers({
    alert,
    auth,
});