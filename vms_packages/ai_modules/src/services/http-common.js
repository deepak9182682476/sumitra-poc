import axios from "axios";
import { SERVER_DEPLOYED_URL } from "../config/deployment";

export default axios.create({
  baseURL: `${SERVER_DEPLOYED_URL}/api`,
  headers: {
    "Content-type": "application/json"
  }
});