import React, { useState } from 'react';

type Entry = {
  id: string;
  en?: string;
  en_context?: string;
  xh?: string;
  xh_context?: string;
  deck?: string;
  tag?: string;
  textTitle?: string;
  isTextEntry?: boolean;
};

interface Props {
  entries: Entry[];
  mode: 'dictionary' | 'texts';
}

const Card: React.FC<{ entry: Entry }> = ({ entry }) => {
  const [showEnglishFirst, setShowEnglishFirst] = useState(true);

  const toggleLanguage = () => {
    setShowEnglishFirst(!showEnglishFirst);
  };

  return (
    <div className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start mb-2">
        {entry.tag && (
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
            {entry.tag}
          </span>
        )}
        <button 
          onClick={toggleLanguage}
          className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          aria-label="Toggle language order"
        >
          <span className={`${showEnglishFirst ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>EN</span>
          <span>/</span>
          <span className={`${!showEnglishFirst ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>XH</span>
        </button>
      </div>
      <div>
        {showEnglishFirst ? (
          <>
            <p className="text-gray-700 dark:text-gray-300">{entry.en}</p>
            {entry.en_context && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{entry.en_context}</p>
            )}
            <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium">{entry.xh}</p>
            {entry.xh_context && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{entry.xh_context}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{entry.xh}</p>
            {entry.xh_context && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{entry.xh_context}</p>
            )}
            <p className="mt-2 text-gray-700 dark:text-gray-300">{entry.en}</p>
            {entry.en_context && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{entry.en_context}</p>
            )}
          </>
        )}
      </div>
      {entry.deck && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{entry.deck}</div>
      )}
    </div>
  );
};

const ResultsGrid: React.FC<Props> = ({ entries, mode }) => {
  if (!entries.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No entries found.
      </p>
    );
  }

  if (mode === 'dictionary') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => (
          <Card key={e.id} entry={e} />
        ))}
      </div>
    );
  }

  // Texts mode – group by textTitle
  const grouped: Record<string, Entry[]> = {};
  entries.forEach((e) => {
    const title = e.textTitle || 'Untitled';
    if (!grouped[title]) grouped[title] = [];
    grouped[title].push(e);
  });

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([title, list]) => (
        <div key={title} className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
            {title}
          </h3>
          <div className="space-y-6">
            {list.map((e) => (
              <div key={e.id}>
                <p className="text-gray-700 dark:text-gray-300">{e.en}</p>
                {e.en_context && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {e.en_context}
                  </p>
                )}
                <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium">
                  {e.xh}
                </p>
                {e.xh_context && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {e.xh_context}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsGrid;
