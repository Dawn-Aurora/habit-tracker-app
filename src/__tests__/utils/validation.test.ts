import { 
  validateHabitName, 
  validateHabitId,
  validateCompletedDates,
  sanitizeHabitName,
  ValidationError
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateHabitName', () => {
    it('should accept valid habit names', () => {
      expect(() => validateHabitName('Morning Exercise')).not.toThrow();
      expect(() => validateHabitName('Reading')).not.toThrow();
    });

    it('should reject empty habit names', () => {
      expect(() => validateHabitName('')).toThrow(ValidationError);
      expect(() => validateHabitName('')).toThrow('Habit name is required');
    });

    it('should reject non-string habit names', () => {
      expect(() => validateHabitName(123 as any)).toThrow(ValidationError);
      expect(() => validateHabitName(null as any)).toThrow(ValidationError);
      expect(() => validateHabitName(undefined as any)).toThrow(ValidationError);
    });
    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => validateHabitName(longName)).toThrow(ValidationError);
      expect(() => validateHabitName(longName)).toThrow('less than 100');
    });
    it('should reject names with only whitespace', () => {
      expect(() => validateHabitName('   ')).toThrow(ValidationError);
      expect(() => validateHabitName('   ')).toThrow('cannot be empty');
    });
  });

  describe('validateHabitId', () => {
    it('should accept valid habit IDs', () => {
      expect(() => validateHabitId('1')).not.toThrow();
      expect(() => validateHabitId('abc123')).not.toThrow();
    });

    it('should reject empty habit IDs', () => {
      expect(() => validateHabitId('')).toThrow(ValidationError);
      expect(() => validateHabitId('')).toThrow('Habit ID is required');
    });
    it('should reject IDs with invalid characters', () => {
      expect(() => validateHabitId('abc!@#')).toThrow(ValidationError);
      expect(() => validateHabitId('abc!@#')).toThrow('Invalid habit ID format');
    });
    it('should reject non-string IDs', () => {
      expect(() => validateHabitId(123 as any)).toThrow(ValidationError);
      expect(() => validateHabitId(null as any)).toThrow(ValidationError);
      expect(() => validateHabitId(undefined as any)).toThrow(ValidationError);
    });
  });

  describe('validateCompletedDates', () => {
    it('should accept valid completed dates array', () => {
      expect(() => validateCompletedDates(['2025-06-18'])).not.toThrow();
      expect(() => validateCompletedDates(['2025-06-17', '2025-06-18'])).not.toThrow();
    });

    it('should reject invalid date formats', () => {
      expect(() => validateCompletedDates(['invalid date'])).toThrow(ValidationError);
      expect(() => validateCompletedDates(['18/06/2025'])).toThrow(ValidationError);
    });
    it('should reject non-array input', () => {
      expect(() => validateCompletedDates('2025-06-18' as any)).toThrow(ValidationError);
      expect(() => validateCompletedDates(null as any)).toThrow(ValidationError);
    });
    it('should reject future dates', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      expect(() => validateCompletedDates([futureDate])).toThrow(ValidationError);
    });
    it('should reject invalid ISO dates', () => {
      expect(() => validateCompletedDates(['2025-13-40'])).toThrow(ValidationError);
    });
  });

  describe('sanitizeHabitName', () => {
    it('should trim whitespace from habit names', () => {
      expect(sanitizeHabitName('  Morning Exercise  ')).toBe('Morning Exercise');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHabitName('  ')).toBe('');
    });
    it('should remove HTML tags', () => {
      expect(sanitizeHabitName('<b>Bold</b>')).toBe('Bold');
    });
    it('should escape special characters', () => {
      expect(sanitizeHabitName('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
      expect(sanitizeHabitName('Tom & "Jerry"')).toBe('Tom &amp; &quot;Jerry&quot;');
    });
  });
});
