import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Define types for getStateClass
type StateType = 'checking' | 'amplified' | 'found' | 'unchecked';
type SearchType = 'classical' | 'quantum';

const getStateClass = (
  state: StateType,
  baseClass: string = 'bg-gray-100',
  type: SearchType = 'classical'
): string => {
  switch (state) {
    case 'checking':
      return 'bg-yellow-200';
    case 'amplified':
      return type === 'quantum'
        ? 'bg-purple-500 animate-ping ring-2 ring-purple-600 ring-offset-1'
        : 'bg-purple-400';
    case 'found':
      return 'bg-green-500';
    default:
      return baseClass;
  }
};

// Define types for Physical Qubits
interface PhysicalQubit {
  hasError: boolean;
}

// Define props for BitStateVisualization
interface BitStateVisualizationProps {
  number: number;
  type: SearchType;
  physicalQubits: PhysicalQubit[];
  bitLength: number;
}

const BitStateVisualization: React.FC<BitStateVisualizationProps> = ({ number, type, physicalQubits, bitLength }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const dimension = bitLength === 16 ? 4 : 3;
  const binary = number.toString(2).padStart(bitLength, '0'); 
  useEffect(() => {
    const interval = setInterval(() => setIsFlipped(prev => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  const bitsPerRow = bitLength / dimension;
  const rows: string[] = [];
  for (let i = 0; i < dimension; i++) {
    rows.push(binary.slice(i * bitsPerRow, (i + 1) * bitsPerRow));
  }

  const contributions: number[] = binary
    .split('')
    .map((bit: string, i: number) => bit === '1' ? Math.pow(2, bitLength - 1 - i) : 0);
  const total: number = contributions.reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-700 font-bold">
        {bitLength}-bit Room Address
      </div>
      <div className={`grid grid-rows-${dimension} gap-1`}>
        {rows.map((rowBits, r) => (
          <div key={r} className="flex gap-1">
            {rowBits.split('').map((bit: string, c) => (
              <div 
                key={c}
                className={
                  `w-6 h-6 rounded flex items-center justify-center text-[10px] font-semibold
                  transition-all duration-300
                  ${type === 'classical' 
                    ? (bit === '1' ? 'bg-blue-500 text-white' : 'bg-gray-200')
                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 animate-pulse text-white'}`
                }
              >
                {type === 'classical' ? bit : '+'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {type === 'classical' && (
        <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-2">
          <div>=</div>
          <div className="font-medium text-gray-800">{total}</div>
        </div>
      )}

      <div className={
        `w-6 h-6 rounded-full flex items-center justify-center text-base mt-1
         ${type === 'classical' 
           ? `transform transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}` 
           : 'animate-pulse'}`
      }>
        {type === 'classical' ? (isFlipped ? '😿' : '😺') : '😺😿'}
      </div>

      {type === 'quantum' && (
        <div className="flex flex-col items-center mt-4 space-y-2">
          <div 
            className="relative w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center"
            title="Multiple physical qubits represent and stabilize the quantum state."
          >
            <div className="grid grid-cols-4 gap-1">
              {physicalQubits.map((q: PhysicalQubit, i: number) => (
                <div 
                  key={i}
                  className={`w-4 h-4 rounded-full ${q.hasError ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}
                ></div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-600 text-center px-4">
            Physical qubits maintain a stable superposition. Errors (red) are corrected, keeping the logical state (green).
          </div>
        </div>
      )}
    </div>
  );
};

// Define props for SearchGrid
interface SearchGridProps {
  states: StateType[];
  currentIndex: number;
  type: SearchType;
  numbers: number[];
  target: number;
  bitLength: number;
  targetIndex: number;
}

const SearchGrid: React.FC<SearchGridProps> = ({ states, currentIndex, type, numbers, target, bitLength, targetIndex }) => {
  if (bitLength === 9) {
    // 9-bit 시나리오: 모든 room을 한 번에 표시
    const total = states.length; // 512
    const gridSize = 23;
    const gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    const rows: StateType[][] = [];
    for (let i = 0; i < gridSize; i++) {
      rows.push(states.slice(i * gridSize, (i + 1) * gridSize));
    }

    return (
      <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="grid gap-px bg-gray-200 w-full h-full"
          style={{ gridTemplateColumns: gridTemplateColumns }}
        >
          {rows.map((row: StateType[], rIdx: number) => 
            row.map((state: StateType, cIdx: number) => {
              const idx = rIdx * gridSize + cIdx;
              const isCurrentlyChecking = type === 'classical' && idx === currentIndex;
              const cellStateClass = getStateClass(state, 'bg-gray-100', type);
              const currentCellClass = isCurrentlyChecking 
                ? 'transform scale-125 z-20 ring-2 ring-orange-400 bg-gradient-to-r from-yellow-200 to-orange-200 animate-pulse shadow-lg' 
                : '';

              if (idx >= total) {
                return <div key={cIdx} className="bg-gray-200"></div>;
              }

              return (
                <div
                  key={cIdx}
                  className={`relative ${cellStateClass} ${currentCellClass} min-h-[2px] transition-all duration-200`}
                ></div>
              );
            })
          )}
        </div>
      </div>
    );
  } else {
    // 16-bit 시나리오: 64개 단위로 Chunking
    const chunkSize = 64; 
    const chunkedStates: StateType[][] = [];
    for (let i = 0; i < states.length; i += chunkSize) {
      chunkedStates.push(states.slice(i, i + chunkSize));
    }

    // 총 65536개에서 64개씩 -> 1024개 Chunk, 32 x 32 Grid
    const chunksPerRow = 32; 
    const gridTemplateColumns = `repeat(${chunksPerRow}, 1fr)`;

    return (
      <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="grid gap-px bg-gray-200 w-full h-full"
          style={{ gridTemplateColumns: gridTemplateColumns }}
        >
          {chunkedStates.map((chunk: StateType[], chunkIndex: number) => {
            const startIndex = chunkIndex * chunkSize;
            const endIndex = startIndex + chunkSize;
            const isCurrentlyChecking = 
              type === 'classical' && 
              startIndex <= currentIndex && 
              currentIndex < endIndex;

            const baseClass = 'bg-gray-100';
            const checkedClass = chunk.some((_: StateType, i: number) => 
              type === 'classical' && numbers[startIndex + i] !== target && currentIndex > startIndex + i
            ) ? 'bg-blue-100' : '';

            const stateClass = type === 'classical'
              ? getStateClass(chunk[0], checkedClass || baseClass, type)
              : getStateClass(chunk[0], baseClass, type);

            const currentCellClass = isCurrentlyChecking ? 
              'transform scale-125 z-20 ring-2 ring-orange-400 bg-gradient-to-r from-yellow-200 to-orange-200 animate-pulse shadow-lg' 
              : '';

            // Quantum 시나리오에서, 해당 Chunk에 target이 포함되어 있고
            // Chunk 내에 amplified나 found 상태가 있을 경우 강조
            let quantumChunkHighlight = '';
            if (type === 'quantum' && targetIndex >= startIndex && targetIndex < endIndex) {
              // Chunk 내에 amplified나 found 상태가 있는지 확인
              const hasAmplifiedOrFound = chunk.some((st: StateType) => st === 'amplified' || st === 'found');
              if (hasAmplifiedOrFound) {
                // 보라색 배경 + animate-pulse로 강조
                quantumChunkHighlight = 'bg-purple-200 animate-pulse';
              }
            }

            return (
              <div 
                key={chunkIndex} 
                className={`relative ${stateClass} ${currentCellClass} ${quantumChunkHighlight}
                  min-h-[2px] transition-all duration-200`}
              ></div>
            );
          })}
        </div>
      </div>
    );
  }
};

// Define types for SearchSimulation state
// interface SearchSimulationState { ... } // 제거됨

const SearchSimulation: React.FC = () => {
  const [bitLength, setBitLength] = useState<number>(16);

  const TOTAL_NUMBERS = 2 ** bitLength;
  const CLASSICAL_DELAY = bitLength === 9 ? 50 : 5; // 9-bit: 느림, 16-bit: 빠름
  const QUANTUM_ITERATIONS = Math.floor(Math.sqrt(TOTAL_NUMBERS));

  const [numbers, setNumbers] = useState<number[]>(() => {
    const arr = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  
  const [target, setTarget] = useState<number>(() => numbers[Math.floor(Math.random() * TOTAL_NUMBERS)]);
  const targetIndex: number = numbers.findIndex(n => n === target);

  const [currentNumber, setCurrentNumber] = useState<{ classical: number; quantum: number }>({ classical: 0, quantum: 0 });
  const [classicalStates, setClassicalStates] = useState<StateType[]>(Array(TOTAL_NUMBERS).fill('unchecked'));
  const [quantumStates, setQuantumStates] = useState<StateType[]>(Array(TOTAL_NUMBERS).fill('unchecked'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentIndices, setCurrentIndices] = useState<{ classical: number; quantum: number }>({ classical: -1, quantum: -1 });
  const [checksCount, setChecksCount] = useState<{ classical: number; quantum: number }>({ classical: 0, quantum: 0 });
  const [showResults, setShowResults] = useState<boolean>(false);

  const [physicalQubits, setPhysicalQubits] = useState<PhysicalQubit[]>(
    Array.from({ length: 16 }, () => ({ hasError: false }))
  );

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    if (isRunning) {
      const errorInterval = setInterval(() => {
        setPhysicalQubits(prev => prev.map(q => ({
          ...q,
          hasError: Math.random() < 0.2 // 20% chance of error
        })));
      }, 3000);

      const correctionInterval = setInterval(() => {
        setPhysicalQubits(prev => prev.map(q => ({ ...q, hasError: false })));
      }, 6000);

      return () => {
        clearInterval(errorInterval);
        clearInterval(correctionInterval);
      };
    }
  }, [isRunning]);

  const runClassicalSearch = async () => {
    let checks = 0;
    const newStates = [...classicalStates];
    
    for (let i = 0; i < numbers.length; i++) {
      if (cancelRef.current) break; // Check for cancellation

      checks++;
      setChecksCount(prev => ({ ...prev, classical: checks }));
      setCurrentIndices(prev => ({ ...prev, classical: i }));

      if (currentNumber.classical !== numbers[i]) {
        setCurrentNumber(prev => ({ ...prev, classical: numbers[i] }));
      }

      newStates[i] = 'checking';
      setClassicalStates([...newStates]);
      await new Promise(r => setTimeout(r, CLASSICAL_DELAY));
      
      if (numbers[i] === target) {
        newStates[i] = 'found';
        setClassicalStates([...newStates]);
        break;
      }
      newStates[i] = 'unchecked';
      setClassicalStates([...newStates]);
    }
  };

  const runQuantumSearch = async () => {
    let checks = 0;

    setQuantumStates(Array(TOTAL_NUMBERS).fill('checking'));
    if (currentNumber.quantum !== target) {
      setCurrentNumber(prev => ({ ...prev, quantum: target }));
    }

    const iterationDelay = bitLength === 9 ? 50 : 200;
    
    await new Promise(r => setTimeout(r, 1000));
    checks++;
    
    for (let i = 0; i < QUANTUM_ITERATIONS; i++) {
      if (cancelRef.current) break; // Check for cancellation

      setChecksCount(prev => ({ ...prev, quantum: checks }));
      setQuantumStates(prev => prev.map((state, idx) => idx === targetIndex ? 'amplified' : state));
      checks++;
      await new Promise(r => setTimeout(r, iterationDelay));
      
      if (i < QUANTUM_ITERATIONS - 1) {
        setQuantumStates(prev => prev.map(() => 'checking'));
        await new Promise(r => setTimeout(r, iterationDelay));
      }
    }
    
    if (!cancelRef.current) {
      setQuantumStates(prev => prev.map((_, idx) => idx === targetIndex ? 'found' : 'unchecked'));
    }
  };

  const startSimulation = async () => {
    setIsRunning(true);
    setShowResults(false);
    setChecksCount({ classical: 0, quantum: 0 });
    setCurrentIndices({ classical: -1, quantum: -1 });
    setCurrentNumber({ classical: 0, quantum: 0 });
    setClassicalStates(Array(TOTAL_NUMBERS).fill('unchecked'));
    setQuantumStates(Array(TOTAL_NUMBERS).fill('unchecked'));
    cancelRef.current = false;

    try {
      await Promise.all([runClassicalSearch(), runQuantumSearch()]);
      if (!cancelRef.current) {
        setIsRunning(false);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Simulation interrupted:', error);
      setIsRunning(false);
    }
  };

  const stopSimulation = () => {
    cancelRef.current = true;
    setIsRunning(false);
  };

  const resetSimulation = () => {
    const arr = Array.from({ length: 2**bitLength }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setNumbers(arr);
    setTarget(arr[Math.floor(Math.random() * (2**bitLength))]);
    setChecksCount({ classical: 0, quantum: 0 });
    setCurrentIndices({ classical: -1, quantum: -1 });
    setCurrentNumber({ classical: 0, quantum: 0 });
    setClassicalStates(Array(2**bitLength).fill('unchecked'));
    setQuantumStates(Array(2**bitLength).fill('unchecked'));
    setShowResults(false);
    setPhysicalQubits(prev => prev.map(q => ({ ...q, hasError: false })));
  };

  const setBitLengthAndReset = (newBitLength: number) => {
    if (bitLength === newBitLength) return; 
    setBitLength(newBitLength);
    setTimeout(() => {
      const arr = Array.from({ length: 2**newBitLength }, (_, i) => i + 1);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setNumbers(arr);
      setTarget(arr[Math.floor(Math.random() * (2**newBitLength))]);
      setChecksCount({ classical: 0, quantum: 0 });
      setCurrentIndices({ classical: -1, quantum: -1 });
      setCurrentNumber({ classical: 0, quantum: 0 });
      setClassicalStates(Array(2**newBitLength).fill('unchecked'));
      setQuantumStates(Array(2**newBitLength).fill('unchecked'));
      setShowResults(false);
      setPhysicalQubits(prev => prev.map(q => ({ ...q, hasError: false })));
    }, 0);
  };

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Bit-Length Selection Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded ${bitLength === 9 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} 
            ${isRunning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
          onClick={() => setBitLengthAndReset(9)}
          disabled={isRunning}
        >
          9-bit (512 rooms)
        </button>
        <button
          className={`px-4 py-2 rounded ${bitLength === 16 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} 
            ${isRunning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
          onClick={() => setBitLengthAndReset(16)}
          disabled={isRunning}
        >
          16-bit (65536 rooms)
        </button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Find Schrödinger's Cat ({bitLength}-bit = {2**bitLength} Rooms)</CardTitle>
          <div className="text-center mt-2">
            <span className="inline-block px-4 py-2 bg-blue-100 rounded-lg">
              🎯 Cat ID: <span className="font-bold text-blue-600">{target}</span>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg min-h-[11rem]">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col items-center border-r border-gray-200 pt-2">
                  <div className="text-xs text-gray-500 mb-2">Classical Bits ({bitLength}-bit)</div>
                  <BitStateVisualization 
                    number={currentNumber.classical || target} 
                    type="classical"
                    physicalQubits={physicalQubits}
                    bitLength={bitLength}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Classical: Checking each room one by one.
                  </p>
                </div>
                <div className="flex flex-col items-center pt-2">
                  <div className="text-xs text-gray-500 mb-2">Quantum State ({bitLength}-bit)</div>
                  <BitStateVisualization 
                    number={currentNumber.quantum || target} 
                    type="quantum"
                    physicalQubits={physicalQubits}
                    bitLength={bitLength}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Quantum: Using superposition and error-corrected qubits.
                  </p>
                </div>
              </div>
            </div>

            {/* Start/Stop Button */}
            <div className="mt-8 flex justify-center">
              <button
                className={`px-6 py-3 rounded-lg ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
                onClick={isRunning ? stopSimulation : startSimulation}
              >
                {isRunning ? 'Stop' : 'Start the Mission'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Classical Search (O(n) = {2**bitLength})</h3>
                <SearchGrid 
                  states={classicalStates} 
                  currentIndex={currentIndices.classical} 
                  type="classical"
                  numbers={numbers}
                  target={target}
                  bitLength={bitLength}
                  targetIndex={targetIndex}
                />
                <div className="text-sm text-center">
                  Rooms Checked: {checksCount.classical}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quantum Search (O(√n) = {QUANTUM_ITERATIONS})</h3>
                <SearchGrid 
                  states={quantumStates} 
                  currentIndex={currentIndices.quantum} 
                  type="quantum"
                  numbers={numbers}
                  target={target}
                  bitLength={bitLength}
                  targetIndex={targetIndex}
                />
                <div className="text-sm text-center">
                  Quantum Iterations: {checksCount.quantum} / {QUANTUM_ITERATIONS}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600 text-center space-x-3">
              <span>Checked: Blue</span>
              <span>Checking: Yellow</span>
              <span>Amplified: Purple </span>
              <span>Found: Green</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showResults && !cancelRef.current} onOpenChange={setShowResults}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mission Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p>Classical Method: {checksCount.classical} checks</p>
                    <p>Quantum Method: {checksCount.quantum} iterations</p>
                    <p className="text-green-600 font-semibold">
                      {checksCount.quantum > 0 
                        ? `${Math.round(checksCount.classical / checksCount.quantum)}x faster using quantum search!`
                        : 'Quantum search did not complete successfully.'}
                    </p>
                    <p className="text-sm text-gray-700">
                      Experimenting with {bitLength}-bit ({2**bitLength} rooms) helps see how quantum searching scales compared to classical methods.
                    </p>
                  </div>
                  <button 
                    className="px-4 py-2 mt-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    onClick={resetSimulation}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SearchSimulation;
