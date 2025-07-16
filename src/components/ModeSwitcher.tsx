import React from 'react';

type Mode = 'dictionary' | 'texts';

interface Props {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ModeSwitcher: React.FC<Props> = ({ mode, setMode }) => {
  const btnBase =
    'px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none';
  const active =
    'bg-indigo-600 text-white hover:bg-indigo-700';
  const inactive =
    'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300';
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        className={`${btnBase} ${mode === 'dictionary' ? active : inactive}`}
        onClick={() => setMode('dictionary')}
      >
        Dictionary
      </button>
      <button
        className={`${btnBase} ${mode === 'texts' ? active : inactive}`}
        onClick={() => setMode('texts')}
      >
        Texts
      </button>
    </div>
  );
};

export default ModeSwitcher;
