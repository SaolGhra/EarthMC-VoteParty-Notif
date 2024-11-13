function notifyUser(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: "EarthMC Vote Party",
    message: message,
    priority: 2,
  });
}

async function sendNtfyNotification(message) {
  try {
    const response = await fetch("https://ntfy.saolghra.co.uk/earthmc", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: message,
    });

    if (!response.ok) {
      throw new Error(`NTFY HTTP error! status: ${response.status}`);
    }
    console.log(`ntfy notification sent: ${message}`);
  } catch (error) {
    console.error("Error sending ntfy notification:", error);
  }
}

function scheduleNextCheck(minutes) {
  chrome.alarms.create("checkVoteParty", { delayInMinutes: minutes });
}

async function checkVoteParty() {
  try {
    const response = await fetch("https://api.earthmc.net/v3/aurora/", {
      headers: {
        Accept: "application/json",
      },
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.voteParty?.numRemaining) {
      throw new Error("Invalid data format received from API");
    }

    const numRemaining = data.voteParty.numRemaining;
    console.log(`Votes remaining: ${numRemaining}`);

    const thresholds = [
      {
        limit: 10,
        message: "Vote party is imminent!",
        delay: 1,
        isMilestone: true,
      },
      {
        limit: 20,
        message: "Vote party is very close!",
        delay: 1,
        isMilestone: true,
      },
      {
        limit: 30,
        message: "Vote party is approaching!",
        delay: 1,
        isMilestone: true,
      },
      {
        limit: 40,
        message: "Vote party is near!",
        delay: 1,
        isMilestone: true,
      },
      {
        limit: 50,
        message: "Vote party is near!",
        delay: 1,
        isMilestone: true,
      },
      {
        limit: 100,
        message: "Vote party is getting closer!",
        delay: 5,
        isMilestone: true,
      },
      {
        limit: 250,
        message: "Vote party milestone reached!",
        delay: 30,
        isMilestone: true,
      },
      {
        limit: 500,
        message: "Vote party milestone reached!",
        delay: 30,
        isMilestone: true,
      },
      {
        limit: 1000,
        message: "Vote party milestone reached!",
        delay: 30,
        isMilestone: true,
      },
    ];

    const threshold = thresholds.find((t) => numRemaining <= t.limit);
    const currentMinute = new Date().getMinutes();

    if (threshold) {
      const message = `${threshold.message} Only ${numRemaining} votes remaining!`;
      notifyUser(message);
      sendNtfyNotification(message);
      scheduleNextCheck(threshold.delay);
    } else {
      if (numRemaining <= 100) {
        scheduleNextCheck(5);
      } else {
        const minutesToNextHour = 60 - currentMinute;
        scheduleNextCheck(minutesToNextHour);
      }

      if (currentMinute === 0) {
        const message = `Vote Party Update: ${numRemaining} votes remaining`;
        notifyUser(message);
        sendNtfyNotification(message);
      }
    }
  } catch (error) {
    console.error(
      `Error fetching vote party data at ${new Date().toLocaleTimeString()}:`,
      error.message || error
    );

    const errorMessage =
      "There was an error retrieving vote party data. Retrying in 30 minutes.";
    notifyUser(errorMessage);
    sendNtfyNotification(errorMessage);
    scheduleNextCheck(30);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkVoteParty") {
    checkVoteParty();
  }
});

const minutesToNextHour = 60 - new Date().getMinutes();
scheduleNextCheck(minutesToNextHour);

checkVoteParty();
