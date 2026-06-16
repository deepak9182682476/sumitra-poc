import { server_info } from "../config/deployment";

export const socket_client = new WebSocket(`${server_info.SOCKET_URL}`);