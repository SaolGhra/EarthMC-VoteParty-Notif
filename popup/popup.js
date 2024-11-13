document.addEventListener("DOMContentLoaded", () => {
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
      searchResults.innerHTML = "";
    });
  });

  async function fetchServerStats() {
    try {
      const response = await fetch("https://api.earthmc.net/v3/aurora/", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      });

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

  function parseMinecraftColors(text) {
    const colorMap = {
      red: "#FF5555",
      yellow: "#FFFF55",
      gold: "#FFAA00",
      green: "#55FF55",
      blue: "#5555FF",
      aqua: "#55FFFF",
      light_purple: "#FF55FF",
      white: "#FFFFFF",
      gray: "#AAAAAA",
      dark_gray: "#555555",
      dark_red: "#AA0000",
      dark_blue: "#0000AA",
      dark_green: "#00AA00",
      dark_aqua: "#00AAAA",
      dark_purple: "#AA00AA",
      black: "#000000",
    };

    return text.replace(/<([a-z_]+)>/g, (match, color) => {
      const hexColor = colorMap[color];
      if (hexColor) {
        return `<span style="color: ${hexColor}">`;
      }
      return match;
    }).replace(/<\/[a-z_]+>/g, () => "</span>");
  }

  async function searchEntities(query) {
    if (!query) return;

    searchResults.innerHTML = "";

    try {
      let endpoint;
      let body;

      switch (currentSearchType) {
        case "players":
          endpoint = "players";
          body = { query: [query] };
          break;
        case "towns":
          endpoint = "towns";
          body = { query: [query] };
          break;
        case "nations":
          endpoint = "nations";
          body = { query: [query] };
          break;
        default:
          return;
      }

      const response = await fetch(
        `https://api.earthmc.net/v3/aurora/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();

      results.forEach((result) => {
        const div = document.createElement("div");
        div.className = "result-item";

        let content = `<strong>${parseMinecraftColors(result.name)}</strong><br>`;

        if (currentSearchType === "nations") {
          const coordinates = result.coordinates?.spawn;
          const mapLink = coordinates
            ? `<a href="https://map.earthmc.net/?zoom=4&x=${Math.round(
                coordinates.x
              )}&z=${Math.round(coordinates.z)}" target="_blank">View on Map</a><br>`
            : "";

          content += `
            Capital: ${result.capital?.name || "None"}<br>
            King: ${parseMinecraftColors(result.king?.name || "None")}<br>
            Board: ${result.board || "None"}<br>
            Towns: ${result.stats?.numTowns || 0}<br>
            Residents: ${result.stats?.numResidents || 0}<br>
            Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold<br>
            Allies: ${result.stats?.numAllies || 0}<br>
            Enemies: ${result.stats?.numEnemies || 0}<br>
            Founded: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }<br>
            ${mapLink}
          `;
        } else if (currentSearchType === "towns") {
          const coordinates = result.coordinates?.spawn;
          const mapLink = coordinates
            ? `<a href="https://map.earthmc.net/?zoom=4&x=${Math.round(
                coordinates.x
              )}&z=${Math.round(coordinates.z)}" target="_blank">View on Map</a><br>`
            : "";

          content += `
            Mayor: ${parseMinecraftColors(result.mayor?.name || "None")}<br>
            Nation: ${parseMinecraftColors(result.nation?.name || "None")}<br>
            Board: ${result.board || "None"}<br>
            Residents: ${result.stats?.numResidents || 0}<br>
            Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold<br>
            Town Blocks: ${result.stats?.numTownBlocks || 0} / ${
            result.stats?.maxTownBlocks || 0
          }<br>
            Coordinates: ${
              coordinates
                ? `x: ${Math.round(coordinates.x)}, z: ${Math.round(
                    coordinates.z
                  )}`
                : "Unknown"
            }<br>
            Status: ${result.status?.isOpen ? "Open" : "Closed"}${
            result.status?.isPublic ? ", Public" : ""
          }${result.status?.isCapital ? ", Capital" : ""}<br>
            Founded: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }<br>
            ${mapLink}
          `;
        } else if (currentSearchType === "players") {
          const formattedName = parseMinecraftColors(result.formattedName || result.name);

          content = `<strong>${formattedName}</strong><br>`;
          content += `
            Town: ${(result.town?.name || "None")}<br>
            Nation: ${(result.nation?.name || "None")}<br>
            Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold<br>
            Friends: ${result.stats?.numFriends || 0}<br>
            Status: ${result.status?.isOnline ? "🟢 Online" : "🔴 Offline"}${
            result.status?.isMayor ? ", Mayor" : ""
          }${result.status?.isKing ? ", King" : ""}<br>
            Town Rank: ${result.status?.isMayor ? "Mayor" : (result.ranks?.townRanks?.join(", ") || "None")}<br>
            Nation Rank: ${result.ranks?.nationRanks?.join(", ") || "None"}<br>
            Joined: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }<br>
            Last Online: ${
              result.timestamps?.lastOnline
                ? new Date(result.timestamps.lastOnline).toLocaleDateString()
                : "Unknown"
            }
          `;
          if (result.about) {
            content += `<br>About: ${parseMinecraftColors(result.about)}<br>`;
          }
        }

        div.innerHTML = content;
        searchResults.appendChild(div);
      });
    } catch (error) {
      console.error("Error:", error);
      searchResults.innerHTML = `<div class="error">Error searching ${currentSearchType}</div>`;
    }
  }

  fetchServerStats();

  setInterval(fetchServerStats, 30000);
});