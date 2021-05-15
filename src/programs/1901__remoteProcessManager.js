/*
Call like:
PROGRAM_ID=9001 node src/programs/1901_remoteProcessManager.js

Assuming the os hostname is "haippi3.local", then you should be able to make other claims like:
wish "... code as a shell script ..." would be running on "haippi3.local"

Expect the shell script when starting to stop any actively running programs that it created last time
*/
const spawn = require('child_process').spawn;
const process = require('process');
const path = require('path');
const pkill = require('pkill');
const os = require('os');
const { room, run, MY_ID_STR, checkServerConnection } = require('../helpers/helper')(__filename);

const MY_COMPUTER_NAME = process.env.PROG_SPACE_MY_COMPUTER_NAME || os.hostname();
const MY_SCRIPT_NAME = 'my_remote_script.sh'

setInterval(async () => {
  try {
    const serverReconnected = await checkServerConnection();
    room.retractMine(`remoteProcessManager "${MY_COMPUTER_NAME}" update $`)
    room.assert(`remoteProcessManager "${MY_COMPUTER_NAME}" update ${(new Date()).toISOString()}`)
    if (serverReconnected) {
      console.log("server reconnected, reinitializing subscriptions")
      initSubscriptions();
    }
  } catch (err) {
    console.log("Connection to server died")
  }
}, 30*1000);

function initSubscriptions() {
  room.on(
    `wish $code would be running on "${MY_COMPUTER_NAME}"`,
    results => {
      console.log(results);
      results.forEach(({code}) => {
        pkill.full(MY_SCRIPT_NAME, function (err, validPid) {
          if (err) return console.error("ERROR PKILLING", MY_SCRIPT_NAME);
          const sourceCode = code.replace(new RegExp(String.fromCharCode(9787), 'g'), String.fromCharCode(34))
          console.log(`writing code to ${MY_SCRIPT_NAME}`);
          console.log(sourceCode);
          fs.writeFile(MY_SCRIPT_NAME, sourceCode, err => {
            if (err) return console.log(err);
            console.log(`running ${MY_SCRIPT_NAME}`);
            spawn("sh", [MY_SCRIPT_NAME]);
          });
        });
      });
    }
  )
}

initSubscriptions();
run()
