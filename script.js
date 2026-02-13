// DATABASE CONFIGURATION //
// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ynlrzypirbdswfngnwvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlubHJ6eXBpcmJkc3dmbmdud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjM0NzgsImV4cCI6MjA4NjQ5OTQ3OH0.QjZieMxaHbz1sIH-VeoQbz-v8AuZmcusRVQ2G1HC9h0';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const familyEmojis = ["👩", "🎤︎︎", "📐", "👔"];
    let isEditing = false;

const editCocina = document.getElementById("edit-cocina");
const emojiBoxes = document.querySelectorAll(".profile-emojis");

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
// FUNCTION TO SWITCH BETWEEN TABS //
function switchTab(tabName) {
    const tabContent = document.querySelectorAll(".tab-content");
    tabContent.forEach(tab => tab.style.display = "none");
    
    const target = document.getElementById(tabName);
    if (target) {
    target.style.display = "block";
    }
}
// END OF FUNCTION TO SWITCH BETWEEN TABS //

// FUNCTION TO EDIT COOKING TASKS //
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
// END OF FUNCTION TO EDIT COOKING TASKS //
loadSchedule();