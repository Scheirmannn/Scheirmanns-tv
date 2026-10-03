let currentId = localStorage.getItem("currentId") || "1100";
let currentSsIndex = 1;
let currentEpIndex = 1;
let currentName = localStorage.getItem("currentName") || "How I Met Your Mother";

const player = document.getElementById('player');
const episodeLabel = document.getElementById('Episode-label');
const seasonLabel = document.getElementById('Season-label');
const idInput = document.getElementById('id-input');
const savedShows = document.getElementById("savedShows");
const searchToggle = document.getElementById("search-toggle");
const searchInput = document.getElementById("search-input");

function tvServers() {
    return [
        `https://peachify.pro/embed/tv/${currentId}/${currentSsIndex}/${currentEpIndex}`,
        `https://vidup.to/tv/${currentId}/${currentSsIndex}/${currentEpIndex}?nextButton=false&autoNext=false`,
        `https://vidsrc.sh/embed/tv/${currentId}/${currentSsIndex}/${currentEpIndex}`,
        `https://player.vidlove.cc/embed/tv/${currentId}/${currentSsIndex}/${currentEpIndex}`,
        `https://vidfast.vc/tv/${currentId}/${currentSsIndex}/${currentEpIndex}?nextButton=false&autoNext=false`,
        `https://vidnest.fun/tv/${currentId}/${currentSsIndex}/${currentEpIndex}`,
    ];
}

let currentServer = 2;

const serverButtons = document.querySelector(".server-buttons");

tvServers().forEach((_, index) => {
    const button = document.createElement("button");
    button.className = "server-btn";
    button.dataset.server = index;
    button.textContent = `Server ${index + 1}`;

    serverButtons.appendChild(button);
});

idInput.value = currentName;

function updateSavedShows() {
    const progress = JSON.parse(localStorage.getItem("progress")) || {};

    savedShows.innerHTML = "";

    for (const id in progress) {
        const div = document.createElement("div");
        div.className = "saved-show";

        const show = progress[id];

        div.textContent =
            `${show.name || id} - S${show.season}E${show.episode}`;

        div.addEventListener("click", function () {
            currentId = id;
            currentName = show.name
            idInput.value = show.name;
            loadProgress(id);
            updatePlayer();
        });

        div.addEventListener("dblclick", function () {
            let progress = JSON.parse(localStorage.getItem("progress")) || {};

            delete progress[id];

            if (id === currentId) {
                currentId = "";
                currentName = "";
                currentSsIndex = 1;
                currentEpIndex = 1;

                idInput.value = "";

                player.src = "";
                episodeLabel.textContent = "Episode: 1";
                seasonLabel.textContent = "Season: 1";

                localStorage.removeItem("currentId");
                localStorage.removeItem("currentName");
            }

            localStorage.setItem("progress", JSON.stringify(progress));
            updateSavedShows();
        });

        savedShows.appendChild(div);
    }

}

function saveProgress() {
    let progress = JSON.parse(localStorage.getItem("progress")) || {};

    progress[currentId] = {
        name: currentName,
        season: currentSsIndex,
        episode: currentEpIndex
    };

    localStorage.setItem("progress", JSON.stringify(progress));
    localStorage.setItem("currentId", currentId);
    localStorage.setItem("currentName", currentName);
    updateSavedShows();
}

function loadProgress(id) {
    let progress = JSON.parse(localStorage.getItem("progress")) || {};

    if (progress[id]) {
        currentSsIndex = progress[id].season;
        currentEpIndex = progress[id].episode;
    } else {
        currentSsIndex = 1;
        currentEpIndex = 1;
    }
}

function updatePlayer() {
    player.src = tvServers()[currentServer];
    episodeLabel.textContent = `Episode: ${currentEpIndex}`;
    seasonLabel.textContent = `Season: ${currentSsIndex}`;
    saveProgress();
}

loadProgress(currentId);
updatePlayer();

idInput.addEventListener("keydown", async function (event) {
    if (event.key !== "Enter") return;

    const query = this.value.trim();

    if (!query) return;

    try {
        const response = await fetch(`/api/tmdbTvT?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.results.length > 0) {
            const show = data.results[0];

            currentName = show.name;
            currentId = show.id.toString();
            idInput.value = currentName
            loadProgress(currentId);
            updatePlayer();
        } else {
            console.log("No show found.");
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('nextEp-btn').addEventListener('click', function () {
    currentEpIndex++;
    updatePlayer();
});

document.getElementById('prevEp-btn').addEventListener('click', function () {
    if (currentEpIndex > 1) {
        currentEpIndex--;
        updatePlayer();
    }
});

document.getElementById('nextSs-btn').addEventListener('click', function () {
    currentSsIndex++
    currentEpIndex = 1;
    updatePlayer();
});

document.getElementById('prevSs-btn').addEventListener('click', function () {
    if (currentSsIndex > 1) {
        currentSsIndex--;
        currentEpIndex = 1;
        updatePlayer();
    }
});

document.querySelectorAll(".server-btn").forEach(button => {
    button.addEventListener("click", function () {
        currentServer = Number(this.dataset.server);
        updatePlayer();
    });
});

searchToggle.addEventListener("click", () => {
    const isOpen = searchInput.classList.toggle("open");
    if (isOpen) searchInput.focus();
    else searchInput.value = "";
});

searchInput.addEventListener("keydown", async function (event) {
    if (event.key !== "Enter") return;

    const query = this.value.trim();

    if (!query) return;

    try {
        const response = await fetch(`/api/tmdbTvT?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.results.length > 0) {
            const show = data.results[0];

            currentName = show.name;
            currentId = show.id.toString();
            idInput.value = currentName
            loadProgress(currentId);
            updatePlayer();
        } else {
            console.log("No show found.");
        }
    } catch (error) {
        console.error(error);
    }

});

// close when clicking elsewhere (only if empty)
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap") && !searchInput.value) {
        searchInput.classList.remove("open");
    }
});