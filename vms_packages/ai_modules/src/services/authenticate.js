import { crypto_config } from '../config/deployment';
import { AES } from 'crypto-js'
import http from "./http-common";
import { getLocalStorage } from "../utilities/common-util";
const userAccount = JSON.parse(getLocalStorage("anpr_user"));

const getEncryptedValue = (value) => {
    const cipherText = AES.encrypt(value, crypto_config.password);
    // console.log('encrypted cipher', cipherText.toString(), value)
    return  cipherText.toString();
}

const validateUser = (payload) => {
    return http.post(`/auth/validate-user`, {...payload,userAccount,action_type: "Create",module_type: "Login", sub_module_name:" "});
}


const AuthService = {
    getEncryptedValue,
    validateUser
}


export default AuthService;