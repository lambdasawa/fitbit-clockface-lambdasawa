import { today } from "user-activity";
import { peerSocket } from "messaging";
import { vibration } from "haptics";
import { battery } from "power";
import { display } from "display";
import document from "document";
import clock from "clock";
import { HeartRateSensor } from "heart-rate";

function updateClockLabel(date) {
  const d = new Date(date.getTime() + 1000 * 60 * 60 * 9);

  const day = {
    month: date.getMonth() + 1,
    date: date.getDate(),
    dayOfWeek: ["日", "月", "火", "水", "木", "金", "土"][date.getDay()],
  };

  document.getElementById("timeLabel").text = d.toTimeString().slice(0, -4); // trim .000
  document.getElementById(
    "dayLabel"
  ).text = `${day.month}/${day.date} (${day.dayOfWeek})`;
}

function updateBatteryLabel(hrm) {
  const text = `Battery:${Math.floor(battery.chargeLevel)}%`;

  document.getElementById("batteryLabel").text = text;
}

function updateHeartRateLabel(hrm) {
  const text = `HeartRate:${hrm.heartRate}`;

  document.getElementById("heartRateLabel").text = text;
}

function updateStepsLabel() {
  const text = `Steps:${today.adjusted.steps}`;

  document.getElementById("stepsLabel").text = text;
}

function updateCaloriesLabel() {
  const text = `Calories:${today.adjusted.calories}`;

  document.getElementById("caloriesLabel").text = text;
}

function updateTweetLabel(data) {
  const maxLength = 60;
  const tail = "...";
  const baseData = data.replace("\n", " ");
  const text =
    baseData.length > maxLength
      ? baseData.slice(0, maxLength - tail.length) + tail
      : baseData;

  document.getElementById("tweetLabel").text = text;
}

function init() {
  const hrm = new HeartRateSensor();

  battery.onchange = () => {
    updateBatteryLabel();
  };

  display.addEventListener("change", () => {
    display.on ? hrm.start() : hrm.stop();
  });

  clock.granularity = "seconds";
  clock.addEventListener("tick", (evt) => {
    updateClockLabel(evt.date);
    updateStepsLabel();
    updateCaloriesLabel();
  });

  hrm.addEventListener("reading", () => {
    updateHeartRateLabel(hrm);
  });
  hrm.start();

  updateBatteryLabel();
  updateClockLabel(new Date());
  updateHeartRateLabel(hrm);

  peerSocket.addEventListener("open", (evt) => {
    console.log("Ready to send or receive messages");
  });
  peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
  });
  peerSocket.addEventListener("message", (evt) => {
    updateTweetLabel(evt.data);
  });
}

init();
