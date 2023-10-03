// Get references to HTML elements
const betAmountElement = document.getElementById('betAmount');
const betInput = document.getElementById('betInput');
const multiplierElement = document.getElementById('multiplier');
const placeBetButton = document.getElementById('placeBet');
const cashOutButton = document.getElementById('cashOut');
const resultText = document.getElementById('result');
const rocket = document.getElementById('rocket');


// Variables for game state
const initialRocketPosition = 0; // Adjust this value to match your CSS starting position
let isRunning = false;
let betAmount = 0;
let multiplier = 1.00; // Start at 1.00
let crashThreshold;
let speed = 0.002; // Initial speed (adjust as needed)
let intervalId;

// Event listener for the "Place Bet" button
placeBetButton.addEventListener('click', () => {
    if (!isRunning) {
        // Reset the game if it's not running
        resetGame();
        betAmount = parseFloat(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            alert('Please enter a valid bet amount greater than 0.');
            return;
        }

        betAmountElement.textContent = `$${betAmount.toFixed(2)}`;
        placeBetButton.disabled = true;
        cashOutButton.disabled = false;
        intervalId = startGame();
    } else {
        // Handle game reset when "Place Bet" is clicked again
        resetGame();
    }
});

// Event listener for the "Cash Out" button
cashOutButton.addEventListener('click', () => {
    if (isRunning) {
        const payout = betAmount * multiplier;
        if (multiplier >= crashThreshold) {
            endGame(true);
        } else {
            endGame(false, payout);
        }
        clearInterval(intervalId);
    }
});

// Function to start the game
function startGame() {
    isRunning = true;
    crashThreshold = getRandomCrashThreshold(4.00, 50.00);
    updateRocketPosition(1);

    return setInterval(() => {
        updateGame();
        if (multiplier < 50.00) { // End at 50.00
            multiplier += speed; // Increment the multiplier by the current speed
            multiplierElement.textContent = `${multiplier.toFixed(2)}x`;
            // Gradually increase the speed as the game progresses
            if (speed < 0.3) {
                speed += 0.0003; // Adjust the increment value for speed
            }
            
            // Check if the multiplier has reached or exceeded the crash threshold
            if (multiplier >= crashThreshold) {
                endGame(true);
                clearInterval(intervalId);
            }
        } else {
            clearInterval(intervalId);
            endGame(true);
        }
    }, 100);
    
}

// Function to end the game and display the result
function endGame(isAutomaticLoss = false, payout = 0) {
    isRunning = false;
    if (isAutomaticLoss) {
        const loss = betAmount;
        resultText.textContent = `You crashed and lost $${loss.toFixed(2)}`;
    } else {
        resultText.textContent = `You cashed out and won $${payout.toFixed(2)}`;
    }
    placeBetButton.disabled = false;
    cashOutButton.disabled = true;
}


function resetGame() {
    isRunning = false;
    betAmount = 0;
    multiplier = 1.00;
    speed = 0.002;
    clearInterval(intervalId);
    betAmountElement.textContent = '$0.00';
    multiplierElement.textContent = '1.00x';
    resultText.textContent = '';
    placeBetButton.disabled = false;
    cashOutButton.disabled = true;
    rocket.style.bottom = `${initialRocketPosition}px`;
    document.getElementById('graph').classList.remove('zoom');
    setTimeout(() => {
        document.getElementById('graph').classList.add('zoom');
    }, 100);
}


/* JavaScript to update rocket position */


// Function to update rocket position based on the multiplier
function updateRocketPosition(multiplier) {
    const maxHeight = 250; // Maximum height for the rocket to reach
    const maxWidth = 800; // Maximum width for the rocket to reach
    const newHeight = Math.min(maxHeight, maxHeight * (multiplier / 50));
    const newLeft = maxWidth * (multiplier / 50); // Calculate the new left position

    // Apply the new positions to the rocket element with a smooth transition
    rocket.style.bottom = `${newHeight}px`;
    rocket.style.left = `${newLeft}px`;
}

// Update the rocket position whenever the multiplier changes
function updateGame() {
    const multiplier = parseFloat(multiplierElement.textContent);
    updateRocketPosition(multiplier);
}

// Call updateGame whenever the multiplier changes (e.g., in your game logic)
// Example:
// multiplierElement.textContent = '2.50x'; // Update the multiplier
// updateGame(); // Update the rocket position


// Helper function to get a random crash threshold within a range
function getRandomCrashThreshold(min, max) {
    return Math.random() * (max - min) + min;
}

// Helper function to get a random increment for the multiplier
function getRandomIncrement() {
    return Math.random() * 0.1 + 0.05; // Adjust the range as needed
}