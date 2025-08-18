import { describe, it, expect } from 'vitest';
import {
  isValidLevel,
  getLevelIndex,
  isLevelHigher,
  getLevelsUpTo,
  getNextLevel,
  getPreviousLevel,
  formatLevelName,
  requiresSpecialAccess,
  validateLevelAccessRequest,
  sortLevelsByHierarchy,
} from '../level-access-utils';

describe('Level Access Utils', () => {
  describe('isValidLevel', () => {
    it('should return true for valid levels', () => {
      expect(isValidLevel('beginner')).toBe(true);
      expect(isValidLevel('BEGINNER')).toBe(true);
      expect(isValidLevel('movers')).toBe(true);
      expect(isValidLevel('ket')).toBe(true);
      expect(isValidLevel('cpe')).toBe(true);
    });

    it('should return false for invalid levels', () => {
      expect(isValidLevel('invalid')).toBe(false);
      expect(isValidLevel('')).toBe(false);
      expect(isValidLevel('advanced')).toBe(false);
    });
  });

  describe('getLevelIndex', () => {
    it('should return correct index for valid levels', () => {
      expect(getLevelIndex('beginner')).toBe(0);
      expect(getLevelIndex('movers')).toBe(1);
      expect(getLevelIndex('cpe')).toBe(7);
    });

    it('should return -1 for invalid levels', () => {
      expect(getLevelIndex('invalid')).toBe(-1);
    });
  });

  describe('isLevelHigher', () => {
    it('should correctly compare levels', () => {
      expect(isLevelHigher('movers', 'beginner')).toBe(true);
      expect(isLevelHigher('beginner', 'movers')).toBe(false);
      expect(isLevelHigher('cpe', 'ket')).toBe(true);
      expect(isLevelHigher('ket', 'cpe')).toBe(false);
    });

    it('should return false for invalid levels', () => {
      expect(isLevelHigher('invalid', 'beginner')).toBe(false);
      expect(isLevelHigher('beginner', 'invalid')).toBe(false);
    });
  });

  describe('getLevelsUpTo', () => {
    it('should return correct levels up to specified level', () => {
      expect(getLevelsUpTo('beginner')).toEqual(['beginner']);
      expect(getLevelsUpTo('movers')).toEqual(['beginner', 'movers']);
      expect(getLevelsUpTo('flyers')).toEqual(['beginner', 'movers', 'flyers']);
    });

    it('should return beginner for invalid levels', () => {
      expect(getLevelsUpTo('invalid')).toEqual(['beginner']);
    });
  });

  describe('getNextLevel', () => {
    it('should return next level in hierarchy', () => {
      expect(getNextLevel('beginner')).toBe('movers');
      expect(getNextLevel('movers')).toBe('flyers');
      expect(getNextLevel('cae')).toBe('cpe');
    });

    it('should return null for highest level', () => {
      expect(getNextLevel('cpe')).toBe(null);
    });

    it('should return null for invalid levels', () => {
      expect(getNextLevel('invalid')).toBe(null);
    });
  });

  describe('getPreviousLevel', () => {
    it('should return previous level in hierarchy', () => {
      expect(getPreviousLevel('movers')).toBe('beginner');
      expect(getPreviousLevel('flyers')).toBe('movers');
      expect(getPreviousLevel('cpe')).toBe('cae');
    });

    it('should return null for lowest level', () => {
      expect(getPreviousLevel('beginner')).toBe(null);
    });

    it('should return null for invalid levels', () => {
      expect(getPreviousLevel('invalid')).toBe(null);
    });
  });

  describe('formatLevelName', () => {
    it('should format level names correctly', () => {
      expect(formatLevelName('beginner')).toBe('Beginner');
      expect(formatLevelName('MOVERS')).toBe('Movers');
      expect(formatLevelName('ket')).toBe('KET');
      expect(formatLevelName('FCE')).toBe('FCE');
    });

    it('should return as-is for invalid levels', () => {
      expect(formatLevelName('invalid')).toBe('invalid');
    });
  });

  describe('requiresSpecialAccess', () => {
    it('should return false only for beginner', () => {
      expect(requiresSpecialAccess('beginner')).toBe(false);
      expect(requiresSpecialAccess('BEGINNER')).toBe(false);
    });

    it('should return true for all other levels', () => {
      expect(requiresSpecialAccess('movers')).toBe(true);
      expect(requiresSpecialAccess('ket')).toBe(true);
      expect(requiresSpecialAccess('cpe')).toBe(true);
      expect(requiresSpecialAccess('invalid')).toBe(true);
    });
  });

  describe('validateLevelAccessRequest', () => {
    it('should validate correct access requests', () => {
      const result = validateLevelAccessRequest('beginner', 'movers');
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject beginner level requests', () => {
      const result = validateLevelAccessRequest('movers', 'beginner');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Beginner level is always accessible');
    });

    it('should reject requests too far ahead', () => {
      const result = validateLevelAccessRequest('beginner', 'fce');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot request access to levels more than 2 steps ahead');
    });

    it('should reject invalid levels', () => {
      const result = validateLevelAccessRequest('invalid', 'movers');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid level specified');
    });
  });

  describe('sortLevelsByHierarchy', () => {
    it('should sort levels correctly', () => {
      const unsorted = ['cpe', 'beginner', 'movers', 'ket'];
      const sorted = sortLevelsByHierarchy(unsorted);
      expect(sorted).toEqual(['beginner', 'movers', 'ket', 'cpe']);
    });

    it('should put invalid levels at the end', () => {
      const unsorted = ['invalid', 'beginner', 'unknown', 'movers'];
      const sorted = sortLevelsByHierarchy(unsorted);
      expect(sorted).toEqual(['beginner', 'movers', 'invalid', 'unknown']);
    });
  });
});