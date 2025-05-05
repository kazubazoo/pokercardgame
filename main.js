// Card Class
class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = this.getCardValue();
  }

  // Map card ranks to values for comparison
  getCardValue() {
    const rankValues = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[this.rank];
  }

  // Card as string for printing
  toString() {
    return `${this.rank} of ${this.suit}`;
  }
}

// Deck Class
class Deck {
  constructor() {
    this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.cards = [];
    this.createDeck();
  }

  createDeck() {
    this.cards = [];
    for (let suit of this.suits) {
      for (let rank of this.ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(numCards) {
    return this.cards.splice(0, numCards);
  }
}

// Hand Evaluation
class HandEvaluator {
  static evaluateHand(hand) {
    const ranks = hand.map(card => card.rank);
    const suits = hand.map(card => card.suit);
    const rankCount = this.getRankCount(ranks);
    const isFlush = this.isFlush(suits);
    const isStraight = this.isStraight(ranks);

    if (isStraight && isFlush && ranks.includes('A') && ranks.includes('K')) return 'Royal Flush';
    if (isStraight && isFlush) return 'Straight Flush';
    if (rankCount[0] === 4) return 'Four of a Kind';
    if (rankCount[0] === 3 && rankCount[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (rankCount[0] === 3) return 'Three of a Kind';
    if (rankCount[0] === 2 && rankCount[1] === 2) return 'Two Pair';
    if (rankCount[0] === 2) return 'One Pair';
    return 'High Card';
  }

  static getRankCount(ranks) {
    const rankCount = {};
    ranks.forEach(rank => {
      rankCount[rank] = (rankCount[rank] || 0) + 1;
    });
    return Object.values(rankCount).sort((a, b) => b - a);
  }

  static isFlush(suits) {
    return new Set(suits).size === 1;
  }

  static isStraight(ranks) {
    const rankValues = ranks.map(rank => {
      const values = { 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
      return values[rank] || parseInt(rank);
    }).sort((a, b) => a - b);

    return rankValues[4] - rankValues[0] === 4 && new Set(rankValues).size === 5;
  }
}

// Player Class
class Player {
  constructor(name, balance) {
    this.name = name;
    this.balance = balance;
    this.hand = [];
    this.bet = 0;
  }

  receiveCards(cards) {
    this.hand = cards;
  }

  placeBet(amount) {
    if (amount > this.balance) {
      console.log(`${this.name} does not have enough funds to bet ${amount}`);
      return;
    }
    this.bet = amount;
    this.balance -= amount;
    console.log(`${this.name} places a bet of ${amount}`);
  }

  resetHand() {
    this.hand = [];
    this.bet = 0;
  }

  resetBet() {
    this.bet = 0;
  }
}

// Poker Game Class
class PokerGame {
  constructor(players) {
    this.players = players;
    this.deck = new Deck();
    this.pot = 0;
    this.communityCards = [];
    this.round = 0;
  }

  startGame() {
    console.log("Starting a new Poker game...");
    this.deck.shuffle();
    this.dealCards();

    this.bettingRound();
    this.flop();
    this.bettingRound();
    this.turn();
    this.bettingRound();
    this.river();
    this.bettingRound();

    this.showdown();
  }

  dealCards() {
    for (let player of this.players) {
      player.receiveCards(this.deck.deal(2));
      console.log(`${player.name} has been dealt: ${player.hand.map(card => card.toString()).join(', ')}`);
    }
  }

  bettingRound() {
    console.log(`\nRound ${++this.round} - Betting starts!`);
    for (let player of this.players) {
      const betAmount = Math.floor(Math.random() * (player.balance / 2));
      player.placeBet(betAmount);
      this.pot += betAmount;
    }
    console.log(`Total Pot: ${this.pot}`);
  }

  flop() {
    console.log("\nThe Flop:");
    this.communityCards = this.deck.deal(3);
    console.log(this.communityCards.map(card => card.toString()).join(', '));
  }

  turn() {
    console.log("\nThe Turn:");
    this.communityCards.push(...this.deck.deal(1));
    console.log(this.communityCards.map(card => card.toString()).join(', '));
  }

  river() {
    console.log("\nThe River:");
    this.communityCards.push(...this.deck.deal(1));
    console.log(this.communityCards.map(card => card.toString()).join(', '));
  }

  showdown() {
    console.log("\nShowdown:");

    let winner = null;
    let bestRank = -1;
    const rankingOrder = [
      'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
      'Straight', 'Flush', 'Full House', 'Four of a Kind',
      'Straight Flush', 'Royal Flush'
    ];

    for (let player of this.players) {
      const fullHand = [...player.hand, ...this.communityCards];
      const result = HandEvaluator.evaluateHand(fullHand);
      console.log(`${player.name} has a ${result}`);
      const rankIndex = rankingOrder.indexOf(result);

      if (rankIndex > bestRank) {
        bestRank = rankIndex;
        winner = player;
      }
    }

    console.log(`${winner.name} wins the pot of ${this.pot} with a ${rankingOrder[bestRank]}!`);
    winner.balance += this.pot;
    console.log(`${winner.name}'s new balance: ${winner.balance}`);
  }
}

// Create players and start game
const player1 = new Player("Alice", 1000);
const player2 = new Player("Bob", 1000);
const player3 = new Player("Charlie", 1000);
const pokerGame = new PokerGame([player1, player2, player3]);
pokerGame.startGame();

