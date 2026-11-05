// cookie run kingdom arena tracker

const COLUMNS = [
    "opponent",
    "their team",
    "result",
    "weak to",
    "strong against",
    "notes",
    "trophies",
    "team power",
    "cookie1",
    "cookie2",
    "cookie3",
    "cookie4",
    "cookie5",
    "treasure1",
    "treasure2",
    "treasure3"
];

const STORAGE_KEY = "cookieRunArenaOpponents";

const TEXT_COLUMNS = [
    "opponent",
    "their team",
    "result",
    "weak to",
    "strong against",
    "notes",
    "cookie1",
    "cookie2",
    "cookie3",
    "cookie4",
    "cookie5",
    "treasure1",
    "treasure2",
    "treasure3"
];

let opponents = [];
let editingId = null;
let selectedOpponentId = null;

// create a blank opponent record
function blankOpponent() {
    const opponent = { id: crypto.randomUUID() };

    COLUMNS.forEach(column => {
        opponent[column] = "";
    });

    return opponent;
}

// convert numeric fields to integers
function normalizeNumber(value) {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    const number = Number(value);

    return Number.isFinite(number) ? Math.round(number) : "";
}

// clean and standardize opponent data
function normalizeRecord(record) {
    const normalized = blankOpponent();

    COLUMNS.forEach(column => {
        const value = record[column];

        if (column === "trophies" || column === "team power") {
            normalized[column] = normalizeNumber(value);
        } else {
            normalized[column] = value === null || value === undefined
                ? ""
                : String(value).trim();
        }
    });

    if (record.id) {
        normalized.id = record.id;
    }

    return normalized;
}

// save opponents to local storage
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opponents));
}

// load opponents from local storage
function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                opponents = parsed.map(normalizeRecord);
            }
        }
    } catch (error) {
        console.error("Could not load saved opponents:", error);
        opponents = [];
    }
}

// safely display text in HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}

// get an element by ID
function element(id) {
    return document.getElementById(id);
}

// display a temporary notification
function showToast(message) {
    const toast = element("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// update the statistics at the top
function renderStats() {
    const total = opponents.length;
    const wins = opponents.filter(opponent =>
        opponent.result.toLowerCase() === "win"
    ).length;

    const losses = opponents.filter(opponent =>
        opponent.result.toLowerCase() === "lose"
    ).length;

    const draws = opponents.filter(opponent =>
        opponent.result.toLowerCase() === "draw"
    ).length;

    if (element("total-count")) {
        element("total-count").textContent = total;
    }

    if (element("wins-count")) {
        element("wins-count").textContent = wins;
    }

    if (element("losses-count")) {
        element("losses-count").textContent = losses;
    }

    if (element("draws-count")) {
        element("draws-count").textContent = draws;
    }
}

// get the values currently entered in the search form
function getSearchFilters() {
    const filters = {};

    COLUMNS.forEach(column => {
        const input = element(`search-${column.replaceAll(" ", "-")}`);

        if (input && input.value.trim() !== "") {
            filters[column] = input.value.trim().toLowerCase();
        }
    });

    return filters;
}

// filter opponents using all populated search fields
function filterOpponents() {
    const filters = getSearchFilters();

    return opponents.filter(opponent => {
        return Object.entries(filters).every(([column, searchValue]) => {
            const opponentValue = String(opponent[column] ?? "").toLowerCase();

            return opponentValue.includes(searchValue);
        });
    });
}

// render opponent cards
function renderOpponents() {
    const container = element("opponent-list");

    if (!container) {
        return;
    }

    const filtered = filterOpponents();

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No opponents found</h3>
                <p>Add an opponent or change your search filters.</p>
            </div>
        `;

        renderStats();
        return;
    }

    filtered.forEach(opponent => {
        const result = opponent.result.toLowerCase();

        let resultClass = "unknown";

        if (result === "win") resultClass = "win";
        if (result === "lose") resultClass = "lose";
        if (result === "draw") resultClass = "draw";

        const card = document.createElement("div");

        card.className = "opponent-card";

        card.innerHTML = `
            <div class="card-top">
                <h3>${escapeHTML(opponent.opponent)}</h3>
                <span class="result-badge ${resultClass}">
                    ${escapeHTML(opponent.result || "Unknown")}
                </span>
            </div>

            <div class="card-info">
                <p><strong>Their team:</strong> ${escapeHTML(opponent["their team"] || "—")}</p>
                <p><strong>Trophies:</strong> ${escapeHTML(opponent.trophies || "—")}</p>
                <p><strong>Team power:</strong> ${escapeHTML(opponent["team power"] || "—")}</p>
            </div>

            <button class="secondary-button view-button" type="button">
                View details
            </button>
        `;

        card.querySelector(".view-button").addEventListener("click", () => {
            openDetails(opponent.id);
        });

        container.appendChild(card);
    });

    renderStats();
}

// open the add/edit form
function openOpponentForm(id = null) {
    editingId = id;

    const opponent = id
        ? opponents.find(item => item.id === id)
        : blankOpponent();

    if (!opponent) {
        return;
    }

    COLUMNS.forEach(column => {
        const input = element(`field-${column.replaceAll(" ", "-")}`);

        if (input) {
            input.value = opponent[column] ?? "";
        }
    });

    const title = element("form-title");

    if (title) {
        title.textContent = id ? "Edit opponent" : "Add opponent";
    }

    const dialog = element("opponent-dialog");

    if (dialog) {
        dialog.showModal();
    }
}

// close the add/edit form
function closeOpponentForm() {
    const dialog = element("opponent-dialog");

    if (dialog) {
        dialog.close();
    }

    editingId = null;
}

// save a new opponent or update an existing one
function saveOpponent(event) {
    event.preventDefault();

    const record = blankOpponent();

    COLUMNS.forEach(column => {
        const input = element(`field-${column.replaceAll(" ", "-")}`);

        if (input) {
            record[column] = input.value.trim();
        }
    });

    if (!record.opponent) {
        showToast("Opponent username is required.");
        return;
    }

    const wasEditing = Boolean(editingId);

    if (editingId) {
        const index = opponents.findIndex(item => item.id === editingId);

        if (index !== -1) {
            record.id = editingId;
            opponents[index] = normalizeRecord(record);
        }
    } else {
        opponents.push(normalizeRecord(record));
    }

    saveToStorage();
    closeOpponentForm();
    renderOpponents();

    showToast(wasEditing ? "Opponent updated." : "Opponent added.");
}

// show opponent details
function openDetails(id) {
    const opponent = opponents.find(item => item.id === id);

    if (!opponent) {
        return;
    }

    selectedOpponentId = id;

    const container = element("details-content");

    if (!container) {
        return;
    }

    const labels = {
        opponent: "Opponent",
        "their team": "Their team",
        result: "Result",
        "weak to": "Weak to",
        "strong against": "Strong against",
        notes: "Notes",
        trophies: "Trophies",
        "team power": "Team power",
        cookie1: "Cookie 1 (frontmost)",
        cookie2: "Cookie 2",
        cookie3: "Cookie 3",
        cookie4: "Cookie 4",
        cookie5: "Cookie 5 (rearmost)",
        treasure1: "Treasure 1",
        treasure2: "Treasure 2",
        treasure3: "Treasure 3"
    };

    container.innerHTML = COLUMNS.map(column => `
        <div class="detail-row">
            <strong>${escapeHTML(labels[column])}</strong>
            <span>${escapeHTML(opponent[column] || "—")}</span>
        </div>
    `).join("");

    const dialog = element("details-dialog");

    if (dialog) {
        dialog.showModal();
    }
}

// close details
function closeDetails() {
    const dialog = element("details-dialog");

    if (dialog) {
        dialog.close();
    }

    selectedOpponentId = null;
}

// edit the currently selected opponent
function editSelectedOpponent() {
    const id = selectedOpponentId;

    closeDetails();
    openOpponentForm(id);
}

// delete the currently selected opponent
function deleteSelectedOpponent() {
    if (!selectedOpponentId) {
        return;
    }

    const opponent = opponents.find(item => item.id === selectedOpponentId);

    if (!opponent) {
        return;
    }

    const confirmed = confirm(
        `Delete ${opponent.opponent}? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    opponents = opponents.filter(item => item.id !== selectedOpponentId);

    saveToStorage();
    closeDetails();
    renderOpponents();

    showToast("Opponent deleted.");
}

// clear all search fields
function clearSearch() {
    COLUMNS.forEach(column => {
        const input = element(`search-${column.replaceAll(" ", "-")}`);

        if (input) {
            input.value = "";
        }
    });

    renderOpponents();
}

// export opponents to an Excel file
function exportExcel() {
    if (typeof XLSX === "undefined") {
        showToast("Excel library failed to load. Check your internet connection.");
        return;
    }

    const data = opponents.map(opponent => {
        const row = {};

        COLUMNS.forEach(column => {
            row[column] = opponent[column];
        });

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, {
        header: COLUMNS
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Opponents");

    XLSX.writeFile(workbook, "opponents.xlsx");

    showToast("Excel file exported.");
}

// import opponents from an Excel file
function importExcel(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (typeof XLSX === "undefined") {
        showToast("Excel library failed to load. Check your internet connection.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
        try {
            const workbook = XLSX.read(loadEvent.target.result, {
                type: "array"
            });

            const sheetName = workbook.SheetNames.includes("Opponents")
                ? "Opponents"
                : workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];

            const rows = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                raw: false
            });

            if (rows.length > 0) {
                const headers = Object.keys(rows[0]);

                const missingHeaders = COLUMNS.filter(column =>
                    !headers.includes(column)
                );

                if (missingHeaders.length > 0) {
                    alert(
                        "The Excel file is missing these columns:\n\n" +
                        missingHeaders.join(", ")
                    );

                    return;
                }
            }

            const imported = rows
                .filter(row => String(row.opponent ?? "").trim() !== "")
                .map(row => normalizeRecord(row));

            const confirmed = confirm(
                `Import ${imported.length} opponents?\n\n` +
                "This will replace your currently saved opponents."
            );

            if (!confirmed) {
                return;
            }

            opponents = imported;

            saveToStorage();
            renderOpponents();

            showToast("Excel file imported.");
        } catch (error) {
            console.error("Import error:", error);
            alert("Could not import this Excel file. Make sure it is a valid .xlsx file.");
        } finally {
            event.target.value = "";
        }
    };

    reader.readAsArrayBuffer(file);
}

// connect buttons and inputs
function setupEventListeners() {
    if (element("add-opponent-button")) {
        element("add-opponent-button").addEventListener("click", () => {
            openOpponentForm();
        });
    }

    if (element("opponent-form")) {
        element("opponent-form").addEventListener("submit", saveOpponent);
    }

    if (element("cancel-form-button")) {
        element("cancel-form-button").addEventListener("click", closeOpponentForm);
    }

    if (element("close-details-button")) {
        element("close-details-button").addEventListener("click", closeDetails);
    }

    if (element("edit-opponent-button")) {
        element("edit-opponent-button").addEventListener("click", editSelectedOpponent);
    }

    if (element("delete-opponent-button")) {
        element("delete-opponent-button").addEventListener("click", deleteSelectedOpponent);
    }

    if (element("clear-search-button")) {
        element("clear-search-button").addEventListener("click", clearSearch);
    }

    if (element("export-button")) {
        element("export-button").addEventListener("click", exportExcel);
    }

    if (element("import-input")) {
        element("import-input").addEventListener("change", importExcel);
    }

    COLUMNS.forEach(column => {
        const input = element(`search-${column.replaceAll(" ", "-")}`);

        if (input) {
            input.addEventListener("input", renderOpponents);
        }
    });
}

// start the website
document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    setupEventListeners();
    renderOpponents();
});