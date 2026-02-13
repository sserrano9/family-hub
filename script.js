
const SUPABASE_URL = 'https://ynlrzypirbdswfngnwvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlubHJ6eXBpcmJkc3dmbmdud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjM0NzgsImV4cCI6MjA4NjQ5OTQ3OH0.QjZieMxaHbz1sIH-VeoQbz-v8AuZmcusRVQ2G1HC9h0';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const familyEmojis = ["👩👔", "🎤︎︎", "📐", "🍴"];
    let isEditing = false;
    let isEditingLimpieza = false;

const editCocina = document.getElementById("edit-cocina");
const emojiBoxes = document.querySelectorAll(".profile-emojis");
const editLimpieza = document.getElementById("edit-limpieza");
const cleaningGrid = document.getElementById("cleaning-grid");

// LOGIC //
function updateSlotInHTML(dayName, slotName, emojiValue) {
    const selector = `.profile-emojis[data-day="${dayName}"][data-slot="${slotName}"]`;
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = emojiValue;
    }
}

async function loadSchedule() {
    const { data, error } = await db
        .from('Cocina')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error loading:", error);
        return;
    }
    data.forEach(row => {
        updateSlotInHTML(row.day, 'slot1', row.slot1);
        updateSlotInHTML(row.day, 'slot2', row.slot2);
        updateSlotInHTML(row.day, 'slot3', row.slot3);
    });
}

async function saveEmojiToDB(dayName, slotName, newEmoji) {
    const { error } = await db
        .from('Cocina')
        .update({ [slotName]: newEmoji })
        .eq('day', dayName);

    if (error) console.error("Error saving:", error);
}

function switchTab(tabName) {
    const tabContent = document.querySelectorAll(".tab-content");
    tabContent.forEach(tab => tab.style.display = "none");
    
    const target = document.getElementById(tabName);
    if (target) {
    target.style.display = "block";
    }
}

    editCocina.addEventListener("click", () => {
        isEditing = !isEditing;

        if (isEditing) {
            editCocina.textContent = "Guardar";
            document.body.classList.add("editing");
        }else{
            editCocina.textContent = "⚙️";
            document.body.classList.remove("editing");
        }
    });

    emojiBoxes.forEach(box => {
        box.addEventListener("click", async() => {
            if (!isEditing) return;

            const currentEmoji = box.textContent.trim();
            let index = familyEmojis.indexOf(currentEmoji);
            index = (index + 1) % familyEmojis.length;
            const nextEmoji = familyEmojis[index];

            box.textContent = nextEmoji;

            const day = box.getAttribute('data-day');
            const slot = box.getAttribute('data-slot');

            await saveEmojiToDB(day, slot, nextEmoji);
        });
    });

loadSchedule();

// CLEANING SCHEDULE SECTION //
editLimpieza.addEventListener("click", () => {
    isEditingLimpieza = !isEditingLimpieza;
    
    if (isEditingLimpieza) {
        editLimpieza.textContent = "Guardar";
        cleaningGrid.classList.add("editing");
    }else{
        editLimpieza.textContent = "⚙️";
        cleaningGrid.classList.remove("editing");
    }
});

async function loadCleaningSchedule() {
    const { data, error } = await db
        .from('Cleaning_Schedule')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error loading schedule:", error);
        return;
    }
    cleaningGrid.innerHTML = '';

    data.forEach(row => {
        console.log("Row Data:", row);
        const roomTitle = row.Room || row.name || "Unnamed Room";
        const rowHTML = `
            <div class="glass-card">
                <h3 class="glass-card-titles">${roomTitle}</h3>
                <div class="cleaning-slots">
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">Lun</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="mon">${row.mon || "⚪"}</div>
                </div>
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">Mie</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="wed">${row.wed || "⚪"}</div>
                </div>
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">Vie</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="fri">${row.fri || "⚪"}</div>
                </div>
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">Dom</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="sun">${row.sun || "⚪"}</div>
                </div>
            </div>
        `;
        cleaningGrid.innerHTML += rowHTML;
    });
}

cleaningGrid.addEventListener('click', async (event) => {
    if (!isEditingLimpieza) return;

    const clickedSlot = event.target.closest('.clean-slot');
    if (!clickedSlot) return;

    const currentEmoji = clickedSlot.textContent.trim();
    let index = familyEmojis.indexOf(currentEmoji);
    if (index === -1) index = 0;

    const nextEmoji = familyEmojis[(index + 1) % familyEmojis.length];
    clickedSlot.textContent = nextEmoji;

    const roomId = clickedSlot.dataset.id;
    const column = clickedSlot.dataset.col;
    const { error } = await db
        .from('Cleaning_Schedule')
        .update({ [column]: nextEmoji })
        .eq('id', roomId);
    if (error) console.error("Save failed:", error);
});
loadCleaningSchedule();