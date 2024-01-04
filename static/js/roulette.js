// Variables for the wheel
var startAngle = 11;
var arc = Math.PI / 18; // 360 degrees divided by the number of options (European roulette has 37 numbers)
var spinTimeout = null;
var spinAngleStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

// Options for the wheel
var options = ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"];

// Get the canvas and context
var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");

// Spin button click event listener
document.getElementById("spin-button").addEventListener("click", spinWheel);

canvas.addEventListener("click", handleCanvasClick);

document.getElementById("even-bet").addEventListener("click", function() {
    placeBet("Even", 10); // Adjust the bet amount as needed
});

document.getElementById("odd-bet").addEventListener("click", function() {
    placeBet("Odd", 10); // Adjust the bet amount as needed
});

// Function to draw the wheel
function drawRouletteWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    var outsideRadius = 250;  // Adjust as needed
    var textRadius = 200;     // Adjust as needed
    var insideRadius = 150;   // Adjust as needed

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

// Function to spin the wheel
function spinWheel() {
    if (spinTimeout === null) {
        spinAngleStart = Math.random() * 10 + 10;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000;
        rotateWheel();
    }
}

// Function to rotate the wheel
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

// Function to stop rotating the wheel
function stopRotateWheel() {
    clearTimeout(spinTimeout);
    spinTimeout = null;
    var degrees = startAngle * 180 / Math.PI + 90;
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
    displayResult(options[index]);
}

// Function to display the result
function displayResult(result) {
    var resultElement = document.getElementById("result");
    resultElement.textContent = result;
}

// Function to update and display bets
function updateBets() {
    var betsList = document.getElementById("bets-list");
    betsList.innerHTML = ""; // Clear previous bets

    bets.forEach(function(bet) {
        var li = document.createElement("li");
        li.textContent = bet.amount + " on " + bet.option;
        betsList.appendChild(li);
    });
}

// Function to ease out the spinning
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
        // Zero is green
        red = 0;
        green = 255;
        blue = 0;
    } else if (item % 2 === 0) {
        // Even numbers are black
        red = 0;
        green = 0;
        blue = 0;
    } else {
        // Odd numbers are red
        red = 255;
        green = 0;
        blue = 0;
    }

    return RGB2Color(red, green, blue);
}

// betting part
var bettingCanvas = document.getElementById("rouletteTable");
var bettingCtx = bettingCanvas.getContext("2d");

var bets = [];

function handleCanvasClick(event) {
    var x = event.clientX - bettingCanvas.getBoundingClientRect().left;
    var y = event.clientY - bettingCanvas.getBoundingClientRect().top;

    // Check if the click is within the "Even" button
    if (x >= 10 && x <= 110 && y >= 10 && y <= 60) {
        placeBet("Even", 10); // Adjust the bet amount as needed
    }

    // Check if the click is within the "Odd" button
    else if (x >= 120 && x <= 220 && y >= 10 && y <= 60) {
        placeBet("Odd", 10); // Adjust the bet amount as needed
    }

    // Add more conditions for other betting areas...
}

// Function to place a bet
function placeBet(option, amount) {
    bets.push({ option: option, amount: amount });
    // You can handle the bet placement as needed
    console.log("Bet placed:", option, amount);
}

// Initial draw of the wheel
drawRouletteWheel();
