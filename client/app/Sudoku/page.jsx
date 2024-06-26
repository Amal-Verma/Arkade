"use client";

import React, { useEffect, useRef, useState } from 'react';

import * as utils from './utils/logic';
import * as sudokuUtils from './utils/sudoku';
import  CONSTANT  from './utils/constant';
import './sudoku.css';
import './utils/logic.css'


const Sudoku = () => {
  const [level, setLevel] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [pause, setPause] = useState(false);
  const [selectedCell, setSelectedCell] = useState(-1);
  const [showScreen, setShowScreen] = useState('start');

  const cellRefsArray = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const sudokuData = sudokuUtils.sudokuGen(CONSTANT.LEVEL[0]);
    if (sudokuData) {
      setGameData({ su: sudokuData });
    }
    setShowScreen('start');
  
    // Populate the cellRefsArray with the DOM elements
    const cells = document.querySelectorAll('.sudoku-cell');
    cellRefsArray.current = Array.from(cells);
  
    // Call initGameGrid after cellRefsArray.current has been populated
    if (sudokuData) {
      utils.initGameGrid(cellRefsArray.current, sudokuData.question, sudokuData.original);
    }
  }, []);


  useEffect(() => {
    if (showScreen === 'game' && !pause) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
  }, [showScreen, pause]);

  

  const handleLevelChange = () => {
    setLevel((prevLevel) => (prevLevel + 1) % CONSTANT.LEVEL_NAME.length);
    const sudokuData = sudokuUtils.sudokuGen(CONSTANT.LEVEL[(level + 1) % CONSTANT.LEVEL_NAME.length]);
    if (sudokuData) {
      setGameData({ su: sudokuData });
      utils.initGameGrid(cellRefsArray.current, sudokuData.question);
    }
  };

  const handlePlayGame = () => {
    setLevel((prevLevel) => (prevLevel + 1) % CONSTANT.LEVEL_NAME.length);
    const sudokuData = sudokuUtils.sudokuGen(CONSTANT.LEVEL[level]);
    if (sudokuData) {
      setGameData({ su: sudokuData });
      utils.initGameGrid(cellRefsArray.current, sudokuData.question, sudokuData.original);
    }
    setShowScreen('game');
  };

  const handlePauseGame = () => {
    setPause(true);
    setShowScreen('pause');
  };

  const handleResumeGame = () => {
    setPause(false);
    setShowScreen('game');
  };

  const handleNewGame = () => {
    setShowScreen('start');
    setPause(false);
    setSeconds(0);
  };

  const handleCellClick = (index) => {
    const cellRef = cellRefsArray.current[index];
    if (cellRef) {
      cellRefsArray.current.forEach((cell) => {
        if (cell) {
          cell.classList.remove('selected');
        }
      });
  
      setSelectedCell(index);
      console.log('Adding .selected class to cell:', index);
      cellRef.classList.remove('err');
      cellRef.classList.add('selected');
  
      utils.resetBg(cellRefsArray.current);
      utils.hoverBg(index, cellRefsArray.current);
    } else {
      console.log('Cell is not clickable for index:', index);
    }
    console.log("cell clicked");
  };

  const handleNumberClick = (number) => {
    if (
      cellRefsArray.current[selectedCell] &&
      cellRefsArray.current[selectedCell].getAttribute('data-value') === '0' &&
      !cellRefsArray.current[selectedCell].classList.contains('prefilled')
    ) {
      const cellRef = cellRefsArray.current[selectedCell];
      const row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
      const col = selectedCell % CONSTANT.GRID_SIZE;
  
      // Create a new copy of the question array
      const newQuestionArray = [...gameData.su.question];
      newQuestionArray[row][col] = number;
  
      // Create a new copy of the original array
      const newOriginalArray = [...gameData.su.original];
      newOriginalArray[row][col] = number;
  
      // Update the gameData state with the new question and original arrays
      setGameData({ ...gameData, su: { ...gameData.su, question: newQuestionArray, original: newOriginalArray } });
  
      cellRef.innerHTML = number;
      cellRef.setAttribute('data-value', number);
  
      utils.removeErr(cellRefsArray.current); // Remove previous error highlights
  
      // Check for errors and highlight only if the inserted number is not 0
      if (number !== 0) {
        utils.checkErr(number, selectedCell, cellRefsArray.current);
      }
  
      cellRef.classList.add('zoom-in');
      setTimeout(() => {
        cellRef.classList.remove('zoom-in');
      }, 500);
  
      if (sudokuUtils.sudokuCheck(newQuestionArray)) {
        setShowScreen('result');
      }
    }
    console.log("number clicked");
  };
  
  const handleDeleteClick = () => {
    const selectedCellRef = cellRefsArray.current[selectedCell];
    if (selectedCellRef && !selectedCellRef.classList.contains('prefilled')) {
      const currentValue = selectedCellRef.getAttribute('data-value');
      if (currentValue !== CONSTANT.UNASSIGNED && currentValue !== '0') {
        selectedCellRef.innerHTML = '';
        selectedCellRef.setAttribute('data-value', 0);
  
        const row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
        const col = selectedCell % CONSTANT.GRID_SIZE;
        gameData.su.question[row][col] = 0;
  
        utils.removeErr(cellRefsArray.current); // Remove error highlighting
      }
    }
    console.log("delete clicked");
  };

  
  return (
    <div
      className={`screen ${showScreen === 'start' ? 'start-screen' : ''} ${
        showScreen === 'game' ? 'main-game' : ''
      } ${showScreen === 'pause' ? 'pause-screen' : ''} ${
        showScreen === 'result' ? 'result-screen' : ''
      } flex flex-col items-center justify-center bg-black h-screen w-screen`}
    >
      {showScreen === 'start' && (
        <div className="flex flex-col items-center">
          <button
            className="mt-4 h-20 w-72 rounded-lg bg-blue-500 text-2xl text-white"
            onClick={handleLevelChange}
          >
            {CONSTANT.LEVEL_NAME[level]}
          </button>
          <button
            className="mt-4 h-20 w-72 rounded-lg bg-green-500 text-2xl text-white"
            onClick={handlePlayGame}
          >
            New game
          </button>
        </div>
      )}
  
      {showScreen === 'game' && gameData && (
        <div className="flex flex-col items-center justify-between h-full py-4">
        <div className="grid grid-cols-3 gap-3.5">
  {gameData.su.question.map((row, rowIndex) => (
    <div key={rowIndex} className="grid grid-cols-3 gap-1">
      {row.map((value, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`h-14 w-14 rounded-lg bg-gray-200 hover:border-blue-500 border-2 text-center text-2xl leading-14 cursor-pointer flex justify-center items-center ${
            value !== CONSTANT.UNASSIGNED ? 'filled' : ''
          }`}
          ref={(el) => {
            if (el) {
              cellRefsArray.current[rowIndex * CONSTANT.GRID_SIZE + colIndex] = el;
            }
          }}
          onClick={() => handleCellClick(rowIndex * CONSTANT.GRID_SIZE + colIndex)}
          data-value={value}
        >
          {value !== CONSTANT.UNASSIGNED ? value : ''}
        </div>
      ))}
    </div>
  ))}
</div>
  <div className="flex flex-row ml-24">
  <div className="flex flex-col">
          <div className="mt-4 grid grid-cols-2 gap-2 ">
            <div className="h-12 w-48 rounded-lg bg-gray-200 text-2xl leading-12 flex items-center justify-center">
              {CONSTANT.LEVEL_NAME[level-1]}
            </div>
          </div>

           
  
          <div className="mt-2 h-12 w-48 rounded-lg bg-gray-200 flex justify-start items-center px-3 text-2xl leading-12 relative">
            <span>{utils.showTime(seconds)}</span>
            <button
              className="absolute right-2 h-8 w-8 rounded-lg  bg-blue-500 text-white text-xl grid place-items-center"
              onClick={handlePauseGame}
            >
              <img src="/Images/pause.png" alt="pause" />
            </button>
          </div>
          </div>
         
         <div className="mt-4 grid grid-cols-5 gap-1 mr-36">
            {CONSTANT.NUMBERS.map((number) => (
              <button
                key={number}
                className="h-12 w-12 rounded-lg bg-gray-200 text-2xl hover:bg-blue-500 hover:text-white"
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </button>
            ))}
            <button
              className="h-12 w-12 rounded-lg bg-red-500 text-2xl text-white"
              onClick={handleDeleteClick}
            >
              X
            </button>
          </div>
  
         
           </div>
        </div>
      )}
  
      {showScreen === 'pause' && (
        <div className="flex flex-col items-center">
          <button
            className="h-20 w-72 rounded-lg bg-blue-500 text-2xl text-white"
            onClick={handleResumeGame}
          >
            Resume
          </button>
          <button
            className="mt-4 h-20 w-72 rounded-lg bg-gray-500 text-2xl text-white"
            onClick={handleNewGame}
          >
            New game
          </button>
        </div>
      )}
  
      {showScreen === 'result' && (
        <div className="flex flex-col items-center">
          <div className="text-4xl text-blue-500">Completed</div>
          <div className="mt-4 text-2xl">Time</div>
          <div id="result-time" className="text-4xl text-blue-500">
            {utils.showTime(seconds)}
          </div>
          <button
            className="mt-4 h-20 w-72 rounded-lg bg-gray-500 text-2xl text-white"
            onClick={handleNewGame}
          >
            New game
          </button>
        </div>
      )}
    </div>
  );
};
  export default Sudoku;