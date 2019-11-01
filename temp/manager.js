var tr = require('tor-request');

const RECYCLE_TIME = 1000 * 60
const ENCRYPTION_STRING = 'datable'

tr.TorControlPort.password = ENCRYPTION_STRING

function showCurrentIP() {
  return new Promise((resolve, reject) => {
    tr.request('https://api.ipify.org', function (err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log(body)
        resolve()
        // console.log("Your public (through Tor) IP is: " + body);
      }
      reject()
    })
  })
}
function newSession() {
  return new Promise((resolve, reject) => {
    tr.newTorSession(()=>{resolve()})
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  while(1) {
    await sleep(RECYCLE_TIME)
    try {
      await newSession()
      showCurrentIP()
    }
    catch (e) {
      console.log(e)
    }
  }
}

main()
