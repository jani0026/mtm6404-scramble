// Import React and ReactDOM (assuming they're available via CDN or bundler)
const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect } = React;

const WORDS = [
  'javascript',
  'programming',
  'computer',
  'algorithm',
  'database',
  'network',
  'software',
  'developer',
  'interface',
  'application'
];

const MAX_STRIKES = 3;
const INITIAL_PASSES = 3;

function shuffle(src) {
  const copy = [...src];
  const length = copy.length;
  for (let i = 0; i < length; i++) {
    const x = copy[i];
    const y = Math.floor(Math.random() * length);
    const z = copy[y];
    copy[i] = z;
    copy[y] = x;
  }
  if (typeof src === 'string') {
    return copy.join('');
  }
  return copy;
}

const ScrambleGame = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [guess, setGuess] = useState('');
  const [points, setPoints] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [passes, setPasses] = useState(INITIAL_PASSES);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('scrambleGame');
    if (savedState) {
      const { words, points, strikes, passes, currentWord } = JSON.parse(savedState);
      setWords(words);
      setPoints(points);
      setStrikes(strikes);
      setPasses(passes);
      if (currentWord) {
        setCurrentWord(currentWord);
        setScrambledWord(shuffle(currentWord));
      } else {
        selectNewWord(words);
      }
    } else {
      startNewGame();
    }
  }, []);

  useEffect(() => {
    if (!gameOver) {
      localStorage.setItem('scrambleGame', JSON.stringify({
        words,
        points,
        strikes,
        passes,
        currentWord
      }));
    }
  }, [words, points, strikes, passes, currentWord, gameOver]);

  const startNewGame = () => {
    const shuffledWords = shuffle([...WORDS]);
    setWords(shuffledWords);
    setPoints(0);
    setStrikes(0);
    setPasses(INITIAL_PASSES);
    setGameOver(false);
    setMessage('');
    selectNewWord(shuffledWords);
    localStorage.removeItem('scrambleGame');
  };

  const selectNewWord = (wordList) => {
    if (wordList.length === 0) {
      endGame(true);
      return;
    }
    const word = wordList[0];
    const remainingWords = wordList.slice(1);
    setWords(remainingWords);
    setCurrentWord(word);
    setScrambledWord(shuffle(word));
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (gameOver) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedWord = currentWord.toLowerCase();

    if (normalizedGuess === normalizedWord) {
      setPoints(points + 1);
      setMessage('Correct! Keep going!');
      selectNewWord(words);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage('Wrong guess! Try again.');
      if (newStrikes >= MAX_STRIKES) {
        endGame(false);
      }
    }
    setGuess('');
  };

  const handlePass = () => {
    if (passes > 0 && !gameOver) {
      setPasses(passes - 1);
      selectNewWord(words);
      setMessage('Word skipped!');
    }
  };

  const endGame = (completed) => {
    setGameOver(true);
    setMessage(completed 
      ? `Congratulations! You completed the game with ${points} points!` 
      : `Game Over! You got ${points} points. Maximum strikes reached.`
    );
    localStorage.removeItem('scrambleGame');
  };

  return React.createElement(
    'div',
    {
      style: {
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backgroundColor: 'white'
      }
    },
    React.createElement(
      'header',
      { style: { textAlign: 'center', marginBottom: '1.5rem' } },
      React.createElement('h1', 
        { style: { fontSize: '1.5rem', fontWeight: 'bold' } },
        'Scramble'
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      React.createElement(
        'div',
        { style: { textAlign: 'center' } },
        React.createElement(
          'div',
          { 
            style: { 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            } 
          },
          scrambledWord
        ),
        !gameOver && React.createElement(
          'form',
          { 
            onSubmit: handleGuess,
            style: { display: 'flex', flexDirection: 'column', gap: '1rem' }
          },
          React.createElement('input', {
            type: 'text',
            value: guess,
            onChange: (e) => setGuess(e.target.value),
            placeholder: 'Enter your guess',
            style: {
              padding: '0.5rem',
              textAlign: 'center',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }
          }),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '0.5rem', justifyContent: 'center' } },
            React.createElement(
              'button',
              {
                type: 'submit',
                style: {
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }
              },
              'Guess'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: handlePass,
                disabled: passes === 0,
                style: {
                  padding: '0.5rem 1rem',
                  backgroundColor: passes === 0 ? '#ccc' : '#000',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: passes === 0 ? 'not-allowed' : 'pointer'
                }
              },
              `Pass (${passes} left)`
            )
          )
        )
      ),
      React.createElement(
        'div',
        { 
          style: { 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          } 
        },
        React.createElement('div', null, `Points: ${points}`),
        React.createElement('div', null, `Strikes: ${strikes}/${MAX_STRIKES}`)
      ),
      message && React.createElement(
        'div',
        { 
          style: { 
            textAlign: 'center',
            fontWeight: '500'
          } 
        },
        message
      ),
      gameOver && React.createElement(
        'button',
        {
          onClick: startNewGame,
          style: {
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        },
        'Play Again'
      )
    )
  );
};

// Create App component
const App = () => React.createElement(ScrambleGame);

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));