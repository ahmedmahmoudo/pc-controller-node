const ipc = require("electron").ipcRenderer;

const serverIPs = document.getElementById("serverIPs");

ipc.send("getIPs");

ipc.on("listIPs", (event, args) => {
  console.log(event, args);
  serverIPs.innerHTML = args.map((ip) => ip);
});
