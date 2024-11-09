// Function to fetch vote party data from the API
async function checkVoteParty() {
  try {
    const response = await fetch("https://api.earthmc.net/v3/aurora/", {
      mode: "no-cors",
    });
    const data = await response.json();
    const numRemaining = data.voteParty.numRemaining;

    console.log(`Votes remaining: ${numRemaining}`);

    if (numRemaining <= 50) {
      notifyUser("Vote party is near! Only 50 votes remaining!");
      scheduleNextCheck(1); // Check every 1 minute
    } else if (numRemaining <= 100) {
      notifyUser("Vote party is getting closer! Only 100 votes remaining!");
      scheduleNextCheck(5); // Check every 5 minutes
    } else if (numRemaining <= 250) {
      notifyUser("Vote party milestone reached! Only 250 votes remaining!");
      scheduleNextCheck(10); // Check every 10 minutes
    } else if (numRemaining <= 500) {
      notifyUser("Halfway to vote party! Only 500 votes remaining!");
      scheduleNextCheck(30); // Check every 30 minutes
    } else {
      scheduleNextCheck(30); // Check every 30 minutes if more than 500 remaining
    }
  } catch (error) {
    console.error("Error fetching vote party data:", error);
    scheduleNextCheck(30); // In case of error, retry in 30 minutes
  }
}

// Function to send notifications
function notifyUser(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png", // Add an icon to the notification
    title: "EarthMC Vote Party",
    message: message,
    priority: 2,
  });
}

// Function to schedule the next check using Chrome alarms
function scheduleNextCheck(minutes) {
  chrome.alarms.create("checkVoteParty", { delayInMinutes: minutes });
}

// Test notification function (for testing purposes only)
function testNotification() {
  notifyUser("Test Notification: This is how the notifications will look.");
}

// Set up the alarm listener to trigger the checkVoteParty function
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkVoteParty") {
    checkVoteParty();
  }
});

// Initial setup: Start checking immediately
checkVoteParty();

// Test the notification when the extension is loaded
testNotification();
