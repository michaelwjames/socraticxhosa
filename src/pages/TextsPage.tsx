import React, { useState, useEffect, useMemo } from 'react';
import type { TextEntry } from '../types/index';
import useSanitizeText from '../hooks/useSanitizeText';

const TextsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [showEnglishFirst, setShowEnglishFirst] = useState(true);
  const [selectedText, setSelectedText] = useState<string>('all');
  const sanitizeText = useSanitizeText();
  
  // Default deck to show if available
  const defaultDeck = "Xhosa Texts::Nkosi sikelel' iAfrika";

  // Load texts data on mount
  useEffect(() => {
    const loadTexts = async () => {
      try {
        console.log('Loading texts data...');
        const response = await fetch('/data/Xhosa_texts.json');
        if (!response.ok) {
          throw new Error(`Failed to load texts: ${response.statusText}`);
        }
        const data = await response.json();
        setTexts(data as TextEntry[]);
      } catch (error) {
        console.error('Error loading texts:', error);
      }
    };

    loadTexts();
  }, []);

  // Get unique deck names from texts for the filter
  const textDecks = useMemo(() => {
    const decks = new Set<string>();
    let hasDefaultDeck = false;
    
    texts.forEach(entry => {
      if (entry.deck) {
        const deckName = entry.deck.split('::').pop() || '';
        if (deckName) {
          decks.add(deckName);
          if (deckName === defaultDeck) {
            hasDefaultDeck = true;
          }
        }
      }
    });
    
    const decksArray = Array.from(decks).sort();
    
    // If default deck exists and we haven't set it yet, set it as selected
    if (hasDefaultDeck && selectedText === 'all') {
      setSelectedText(defaultDeck);
    }
    
    return decksArray;
  }, [texts, defaultDeck, selectedText]);

  // Filter and sanitize texts based on search and selected text
  const filteredTexts = useMemo(() => {
    return texts.map(entry => ({
      ...entry,
      xh: sanitizeText(entry.xh),
      en: sanitizeText(entry.en),
      xh_context: entry.xh_context ? sanitizeText(entry.xh_context) : undefined,
      en_context: entry.en_context ? sanitizeText(entry.en_context) : undefined,
      tag: entry.tag ? sanitizeText(entry.tag) : undefined,
      deck: entry.deck ? sanitizeText(entry.deck) : undefined
    })).filter(entry => {
      const deckName = entry.deck ? entry.deck.split('::').pop() : '';
      const matchesText = selectedText === 'all' || (deckName && deckName === selectedText);
      
      const matchesSearch = searchTerm === '' ||
        (entry.xh && entry.xh.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.en && entry.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.en_context && entry.en_context.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesText && matchesSearch;
    });
  }, [texts, searchTerm, selectedText, sanitizeText]);


  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xhosa Texts</h1>
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
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search texts..."
              />
            </div>
            
            <div className="w-full sm:w-64">
              <select
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Texts</option>
                {textDecks.map((deck) => (
                  <option key={deck} value={deck}>
                    {deck}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredTexts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No texts found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTexts.map((entry) => (
                <div
                  key={entry.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  {entry.tag && (
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      {entry.tag}
                    </span>
                  )}
                  
                  <div className="space-y-4">
                    {showEnglishFirst ? (
                      <>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {entry.en}
                          </h3>
                          {entry.en_context && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                              {entry.en_context}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-indigo-600 dark:text-indigo-400">
                            {entry.xh}
                          </p>
                          {entry.xh_context && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                              {entry.xh_context}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                            {entry.xh}
                          </h3>
                          {entry.xh_context && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                              {entry.xh_context}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-900 dark:text-white">
                            {entry.en}
                          </p>
                          {entry.en_context && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                              {entry.en_context}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextsPage;
