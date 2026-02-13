// DATABASE CONFIGURATION //
// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ynlrzypirbdswfngnwvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlubHJ6eXBpcmJkc3dmbmdud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjM0NzgsImV4cCI6MjA4NjQ5OTQ3OH0.QjZieMxaHbz1sIH-VeoQbz-v8AuZmcusRVQ2G1HC9h0';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// --- LOAD DATA ---
async function loadSchedule() {
    // Get all rows, ordered by ID (so Monday stays first)
    const { data, error } = await supabase
        .from('Cocina')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error loading:", error);
        return;
    }
    // Now, loop through the data and update your HTML
    data.forEach(row => {
        // This assumes your HTML rows have IDs like "row-1", "row-2"
        // OR you can use the loop index if your HTML order matches the DB order perfectly.
        
        // Example: Update the slots for this specific day
        updateSlotInHTML(row.day, 'slot1', row.slot1);
        updateSlotInHTML(row.day, 'slot2', row.slot2);
        updateSlotInHTML(row.day, 'slot3', row.slot3);
    });
}
// --- SAVE DATA --- //
async function updateEmoji(dayName, slotName, newEmoji) {
    const { error } = await supabase
        .from('Cocina')
        .update({ [slotName]: newEmoji }) // e.g. { slot1: "⚽" }
        .eq('day', dayName); // Update the row where day is "Lunes"

    if (error) console.error("Error saving:", error);
}
loadSchedule();
// END OF DATABASE CONFIGURATION //

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
    const familyEmojis = ["👩", "🎤︎︎", "📐", "👔"];
    let isEditing = false;

    const editCocina = document.getElementById("edit-cocina");
    const emojiBoxes = document.querySelectorAll(".profile-emojis");

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
            box.addEventListener("click", () => {
                if (!isEditing) return;

                const currentEmoji = box.textContent;
                let index = familyEmojis.indexOf(currentEmoji);

                index = (index + 1) % familyEmojis.length;

                box.textContent = familyEmojis[index];
            });
        });
// END OF FUNCTION TO EDIT COOKING TASKS //