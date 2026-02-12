

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
                saveData();
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