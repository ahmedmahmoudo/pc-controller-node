const express = require("express");
const cors = require("cors");
const robotjs = require("robotjs");
const dotenv = require("dotenv");
const { spawn } = require("child_process");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const successCallObj = {
  message: "Command Sent!",
};

app.get("/keyboard-action", (req, res) => {
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

app.get("/lock-screen", (req, res) => {
  try {
    robotjs.keyToggle("q", "down", ["control", "command"]);
    res.send(successCallObj);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/restart", (req, res) => {
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

app.get("/shutdown", (req, res) => {
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

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});
