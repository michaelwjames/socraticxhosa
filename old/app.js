// App state
let entries = []; // Global variables
let allEntries = [];
let allTexts = [];
let currentEntries = [];
let currentPage = 1;
const entriesPerPage = 50;
let currentDeck = 'all';
let currentTextFilter = 'all';
let currentSearchTerm = '';
let isDarkMode = false;
let currentFontSize = 100; // Default font size percentage
let currentMode = 'dictionary'; // 'dictionary' or 'texts', 1: small, 2: medium (default), 3: large, 4: larger

// DOM Elements
const resultsContainer = document.getElementById('results');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

// Fetch and process the JSON data
async function loadData() {
    try {
        // Load dictionary data
        const dictResponse = await fetch('server.php?file=Xhosa_notes.json');
        allEntries = await dictResponse.json();
        
        // Load texts data
        const textsResponse = await fetch('server.php?file=Xhosa_texts.json');
        allTexts = await textsResponse.json();
        
        // Process texts to group by title
        processTextEntries();
        
        applyFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('results').innerHTML = '<p class="text-red-500">Error loading data. Please try again later.</p>';
    }
}

// Process text entries to group by title
function processTextEntries() {
    const processedTexts = [];
    let currentText = null;
    
    allTexts.forEach(entry => {
        // Extract text title from the deck (format: "Xhosa Texts::Title")
        const titleMatch = entry.deck ? entry.deck.split('::')[1] : 'Untitled';
        
        if (!currentText || currentText.title !== titleMatch) {
            // Start a new text
            if (currentText) processedTexts.push(currentText);
            currentText = {
                id: `text-${processedTexts.length + 1}`,
                title: titleMatch,
                entries: []
            };
        }
        
        // Add entry to current text
        if (currentText) {
            currentText.entries.push({
                id: entry.id,
                en: entry.en,
                en_context: entry.en_context,
                xh: entry.xh,
                xh_context: entry.xh_context
            });
        }
    });
    
    // Add the last text
    if (currentText) processedTexts.push(currentText);
    
    allTexts = processedTexts;
}

// Apply filters based on search term and deck/text selection
function applyFilters() {
    if (currentMode === 'dictionary') {
        currentEntries = allEntries.filter(entry => {
            const matchesSearch = !currentSearchTerm || 
                (entry.en && entry.en.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
                (entry.xh && entry.xh.toLowerCase().includes(currentSearchTerm.toLowerCase()));
                
            const matchesDeck = currentDeck === 'all' || 
                (entry.deck && entry.deck.includes(currentDeck));
                
            return matchesSearch && matchesDeck;
        });
    } else {
        // In texts mode, filter by text title and search term
        currentEntries = [];
        allTexts.forEach(text => {
            if (currentTextFilter !== 'all' && !text.title.includes(currentTextFilter)) return;
            
            // Create a flat list of entries with text title for searching
            text.entries.forEach(entry => {
                const entryText = `${text.title} ${entry.en} ${entry.xh} ${entry.en_context || ''} ${entry.xh_context || ''}`.toLowerCase();
                const matchesSearch = !currentSearchTerm || entryText.includes(currentSearchTerm.toLowerCase());
                
                if (matchesSearch) {
                    currentEntries.push({
                        ...entry,
                        textTitle: text.title,
                        isTextEntry: true
                    });
                }
            });
        });
    }
    
    currentPage = 1; // Reset to first page when filters change
    renderResults();
    renderPagination();
}

// Render the results to the page
function renderResults() {
    const resultsContainer = document.getElementById('results');
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const paginatedEntries = currentEntries.slice(startIdx, endIdx);
    
    if (paginatedEntries.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-gray-500">No entries found. Try adjusting your search or filters.</p>';
        return;
    }
    
    if (currentMode === 'dictionary') {
        resultsContainer.innerHTML = paginatedEntries.map(entry => `
            <div class="card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                ${entry.tag ? `<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-2 dark:bg-indigo-900 dark:text-indigo-200">${entry.tag}</span>` : ''}
                <div class="entry-content">
                    <p class="text-gray-700 dark:text-gray-300">${entry.en || ''}</p>
                    ${entry.en_context ? `<p class="text-sm text-gray-500 mt-1 dark:text-gray-400">${entry.en_context}</p>` : ''}
                    <p class="mt-2 text-indigo-600 dark:text-indigo-400 font-medium">${entry.xh || ''}</p>
                    ${entry.xh_context ? `<p class="text-sm text-gray-500 mt-1 dark:text-gray-400">${entry.xh_context}</p>` : ''}
                </div>
                ${entry.deck ? `<div class="mt-2 text-xs text-gray-500 dark:text-gray-400">${entry.deck}</div>` : ''}
            </div>
        `).join('');
    } else {
        // Group entries by text title
        const groupedEntries = {};
        paginatedEntries.forEach(entry => {
            const title = entry.textTitle || 'Untitled';
            if (!groupedEntries[title]) {
                groupedEntries[title] = [];
            }
            groupedEntries[title].push(entry);
        });
        
        // Render grouped entries
        resultsContainer.innerHTML = Object.entries(groupedEntries).map(([title, entries]) => `
            <div class="card p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 mb-6">
                <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-4">${title}</h3>
                <div class="space-y-6">
                    ${entries.map(entry => `
                        <div class="text-entry">
                            <div class="text-content">
                                <p class="text-gray-700 dark:text-gray-300">${entry.en || ''}</p>
                                ${entry.en_context ? `<p class="context text-gray-500 dark:text-gray-400">${entry.en_context}</p>` : ''}
                                <p class="mt-2 text-indigo-600 dark:text-indigo-400 font-medium">${entry.xh || ''}</p>
                                ${entry.xh_context ? `<p class="context text-gray-500 dark:text-gray-400">${entry.xh_context}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    const totalPages = Math.ceil(currentEntries.length / entriesPerPage);
    
    paginationContainer.innerHTML = `
        <button id="prevPage" class="prev-page ${currentPage === 1 ? 'disabled' : ''}">Previous</button>
        <span id="pageInfo">Page ${currentPage} of ${totalPages}</span>
        <button id="nextPage" class="next-page ${currentPage === totalPages ? 'disabled' : ''}">Next</button>
    `;
    
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderResults();
            renderPagination();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderResults();
            renderPagination();
        }
    });
}

// Switch between dictionary and texts mode
function switchMode(mode) {
    if (currentMode === mode) return; // Skip if already in the requested mode
    
    currentMode = mode;
    const dictBtn = document.getElementById('dictionaryMode');
    const textsBtn = document.getElementById('textsMode');
    
    // Reset both buttons to inactive state first
    dictBtn.classList.remove('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'active:bg-indigo-800', 'focus:ring-indigo-500');
    dictBtn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
    
    textsBtn.classList.remove('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'active:bg-indigo-800', 'focus:ring-indigo-500');
    textsBtn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
    
    // Set active state for selected mode
    if (mode === 'dictionary') {
        dictBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
        dictBtn.classList.add('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'active:bg-indigo-800', 'focus:ring-indigo-500');
    } else {
        textsBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
        textsBtn.classList.add('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'active:bg-indigo-800', 'focus:ring-indigo-500');
    }
    
    // Update UI based on mode
    document.getElementById('appTitle').textContent = mode === 'dictionary' ? 'My Xhosa Database' : 'Xhosa Texts';
    document.getElementById('dictionaryFilters').classList.toggle('hidden', mode !== 'dictionary');
    document.getElementById('textFilters').classList.toggle('hidden', mode !== 'texts');
    
    // Reset search and filters when switching modes
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    currentPage = 1;
    
    // Toggle filter visibility
    document.getElementById('dictionaryFilters').classList.toggle('hidden', mode !== 'dictionary');
    document.getElementById('textFilters').classList.toggle('hidden', mode !== 'texts');
    
    // Update title
    document.getElementById('appTitle').textContent = mode === 'dictionary' 
        ? 'My Xhosa Database' 
        : 'Xhosa Texts';
    
    // Reset filters and search
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    currentPage = 1;
    
    applyFilters();
}

// Initialize the application
function init() {
    initTheme();
    initFontSize();
    initEventListeners();
    loadData();
    
    // Initialize mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            switchMode(mode);
        });
    });
    
    // Initialize deck filter buttons
    document.querySelectorAll('.deck-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            currentDeck = btn.getAttribute('data-deck');
            document.querySelectorAll('.deck-filter').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
                b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
            btn.classList.add('bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
            applyFilters();
        });
    });
    
    // Initialize text filter buttons
    document.querySelectorAll('.text-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTextFilter = btn.getAttribute('data-text');
            document.querySelectorAll('.text-filter').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
                b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
            btn.classList.add('bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
            applyFilters();
        });
    });
}

// Initialize theme from localStorage or system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check if we have a saved theme preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        isDarkMode = true;
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        isDarkMode = false;
        localStorage.setItem('theme', 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only if user hasn't set a preference
            if (e.matches) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                isDarkMode = true;
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                isDarkMode = false;
            }
        }
    });
    
    // Initialize event listeners
    function initEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // Set initial theme
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            themeIcon.innerHTML = '';
        } else {
            document.documentElement.classList.remove('dark');
            themeIcon.innerHTML = '';
        }
        
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
                themeIcon.innerHTML = '';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
                themeIcon.innerHTML = '';
            }
            // Re-apply mode to ensure button styles are correct after theme change
            switchMode(currentMode);
        });
        
        // Set initial mode and button states
        switchMode(currentMode);
    }
}

// Toggle between dark and light theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

// Update font size
function updateFontSize() {
    const sizeClasses = ['text-smaller', 'text-small', '', 'text-large', 'text-larger'];
    const body = document.body;
    
    // Remove all size classes
    body.classList.remove('text-smaller', 'text-small', 'text-medium', 'text-large', 'text-larger');
    
    // Add the current size class if it's not the default (empty string)
    if (sizeClasses[currentFontSize]) {
        body.classList.add(sizeClasses[currentFontSize]);
    }
    
    // Save to localStorage
    localStorage.setItem('fontSize', currentFontSize);
}

// Initialize font size from localStorage
function initFontSize() {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize !== null) {
        currentFontSize = parseInt(savedFontSize, 10);
        updateFontSize();
    }
}

// Initialize event listeners
function initEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        applyFilters();
    });
    
    // Set first filter button as active by default if in dictionary mode
    if (filterButtons.length > 0) {
        filterButtons[0].classList.add('active');
        
        // Add click handlers for filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentDeck = button.dataset.deck || 'all';
                applyFilters();
            });
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Font size controls
    const fontSizeDecrease = document.getElementById('fontSizeDecrease');
    if (fontSizeDecrease) {
        fontSizeDecrease.addEventListener('click', () => {
            if (currentFontSize > 0) {
                currentFontSize--;
                updateFontSize();
            }
        });
    }
    
    const fontSizeReset = document.getElementById('fontSizeReset');
    if (fontSizeReset) {
        fontSizeReset.addEventListener('click', () => {
            currentFontSize = 2; // Reset to medium
            updateFontSize();
        });
    }
    
    const fontSizeIncrease = document.getElementById('fontSizeIncrease');
    if (fontSizeIncrease) {
        fontSizeIncrease.addEventListener('click', () => {
            if (currentFontSize < 4) {
                currentFontSize++;
                updateFontSize();
            }
        });
    }
}

// Start the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});
