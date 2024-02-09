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
    placeBetButton.addEventListener('click', function () {
        if (!gameStarted) {
            placeBetButton.disabled = false;
            betAmount = parseFloat(betAmountInput.value);
            if (isNaN(betAmount) || betAmount <= 0) {
            } else {
                placeBetButton.disabled = true;
                placeBetButton.style.backgroundColor = 'grey';
                betAmountInput.disabled = true;
                document.querySelector('label[for="bet-amount"]').textContent = `Vsazeno: ₵ ${betAmount.toFixed(2)}`;
                betPlaced = true;
            }
        }
    });

    // Event listener for cashing out
    cashOutButton.addEventListener('click', function () {
        if (gameStarted && betPlaced) {
            cashOutButton.disabled = true;
            cashOutButton.style.backgroundColor = 'grey';
            gameContent.style.opacity = 1;
            gameContent.textContent = 'Vyplatil si v x' + currentMultiplier.toFixed(2) + ' a vyhrál ₵' + (betAmount * currentMultiplier).toFixed(2);
        }
    });

    // Event listener for bet amount input
    betAmountInput.addEventListener('input', function () {
        betAmountInput.value = betAmountInput.value.replace(/[^0-9.]/g, '');
    });
});
