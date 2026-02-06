



function switchTab(tabName) {
    var i, tabContent, tabLinks;

    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    
    tabLinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function updateProgressBar(elementId, current, goal) {
    const bar = document.getElementById(elementId);
    if (!bar) return;

    // Calculate percentage
    let percentage = (current / goal) * 100;

    // Constrain between 0 and 100
    percentage = Math.max(0, Math.min(percentage, 100));

    // Update the width - the CSS 'transition' handles the animation!
    bar.style.width = percentage + "%";
}

// How you use it:
updateProgressBar('budgetProgressBar', totalSpent, currentBudget);
updateProgressBar('savingsProgressBar', currentSavings, savingsGoal);
