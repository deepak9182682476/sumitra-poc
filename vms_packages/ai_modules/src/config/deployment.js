export const server_info = {
  //SERVER_IP: "10.66.167.32",
  SERVER_IP: "localhost",
  SERVER_PORT: "3016",
  //VMS_SERVER_HOST: "172.20.1.141",
  VMS_SERVER_HOST: "192.168.2.15",
  // RECORDED_IMAGES: "10.66.40.86",
  VMS_SERVER_PORT: "5004",
  EVENT_IMAGE_URL: "192.168.2.15",
  //EVENT_IMAGE_URL: "10.66.167.33",
  EVENT_IMAGE_URL_PORT: "3028",
  SOCKET_URL: "ws://10.66.167.32:5889",
  NOTIFICATION_URL: "http://136.233.45.154:6700",
  //need to check availiability
  SERVER_MODEL_DEPLOYED_URL: "http://10.66.40.93:6024"
};

export const crypto_config = {
  //  algorithm: 'aes-192-cbc',
   password: 'aiosAnpr2023'
}

export const EVENT_NOTIFICATION_URL = `${server_info.NOTIFICATION_URL}`;

export const SERVER_DEPLOYED_URL = `http://${server_info.SERVER_IP}:${server_info.SERVER_PORT}`;

export const VMS_SERVER_URL = `http://${server_info.VMS_SERVER_HOST}:${server_info.VMS_SERVER_PORT}/stream`;

export const LIVE_STREAM = `http://${server_info.VMS_SERVER_HOST}:${server_info.VMS_SERVER_PORT}/b64stream`;

export const VMS_URL = `http://${server_info.VMS_SERVER_HOST}:${server_info.VMS_SERVER_PORT}`;

export const GET_EVENT_IMAGE_URL = `http://${server_info.EVENT_IMAGE_URL}:${server_info.EVENT_IMAGE_URL_PORT}`;

//used for frames in dashboard, need to check

export const SERVER_MODEL_DEPLOYED_URL = `${server_info.SERVER_MODEL_DEPLOYED_URL}`;
