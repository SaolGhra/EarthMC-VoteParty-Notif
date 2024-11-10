// Cache DOM elements
const onlinePlayers = document.getElementById("online-players");
const totalTowns = document.getElementById("total-towns");
const totalNations = document.getElementById("total-nations");
const totalResidents = document.getElementById("total-residents");
const voteBar = document.getElementById("vote-bar");
const voteText = document.getElementById("vote-text");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const tabs = document.querySelectorAll(".tab");

let currentSearchType = "towns";

// Function to fetch server stats
async function fetchServerStats() {
  try {
    const response = await fetch("https://api.earthmc.net/v3/aurora/");
    const data = await response.json();

    onlinePlayers.textContent = data.stats.numOnlinePlayers;
    totalTowns.textContent = data.stats.numTowns;
    totalNations.textContent = data.stats.numNations;
    totalResidents.textContent = data.stats.numResidents;

    // Update vote party progress
    const { target, numRemaining } = data.voteParty;
    const progress = ((target - numRemaining) / target) * 100;
    voteBar.style.width = `${progress}%`;
    voteText.textContent = `${numRemaining} votes remaining`;
  } catch (error) {
    console.error("Error fetching server stats:", error);
  }
}

// Function to search entities
async function searchEntities(query) {
  if (!query) return;

  try {
    let endpoint = `https://api.earthmc.net/v3/aurora/${currentSearchType}`;

    // First get the list of all entities
    const response = await fetch(endpoint);
    const data = await response.json();

    // Filter based on the query
    const filtered = data
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5); // Limit to 5 results

    // If we have results, fetch detailed information
    if (filtered.length > 0) {
      const detailResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: filtered.map((item) => item.name),
        }),
      });

      const detailData = await detailResponse.json();
      displayResults(detailData);
    } else {
      searchResults.innerHTML =
        '<div class="result-item">No results found</div>';
    }
  } catch (error) {
    console.error("Error searching:", error);
    searchResults.innerHTML =
      '<div class="result-item">Error fetching results</div>';
  }
}

// Function to display search results
function displayResults(results) {
  searchResults.innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");
    div.className = "result-item";

    let content = `<strong>${result.name}</strong><br>`;

    if (currentSearchType === "towns") {
      content += `
        Mayor: ${result.mayor?.name || "None"}<br>
        Nation: ${result.nation?.name || "None"}<br>
        Residents: ${result.stats?.numResidents || 0}
      `;
    } else if (currentSearchType === "nations") {
      content += `
        King: ${result.king?.name || "None"}<br>
        Capital: ${result.capital?.name || "None"}<br>
        Towns: ${result.stats?.numTowns || 0}
      `;
    } else if (currentSearchType === "players") {
      content += `
        Town: ${result.town?.name || "None"}<br>
        Nation: ${result.nation?.name || "None"}<br>
        Last Online: ${
          result.timestamps?.lastOnline
            ? new Date(result.timestamps.lastOnline).toLocaleDateString()
            : "Unknown"
        }
      `;
    }

    div.innerHTML = content;
    searchResults.appendChild(div);
  });
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  searchEntities(searchInput.value);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchEntities(searchInput.value);
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentSearchType = tab.dataset.type;
    searchInput.placeholder = `Search ${currentSearchType}...`;
    searchResults.innerHTML = "";
    searchInput.value = "";
  });
});

// Initial load
fetchServerStats();
// Refresh stats every minute
setInterval(fetchServerStats, 60000);
