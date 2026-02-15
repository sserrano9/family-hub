
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

// RESTAURANTS SECTION //
document.getElementById('rest-add-btn').addEventListener('click', async () => {
    const nameValue = document.getElementById('rest-name-input').value;
    const linkValue = document.getElementById('rest-link-input').value;
    const zoneValue = document.getElementById('rest-zone-input').value;
    const priceValue = document.getElementById('rest-price').value;
    const foodValue = document.getElementById('rest-type').value;

    if (!nameValue) return alert("Please enter a name!");

    const { error } = await db
        .from('Restaurants')
        .insert([
            {
                // Column Name : Variable Name
                name: nameValue,
                link: linkValue,
                zone: zoneValue,
                price: priceValue,
                food_type: foodValue,
            }
        ]);
        if (error) {
        console.error("Error saving:", error);
        alert("Could not save restaurant.");
        }else{
            console.log("Restaurant saved!");
            document.getElementById('rest-name-input').value = '';
            document.getElementById('rest-link-input').value = '';
            document.getElementById('rest-zone-input').value = '';
            document.getElementById('rest-price').value = '';
            document.getElementById('rest-type').value = '';
            loadRestaurants();
        }
    });

async function loadRestaurants() {
    const { data, error } = await db
        .from('Restaurants')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error loading schedule:", error);
        return;
    }

    const container = document.getElementById('restaurants-list');
    container.innerHTML = '';

    data.forEach(row => {
        const restHTML = `
        <div class="glass-card">
                <h3 class="glass-card-titles">${row.name}</h3>
                <p>📍 ${row.zone}</p>
                <p>$ ${row.price}</p> 
                <p>Tipo: ${row.food_type}</p>
                <a href="${row.link}" target="_blank">Ver Mapa/Link</a>
            </div>
        `;
        container.innerHTML += restHTML;
    });
}

// RECIPES SECTION //
document.getElementById('recipe-add-btn').addEventListener('click', async () => {
    const RecNameValue = document.getElementById('recipe-name-input').value;
    const RecLinkValue = document.getElementById('recipe-link-input').value;
    const RecTypeValue = document.getElementById('recipe-type-input').value;

    if (!RecNameValue) return alert("Please enter a name!");

    const { error } = await db
        .from('Recetas')
        .insert([
            {
                // Column Name : Variable Name
                name: RecNameValue,
                link: RecLinkValue,
                rec_type: RecTypeValue,
            }
        ]);
        if (error) {
        console.error("Error saving:", error);
        alert("Could not save restaurant.");
        }else{
            console.log("Recipe saved!");
            document.getElementById('recipe-name-input').value = '';
            document.getElementById('recipe-link-input').value = '';
            document.getElementById('recipe-type-input').value = '';
            loadRecetas();
        }
    });

async function loadRecetas() {
    const { data, error } = await db
        .from('Recetas')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error loading:", error);
        return;
    }

    const container = document.getElementById('recipes-list');
    container.innerHTML = '';

    data.forEach(row => {
        const recetasHTML = `
        <div class="glass-card">
                <h3 class="glass-card-titles">${row.name}</h3>
                <p>Tipo: ${row.rec_type}</p>
                <a href="${row.link}" target="_blank">Ver Mapa/Link</a>
            </div>
        `;
        container.innerHTML += recetasHTML;
    });
}
