export const cleanText = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    // Replace commas, dots, and common punctuation with space
    .replace(/[,\.!?;:'"()\[\]{}\-_=+\\\/|]/g, ' ')
    // Remove any remaining special characters except alphanumeric and spaces
    .replace(/[^a-z0-9\s]/g, '')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();
};
