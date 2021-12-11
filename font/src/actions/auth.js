import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
} from "./types";
import { setAlert } from "./alert";

//load user
export const loadUser = () => async(dispatch) => {
    if (localStorage.token) {
        try {
            setAuthToken(localStorage.token);
            const res = await axios.get("/api/auth");
            dispatch({
                type: USER_LOADED,
                payload: res.data,
            });
        } catch (error) {
            dispatch({
                type: AUTH_ERROR,
            });
        }
    } else {
        dispatch({
            type: AUTH_ERROR,
        });
    }
};

// register the user
export const register =
    ({ name, email, password }) =>
    async(dispatch) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ name, email, password });
        try {
            const res = await axios.post("/api/user", body, config);
            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data,
            });
        } catch (err) {
            const errors = err.response.data.errors;
            if (errors) {
                errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
            }
            dispatch({
                type: REGISTER_FAIL,
            });
        }
    };