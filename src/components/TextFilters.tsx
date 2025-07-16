import React from 'react';

interface Props {
  texts: string[];
  selected: string;
  setSelected: (val: string) => void;
}

const TextFilters: React.FC<Props> = ({ texts, selected, setSelected }) => {
  const btnBase =
    'px-4 py-2 rounded-lg transition-colors dark:bg-indigo-900 dark:text-indigo-100';
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      <button
        className={`${btnBase} ${
          selected === 'all'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        }`}
        onClick={() => setSelected('all')}
      >
        All Texts
      </button>
      {texts.map((title) => (
        <button
          key={title}
          className={`${btnBase} ${
            selected === title
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
          onClick={() => setSelected(title)}
        >
          {title}
        </button>
      ))}
    </div>
  );
};

export default TextFilters;
