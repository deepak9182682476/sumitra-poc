import React, { useEffect, useState } from "react";
import AuthService from "../../services/authenticate.js";
import { getLocalStorage, removeLocalStorageItem, setLocalStorage } from "../../utilities/common-util";

const AuthContext = React.createContext();

const AuthProvider = (props) => {
  const [auth, setAuth] = useState({
    username: "",
    password: "",
    grant_type: "",
    isAuth: false,
    is_error: false,
    is_error_msg: ""
  });

  useEffect(() => {
    setCurrentUser();
  }, []);

  const login = (params) => {
    console.log('params-----', params);
    // if (params) {
    //   const authObj = {
    //     isAuth: true,
    //     username: params.username,
    //     password: params.password,
    //     grant_type: params.grant_type,
    //   };
    //   setAuth(authObj);
    //   setLocalStorage("login", JSON.stringify(authObj));
    // }
    const paramPwd = AuthService.getEncryptedValue(params.password);
    if (params) {
      const authObj = {
        isAuth: true,
        username: params.username,
        password: paramPwd,
        grant_type: params.grant_type
      };
      AuthService.validateUser(authObj).then((res) => {
        // console.log('res---------', res);
        const {data} = res.data;
        authObj.isAuth = true;
        authObj.is_error = false;
        authObj.is_error_msg = "";
        authObj.userInfo = data;
        setLocalStorage("anpr_user", JSON.stringify(authObj));
        setAuth(authObj);
      }).catch((err) => {
        const { message } = err.response && err.response.data ? err.response.data: err;
        authObj.isAuth = false;
        authObj.is_error = true;
        authObj.is_error_msg = message;
        // console.log('errrr------', message);
        setAuth(authObj);
      })
    }
  };

  const logout = () => {
    setAuth({
      username: "", 
      password: "", 
      grant_type: "", 
      isAuth: false, 
      is_error: false,
      is_error_msg: ""
    });
    removeLocalStorageItem("anpr_user");
  };

  const setCurrentUser = () => {
    const login_details = getLocalStorage("anpr_user");
    if (login_details) {
      const parsed_obj = JSON.parse(login_details);
      if (parsed_obj.isAuth && auth && !auth.isAuth) {
        setAuth(parsed_obj);
      }
    }
  }

  const showErrorAlert = () => {
    setAuth({
      isAuth: false,
      is_error: false,
      is_error_msg: ""
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuth: auth.isAuth,
        login: login,
        logout: logout,
        errMsg: auth.is_error_msg,
        isErr: auth.is_error,
        errorAlert: showErrorAlert,
        setCurrentUser: setCurrentUser
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

const AuthConsumer = AuthContext.Consumer;

export { AuthProvider, AuthConsumer };
