import { describe, it, expect } from 'vitest';
import { cn, formatNumber, formatDate, formatRelativeTime } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (Tailwind class merger)', () => {
    it('merges multiple class strings correctly', () => {
      const result = cn('px-4 py-2', 'bg-emerald-500', 'text-white');
      expect(result).toBe('px-4 py-2 bg-emerald-500 text-white');
    });

    it('resolves conflicting Tailwind utilities properly', () => {
      const result = cn('p-2', 'p-4', 'text-red-500', 'text-emerald-500');
      expect(result).toBe('p-4 text-emerald-500');
    });

    it('handles falsy values and conditionals gracefully', () => {
      const isVisible = false;
      const isPrimary = true;
      const result = cn('base-class', isVisible && 'hidden', isPrimary ? 'text-white' : 'text-gray-400');
      expect(result).toBe('base-class text-white');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers to specified decimal places', () => {
      expect(formatNumber(45.678, 1)).toBe('45.7');
      expect(formatNumber(100, 2)).toBe('100.00');
      expect(formatNumber(0, 1)).toBe('0.0');
    });

    it('returns custom fallback when passed null, undefined, or NaN', () => {
      expect(formatNumber(null)).toBe('--');
      expect(formatNumber(undefined, 1, 'N/A')).toBe('N/A');
      expect(formatNumber(NaN, 1, 'ERR')).toBe('ERR');
    });
  });

  describe('formatDate', () => {
    it('returns formatted date string for valid ISO timestamp', () => {
      const iso = '2026-10-15T12:00:00.000Z';
      const formatted = formatDate(iso);
      expect(formatted).not.toBe('--');
      expect(typeof formatted).toBe('string');
    });

    it('returns fallback for null or empty input', () => {
      expect(formatDate(null)).toBe('--');
      expect(formatDate('')).toBe('--');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "Just now" for recent timestamps (< 10s)', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('returns seconds ago for timestamps under 60 seconds', () => {
      const date = new Date(Date.now() - 35 * 1000).toISOString();
      expect(formatRelativeTime(date)).toBe('35s ago');
    });

    it('returns minutes ago for timestamps under an hour', () => {
      const date = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date)).toBe('15m ago');
    });

    it('returns hours ago for timestamps under a day', () => {
      const date = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
      expect(formatRelativeTime(date)).toBe('4h ago');
    });

    it('returns "Never" for null input', () => {
      expect(formatRelativeTime(null)).toBe('Never');
    });
  });
});
