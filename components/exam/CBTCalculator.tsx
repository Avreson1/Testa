"use client";

import React, { useState, useCallback } from "react";
import { X, Delete, Calculator as CalcIcon } from "lucide-react";

interface CBTCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CBTCalculator({ isOpen, onClose }: CBTCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number>(0);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? digit : display + digit);
      }
    },
    [display, waitingForOperand]
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPendingOperator(null);
    setPrevValue(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const calculate = useCallback(
    (nextOperator: string) => {
      const inputValue = parseFloat(display);

      if (prevValue === null) {
        setPrevValue(inputValue);
      } else if (pendingOperator) {
        const currentValue = prevValue;
        let newValue = 0;

        switch (pendingOperator) {
          case "+":
            newValue = currentValue + inputValue;
            break;
          case "-":
            newValue = currentValue - inputValue;
            break;
          case "*":
            newValue = currentValue * inputValue;
            break;
          case "/":
            newValue = inputValue === 0 ? NaN : currentValue / inputValue;
            break;
          case "^":
            newValue = Math.pow(currentValue, inputValue);
            break;
          default:
            newValue = inputValue;
        }

        setPrevValue(newValue);
        setDisplay(String(Number(newValue.toFixed(8))));
      }

      setWaitingForOperand(true);
      setPendingOperator(nextOperator === "=" ? null : nextOperator);
    },
    [display, pendingOperator, prevValue]
  );

  const applyUnary = useCallback(
    (op: string) => {
      const val = parseFloat(display);
      let res = val;

      switch (op) {
        case "sqrt":
          res = Math.sqrt(val);
          break;
        case "sqr":
          res = Math.pow(val, 2);
          break;
        case "inv":
          res = 1 / val;
          break;
        case "sin":
          res = Math.sin((val * Math.PI) / 180);
          break;
        case "cos":
          res = Math.cos((val * Math.PI) / 180);
          break;
        case "tan":
          res = Math.tan((val * Math.PI) / 180);
          break;
        case "log":
          res = Math.log10(val);
          break;
        case "ln":
          res = Math.log(val);
          break;
        case "pi":
          res = Math.PI;
          break;
        case "+-":
          res = -val;
          break;
      }

      setDisplay(String(Number(res.toFixed(8))));
      setWaitingForOperand(true);
    },
    [display]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 font-mono select-none overflow-hidden text-xs">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-1.5 font-sans font-bold text-neutral-300">
          <CalcIcon className="w-3.5 h-3.5 text-neutral-400" />
          <span>CBT Standard Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
          title="Close Calculator"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Display */}
      <div className="p-3 bg-black/90 text-right">
        <div className="text-[10px] text-neutral-500 h-4 truncate">
          {prevValue !== null && pendingOperator
            ? `${prevValue} ${pendingOperator}`
            : ""}
        </div>
        <div className="text-2xl font-bold tracking-wider text-emerald-400 truncate">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-2.5 bg-neutral-900 grid grid-cols-5 gap-1.5">
        {/* Row 1: Memory */}
        <button
          onClick={() => setMemory(0)}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold"
        >
          MC
        </button>
        <button
          onClick={() => {
            setDisplay(String(memory));
            setWaitingForOperand(true);
          }}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold"
        >
          MR
        </button>
        <button
          onClick={() => setMemory(memory + parseFloat(display))}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold"
        >
          M+
        </button>
        <button
          onClick={clearEntry}
          className="p-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 rounded font-bold"
        >
          CE
        </button>
        <button
          onClick={clearAll}
          className="p-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded font-bold"
        >
          C
        </button>

        {/* Row 2: Scientific */}
        <button
          onClick={() => applyUnary("sqrt")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
        >
          √
        </button>
        <button
          onClick={() => applyUnary("sqr")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
        >
          x²
        </button>
        <button
          onClick={() => calculate("^")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
        >
          xʸ
        </button>
        <button
          onClick={() => applyUnary("inv")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
        >
          1/x
        </button>
        <button
          onClick={handleBackspace}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded flex items-center justify-center"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>

        {/* Row 3: Trig & 7, 8, 9, / */}
        <button
          onClick={() => applyUnary("sin")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
        >
          sin
        </button>
        <button
          onClick={() => inputDigit("7")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          7
        </button>
        <button
          onClick={() => inputDigit("8")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          8
        </button>
        <button
          onClick={() => inputDigit("9")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          9
        </button>
        <button
          onClick={() => calculate("/")}
          className="p-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-200 rounded font-bold"
        >
          ÷
        </button>

        {/* Row 4: Cos & 4, 5, 6, * */}
        <button
          onClick={() => applyUnary("cos")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
        >
          cos
        </button>
        <button
          onClick={() => inputDigit("4")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          4
        </button>
        <button
          onClick={() => inputDigit("5")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          5
        </button>
        <button
          onClick={() => inputDigit("6")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          6
        </button>
        <button
          onClick={() => calculate("*")}
          className="p-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-200 rounded font-bold"
        >
          ×
        </button>

        {/* Row 5: Tan & 1, 2, 3, - */}
        <button
          onClick={() => applyUnary("tan")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
        >
          tan
        </button>
        <button
          onClick={() => inputDigit("1")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          1
        </button>
        <button
          onClick={() => inputDigit("2")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          2
        </button>
        <button
          onClick={() => inputDigit("3")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          3
        </button>
        <button
          onClick={() => calculate("-")}
          className="p-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-200 rounded font-bold"
        >
          −
        </button>

        {/* Row 6: Pi, +-, 0, ., +, = */}
        <button
          onClick={() => applyUnary("pi")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
        >
          π
        </button>
        <button
          onClick={() => applyUnary("+-")}
          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
        >
          ±
        </button>
        <button
          onClick={() => inputDigit("0")}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          0
        </button>
        <button
          onClick={inputDot}
          className="p-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-bold"
        >
          .
        </button>
        <button
          onClick={() => calculate("+")}
          className="p-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-200 rounded font-bold"
        >
          +
        </button>
      </div>

      {/* Equals button */}
      <div className="p-2 bg-neutral-900 border-t border-neutral-800">
        <button
          onClick={() => calculate("=")}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow transition-colors text-sm"
        >
          = Evaluate
        </button>
      </div>
    </div>
  );
}
