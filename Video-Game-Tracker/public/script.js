const API = "/games";

async function loadGames(url = API) {
    const res = await fetch(url);
    const games = await res.json();

    const list = document.getElementById("gameList");
    list.innerHTML = "";

    //Game information
    games.forEach(game => {
        list.innerHTML += `
        <div class="game">
        <h3>${game.title}</h3>
        <p><b>Company:</b> ${game.company}</p>
        <p><b>Status:</b> ${game.status}</p>
        <p>${game.description}</p>
        <small>${game.date}</small><br>
        <button onclick="toggleStatus('${game.id}')">Toggle Status</button>
        <button onclick="deleteGame('${game.id}')">Delete</button>
        </div>
        `;
    });
}

async function addGame() {
    //Get the values typed in the input fields
const title = document.getElementById("title").value.trim();
const company = document.getElementById("company").value.trim();
const description = document.getElementById("description").value.trim();

    // Check that title and company are not empty
    if(!title || !company) {
        showError("Title and Company are required"); //! means if title or company isn't there it won't work
        return;
    }
    //Send the new game to the server
    const res = await fetch("/games", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, company, description})
    });
    // read the server's response
    const data = await res.json();

    //Check if server returns an error
    if(!res.ok) {
        showError(data.error || "Something went wrong");
        return;
    }
    //Clear previous error messages
    clearError();

    //Check the input fields so the user can type a new game
    document.getElementById("title").value = "";
    document.getElementById("company").value = "";
    document.getElementById("description").value = "";

    //Reload list of games on the page
    loadGames();
}

//Delete Game
async function deleteGame(id) {
    await fetch(`${API}/${id}`, {method: "DELETE"});
    loadGames();
}

//Toggle status of a game
async function toggleStatus(id) {
    await fetch (`${API}/${id}/status`, {method: "PUT"});
    loadGames();
}

//Filter game by status
function filterGames(status) {
    loadGames(`${API}?status=${status}`);
}
//Search for a game
function searchGames() {
    const value = document.getElementById("search").value;
    loadGames(`${API}?search=${value}`);
}

function showError(message) {
    document.getElementById("errorMsg").innerText = message;
}

function clearError() {
    document.getElementById("errorMsg").innerText = "";
}

loadGames();