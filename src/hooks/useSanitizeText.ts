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
    
    // First, decode any HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const decodedText = tempDiv.textContent || '';
    
    // Remove any remaining HTML tags but preserve their content
    const withoutHtml = decodedText
      .replace(/<[^>]*>?/gm, '')  // Remove HTML tags
      .replace(/&nbsp;/g, ' ')    // Replace &nbsp; with space
      .replace(/\s+/g, ' ')       // Collapse multiple spaces
      .trim();
    
    return withoutHtml;
  }, []);

  return sanitizeText;
};

export default useSanitizeText;
