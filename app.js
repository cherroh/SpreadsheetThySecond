
// app.js
// Shared data, storage, details, Excel import/export, and event setup.


// Exact Excel column names and order.
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

let opponents = [];

let editingId = null;
let selectedOpponentId = null;


// Create an empty opponent record.
function blankOpponent() {
    const opponent = {
        id: crypto.randomUUID()
    };

    COLUMNS.forEach(column => {
        opponent[column] = "";
    });

    return opponent;
}


// Convert numeric values into integers.
function normalizeNumber(value) {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    const number = Number(value);

    return Number.isSafeInteger(number) && number >= 0
        ? number
        : "";
}


// Normalize an opponent record.
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


// Save opponents to localStorage.
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(opponents));
    } catch (error) {
        console.error("Could not save opponents:", error);
        showToast("Could not save data. Browser storage may be full.");
    }
}


// Load opponents from localStorage.
function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                opponents = parsed
                    .filter(record => record && typeof record === "object")
                    .map(normalizeRecord);
            }
        }
    } catch (error) {
        console.error("Could not load saved opponents:", error);
        opponents = [];
    }
}


// Escape HTML to prevent user-entered text from becoming HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// Display a notification.
function showToast(message) {
    const toast = document.getElementById("toast");

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


// Update statistics.
function renderStats() {
    const count = result => opponents.filter(opponent =>
        String(opponent.result || "").toLowerCase() === result
    ).length;

    document.getElementById("totalCount").textContent = opponents.length;
    document.getElementById("winCount").textContent = count("win");
    document.getElementById("loseCount").textContent = count("lose");
    document.getElementById("drawCount").textContent = count("draw");
}


// Open opponent details.
function openDetails(id) {
    const opponent = opponents.find(item => item.id === id);

    if (!opponent) return;

    selectedOpponentId = id;

    const container = document.getElementById("detailsContent");
    const title = document.getElementById("detailsTitle");

    if (!container) return;

    title.textContent = opponent.opponent;

    const groups = [
        {
            title: "Basic information",
            columns: [
                "opponent",
                "their team",
                "result",
                "weak to",
                "strong against",
                "notes"
            ]
        },
        {
            title: "Battle information",
            columns: [
                "trophies",
                "team power"
            ]
        },
        {
            title: "Cookies",
            columns: [
                "cookie1",
                "cookie2",
                "cookie3",
                "cookie4",
                "cookie5"
            ]
        },
        {
            title: "Treasures",
            columns: [
                "treasure1",
                "treasure2",
                "treasure3"
            ]
        }
    ];

    const labels = {
        opponent: "Username",
        "their team": "Their team",
        result: "Result",
        "weak to": "Weak to",
        "strong against": "Strong against",
        notes: "Notes",
        trophies: "Trophies",
        "team power": "Team power",
        cookie1: "Cookie 1 · Frontmost",
        cookie2: "Cookie 2",
        cookie3: "Cookie 3 · Middle",
        cookie4: "Cookie 4",
        cookie5: "Cookie 5 · Rearmost",
        treasure1: "Treasure 1",
        treasure2: "Treasure 2",
        treasure3: "Treasure 3"
    };

    container.innerHTML = groups.map(group => `
        <section class="detail-group">

            <h3>${escapeHTML(group.title)}</h3>

            <div class="detail-grid">

                ${group.columns.map(column => `
                    <div class="detail-item">

                        <span class="detail-label">
                            ${escapeHTML(labels[column])}
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(opponent[column] === "" ? "—" : opponent[column])}
                        </span>

                    </div>
                `).join("")}

            </div>

        </section>
    `).join("");

    const dialog = document.getElementById("detailsDialog");

    if (dialog && !dialog.open) {
        dialog.showModal();
    }
}


// Close opponent details.
function closeDetails() {
    const dialog = document.getElementById("detailsDialog");

    if (dialog?.open) {
        dialog.close();
    }

    selectedOpponentId = null;
}


// Edit the currently selected opponent.
function editSelectedOpponent() {
    const id = selectedOpponentId;

    closeDetails();

    if (id) {
        openOpponentForm(id);
    }
}


// Delete the currently selected opponent.
function deleteSelectedOpponent() {
    if (!selectedOpponentId) return;

    const opponent = opponents.find(item => item.id === selectedOpponentId);

    if (!opponent) return;

    if (!confirm(`Delete ${opponent.opponent}? This cannot be undone.`)) {
        return;
    }

    opponents = opponents.filter(item => item.id !== selectedOpponentId);

    saveToStorage();

    closeDetails();

    renderOpponents();

    showToast("Opponent deleted.");
}


// Clear every search field.
function clearSearch() {
    document.getElementById("searchForm").reset();

    renderOpponents();
}


// Export opponents to Excel.
function exportExcel() {
    if (typeof XLSX === "undefined") {
        showToast("Excel library failed to load. Check your internet connection.");
        return;
    }

    // Create rows using the exact column order.
    const rows = opponents.map(opponent => {
        const row = {};

        COLUMNS.forEach(column => {
            row[column] = opponent[column];
        });

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: COLUMNS
    });

    // Ensure headers exist even when there are no opponents.
    XLSX.utils.sheet_add_aoa(worksheet, [COLUMNS], {
        origin: "A1"
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Opponents");

    XLSX.writeFile(workbook, "opponents.xlsx");

    showToast("Excel file exported.");
}


// Import opponents from Excel.
function importExcel(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (typeof XLSX === "undefined") {
        showToast("Excel library failed to load. Check your internet connection.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = loadEvent => {
        try {
            const workbook = XLSX.read(loadEvent.target.result, {
                type: "array"
            });

            if (workbook.SheetNames.length === 0) {
                throw new Error("The Excel file contains no worksheets.");
            }

            const sheetName = workbook.SheetNames.includes("Opponents")
                ? "Opponents"
                : workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];

            // Read the header row.
            const headerRows = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
                raw: false
            });

            if (headerRows.length === 0) {
                throw new Error("The Excel worksheet is empty.");
            }

            const headers = headerRows[0].map(header =>
                String(header).trim()
            );

            // Check that all required columns exist.
            const missing = COLUMNS.filter(column =>
                !headers.includes(column)
            );

            if (missing.length > 0) {
                alert(
                    "The Excel file is missing these columns:\n\n" +
                    missing.join(", ")
                );
                return;
            }

            // Read the actual records.
            const rows = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                raw: false
            });

            const imported = rows
                .filter(row => String(row.opponent ?? "").trim() !== "")
                .map(normalizeRecord);

            // Replace existing records only after confirmation.
            if (!confirm(
                `Import ${imported.length} opponents?\n\n` +
                "This will replace your currently saved opponents."
            )) {
                return;
            }

            opponents = imported;

            saveToStorage();

            clearSearch();

            renderOpponents();

            showToast("Excel file imported.");

        } catch (error) {
            console.error("Import error:", error);

            alert(
                "Could not import this Excel file. " +
                "Make sure it is a valid Excel file with the correct columns."
            );

        } finally {
            event.target.value = "";
        }
    };

    reader.onerror = () => {
        showToast("Could not read the selected file.");
        event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
}


// Connect buttons and forms to their functions.
function setupEventListeners() {

    // Add opponent buttons.
    document.getElementById("addOpponentButton")
        .addEventListener("click", () => openOpponentForm());

    document.getElementById("emptyAddButton")
        .addEventListener("click", () => openOpponentForm());


    // Add/edit form.
    document.getElementById("opponentForm")
        .addEventListener("submit", saveOpponent);

    document.getElementById("closeDialogButton")
        .addEventListener("click", closeOpponentForm);

    document.getElementById("cancelDialogButton")
        .addEventListener("click", closeOpponentForm);


    // Details dialog.
    document.getElementById("closeDetailsButton")
        .addEventListener("click", closeDetails);

    document.getElementById("detailsCloseButton")
        .addEventListener("click", closeDetails);

    document.getElementById("editOpponentButton")
        .addEventListener("click", editSelectedOpponent);

    document.getElementById("deleteOpponentButton")
        .addEventListener("click", deleteSelectedOpponent);


    // Search.
    document.getElementById("clearSearchButton")
        .addEventListener("click", clearSearch);

    document.getElementById("searchForm")
        .addEventListener("input", renderOpponents);


    // Excel import/export.
    document.getElementById("exportButton")
        .addEventListener("click", exportExcel);

    document.getElementById("importButton")
        .addEventListener("click", () => {
            document.getElementById("importInput").click();
        });

    document.getElementById("importInput")
        .addEventListener("change", importExcel);
}


// Initialize the application.
document.addEventListener("DOMContentLoaded", () => {

    loadFromStorage();

    setupEventListeners();

    renderOpponents();

});
