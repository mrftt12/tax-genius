/**
 * Creates a page URL from a page name
 * @param {string} pageName - The name of the page
 * @returns {string} The URL path for the page
 */
export function createPageUrl(pageName) {
  return `/${pageName}`;
}

/**
 * Formats a currency value
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a date
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Merges class names using clsx and tailwind-merge
 * @param  {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
