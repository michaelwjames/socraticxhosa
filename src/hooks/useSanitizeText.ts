import { useCallback } from 'react';

/**
 * A custom hook that provides a function to sanitize text by removing &nbsp; and other unwanted characters
 * @returns A function that takes a string and returns a sanitized version
 */
const useSanitizeText = () => {
  /**
   * Sanitizes text by removing &nbsp; and other unwanted characters
   * @param text The text to sanitize
   * @returns The sanitized text
   */
  const sanitizeText = useCallback((text: string | undefined): string => {
    if (!text) return '';
    
    // Replace &nbsp; with a regular space
    return text
      .replace(/&nbsp;/g, ' ')
      // Trim extra spaces that might result from the replacement
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  return sanitizeText;
};

export default useSanitizeText;
