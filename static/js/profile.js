document.getElementById('reset-money-btn').addEventListener('click', function() {
    document.getElementById('money-confirmation-dialog').classList.add('show'); // Show the dialog using class
});

document.getElementById('money-confirm-reset').addEventListener('click', function() {
    // Proceed with the reset
    fetch('/reset_money', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload(); // Reload to reflect the change
        } else {
            alert("There was an issue resetting your money."); // Or implement a more styled notification
        }
    })
    .catch(error => console.error('Error:', error));
    document.getElementById('money-confirmation-dialog').classList.remove('show'); // Hide the dialog
});

document.getElementById('money-cancel-reset').addEventListener('click', function() {
    document.getElementById('money-confirmation-dialog').classList.remove('show'); // Hide the dialog without resetting
});


document.getElementById('reset-history-btn').addEventListener('click', function() {
    document.getElementById('history-confirmation-dialog').classList.add('show'); // Show the dialog using class
});

document.getElementById('history-confirm-reset').addEventListener('click', function() {
    // Proceed with the reset
    fetch('/reset_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload(); // Reload to reflect the change
        } else {
            alert("There was an issue resetting your history."); // Or implement a more styled notification
        }
    })
    .catch(error => console.error('Error:', error));
    document.getElementById('history-confirmation-dialog').classList.remove('show'); // Hide the dialog
});

document.getElementById('history-cancel-reset').addEventListener('click', function() {
    document.getElementById('history-confirmation-dialog').classList.remove('show'); // Hide the dialog without resetting
});