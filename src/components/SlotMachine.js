import React, { useState, useEffect, useCallback } from 'react';
import './SlotMachine.css';

// Slot symbols with their values and win multipliers
const SYMBOLS = [
  { id: 'seven', emoji: '7️⃣', value: 777, multiplier: 100, color: '#FFD700' },
  { id: 'diamond', emoji: '💎', value: 500, multiplier: 50, color: '#00BFFF' },
  { id: 'star', emoji: '⭐', value: 300, multiplier: 30, color: '#FF69B4' },
  { id: 'bell', emoji: '🔔', value: 200, multiplier: 20, color: '#FFD700' },
  { id: 'bar', emoji: '🟫', value: 150, multiplier: 15, color: '#8B4513' },
  { id: 'cherry', emoji: '🍒', value: 100, multiplier: 10, color: '#DC143C' },
];

// Initial game state
const INITIAL_BALANCE = 1000;
const MIN_BET = 10;
const MAX_BET = 100;

const SlotMachine = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(MIN_BET);
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('casino-balance');
    const savedTotalWins = localStorage.getItem('casino-total-wins');
    
    if (savedBalance) setBalance(parseInt(savedBalance));
    if (savedTotalWins) setTotalWins(parseInt(savedTotalWins));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('casino-balance', balance.toString());
    localStorage.setItem('casino-total-wins', totalWins.toString());
  }, [balance, totalWins]);

  // Check for winning combinations
  const checkWin = useCallback((reelResults) => {
    const [reel1, reel2, reel3] = reelResults;
    
    // Three of a kind
    if (reel1 === reel2 && reel2 === reel3) {
      return SYMBOLS[reel1].multiplier * bet;
    }
    
    // Two matching (smaller payout)
    if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      const matchedSymbol = reel1 === reel2 ? reel1 : (reel2 === reel3 ? reel2 : reel1);
      return Math.floor(SYMBOLS[matchedSymbol].multiplier * bet * 0.2);
    }
    
    return 0;
  }, [bet]);

  // Play sound effect
  const playSound = useCallback((frequency, duration) => {
    if (!soundEnabled) return;
    
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Spin the reels
  const spin = useCallback(() => {
    if (isSpinning || balance < bet) return;

    setIsSpinning(true);
    setLastWin(0);
    setShowWinAnimation(false);
    setBalance(prev => prev - bet);

    // Play spin sound
    playSound(200, 0.2);

    // Animate the reels spinning
    let spinCount = 0;
    const maxSpins = 20;
    
    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length)
      ]);
      
      spinCount++;
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        
        // Final results
        const finalReels = [
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length)
        ];
        
        setReels(finalReels);
        
        // Check for wins
        const winAmount = checkWin(finalReels);
        
        setTimeout(() => {
          setIsSpinning(false);
          
          if (winAmount > 0) {
            setLastWin(winAmount);
            setBalance(prev => prev + winAmount);
            setTotalWins(prev => prev + winAmount);
            setShowWinAnimation(true);
            
            // Play win sound
            playSound(winAmount > bet * 20 ? 800 : 440, 0.5);
            
            // Hide win animation after delay
            setTimeout(() => setShowWinAnimation(false), 3000);
          }
        }, 500);
      }
    }, 100);
  }, [isSpinning, balance, bet, checkWin, playSound]);

  // Handle bet adjustment
  const adjustBet = (change) => {
    setBet(prev => {
      const newBet = prev + change;
      return Math.max(MIN_BET, Math.min(MAX_BET, Math.min(newBet, balance)));
    });
  };

  // Reset game
  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setBet(MIN_BET);
    setLastWin(0);
    setTotalWins(0);
    setShowWinAnimation(false);
    localStorage.removeItem('casino-balance');
    localStorage.removeItem('casino-total-wins');
  };

  return (
    <div className="slot-machine">
      <div className="casino-header">
        <h1 className="casino-title">🎰 Vegas Casino 🎰</h1>
        <div className="casino-subtitle">High-Stakes Slot Machine</div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Balance:</span>
          <span className="stat-value balance">${balance}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Wins:</span>
          <span className="stat-value">${totalWins}</span>
        </div>
      </div>

      <div className={`reels-container ${isSpinning ? 'spinning' : ''}`}>
        {reels.map((symbolIndex, reelIndex) => (
          <div key={reelIndex} className={`reel reel-${reelIndex + 1}`}>
            <div className="symbol" style={{ color: SYMBOLS[symbolIndex].color }}>
              <span className="symbol-emoji">{SYMBOLS[symbolIndex].emoji}</span>
              <span className="symbol-value">{SYMBOLS[symbolIndex].value}</span>
            </div>
          </div>
        ))}
      </div>

      {showWinAnimation && (
        <div className="win-animation">
          <div className="win-text">🎉 YOU WON ${lastWin}! 🎉</div>
          <div className="confetti">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={`confetti-piece confetti-${i}`} />
            ))}
          </div>
        </div>
      )}

      <div className="game-controls">
        <div className="bet-controls">
          <label className="bet-label">Bet Amount:</label>
          <div className="bet-buttons">
            <button 
              className="bet-btn" 
              onClick={() => adjustBet(-10)}
              disabled={bet <= MIN_BET}
            >
              -$10
            </button>
            <span className="bet-amount">${bet}</span>
            <button 
              className="bet-btn" 
              onClick={() => adjustBet(10)}
              disabled={bet >= MAX_BET || bet >= balance}
            >
              +$10
            </button>
          </div>
        </div>

        <button
          className={`spin-button ${isSpinning ? 'spinning' : ''}`}
          onClick={spin}
          disabled={isSpinning || balance < bet}
        >
          {isSpinning ? '🌪️ SPINNING...' : '🎰 SPIN!'}
        </button>
      </div>

      <div className="game-info">
        {lastWin > 0 && !showWinAnimation && (
          <div className="last-win">Last Win: ${lastWin}</div>
        )}
        
        <div className="controls-row">
          <button 
            className="control-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
          </button>
          
          <button 
            className="control-btn reset-btn"
            onClick={resetGame}
          >
            🔄 Reset Game
          </button>
        </div>
      </div>

      <div className="paytable">
        <h3>💰 PAYTABLE 💰</h3>
        <div className="paytable-grid">
          {SYMBOLS.map(symbol => (
            <div key={symbol.id} className="paytable-row">
              <span className="paytable-symbol">{symbol.emoji}</span>
              <span className="paytable-combo">3x = {symbol.multiplier}x bet</span>
              <span className="paytable-combo">2x = {Math.floor(symbol.multiplier * 0.2)}x bet</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;