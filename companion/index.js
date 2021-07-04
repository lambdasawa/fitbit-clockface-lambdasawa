import { me } from "companion";

import { peerSocket } from "messaging";

function sendLatestTweet() {
  return fetch("https://fitbit-clockface.dev.lambdasour.com")
    .then((res) => res.json())
    .then(({ message }) => {
      if (peerSocket.readyState === peerSocket.OPEN) {
        peerSocket.send(message);
      }
    });
}

peerSocket.addEventListener("open", (evt) => {
  console.log("Ready to send or receive messages");
  if (peerSocket.readyState === peerSocket.OPEN) {
    sendLatestTweet();
  }
});
peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});
peerSocket.addEventListener("message", (evt) => {
  console.log(JSON.stringify(evt.data));
});

me.wakeInterval = 1000 * 60 * 5;
me.addEventListener("wakeinterval", function () {
  sendLatestTweet();
});

if (me.launchReasons.wokenUp) {
  sendLatestTweet();
}
