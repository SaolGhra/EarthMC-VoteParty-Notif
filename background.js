// Function to send a notification via Chrome notifications API
function notifyUser(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: "EarthMC Vote Party",
    message: message,
    priority: 2,
  });
}

// Function to send an ntfy notification
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

// Function to schedule the next vote check
function scheduleNextCheck(minutes) {
  chrome.alarms.create("checkVoteParty", { delayInMinutes: minutes });
}

// Function to check the current number of votes remaining
async function checkVoteParty() {
  try {
    const response = await fetch("https://api.earthmc.net/v3/aurora/", {
      headers: {
        Accept: "application/json",
      },
      credentials: "omit", // Explicitly opt out of sending credentials
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response data structure
    if (!data?.voteParty?.numRemaining) {
      throw new Error("Invalid data format received from API");
    }

    const numRemaining = data.voteParty.numRemaining;
    console.log(`Votes remaining: ${numRemaining}`);

    // Define notification thresholds and their configurations
    const thresholds = [
      { limit: 10, message: "Vote party is imminent!", delay: 1 },
      { limit: 20, message: "Vote party is very close!", delay: 1 },
      { limit: 30, message: "Vote party is approaching!", delay: 1 },
      { limit: 40, message: "Vote party is near!", delay: 1 },
      { limit: 50, message: "Vote party is near!", delay: 1 },
      { limit: 100, message: "Vote party is getting closer!", delay: 5 },
      { limit: 250, message: "Vote party milestone reached!", delay: 10 },
      { limit: 500, message: "Halfway to vote party!", delay: 30 },
      { limit: 4500, message: "Vote party milestone reached!", delay: 30 },
    ];

    // Find the first threshold that applies
    const threshold = thresholds.find((t) => numRemaining <= t.limit);

    if (threshold) {
      const message = `${threshold.message} Only ${numRemaining} votes remaining!`;
      notifyUser(message);
      sendNtfyNotification(message);
      scheduleNextCheck(threshold.delay);
    } else {
      scheduleNextCheck(30);
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

// Set up the alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkVoteParty") {
    checkVoteParty();
  }
});

// Initial check
checkVoteParty();
