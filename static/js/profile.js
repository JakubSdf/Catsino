document.getElementById('reset-money-btn').addEventListener('click', function() {
    document.getElementById('money-confirmation-dialog').classList.add('show');
});

document.getElementById('money-confirm-reset').addEventListener('click', function() {
    fetch('/reset_money', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert("There was an issue resetting your money."); 
        }
    })
    .catch(error => console.error('Error:', error));
    document.getElementById('money-confirmation-dialog').classList.remove('show'); 
});

document.getElementById('money-cancel-reset').addEventListener('click', function() {
    document.getElementById('money-confirmation-dialog').classList.remove('show'); 
});


document.getElementById('reset-history-btn').addEventListener('click', function() {
    document.getElementById('history-confirmation-dialog').classList.add('show'); 
});

document.getElementById('history-confirm-reset').addEventListener('click', function() {
   
    fetch('/reset_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload(); 
        } else {
            alert("There was an issue resetting your history."); 
        }
    })
    .catch(error => console.error('Error:', error));
    document.getElementById('history-confirmation-dialog').classList.remove('show');
});

document.getElementById('history-cancel-reset').addEventListener('click', function() {
    document.getElementById('history-confirmation-dialog').classList.remove('show'); 
});