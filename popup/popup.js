document.addEventListener("DOMContentLoaded", () => {
  const onlinePlayers = document.getElementById("online-players");
  const totalTowns = document.getElementById("total-towns");
  const totalNations = document.getElementById("total-nations");
  const totalResidents = document.getElementById("total-residents");
  const voteBar = document.getElementById("vote-bar");
  const voteText = document.getElementById("vote-text");
  const voteButton = document.querySelector('.vote-button');
  const infoButton = document.querySelector('.info');
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchResults = document.getElementById("search-results");
  const tabs = document.querySelectorAll(".tab");

  let currentSearchType = "towns";
  let minecraftUsername = '';

  infoButton.addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Enter your Minecraft Username</h3>
        <input type="text" id="minecraft-username" placeholder="Minecraft Username">
        <button id="save-username">Save</button>
        <p>This saves your username using cookies. If you encounter issues with voting, please ensure that your username is saved correctly.</p>
      </div>  
    `;
    document.body.appendChild(modal);

    let saveButton = modal.querySelector('#save-username');
    let usernameInput = modal.querySelector('#minecraft-username');

    saveButton.addEventListener('click', () => {
      minecraftUsername = usernameInput.value;
      document.cookie = `minecraftUsername=${minecraftUsername}; path=/; max-age=31536000`; // Save for 1 year
      voteButton.disabled = false
      modal.remove();
    });
  });

  voteButton.disabled = true;

  if (document.cookie && document.cookie.includes('minecraftUsername')) {
    // minecraftUsername = document.cookie.split('=')[1];
    voteButton.disabled = false
  }

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

  voteButton.addEventListener('click', () => {
    chrome.tabs.create({ url: `https://minecraftservers.org/vote/383495?username=${minecraftUsername}` });
    chrome.tabs.create({ url: `https://minecraft-mp.com/server/332214/vote/?username=${minecraftUsername}` });
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
              )}&z=${Math.round(coordinates.z)}" target="_blank">View on Map</a>`
            : "";

          content += `
            <span>Capital: ${result.capital?.name || "None"}</span>
            <span>King: ${parseMinecraftColors(result.king?.name || "None")}</span>
            <span>Board: ${result.board || "None"}</span>
            <span>Towns: ${result.stats?.numTowns || 0}</span>
            <span>Residents: ${result.stats?.numResidents || 0}</span>
            <span>Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold</span>
            <span>Allies: ${result.stats?.numAllies || 0}</span>
            <span>Enemies: ${result.stats?.numEnemies || 0}</span>
            <span>Founded: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }</span>
            ${mapLink}
          `;
        } else if (currentSearchType === "towns") {
          const coordinates = result.coordinates?.spawn;
          const mapLink = coordinates
            ? `<a href="https://map.earthmc.net/?zoom=4&x=${Math.round(
                coordinates.x
              )}&z=${Math.round(coordinates.z)}" target="_blank">View on Map</a>`
            : "";

          content += `
            <span>Mayor: ${parseMinecraftColors(result.mayor?.name || "None")}</span>
            <span>Nation: ${parseMinecraftColors(result.nation?.name || "None")}</span>
            <span>Board: ${result.board || "None"}</span>
            <span>Residents: ${result.stats?.numResidents || 0}</span>
            <span>Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold</span>
            <span>Town Blocks: ${result.stats?.numTownBlocks || 0} / ${
            result.stats?.maxTownBlocks || 0
          }</span>
            <span>Coordinates: ${
              coordinates
                ? `x: ${Math.round(coordinates.x)}, z: ${Math.round(
                    coordinates.z
                  )}`
                : "Unknown"
            }</span>
            <span>Status: ${result.status?.isOpen ? "Open" : "Closed"}${
            result.status?.isPublic ? ", Public" : ""
          }</span>
          <span>${result.status?.isCapital ? ", Capital" : ""}</span>
          <span>Founded: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }</span>
            ${mapLink}
          `;
        } else if (currentSearchType === "players") {
          const formattedName = parseMinecraftColors(result.formattedName || result.name);

          content = `<strong>${formattedName}</strong>`;
          content += `
            <span>Town: ${(result.town?.name || "None")}</span>
            <span>Nation: ${(result.nation?.name || "None")}</span>
            <span>Balance: ${result.stats?.balance?.toLocaleString() || 0} Gold</span>
            <span>Friends: ${result.stats?.numFriends || 0}</span>
            <span>Status: ${result.status?.isOnline ? "🟢 Online" : "🔴 Offline"}${
            result.status?.isMayor ? ", Mayor" : ""
          }${result.status?.isKing ? ", King" : ""}</span>
            <span>Town Rank: ${result.status?.isMayor ? "Mayor" : (result.ranks?.townRanks?.join(", ") || "None")}</span>
            <span>Nation Rank: ${result.ranks?.nationRanks?.join(", ") || "None"}</span>
            <span>Joined: ${
              result.timestamps?.registered
                ? new Date(result.timestamps.registered).toLocaleDateString()
                : "Unknown"
            }</span>
            <span>Last Online: ${
              result.timestamps?.lastOnline
                ? new Date(result.timestamps.lastOnline).toLocaleDateString()
                : "Unknown"
            }</span>
          `;
          if (result.about) {
            content += `<br>About: ${parseMinecraftColors(result.about)}`;
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