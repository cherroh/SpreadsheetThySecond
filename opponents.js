
// opponents.js
// Handles creating, editing, and saving opponent records.

function getOpponentDialog() {
    return document.getElementById("opponentDialog");
}


// Open the add/edit form.
function openOpponentForm(id = null) {
    editingId = id;

    const opponent = id
        ? opponents.find(item => item.id === id)
        : blankOpponent();

    if (!opponent) {
        console.error("Could not find the opponent to edit.");
        return;
    }

    // Fill every input with the existing data.
    COLUMNS.forEach(column => {
        const input = document.getElementById(
            `field-${column.replaceAll(" ", "-")}`
        );

        if (input) {
            input.value = opponent[column] ?? "";
        }
    });

    const title = document.getElementById("dialogTitle");
    const saveButton = document.getElementById("saveOpponentButton");

    if (title) {
        title.textContent = id ? "Edit opponent" : "Add opponent";
    }

    if (saveButton) {
        saveButton.textContent = id ? "Save changes" : "Save opponent";
    }

    const dialog = getOpponentDialog();

    if (!dialog) {
        console.error("Opponent dialog is missing.");
        return;
    }

    if (!dialog.open) {
        dialog.showModal();
    }

    document.getElementById("field-opponent")?.focus();
}


// Close the add/edit form.
function closeOpponentForm() {
    const dialog = getOpponentDialog();

    if (dialog?.open) {
        dialog.close();
    }

    editingId = null;
}


// Save a new opponent or update an existing opponent.
function saveOpponent(event) {
    event.preventDefault();

    const record = blankOpponent();
    let invalidNumber = false;

    COLUMNS.forEach(column => {
        const input = document.getElementById(
            `field-${column.replaceAll(" ", "-")}`
        );

        if (!input) return;

        const value = input.value.trim();

        if (column === "trophies" || column === "team power") {
            if (value === "") {
                record[column] = "";
            } else {
                const number = Number(value);

                if (!Number.isSafeInteger(number) || number < 0) {
                    input.setCustomValidity(
                        "Enter a valid non-negative whole number."
                    );

                    input.reportValidity();
                    input.setCustomValidity("");
                    input.focus();

                    invalidNumber = true;
                    return;
                }

                record[column] = number;
            }
        } else {
            record[column] = value;
        }
    });

    if (invalidNumber) return;

    if (!record.opponent) {
        showToast("Opponent username is required.");
        document.getElementById("field-opponent")?.focus();
        return;
    }

    const wasEditing = Boolean(editingId);

    if (editingId) {
        const index = opponents.findIndex(item => item.id === editingId);

        if (index === -1) {
            showToast("Could not find the opponent to update.");
            return;
        }

        record.id = editingId;
        opponents[index] = normalizeRecord(record);

    } else {
        opponents.push(normalizeRecord(record));
    }

    saveToStorage();
    closeOpponentForm();
    renderOpponents();

    showToast(wasEditing ? "Opponent updated." : "Opponent added.");
}

