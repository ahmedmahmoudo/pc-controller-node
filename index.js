const express = require("express");
const cors = require("cors");
const robotjs = require("robotjs");
const dotenv = require("dotenv");
var os = require("os");
const { spawn } = require("child_process");
const { app, BrowserWindow, ipcMain } = require("electron");

const port = 3004;

function getAddresses() {
  const addresses = [];
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if ("IPv4" !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      console.log(`App is running at http://${iface.address}:${port}`);
      addresses.push(`http://${iface.address}:${port}`);
    });
  });
  return addresses;
}

dotenv.config();

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

const successCallObj = {
  message: "Command Sent!",
};

expressApp.get("/ping", (req, res) => {
  res.send({ message: "Pinging Completed" });
});

expressApp.post("/keyboard-action", (req, res) => {
  const { action } = req.body;
  if (!action) {
    return res.status(422).send({ message: "Action is required" });
  }
  try {
    robotjs.keyTap(action);
    res.send(successCallObj);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

expressApp.post("/lock-screen", (req, res) => {
  try {
    robotjs.keyToggle("q", "down", ["control", "command"]);
    res.send(successCallObj);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

expressApp.post("/restart", (req, res) => {
  if (process.platform === "darwin") {
    return res.status(500).send({ message: "Unable to excute that on a mac" });
  }
  const shutdown = spawn("shutdown", ["/r", "/t", "0"]);
  shutdown.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  shutdown.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  shutdown.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
  res.send(successCallObj);
});

expressApp.post("/shutdown", (req, res) => {
  if (process.platform === "darwin") {
    return res.status(500).send({ message: "Unable to excute that on a mac" });
  }
  const shutdown = spawn("shutdown", ["/s", "/t", "0"]);
  shutdown.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  shutdown.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  shutdown.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
  res.send(successCallObj);
});

expressApp.listen(port, getAddresses);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "PC Controller (Server)",
  });
  win.loadFile("public/index.html");

  ipcMain.on("getIPs", (event, arg) => {
    const addresses = getAddresses();
    event.reply("listIPs", addresses);
  });
}

app.on("ready", createWindow);
