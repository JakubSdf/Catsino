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
    let historyData = []; 
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
        const min = 1; 
        const lambda = 1; 
        let crashPoint;
    
        const randomValue = Math.random();
    
        if (randomValue < 0.1) { 
            crashPoint = 1.00;
        } else {
            do {
                const random = Math.random();
                crashPoint = -Math.log(1 - random) / lambda;
            } while (crashPoint <= 1.00); 
        return crashPoint;        
    }

    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            countdown.textContent = 'Hra probíhá...';
            gameContent.style.opacity = 0;

            const crashPoint = generateCrashPoint();

            let increment = 0.001; 

            gameInterval = setInterval(function () {
                currentMultiplier += increment;
                multiplierValue.textContent = `x${currentMultiplier.toFixed(2)}`;

                if (currentMultiplier >= crashPoint) {
                    clearInterval(gameInterval);
                    clearInterval(speedUpInterval); 
                    gameStarted = false;
                    multiplierValue.textContent = `Crasnuto na x${currentMultiplier.toFixed(2)}`;
                    historyData.push(currentMultiplier.toFixed(2)); 
                    displayMultiplierHistory();
    
                  
                    placeBetButton.disabled = false;
                    placeBetButton.style.backgroundColor = '#4CAF50';
                    betAmountInput.disabled = false;
                    document.querySelector('label[for="bet-amount"]').textContent = `Vsazeno:`;
                    cashOutButton.disabled = false;
                    cashOutButton.style.backgroundColor = '#F44336';
    
                    
                    if (betAmount.toFixed(2) > 0.00 && gameContent.textContent === 'Game Content') {
                        gameContent.textContent = 'Prohrál jsi ₵' + betAmount.toFixed(2);
                        gameContent.style.opacity = 1;
                    }
    
               
                    document.getElementById('bet-amount').value = '';
                    betPlaced = false;
                    countdownTime = 10;
                    countdownIntervalFnc();
    
                  
                    displayMultiplierHistory();
                }
                increment *= 1.02; 
            }, 100);

            speedUpInterval = setInterval(function () {
                currentMultiplier += 0.001; 
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

        const lastTenMultipliers = historyData.slice(-10).reverse();

        lastTenMultipliers.forEach(function (multiplier, index) {
            const li = document.createElement('li');
            li.textContent = `x${multiplier}`;
            if (index === 0) {
                li.textContent += ' (Poslední)';
            }
            multiplierHistory.appendChild(li);
        });
    }

   
    presetButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            if (!gameStarted && !betPlaced) {
             
                const value = button.textContent.match(/\d+/); 
                if (value) {
                    betAmountInput.value = value[0]; 
                }
            }
        });
    });

        placeBetButton.addEventListener('click', function () {
        if (!gameStarted) {
            betAmount = parseFloat(betAmountInput.value);
            if (isNaN(betAmount) || betAmount <= 0) {
              
                alert("Please enter a valid bet amount");
            } else {
              
                placeBetButton.disabled = true;
                placeBetButton.style.backgroundColor = 'grey';
                betAmountInput.disabled = true;

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
                        updateBalance();
                    } else {
                        alert(data.error);
                        placeBetButton.disabled = false;
                        placeBetButton.style.backgroundColor = '#4CAF50';
                        betAmountInput.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    placeBetButton.disabled = false;
                    placeBetButton.style.backgroundColor = '#4CAF50';
                    betAmountInput.disabled = false;
                });
            }
        }
        });
        
    cashOutButton.addEventListener('click', function () {
        if (gameStarted && betPlaced) {
            cashOutButton.disabled = true;
            cashOutButton.style.backgroundColor = 'grey';
    
            let currentMultiplierValue = currentMultiplier;  
    
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
                    updateBalance();
                    gameContent.style.opacity = 1;
                    gameContent.textContent = `Vyplatil si v x${currentMultiplierValue.toFixed(2)} a vyhrál ₵ ${(betAmount * currentMultiplierValue).toFixed(2)}`;
                } else {
                    alert(data.error);
                    cashOutButton.disabled = false;
                    cashOutButton.style.backgroundColor = '#F44336';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                cashOutButton.disabled = false;
                cashOutButton.style.backgroundColor = '#F44336';
            });
        }
    });
    betAmountInput.addEventListener('input', function () {
        betAmountInput.value = betAmountInput.value.replace(/[^0-9.]/g, '');
    });
}});


