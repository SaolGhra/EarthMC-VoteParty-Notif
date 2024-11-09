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
    await fetch("https://ntfy.saolghra.co.uk/earthmc", {
      mode: "no-cors",
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: message, // Sending the message as plain text
    });
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
      mode: "no-cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data ||
      !data.voteParty ||
      typeof data.voteParty.numRemaining !== "number"
    ) {
      throw new Error("Invalid data format received from API");
    }

    const numRemaining = data.voteParty.numRemaining;

    console.log(`Votes remaining: ${numRemaining}`);

    if (numRemaining <= 10) {
      notifyUser("Vote party is imminent! Only 10 votes remaining!");
      sendNtfyNotification("Vote party is imminent! Only 10 votes remaining!");
      scheduleNextCheck(1);
    } else if (numRemaining <= 20) {
      notifyUser("Vote party is very close! Only 20 votes remaining!");
      sendNtfyNotification(
        "Vote party is very close! Only 20 votes remaining!"
      );
      scheduleNextCheck(1);
    } else if (numRemaining <= 30) {
      notifyUser("Vote party is approaching! Only 30 votes remaining!");
      sendNtfyNotification(
        "Vote party is approaching! Only 30 votes remaining!"
      );
      scheduleNextCheck(1);
    } else if (numRemaining <= 40) {
      notifyUser("Vote party is near! Only 40 votes remaining!");
      sendNtfyNotification("Vote party is near! Only 40 votes remaining!");
      scheduleNextCheck(1);
    } else if (numRemaining <= 50) {
      notifyUser("Vote party is near! Only 50 votes remaining!");
      sendNtfyNotification("Vote party is near! Only 50 votes remaining!");
      scheduleNextCheck(1);
    } else if (numRemaining <= 100) {
      notifyUser("Vote party is getting closer! Only 100 votes remaining!");
      sendNtfyNotification(
        "Vote party is getting closer! Only 100 votes remaining!"
      );
      scheduleNextCheck(5);
    } else if (numRemaining <= 250) {
      notifyUser("Vote party milestone reached! Only 250 votes remaining!");
      sendNtfyNotification(
        "Vote party milestone reached! Only 250 votes remaining!"
      );
      scheduleNextCheck(10);
    } else if (numRemaining <= 500) {
      notifyUser("Halfway to vote party! Only 500 votes remaining!");
      scheduleNextCheck(30);
    } else if (numRemaining <= 4500) {
      notifyUser("Vote party milestone reached! Only 4500 votes remaining!");
      scheduleNextCheck(30);
    } else {
      scheduleNextCheck(30);
    }
  } catch (error) {
    console.error(
      `Error fetching vote party data at ${new Date().toLocaleTimeString()}:`,
      error.message || error
    );

    notifyUser(
      "There was an error retrieving vote party data. Retrying in 30 minutes."
    );
    sendNtfyNotification(
      "There was an error retrieving vote party data. Retrying in 30 minutes."
    );

    scheduleNextCheck(30); // Retry after 5 minutes if there's an error
  }
}

// Set up the alarm listener to trigger the checkVoteParty function
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkVoteParty") {
    checkVoteParty();
  }
});

// Initial setup: Start checking immediately
checkVoteParty();

// Optional: Test the notification when the extension is loaded
// testNotification();
