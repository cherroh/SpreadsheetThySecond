
// search.js
// Handles searching, filtering, and displaying opponents.

function getSearchFilters() {
    const filters = {};

    document.querySelectorAll("[data-search]").forEach(input => {
        const value = input.value.trim().toLowerCase();

        if (value !== "") {
            filters[input.dataset.search] = value;
        }
    });

    return filters;
}


// Find opponents matching every filled search field.
function filterOpponents() {
    const filters = getSearchFilters();

    return opponents.filter(opponent => {
        return Object.entries(filters).every(([column, searchValue]) => {

            const value = String(opponent[column] ?? "").toLowerCase();

            // Partial matching instead of exact matching.
            return value.includes(searchValue);
        });
    });
}


// Display opponent cards.
function renderOpponents() {
    const container = document.getElementById("opponentList");
    const emptyState = document.getElementById("emptyState");
    const emptyTitle = document.getElementById("emptyTitle");
    const emptyMessage = document.getElementById("emptyMessage");
    const summary = document.getElementById("resultSummary");

    if (!container) return;

    const filtered = filterOpponents();

    container.innerHTML = "";

    // Update result count.
    if (summary) {
        summary.textContent = `${filtered.length} of ${opponents.length} opponents`;
    }

    // Show the empty state when there are no results.
    if (filtered.length === 0) {
        emptyState?.classList.add("visible");

        if (opponents.length === 0) {
            if (emptyTitle) emptyTitle.textContent = "No opponents yet";

            if (emptyMessage) {
                emptyMessage.textContent =
                    "Add an opponent or import an Excel spreadsheet to get started.";
            }
        } else {
            if (emptyTitle) emptyTitle.textContent = "No opponents found";

            if (emptyMessage) {
                emptyMessage.textContent =
                    "No opponents match your search. Try changing or clearing your filters.";
            }
        }

        renderStats();
        return;
    }

    emptyState?.classList.remove("visible");

    filtered.forEach(opponent => {

        const result = String(opponent.result || "").toLowerCase();

        let resultClass = "result-none";

        if (result === "win") resultClass = "result-win";
        if (result === "lose") resultClass = "result-lose";
        if (result === "draw") resultClass = "result-draw";

        const card = document.createElement("article");

        card.className = "opponent-card";

        card.innerHTML = `
            <div class="card-top">

                <div>
                    <h3 class="opponent-name">
                        ${escapeHTML(opponent.opponent)}
                    </h3>

                    <div class="team-name">
                        ${escapeHTML(opponent["their team"] || "No team recorded")}
                    </div>
                </div>

                <span class="result-badge ${resultClass}">
                    ${escapeHTML(opponent.result || "Unknown")}
                </span>

            </div>

            <div class="card-meta">

                <span>
                    🏆 Trophies:
                    ${escapeHTML(opponent.trophies === "" ? "—" : opponent.trophies)}
                </span>

                <span>
                    ⚔ Team power:
                    ${escapeHTML(opponent["team power"] === "" ? "—" : opponent["team power"])}
                </span>

            </div>

            ${opponent.notes ? `
                <p class="card-notes">
                    ${escapeHTML(opponent.notes)}
                </p>
            ` : ""}

            <div class="card-footer">

                <span class="team-hint">
                    Weak to: ${escapeHTML(opponent["weak to"] || "Unknown")}
                </span>

                <button class="text-button view-button" type="button">
                    View details →
                </button>

            </div>
        `;

        card.querySelector(".view-button").addEventListener("click", () => {
            openDetails(opponent.id);
        });

        container.appendChild(card);
    });

    renderStats();
}
