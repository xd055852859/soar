import io from "socket.io-client";
export default {
  install: (app, { connection, options }) => {
    var socket = io(connection, options);
    app.provide("socket", socket);
  },
};
