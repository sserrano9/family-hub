
const SUPABASE_URL = 'https://ynlrzypirbdswfngnwvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlubHJ6eXBpcmJkc3dmbmdud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjM0NzgsImV4cCI6MjA4NjQ5OTQ3OH0.QjZieMxaHbz1sIH-VeoQbz-v8AuZmcusRVQ2G1HC9h0';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const familyEmojis = ["👩👔", "🎤︎︎", "📐", "🍴"];
const cleaningEmojis = ["👩", "👔", "🎤︎︎", "📐"];
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

// Grocery Categories Section //

let selectedFqy = 'one-time'; 
const freqButtons = document.querySelectorAll('.pantry-freq');
freqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedFqy = btn.dataset.value;
        freqButtons.forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
    });
});

document.getElementById('pantry-add-btn').addEventListener('click', async () => {
    const pantryProduct = document.getElementById('pantry-product').value;
    const pantryCat = document.getElementById('pantry-cat').value;
    const pantryQty = document.getElementById('pantry-qty').value;
    const pantryUnit = document.getElementById('pantry-unit').value;
    // const pantryExpy = document.getElementById('pantry-expy').value;
    const pantryCost = document.getElementById('pantry-cost').value;
    // const pantryStatus = document.getElementById('pantry-status').value;

    if (!pantryProduct) return alert("Please enter a product!");

    const { error } = await db
        .from('Groceries')
        .insert([
            {
                product: pantryProduct.trim(),
                category: pantryCat,
                qty: parseFloat(pantryQty) || 0,
                unit: pantryUnit,
                frequency: selectedFqy,
                // expy: parseInt(pantryExpy) || 0,
                cost: parseFloat(pantryCost) || 0,
                // status: pantryStatus,
            }
        ]);
        if (error) {
        console.error("Error saving:", error);
        alert("Could not save product.");
        }else{
            console.log("Product saved!");
            document.getElementById('pantry-product').value = '';
            document.getElementById('pantry-cat').value = '';
            document.getElementById('pantry-qty').value = '';
            document.getElementById('pantry-unit').value = '';
            // document.getElementById('pantry-expy').value = '';
            document.getElementById('pantry-cost').value = '';
            // document.getElementById('pantry-status').value = '';
            loadGroceries();
        }
        selectedFqy = 'one-time';
        freqButtons.forEach(b => b.classList.remove('active-filter'));
    });

async function loadGroceries() {
    const { data, error} = await db
    .from('Groceries')
        .select('*')
        .order('product', { ascending: true });
    if (error){
        console.error("Error loading groceries:", error);
        return;
    }
    const groceryContainer = document.getElementById('grocery-list-container');
    groceryContainer.innerHTML = "";
    let grandTotal = { weekly: 0, monthly: 0 };
    let catTotals = {};
    data.forEach(row=>{
        const qty = parseFloat(row.qty) || 0;
        const cost = parseFloat(row.cost) || 0;
        const baseCost = cost * qty;

        let itemWeekly = 0;
        let itemMonthly = 0;

        if (row.frequency === 'semanal') {
            itemWeekly = baseCost;
            itemMonthly = baseCost * 4.3;
        } else {
            itemMonthly = baseCost;
            itemWeekly = baseCost / 4.3;
        }
        grandTotal.weekly += itemWeekly;
        grandTotal.monthly += itemMonthly;

        if (!catTotals[row.category]) {
            catTotals[row.category] = { weekly: 0, monthly: 0 };
        }

        catTotals[row.category].weekly += itemWeekly;
        catTotals[row.category].monthly += itemMonthly;

        const GroceryHtml = `
            <div class="glass-card-infill grocery-item-card collapsed" data-category="${row.category}">
                <div class="card-header glass-card-titles minimized" onclick="toggleProd(this)">
                    <div class="secondary-glass-card-titles-text">${row.product}</div>
                    <div class="qty-badge">${row.qty} ${row.unit}</div>
                </div>
                <div class="prod-body">
                    <p><strong>Cost:</strong> $${baseCost.toFixed(2)} / ${row.frequency === 'semanal' ? 'wk' : 'mo'}</p>
                    <p><strong>Expires:</strong> ${row.expy} days</p>
                    <div class="status-indicator">Status: ${row.status || 'Available'}</div>
                </div>
            </div>
        `;
        groceryContainer.innerHTML += GroceryHtml;
    });

    const globalWk = document.getElementById('global-weekly-total');
    const globalMo = document.getElementById('global-monthly-total');
    if (globalWk) globalWk.innerText = `$${grandTotal.weekly.toFixed(2)}`;
    if (globalMo) globalMo.innerText = `$${grandTotal.monthly.toFixed(2)}`;
    for (const [catName, totals] of Object.entries(catTotals)) {
        const btnId = `${catName}-total`;
        const btnElement = document.getElementById(btnId); 
        if (btnElement) {
            const priceTag = btnElement.querySelector('.cat-price');
            if (priceTag) {
                priceTag.innerHTML = `
                <strong>$${totals.monthly.toFixed(0)}/mo</strong>
                <br><span style="font-size: 0.8em; opacity: 0.8;">$${totals.weekly.toFixed(0)}/wk</span>
                `;
        }
    }
}
const budgetLimit = 2500;
const otherExpenses = 0;
const finalTotal = grandTotal.monthly + otherExpenses;
const usagePercentage = (finalTotal/budgetLimit)*100;
const budgetDisplay = document.getElementById('budgetDisplay');
const budgetBar = document.getElementById('budgetProgressBar');

if (budgetDisplay) {
    budgetDisplay.innerText = `$${finalTotal.toFixed(0)} / $${budgetLimit}`;
    }
if (budgetBar) {
    budgetBar.style.width = `${Math.min(usagePercentage, 100)}%`;
if (usagePercentage > 100) {
            budgetBar.style.backgroundColor = '#ff4d4d'; // Red (Danger)
            budgetBar.style.boxShadow = '0 0 10px #ff4d4d'; // Optional Glow
        } else if (usagePercentage > 85) {
            budgetBar.style.backgroundColor = '#ffae00'; // Orange (Warning)
            budgetBar.style.boxShadow = 'none';
        } else {
            budgetBar.style.backgroundColor = 'var(--main-accent, #4caf50)'; // Green (Safe)
            budgetBar.style.boxShadow = 'none';
        }
}
}

function toggleProd(headerElement) {
    const ProdCard = headerElement.parentElement;
    ProdCard.classList.toggle('collapsed');
}

function CatSwitchTab(categoryName) {
    currentView = categoryName;
    const groceryItems = document.querySelectorAll('.grocery-item-card');
    groceryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category').trim();
        document.getElementById('groceries-summary').style.display = 'none';
        document.getElementById('groceries-input').style.display = 'none';
        document.getElementById('groceries-grid').style.display = 'none';
        document.getElementById('selected-category').style.display = 'block';
        if (itemCategory === categoryName){
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
loadGroceries();
function goBack() {
    document.getElementById('groceries-summary').style.display = 'block';
    document.getElementById('groceries-input').style.display = 'block';
    document.getElementById('groceries-grid').style.display = 'grid';
    document.getElementById('selected-category').style.display = 'none';
}
    


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
            <div class="glass-card-infill">
                <h3 class="glass-card-titles">${roomTitle}</h3>
                <div class="cleaning-slots">
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">L</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="mon">${row.mon || "⚪"}</div>
                </div>
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">M</span>
                    <div class="clean-slot" data-id="${row.id}" data-col="wed">${row.wed || "⚪"}</div>
                </div>
                <div class="flex-container-vertical">
                    <span class="glass-card-titles">D</span>
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
    let index = cleaningEmojis.indexOf(currentEmoji);
    if (index === -1) index = 0;

    const nextEmoji = cleaningEmojis[(index + 1) % cleaningEmojis.length];
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
        <div class="glass-card-infill collapsed">
            <div class="glass-card-titles minimized" onclick="toggleRest(this)">
                <h3 class="secondary-glass-card-titles-text">${row.name}</h3>
                <button class="flechita">➕</button>
            </div>
            <div class="rest-body">
                <p>📍 ${row.zone}</p>
                <p>$ ${row.price}</p> 
                <p>Tipo: ${row.food_type}</p>
                <a href="${row.link}" target="_blank">Ver Mapa/Link</a>
            </div>
            </div>
        `;
        container.innerHTML += restHTML;
    });
}

function toggleRest(headerElement) {
    const RestCard = headerElement.parentElement;
    RestCard.classList.toggle('collapsed');
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
                <h3 class="glass-card-titles-text">${row.name}</h3>
                <p>Tipo: ${row.rec_type}</p>
                <a href="${row.link}" target="_blank">Ver Mapa/Link</a>
            </div>
        `;
        container.innerHTML += recetasHTML;
    });
}

loadRestaurants();
loadRecetas();

// WISHLIST SECTION //
document.getElementById('wish-add-btn').addEventListener('click', async () => {
    const WishItemValue = document.getElementById('wish-item-input').value;
    const WishLinkValue = document.getElementById('wish-link-input').value;
    const WishUrgValue = document.getElementById('wish-urgency').value;
    const WishPriceValue = document.getElementById('wish-price').value;
    const WishPersValue = document.getElementById('wish-person').value;
    const WishStatValue = document.getElementById('wish-status').value;

    if (!WishItemValue) return alert("Please enter an item!");

    const { error } = await db
        .from('Wishlist')
        .insert([
            {
                // Column Name : Variable Name
                item: WishItemValue,
                link: WishLinkValue,
                urgency: WishUrgValue,
                price: WishPriceValue,
                person: WishPersValue,
                status: WishStatValue
            }
        ]);
        if (error) {
        console.error("Error saving:", error);
        alert("Could not save wish.");
        }else{
            console.log("Wish saved!");
            document.getElementById('wish-item-input').value = '';
            document.getElementById('wish-link-input').value = '';
            document.getElementById('wish-urgency').value = '';
            document.getElementById('wish-price').value = '';
            document.getElementById('wish-person').value = '';
            document.getElementById('wish-status').value = '';
            loadWishlist();
        }
    });

async function loadWishlist() {
    const { data, error } = await db
        .from('Wishlist')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error loading wishlist:", error);
        return;
    }

    const container = document.getElementById('wish-list');
    container.innerHTML = '';

    data.forEach(row => {
        const wishHTML = `
        <div class="glass-card-infill wish-boxes collapsed" data-person="${row.person}">
            <div class="glass-card-titles minimized" onclick="toggleWish(this)">
                <h3 class="secondary-glass-card-titles-text">${row.item}</h3>
                <button class="flechita">➕</button>
            </div>
            <div class="wish-body">
                <p>📍 ${row.person}</p>
                <p>$ ${row.price}</p> 
                <p>Urg: ${row.urgency}</p>
                <a href="${row.link}" target="_blank">Ver Mapa/Link</a>
                <p>Status: ${row.status}</p>
            </div>    
            </div>
        `;
        container.innerHTML += wishHTML;
    });
}
loadWishlist();

//Filters//
const filterButtons = document.querySelectorAll('.filter-buttons');
filterButtons.forEach (filterButton => {
    filterButton.addEventListener('click', () => {
        const nameClicked = filterButton.innerText;
        const wishBoxes = document.querySelectorAll(".wish-boxes");
        if (filterButton.classList.contains('active-filter')){
            filterButton.classList.remove('active-filter');
            wishBoxes.forEach(wishBox => wishBox.style.display = 'block');
        }else{
            filterButtons.forEach(b=>b.classList.remove('active-filter'));
            filterButton.classList.add('active-filter');
            wishBoxes.forEach(wishBox=>{
                const wishOwner = wishBox.getAttribute('data-person');
                if (wishOwner === nameClicked){
                    wishBox.style.display = 'block';
                }else{
                    wishBox.style.display = 'none';
                }
            });
        }
    });   
});

function toggleWish(headerElement) {
    const card = headerElement.parentElement;
    card.classList.toggle('collapsed');
}


