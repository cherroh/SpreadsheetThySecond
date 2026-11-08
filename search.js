// search.js
// Handles opponent searching and displaying opponent cards.

const PARTIAL_MATCH_FIELDS = [
    "opponent",
    "their team",
    "weak to",
    "strong against",
    "notes"
];

const EXACT_MATCH_FIELDS = [
    "result",
    "trophies",
    "team power"
];

const COOKIE_FIELDS = [
    "cookie1",
    "cookie2",
    "cookie3",
    "cookie4",
    "cookie5"
];

const TREASURE_FIELDS = [
    "treasure1",
    "treasure2",
    "treasure3"
];

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
        // Partial-match fields.
        for (const field of PARTIAL_MATCH_FIELDS) {
            if (filters[field]) {
                const value = String(opponent[field] ?? "").toLowerCase();

                if (!value.includes(filters[field])) {
                    return false;
                }
            }
        }

        // Exact-match fields.
        for (const field of EXACT_MATCH_FIELDS) {
            if (filters[field]) {
                const value = String(opponent[field] ?? "").trim().toLowerCase();

                if (value !== filters[field]) {
                    return false;
                }
            }
        }

        // Match every searched cookie against any distinct cookie slot.
        const cookieSearches = COOKIE_FIELDS
            .map(field => filters[field])
            .filter(Boolean);

        const opponentCookies = COOKIE_FIELDS
            .map(field => String(opponent[field] ?? "").trim().toLowerCase())
            .filter(Boolean);

        for (const searchValue of cookieSearches) {
            const matchIndex = opponentCookies.indexOf(searchValue);

            if (matchIndex === -1) {
                return false;
            }

            opponentCookies.splice(matchIndex, 1);
        }

        // Every entered treasure search must match at least one
        // of the opponent's three treasure fields.
        const treasureSearches = TREASURE_FIELDS
            .map(field => filters[field])
            .filter(Boolean);

        const opponentTreasures = TREASURE_FIELDS.map(field =>
            String(opponent[field] ?? "").toLowerCase()
        );

        for (const searchValue of treasureSearches) {
            const found = opponentTreasures.some(treasure =>
                treasure.includes(searchValue)
            );

            if (!found) {
                return false;
            }
        }

        return true;
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