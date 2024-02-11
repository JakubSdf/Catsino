document.addEventListener('DOMContentLoaded', function () {
    const presetButtons = document.querySelectorAll('.preset');
    const multiplierValue = document.getElementById('multiplier-value');
    const betAmountInput = document.getElementById('bet-amount');
    const placeBetButton = document.getElementById('place-bet');
    const cashOutButton = document.getElementById('cash-out');
    const countdown = document.getElementById('countdown');
    const gameContent = document.getElementById('game-content');
    const multiplierHistory = document.getElementById('multiplier-history');

    let gameStarted = false;
    let currentMultiplier = 1.00;
    let betAmount = 0;
    let gameInterval;
    let countdownTime = 10;
    let countdownInterval;
    let speedUpInterval;
    let betPlaced = false;
    let historyData = []; // Array to store multiplier history
    countdownIntervalFnc();

    
    window.updateBalance = function() {
        fetch('/get_balance')
            .then(response => response.json())
            .then(data => {
                if(data.balance !== undefined) {
                    document.getElementById('balance').textContent = `${data.balance}`;
                }
            })
            .catch(error => console.error('Error fetching balance:', error));
    }

    function generateCrashPoint() {
        const min = 1; // Minimum crash point
        const lambda = 1; // Adjust the lambda value to control the distribution
    
        let crashPoint;
    
        // Generate a random value to occasionally set the crash point to 1.01
        const randomValue = Math.random();
    
        if (randomValue < 0.1) { // 5% chance of getting 1.01
            crashPoint = 1.00;
        } else {
            do {
                const random = Math.random();
    
                // Using an exponential function to favor lower values
                crashPoint = -Math.log(1 - random) / lambda;
            } while (crashPoint <= 1.00); // Ensure crash point is higher than 1.01
        }
    
        return crashPoint;
            
    }

    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            countdown.textContent = 'Hra probíhá...';
            gameContent.style.opacity = 0;

            const crashPoint = generateCrashPoint();
            console.log(crashPoint);

            let increment = 0.001; // Starting with a slower increment

            gameInterval = setInterval(function () {
                currentMultiplier += increment;
                multiplierValue.textContent = `x${currentMultiplier.toFixed(2)}`;

                if (currentMultiplier >= crashPoint) {
                    clearInterval(gameInterval);
                    clearInterval(speedUpInterval); // Stop the speedup interval
                    gameStarted = false;
                    multiplierValue.textContent = `Crasnuto na x${currentMultiplier.toFixed(2)}`;
                    historyData.push(currentMultiplier.toFixed(2)); // Add the crashed multiplier to history
                    displayMultiplierHistory();
    
                    // Restoring button and input field states
                    placeBetButton.disabled = false;
                    placeBetButton.style.backgroundColor = '#4CAF50';
                    betAmountInput.disabled = false;
                    document.querySelector('label[for="bet-amount"]').textContent = `Vsazeno:`;
                    cashOutButton.disabled = false;
                    cashOutButton.style.backgroundColor = '#F44336';
    
                    // Handling game outcome display
                    if (betAmount.toFixed(2) > 0.00 && gameContent.textContent === 'Game Content') {
                        gameContent.textContent = 'Prohrál jsi ₵' + betAmount.toFixed(2);
                        gameContent.style.opacity = 1;
                    }
    
                    // Clear bet amount and reset variables
                    document.getElementById('bet-amount').value = '';
                    betPlaced = false;
                    countdownTime = 10;
                    countdownIntervalFnc();
    
                    // Display multiplier history
                    displayMultiplierHistory();
                }
                increment *= 1.02; // Multiply the increment for exponential growth
            }, 100);

            speedUpInterval = setInterval(function () {
                currentMultiplier += 0.001; // Maintain a steady increase
                multiplierValue.textContent = `x${currentMultiplier.toFixed(2)}`;
            }, 100);
        
        }
    }

    function countdownIntervalFnc() {
        countdownInterval = setInterval(function () {
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                currentMultiplier = 1.00;
                startGame();
            } else {
                countdown.textContent = `Hra začne za: ${countdownTime} sekund`;
                countdownTime--;
            }
        }, 1000);
    }

    function displayMultiplierHistory() {
        multiplierHistory.innerHTML = '';

        const lastTenMultipliers = historyData.slice(-10).reverse(); // Retrieve the last ten multipliers and reverse the order

        lastTenMultipliers.forEach(function (multiplier, index) {
            const li = document.createElement('li');
            li.textContent = `x${multiplier}`;
            if (index === 0) {
                li.textContent += ' (Poslední)';
            }
            multiplierHistory.appendChild(li);
        });
    }

    // Event listener for preset buttons
    presetButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            if (!gameStarted && !betPlaced) {
                // Use a regular expression to extract numbers from the button text
                const value = button.textContent.match(/\d+/); // Match digits
                if (value) {
                    betAmountInput.value = value[0]; // Set only the first matched group of digits
                }
            }
        });
    });

    // Event listener for placing a bet
    // Find this part in your crash.js
        placeBetButton.addEventListener('click', function () {
        if (!gameStarted) {
            betAmount = parseFloat(betAmountInput.value);
            if (isNaN(betAmount) || betAmount <= 0) {
                // You might want to alert the user or handle this case more gracefully
                alert("Please enter a valid bet amount");
            } else {
                // Disable bet-related UI elements to prevent multiple submissions
                placeBetButton.disabled = true;
                placeBetButton.style.backgroundColor = 'grey';
                betAmountInput.disabled = true;

                // Send the bet amount to the backend
                fetch('/bet/crash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=place_bet&bet_amount=${betAmount}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        betPlaced = true;
                        // Update the UI to reflect the new balance or any other messages
                        // For now, let's just log the new balance
                        console.log("New balance:", data.new_balance);
                        updateBalance();
                        // Here you could also start the game or update any relevant UI elements
                    } else {
                        // Handle errors, such as insufficient funds or not logged in
                        alert(data.error);
                        // Re-enable the UI for correcting the bet or logging in
                        placeBetButton.disabled = false;
                        placeBetButton.style.backgroundColor = '#4CAF50';
                        betAmountInput.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Re-enable the UI in case of network error or other failure
                    placeBetButton.disabled = false;
                    placeBetButton.style.backgroundColor = '#4CAF50';
                    betAmountInput.disabled = false;
                });
            }
        }
        });
        
    // Event listener for cashing out
    cashOutButton.addEventListener('click', function () {
        console.log('Cashing out 1');
        console.log(gameStarted, betPlaced);
        if (gameStarted && betPlaced) {
            // Disable the cash out button to prevent multiple submissions
            console.log("Cashing out 2");
            cashOutButton.disabled = true;
            cashOutButton.style.backgroundColor = 'grey';
    
            // Assuming you have a way to get the currentMultiplier
            let currentMultiplierValue = currentMultiplier;  // This should be the current value of the multiplier when cashing out
    
            // Send the cash out request to the backend
            fetch('/bet/crash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=cash_out&bet_amount=${betAmount}&multiplier=${currentMultiplierValue}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the UI to reflect the new balance
                    console.log("New balance after cash out:", data.new_balance);
                    updateBalance();
                    // Here, update the UI to show the user their new balance and any winnings
                    gameContent.style.opacity = 1;
                    gameContent.textContent = `Vyplatil si v x${currentMultiplierValue.toFixed(2)} a vyhrál ₵ ${(betAmount * currentMultiplierValue).toFixed(2)}`;
                    // Reset UI and game state as needed
                } else {
                    // Handle errors
                    alert(data.error);
                    // Optionally re-enable the cash out button if you want to allow retries
                    cashOutButton.disabled = false;
                    cashOutButton.style.backgroundColor = '#F44336';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Re-enable the cash out button in case of network error or other failure
                cashOutButton.disabled = false;
                cashOutButton.style.backgroundColor = '#F44336';
            });
        }
    });
    

    // Event listener for bet amount input
    betAmountInput.addEventListener('input', function () {
        betAmountInput.value = betAmountInput.value.replace(/[^0-9.]/g, '');
    });
});


