
var startAngle = 11;
var initialStartAngle = 11; 
var arc = Math.PI / 18; 
var spinTimeout = null;
var spinAngleStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;
var selectedBetAmount = 1;
let doneSpinning = false;
var selectedNumber;
let currentUserBalance = 0;
var outsideRadius = 250;
var selectedAngle = 0;
const isOdd = number => number % 2 !== 0;
const resultContent = document.getElementById('result-content');
// Options for the wheel
var options = ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"];

const payouts = {
    number: 35,
    even: 2,    
    odd: 2,     
    red: 2, 
    black: 2,
};


var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");

var betAmountButtons = document.querySelectorAll('.bet-amount-button');


betAmountButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        selectedBetAmount = this.getAttribute('data-amount'); 
        
        document.querySelectorAll('.bet-amount-button.active').forEach(function(activeButton) {
            activeButton.classList.remove('active');
        });
        this.classList.add('active');
    });
});

var clearBetsButton = document.getElementById("clear-bets-button");


fetch('/get_balance')
.then(response => response.json())
.then(data => {
    if(data.balance !== undefined) {
        currentUserBalance = data.balance;
        document.getElementById('balance').textContent = `${data.balance}`;
    }
})
.catch(error => console.error('Error fetching balance:', error));


clearBetsButton.addEventListener("click", function() {
    var clear = true;
    fetch('/bet/roulette', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clear: clear,
            bets: bets
        })
    })
    bets = [];
    updateBalance();
    updateBets();
});


document.getElementById("spin-button").addEventListener("click", spinWheel);

canvas.addEventListener("click", handleCanvasClick);

document.getElementById("even-bet").addEventListener("click", function() {
    placeBet("Sudé", selectedBetAmount);
});

document.getElementById("odd-bet").addEventListener("click", function() {
    placeBet("Liché", selectedBetAmount);
});

document.getElementById("red-bet").addEventListener("click", function() {
    placeBet("Červenou", selectedBetAmount);
});

document.getElementById("black-bet").addEventListener("click", function() {
    placeBet("Černou", selectedBetAmount);
});


document.addEventListener("DOMContentLoaded", function() {
    var bettingOptionsContainer = document.getElementById("betting-options");
    options.forEach(function(number) {
        var betButton = document.createElement("button");
        betButton.textContent = number;
        betButton.addEventListener("click", function() {
            var amount = selectedBetAmount 
            placeBet(number, amount);
        });
        bettingOptionsContainer.appendChild(betButton);
    });
});

function isRed(number) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number);
}

// Function to draw the wheel
function drawRouletteWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    var textRadius = 200;     
    var insideRadius = 150;   

    var numOptions = options.length;
    var adjustedArc = Math.PI * 2 / numOptions;

    for (var i = 0; i < numOptions; i++) {
        var angle = startAngle + i * adjustedArc;
        ctx.fillStyle = getColor(i, numOptions);

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + adjustedArc, false);
        ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + adjustedArc, angle, true);
        ctx.stroke();
        ctx.fill();

        ctx.save();
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = -1;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgb(220,220,220)";
        ctx.fillStyle = "white";
        ctx.translate(canvas.width / 2 + Math.cos(angle + adjustedArc / 2) * textRadius,
            canvas.height / 2 + Math.sin(angle + adjustedArc / 2) * textRadius);
        ctx.rotate(angle + adjustedArc / 2 + Math.PI / 2);
        ctx.font = '20px Helvetica, Arial';
        var text = options[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
    
}


function spinWheel() {
    if (spinTimeout === null) {
        startAngle = initialStartAngle;
        spinAngleStart = Math.random() * 360;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000;
        rotateWheel();
    }
}


function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    doneSpinning = true;
    clearTimeout(spinTimeout);
    spinTimeout = null;

    var degrees = startAngle * 180 / Math.PI + 90;
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);

    selectedNumber = parseInt(options[index]);
    
    startAngle = (index * arcd - 90) * Math.PI / 180;
    document.getElementById("winning-number").textContent = "Výherní číslo: " + selectedNumber;
    evaluateBets(selectedNumber);

    bets = [];
}

function updateBets() {

    window.updateBalance = function() {
        fetch('/get_balance')
            .then(response => response.json())
            .then(data => {
                if(data.balance !== undefined) {
                    currentUserBalance = data.balance;
                    document.getElementById('balance').textContent = `${data.balance}`;
                }
            })
            .catch(error => console.error('Error fetching balance:', error));
    }


    var betsList = document.getElementById("bets-list");
    betsList.innerHTML = ""; 

    bets.forEach(function(bet) {
        var li = document.createElement("li");
        if (!isNaN(+bet.option)) {
            li.textContent = "₵ " + bet.amount + " na číslo " + bet.option;
        } else {
            li.textContent = "₵ " + bet.amount + " na " + bet.option;
        }
        betsList.appendChild(li);
    });
    updateBalance();
}

function easeOut(t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function getColor(item, maxitem) {
    var phase = 0;
    var center = 128;
    var width = 127;
    var frequency = Math.PI * 2 / maxitem;

    var red, green, blue;

    if (item === 0) {
        red = 0;
        green = 255;
        blue = 0;
    } else if (item % 2 === 0) {
        red = 0;
        green = 0;
        blue = 0;
    } else {
        red = 255;
        green = 0;
        blue = 0;
    }
    return RGB2Color(red, green, blue);
}

var bettingCanvas = document.getElementById("rouletteTable");
var bettingCtx = bettingCanvas.getContext("2d");

var bets = [];

function handleCanvasClick(event) {
    var x = event.clientX - bettingCanvas.getBoundingClientRect().left;
    var y = event.clientY - bettingCanvas.getBoundingClientRect().top;

    if (x >= 10 && x <= 110 && y >= 10 && y <= 60) {
        placeBet("Even", 10); 
    }

    else if (x >= 120 && x <= 220 && y >= 10 && y <= 60) {
        placeBet("Odd", 10);
    }
}

function placeBet(option, amount) {
    console.log("here");
    const betAmountNum = Number(amount);

    console.log("User balance: " + currentUserBalance + " Bet amount: " + betAmountNum)
    if (currentUserBalance < betAmountNum){
        alert("Nemáš dostatek peněz na tuto sázku");
    }
    else{
        bets.push({ option: option, amount: amount });
        updateBets(); 
        fetch('/bet/roulette', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bet_option: option,
                bet_amount: amount,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBalance();
            } else {
                console.error('Bet processing failed:', data.error);
            }
        })
        .catch(error => console.error('Error placing bet:', error));
    }
}

function evaluateBets(winningNumber) {
    let totalWinnings = 0;
    let totalLosses = 0;

    bets.forEach((bet) => {

        let betsLength = bets.length;
        let isWin = false;
        let winnings = 0;
        let betOption = translateBetOption(bet.option);

        if (betOption === "red" && isRed(winningNumber)) {
            isWin = true;
        } else if (betOption === "black" && !isRed(winningNumber) && winningNumber !== 0) {
            isWin = true;
        } else if (betOption === "odd" && isOdd(winningNumber)) {
            isWin = true;
        } else if (betOption === "even" && !isOdd(winningNumber) && winningNumber !== 0) {
            isWin = true;
        } else if (parseInt(betOption) === winningNumber) { // Direct number bet
            isWin = true;
        }

        if (isWin) {
            winnings = bet.amount * (payouts[betOption] || payouts.number); // Use appropriate payout
            totalWinnings += winnings;
        } else {
            totalLosses += bet.amount;
        }
        resultContent.textContent = `Celková výhra: ₵ ${totalWinnings}`;

        fetch('/bet/roulette', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                done_spin: doneSpinning,
                bets_length: betsLength,
                winnings: totalWinnings 
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
            }
        })
        .catch(error => console.error('Error:', error));
    });

    updateBets();
    updateBalance();
}

function translateBetOption(option) {
    switch (option) {
        case "Červenou": return "red";
        case "Černou": return "black";
        case "Liché": return "odd";
        case "Sudé": return "even";
        default: return option; 
    }
}

drawRouletteWheel();