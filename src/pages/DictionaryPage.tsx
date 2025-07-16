import React, { useState, useEffect, useMemo } from 'react';
import ModeSwitcher from '../components/ModeSwitcher';
import DictionaryFilters from '../components/DictionaryFilters';
import TextFilters from '../components/TextFilters';
import type { DictionaryEntry, TextEntry, DictionaryPageProps } from '../types';

const DictionaryPage: React.FC<DictionaryPageProps> = ({ isDarkMode }) => {
  const [mode, setMode] = useState<'dictionary' | 'texts'>('dictionary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [selectedText, setSelectedText] = useState<string>('all');
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [texts, setTexts] = useState<TextEntry[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading dictionary data...');
        const dictResponse = await fetch('/data/Xhosa_notes.json');
        console.log('Dictionary response status:', dictResponse.status);
        if (!dictResponse.ok) {
          throw new Error(`Failed to load dictionary data: ${dictResponse.statusText}`);
        }
        const dictData = await dictResponse.json();
        console.log('Dictionary data loaded:', dictData);
        setDictionary(dictData as DictionaryEntry[]);
        
        console.log('Loading texts data...');
        const textsResponse = await fetch('/data/Xhosa_texts.json');
        console.log('Texts response status:', textsResponse.status);
        if (!textsResponse.ok) {
          throw new Error(`Failed to load texts data: ${textsResponse.statusText}`);
        }
        const textsData = await textsResponse.json();
        console.log('Texts data loaded:', textsData);
        setTexts(textsData as TextEntry[]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Get entries based on current mode
  const currentEntries = useMemo(() => {
    if (mode === 'dictionary') {
      return dictionary
        .filter(entry => 
          entry.xh.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.en_context && entry.en_context.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10);
    } else {
      return texts
        .filter(entry => 
          entry.xh.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.en_context && entry.en_context.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10);
    }
  }, [dictionary, texts, mode, searchTerm]);

  // Handle mode change
  const handleModeChange = (newMode: 'dictionary' | 'texts') => {
    setMode(newMode);
    setSearchTerm('');
  };

  // Handle filter changes
  useEffect(() => {
    // Reset to first page when filters change
    // This is a placeholder for when we re-implement pagination
  }, [searchTerm, selectedDeck, selectedText, mode]);

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Xhosa Dictionary</h1>
          
          <div className="mb-6">
            <ModeSwitcher mode={mode} setMode={handleModeChange} />
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${mode === 'dictionary' ? 'dictionary' : 'texts'}...`}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-6">
            {mode === 'dictionary' ? (
              <DictionaryFilters 
                selected={selectedDeck}
                setSelected={setSelectedDeck}
              />
            ) : (
              <TextFilters 
                texts={[]}
                selected={selectedText}
                setSelected={setSelectedText}
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pb-8">
            {currentEntries.map((entry) => (
              <div 
                key={entry.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {entry.xh}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{entry.en}</p>
                    {entry.en_context && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                        {entry.en_context}
                      </p>
                    )}
                    {entry.tag && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                        {entry.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.deck.split('::').pop()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryPage;
