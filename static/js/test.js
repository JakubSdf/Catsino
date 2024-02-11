







// Identify action to be performed
let actionToPerform = '';

// Handle "Reset Money" button click
document.getElementById('reset-money-btn').addEventListener('click', function() {
    actionToPerform = 'reset';
    document.getElementById('confirmation-message').textContent = "Are you sure you want to reset your money to the default amount?";
    document.getElementById('confirmation-dialog').classList.add('show');
    start();
});

// Handle "Clear History" button click
document.getElementById('clear-history-btn').addEventListener('click', function() {
    actionToPerform = 'clear';
    document.getElementById('confirmation-message').textContent = "Are you sure you want to clear the history?";
    document.getElementById('confirmation-dialog').classList.add('show');
});

// Confirm action
function start(){
    document.getElementById('confirm-action').addEventListener('click', function() {
        
        if (actionToPerform === 'reset') {
            console.log("Reset Money")
            resetMoney();
        } else if (actionToPerform === 'clear') {
            clearHistory();
        }
        document.getElementById('confirmation-dialog').classList.remove('show');
    });

    // Cancel action
    document.getElementById('cancel-action').addEventListener('click', function() {
        document.getElementById('confirmation-dialog').classList.remove('show');
        actionToPerform = ''; // Reset action
    });
}
// Function to reset money
function resetMoney() {
    
    fetch('/reset_money', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Your money has been reset."); // Consider implementing a more styled notification
            window.location.reload(); // Reload to reflect the change
        } else {
            alert("There was an issue resetting your money."); // Consider a more styled notification
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to clear history
function clearHistory() {
    fetch('/clear_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Your history has been cleared."); // Consider implementing a more styled notification
            window.location.reload(); // Reload to reflect the change
        } else {
            alert("There was an issue clearing the history."); // Consider a more styled notification
        }
    })
    .catch(error => console.error('Error:', error));
}
