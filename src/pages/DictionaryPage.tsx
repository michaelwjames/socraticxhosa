import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DictionaryFilters from '../components/DictionaryFilters';
import TextFilters from '../components/TextFilters';
import useSanitizeText from '../hooks/useSanitizeText';
import type { DictionaryEntry, TextEntry, DictionaryPageProps } from '../types/index';

const DictionaryPage: React.FC<DictionaryPageProps> = ({ isDarkMode }) => {
  const sanitizeText = useSanitizeText();
  const [mode] = useState<'dictionary' | 'texts'>('dictionary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [selectedText, setSelectedText] = useState<string>('all');
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [texts] = useState<TextEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEnglishFirst, setShowEnglishFirst] = useState(true);
  const entriesPerPage = 50;

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
      
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Get unique deck names from texts for the filter
  const textDecks = useMemo(() => {
    const decks = new Set<string>();
    texts.forEach(entry => {
      if (entry.deck) {
        // Extract the actual deck name after 'Xhosa Texts::'
        const deckName = entry.deck.split('::').pop() || '';
        if (deckName) {
          decks.add(deckName);
        }
      }
    });
    return Array.from(decks).sort();
  }, [texts]);

  // Get filtered entries based on current mode and filters
  const filteredEntries = useMemo(() => {
    if (mode === 'dictionary') {
      return dictionary.filter(entry => {
        // Check if entry matches the selected deck filter
        const matchesDeck = selectedDeck === 'all' || 
          (entry.deck && entry.deck.includes(selectedDeck));
        
        // Check if entry matches the search term
        const matchesSearch = searchTerm === '' || 
          (entry.xh && entry.xh.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.en && entry.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.en_context && entry.en_context.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesDeck && matchesSearch;
      });
    } else {
      return texts.filter(entry => {
        // Check if entry matches the selected text filter
        const deckName = entry.deck ? entry.deck.split('::').pop() : '';
        const matchesText = selectedText === 'all' || 
          (deckName && deckName === selectedText);
        
        // Check if entry matches the search term
        const matchesSearch = searchTerm === '' ||
          (entry.xh && entry.xh.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.en && entry.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.en_context && entry.en_context.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesText && matchesSearch;
      });
    }
  }, [dictionary, texts, mode, searchTerm, selectedDeck, selectedText]);

  // Process entries for display
  const processedEntries = useMemo(() => {
    return filteredEntries.map(entry => ({
      ...entry,
      xh: sanitizeText(entry.xh),
      en: sanitizeText(entry.en),
      en_context: entry.en_context ? sanitizeText(entry.en_context) : undefined,
      xh_context: entry.xh_context ? sanitizeText(entry.xh_context) : undefined
    }));
  }, [filteredEntries, sanitizeText]);

  // Pagination
  const totalPages = Math.ceil(processedEntries.length / entriesPerPage);
  const currentEntries = useMemo(() => {
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    return processedEntries.slice(startIdx, endIdx);
  }, [processedEntries, currentPage, entriesPerPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDeck, selectedText, mode]);


  // Handle filter changes
  useEffect(() => {
    // Reset to first page when filters change
    // This is a placeholder for when we re-implement pagination
  }, [searchTerm, selectedDeck, selectedText, mode]);

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-gray-100 dark:bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xhosa Dictionary</h1>
          <div className="flex items-center space-x-4">
            
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 bg-white dark:bg-transparent transition-colors"
              onClick={() => setShowEnglishFirst(!showEnglishFirst)}
            >
              <span className={!showEnglishFirst ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}>XH</span>
              <svg 
                className="h-5 w-5 mx-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className={showEnglishFirst ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}>EN</span>
            </button>
          </div>
        </div>
          
          <div className="mb-6">
            
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${mode === 'dictionary' ? 'dictionary' : 'texts'}...`}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                texts={textDecks}
                selected={selectedText}
                setSelected={setSelectedText}
              />
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {currentEntries.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No entries found</p>
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {currentEntries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 h-full flex flex-col"
                  >
                    {/* Deck badge - now on its own line */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full truncate max-w-full">
                        {entry.deck.split('::').pop()}
                      </span>
                     
                    </div>
                    
                    {/* Main content */}
                    <div className="flex-1">
                      {showEnglishFirst ? (
                        <>
                          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                            {entry.en}
                            {entry.en_context && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                &nbsp;/ {entry.en_context}
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {entry.xh}
                            {entry.xh_context && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                &nbsp;/ {entry.xh_context}
                              </span>
                            )}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                            {entry.xh}
                            {entry.xh_context && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                &nbsp;/ {entry.xh_context}
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {entry.en}
                            {entry.en_context && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                &nbsp;/ {entry.en_context}
                              </span>
                            )}
                          </p>
                        </>
                      )}
                     
                      {entry.tag && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                          {entry.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default DictionaryPage;
