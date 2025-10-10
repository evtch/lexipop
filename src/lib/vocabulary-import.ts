/**
 * 📚 VOCABULARY IMPORT SYSTEM
 *
 * Bulk import vocabulary words from JSON/CSV with validation
 * Supports categories, difficulty levels, and batch tracking
 */

import { db, words, categories, importBatches, type NewWord, type NewImportBatch } from '@/db';
import { eq } from 'drizzle-orm';

export interface VocabularyEntry {
  word: string;
  correctDefinition: string;
  incorrectDefinition1: string;
  incorrectDefinition2: string;
  incorrectDefinition3: string;
  difficulty?: number; // 1-5, defaults to 1
  category?: string;
  partOfSpeech?: string;
  sourceLanguage?: string;
}

export interface ImportResult {
  success: boolean;
  batchId?: number;
  stats: {
    total: number;
    imported: number;
    failed: number;
    duplicates: number;
  };
  errors: string[];
}

/**
 * Validate a single vocabulary entry
 */
function validateEntry(entry: unknown, index: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Type guard for entry
  if (!entry || typeof entry !== 'object') {
    errors.push(`Row ${index + 1}: Invalid entry format`);
    return { valid: false, errors };
  }

  const typedEntry = entry as Record<string, unknown>;

  // Required fields
  if (!typedEntry.word || typeof typedEntry.word !== 'string' || typedEntry.word.trim().length === 0) {
    errors.push(`Row ${index + 1}: Missing or invalid word`);
  }

  if (!typedEntry.correctDefinition || typeof typedEntry.correctDefinition !== 'string') {
    errors.push(`Row ${index + 1}: Missing correct definition`);
  }

  if (!typedEntry.incorrectDefinition1 || typeof typedEntry.incorrectDefinition1 !== 'string') {
    errors.push(`Row ${index + 1}: Missing incorrect definition 1`);
  }

  if (!typedEntry.incorrectDefinition2 || typeof typedEntry.incorrectDefinition2 !== 'string') {
    errors.push(`Row ${index + 1}: Missing incorrect definition 2`);
  }

  if (!typedEntry.incorrectDefinition3 || typeof typedEntry.incorrectDefinition3 !== 'string') {
    errors.push(`Row ${index + 1}: Missing incorrect definition 3`);
  }

  // Validate difficulty level
  if (typedEntry.difficulty !== undefined) {
    const difficulty = Number(typedEntry.difficulty);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      errors.push(`Row ${index + 1}: Difficulty must be between 1-5`);
    }
  }

  // Check for duplicate definitions within the same entry
  const definitions = [
    typedEntry.correctDefinition,
    typedEntry.incorrectDefinition1,
    typedEntry.incorrectDefinition2,
    typedEntry.incorrectDefinition3
  ].filter(def => def && typeof def === 'string');

  const uniqueDefinitions = new Set(definitions.map(def => (def as string).toLowerCase().trim()));
  if (uniqueDefinitions.size !== definitions.length) {
    errors.push(`Row ${index + 1}: Duplicate definitions found within entry`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create or get category ID
 */
async function ensureCategoryExists(categoryName: string): Promise<number> {
  try {
    // Check if category exists
    const existing = await db.select().from(categories).where(eq(categories.name, categoryName)).limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new category
    const result = await db.insert(categories).values({
      name: categoryName,
      description: `Auto-created category for ${categoryName} words`,
    }).returning({ id: categories.id });

    return result[0].id;
  } catch (error) {
    console.error('Error ensuring category exists:', error);
    throw new Error(`Failed to create/find category: ${categoryName}`);
  }
}

/**
 * Import vocabulary from array of entries
 */
export async function importVocabulary(
  entries: VocabularyEntry[],
  batchName: string,
  description?: string
): Promise<ImportResult> {
  const stats = {
    total: entries.length,
    imported: 0,
    failed: 0,
    duplicates: 0,
  };
  const errors: string[] = [];

  if (entries.length === 0) {
    return {
      success: false,
      stats,
      errors: ['No entries provided for import'],
    };
  }

  try {
    // Create import batch record
    const batchResult = await db.insert(importBatches).values({
      batchName,
      description: description || `Import of ${entries.length} vocabulary words`,
      totalWords: entries.length,
      status: 'processing',
    }).returning({ id: importBatches.id });

    const batchId = batchResult[0].id;

    // Validate all entries first
    for (let i = 0; i < entries.length; i++) {
      const validation = validateEntry(entries[i], i);
      if (!validation.valid) {
        errors.push(...validation.errors);
        stats.failed++;
      }
    }

    // Process valid entries
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const validation = validateEntry(entry, i);

      if (!validation.valid) {
        continue; // Skip invalid entries
      }

      try {
        // Check for existing word
        const existingWord = await db.select().from(words)
          .where(eq(words.word, entry.word.toLowerCase().trim()))
          .limit(1);

        if (existingWord.length > 0) {
          stats.duplicates++;
          continue;
        }

        // Prepare word data
        const wordData: NewWord = {
          word: entry.word.toLowerCase().trim(),
          correctDefinition: entry.correctDefinition.trim(),
          incorrectDefinition1: entry.incorrectDefinition1.trim(),
          incorrectDefinition2: entry.incorrectDefinition2.trim(),
          incorrectDefinition3: entry.incorrectDefinition3.trim(),
          difficulty: entry.difficulty || 1,
          category: entry.category?.toLowerCase().trim(),
          partOfSpeech: entry.partOfSpeech?.toLowerCase().trim(),
          sourceLanguage: entry.sourceLanguage?.toLowerCase().trim() || 'english',
        };

        // Insert word
        await db.insert(words).values(wordData);
        stats.imported++;

      } catch (error) {
        console.error(`Error importing word "${entry.word}":`, error);
        errors.push(`Row ${i + 1}: Failed to import "${entry.word}" - ${error instanceof Error ? error.message : 'Unknown error'}`);
        stats.failed++;
      }
    }

    // Update batch status
    await db.update(importBatches)
      .set({
        status: errors.length === 0 ? 'completed' : 'completed_with_errors',
        successfulImports: stats.imported,
        failedImports: stats.failed,
        duplicatesSkipped: stats.duplicates,
        completedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId));

    return {
      success: stats.imported > 0,
      batchId,
      stats,
      errors,
    };

  } catch (error) {
    console.error('Import process failed:', error);
    return {
      success: false,
      stats,
      errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse CSV content to vocabulary entries
 */
export function parseCSV(csvContent: string): VocabularyEntry[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const entries: VocabularyEntry[] = [];

  // Expected headers
  const requiredHeaders = ['word', 'correctDefinition', 'incorrectDefinition1', 'incorrectDefinition2', 'incorrectDefinition3'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
      continue;
    }

    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });

    // Convert difficulty to number if present
    if (entry.difficulty) {
      (entry as Record<string, string | number>).difficulty = parseInt(entry.difficulty, 10);
    }

    entries.push(entry as unknown as VocabularyEntry);
  }

  return entries;
}

/**
 * Generate sample CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    'word',
    'correctDefinition',
    'incorrectDefinition1',
    'incorrectDefinition2',
    'incorrectDefinition3',
    'difficulty',
    'category',
    'partOfSpeech'
  ];

  const sampleRows = [
    [
      'ubiquitous',
      'present, appearing, or found everywhere',
      'very rare or uncommon',
      'relating to ancient times',
      'having multiple meanings',
      '3',
      'academic',
      'adjective'
    ],
    [
      'ephemeral',
      'lasting for a very short time',
      'eternal and everlasting',
      'extremely heavy or dense',
      'relating to the sky',
      '4',
      'academic',
      'adjective'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}