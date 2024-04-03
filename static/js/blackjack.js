
let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0; 

let hidden;
let deck;

let canHit = true; 

document.getElementById('deal').addEventListener("click", zacatek);


function zacatek() {
    cleartable();
    buildDeck();
    shuffleDeck();
    startGame();
  }

function buildDeck() {
    let values = ["eso", "2", "3", "4", "5", "6", "7", "8", "9", "10", "janek", "dama", "kral"];
    let types = ["kari", "piko", "srdce", "zaludy"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push( types[i] + "_" + values[j]); 
        }
    }

}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function startGame() {
  yourSum = 0;
  dealerSum = 0;
  dealerAceCount = 0;
  yourAceCount = 0;

  canHit = true;
  hidden = null;


  var hiddenImg = document.createElement("img");
  hiddenImg.id = "hidden";
  hiddenImg.src = "./static/blackjackek/cards/skryta.png";
  

  hidden = deck.pop();
  dealerSum += getValue(hidden);
  dealerAceCount += checkAce(hidden);


  let cardImg = document.createElement("img");
  let card = deck.pop();
  cardImg.src = "./static/blackjackek/cards/" + card + ".png";
  dealerSum += getValue(card);
  dealerAceCount += checkAce(card);
  document.getElementById("dealer-cards").append(cardImg);
  document.getElementById("dealer-cards").appendChild(hiddenImg);
  document.getElementById("dealer-sum").innerText = "";
  document.getElementById("results").innerText = "";


  for (let i = 0; i < 2; i++) {
      let cardImg = document.createElement("img");
      let card = deck.pop();
      cardImg.src = "./static/blackjackek/cards/" + card + ".png";
      yourSum += getValue(card);
      yourAceCount += checkAce(card);
      document.getElementById("your-cards").append(cardImg);
      document.getElementById("your-sum").innerText = yourSum;
  }



  document.getElementById("hit").addEventListener("click", hit);
  document.getElementById("stay").addEventListener("click", stay);
}



function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./static/blackjackek/cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);
    document.getElementById("your-sum").innerText = yourSum;

    if (reduceAce(yourSum, yourAceCount) > 21) { 
        canHit = false;
    }

}


function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);
    console.log("dealerSum: " + dealerSum);
    while (dealerSum <= 16) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./static/blackjackek/cards/" + card + ".png";
        dealerSum += getValue(card);
        console.log("new card " + getValue(card));
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    canHit = false;
    document.getElementById("hidden").src = "./static/blackjackek/cards/" + hidden + ".png";

    let message = "";
    if (yourSum > 21) {
        message = "Prohrál jsi!";
    }
    else if (dealerSum > 21) {
        message = "Vyhrál jsi!";
    }

    else if (yourSum == dealerSum) {
        message = "Remíza!";
    }
    else if (yourSum > dealerSum) {
        message = "Vyhrál jsi!";
    }
    else if (yourSum < dealerSum) {
        message = "Prohrál jsi!";
    }

    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;
    var resultsContainer = document.getElementById("results-container");
    resultsContainer.style.display = "block";
}

function getValue(card) {
    let data = card.split("_"); 
    let value = data[1];

    if (isNaN(value)) { 
        if (value == "A" && playerSum + 11 <= 21) {
            return 11;
        } else if (value == "A") {
            return 1;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "eso") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}
function cleartable() {

  var dealerCards = document.getElementById("dealer-cards");
  while (dealerCards.firstChild) {
      dealerCards.removeChild(dealerCards.firstChild);
  }


  var yourCards = document.getElementById("your-cards");
  while (yourCards.firstChild) {
      yourCards.removeChild(yourCards.firstChild);
  }
}