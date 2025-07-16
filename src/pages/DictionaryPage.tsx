import React, { useState, useEffect, useMemo } from 'react';
import ModeSwitcher from '../components/ModeSwitcher';
import SearchBar from '../components/SearchBar';
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
        // Load dictionary data
        const dictResponse = await fetch('/data/dictionary.json');
        const dictData = await dictResponse.json() as DictionaryEntry[];
        setDictionary(dictData);
        
        // Load texts data
        const textsResponse = await fetch('/data/Xhosa_texts.json');
        const textsData = await textsResponse.json() as TextEntry[];
        setTexts(textsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Get entries based on current mode
  const currentEntries = useMemo(() => {
    if (mode === 'dictionary') {
      return dictionary.slice(0, 10); // Just show first 10 entries for now
    } else {
      return texts.slice(0, 10); // Just show first 10 entries for now
    }
  }, [dictionary, texts, mode]);

  // Handle mode change
  const handleModeChange = (newMode: 'dictionary' | 'texts') => {
    setMode(newMode);
    setSearchTerm('');
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle filter changes
  useEffect(() => {
    // Reset to first page when filters change
    // This is a placeholder for when we re-implement pagination
  }, [searchTerm, selectedDeck, selectedText, mode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Xhosa Dictionary</h1>
        
        <div className="mb-6">
          <ModeSwitcher mode={mode} setMode={handleModeChange} />
        </div>
        
        <div className="mb-6">
          <SearchBar value={searchTerm} onChange={handleSearch} />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentEntries.map(entry => (
            <div key={entry.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
              {mode === 'dictionary' ? (
                <>
                  <h3 className="text-lg font-semibold">{(entry as DictionaryEntry).xhosa}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{(entry as DictionaryEntry).english}</p>
                  {entry.notes && <p className="text-sm text-gray-500 dark:text-gray-400">{entry.notes}</p>}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{(entry as TextEntry).title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{(entry as TextEntry).text}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{(entry as TextEntry).translation}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DictionaryPage;
