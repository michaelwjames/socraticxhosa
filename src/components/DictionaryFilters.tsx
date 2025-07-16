import React from 'react';

interface Props {
  selected: string;
  setSelected: (val: string) => void;
}

const decks = ['all', 'Sentences', 'Vocabulary', 'Grammar'];

const DictionaryFilters: React.FC<Props> = ({ selected, setSelected }) => {
  const btnBase =
    'px-4 py-2 rounded-lg transition-colors dark:bg-indigo-900 dark:text-indigo-100';
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      {decks.map((d) => (
        <button
          key={d}
          className={`${btnBase} ${
            selected === d
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
          onClick={() => setSelected(d)}
        >
          {d === 'all' ? 'All' : d}
        </button>
      ))}
    </div>
  );
};

export default DictionaryFilters;
