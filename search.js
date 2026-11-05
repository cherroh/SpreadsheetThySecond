// search.js
// Handles opponent searching and displaying opponent cards.

function getSearchFilters() {
    const filters = {};

    document.querySelectorAll("[data-search]").forEach(input => {
        const value = input.value.trim().toLowerCase();

        if (value) {
            filters[input.dataset.search] = value;
        }
    });

    return filters;
}

function filterOpponents() {
    const filters = getSearchFilters();

    return opponents.filter(opponent => {
        return Object.entries(filters).every(([column, searchValue]) => {
            const opponentValue = String(opponent[column] ?? "").toLowerCase();
            return opponentValue.includes(searchValue);
        });
    });
}

function renderOpponents() {
    const opponentList = document.getElementById("opponentList");
    const resultSummary = document.getElementById("resultSummary");
    const emptyState = document.getElementById("emptyState");
    const emptyTitle = document.getElementById("emptyTitle");
    const emptyMessage = document.getElementById("emptyMessage");

    const filteredOpponents = filterOpponents();
    const hasSearchFilters = Object.keys(getSearchFilters()).length > 0;

    opponentList.innerHTML = "";

    resultSummary.textContent =
        `${filteredOpponents.length} opponent${filteredOpponents.length !== 1 ? "s" : ""}`;

    if (filteredOpponents.length === 0) {
        opponentList.style.display = "none";
        emptyState.style.display = "block";

        if (hasSearchFilters) {
            emptyTitle.textContent = "No opponents found";
            emptyMessage.textContent = "Try changing or clearing your search filters.";
        } else {
            emptyTitle.textContent = "No opponents yet";
            emptyMessage.textContent = "Add an opponent to get started.";
        }

        renderStats();
        return;
    }

    opponentList.style.display = "grid";
    emptyState.style.display = "none";

    filteredOpponents.forEach(opponent => {
        const card = document.createElement("article");
        card.className = "opponent-card";

        const result = String(opponent.result ?? "").toLowerCase();

        let resultClass = "result-none";

        if (result === "win") {
            resultClass = "result-win";
        } else if (result === "lose") {
            resultClass = "result-lose";
        } else if (result === "draw") {
            resultClass = "result-draw";
        }

        card.innerHTML = `
            <div class="card-top">
                <h3 class="opponent-name">
                    ${escapeHTML(opponent.opponent || "Unnamed opponent")}
                </h3>

                <span class="result-badge ${resultClass}">
                    ${escapeHTML(opponent.result || "No result")}
                </span>
            </div>

            <div class="card-information">
                <p>Their team: ${escapeHTML(opponent["their team"] || "—")}</p>

                <p>Weak to: ${escapeHTML(opponent["weak to"] || "—")}</p>

                <p>Strong against: ${escapeHTML(opponent["strong against"] || "—")}</p>

                <p>Notes: ${escapeHTML(opponent.notes || "—")}</p>
            </div>

            <div class="card-footer">
                <button class="text-button" type="button">
                    View details
                </button>
            </div>
        `;

        card.querySelector(".text-button").addEventListener("click", () => {
            openDetails(opponent.id);
        });

        opponentList.appendChild(card);
    });

    renderStats();
}