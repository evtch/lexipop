/**
 * 📊 CSV VOCABULARY IMPORT API
 *
 * Imports vocabulary words from CSV format
 * Expected format: word,option_a,option_b,option_c,option_d,correct_option
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CSVRow {
  word: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
}

/**
 * Parse CSV text into structured data
 */
function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  // Validate headers
  const expectedHeaders = ['word', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option'];
  if (!expectedHeaders.every(header => headers.includes(header))) {
    throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}. Got: ${headers.join(', ')}`);
  }

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) {
      console.warn(`Skipping malformed row ${i + 1}: ${lines[i]}`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index].trim();
    });

    // Validate correct_option
    if (!['a', 'b', 'c', 'd'].includes(row.correct_option)) {
      console.warn(`Invalid correct_option "${row.correct_option}" in row ${i + 1}, skipping`);
      continue;
    }

    rows.push(row as CSVRow);
  }

  return rows;
}

/**
 * Convert CSV row to database format
 */
function csvRowToWordData(row: CSVRow) {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d];
  const correctIndex = ['a', 'b', 'c', 'd'].indexOf(row.correct_option);
  const correctDefinition = options[correctIndex];
  const incorrectDefinitions = options.filter((_, index) => index !== correctIndex);

  // Estimate difficulty based on word length and complexity
  const difficulty = estimateDifficulty(row.word);

  return {
    word: row.word,
    correctDefinition,
    incorrectDefinition1: incorrectDefinitions[0],
    incorrectDefinition2: incorrectDefinitions[1],
    incorrectDefinition3: incorrectDefinitions[2],
    difficulty,
    category: 'academic', // Default category
    partOfSpeech: 'unknown' // Could be enhanced with NLP
  };
}

/**
 * Estimate difficulty based on word characteristics
 */
function estimateDifficulty(word: string): number {
  const length = word.length;

  // Very complex/rare words
  if (['perspicacious', 'pulchritudinous', 'obsequious', 'recalcitrant', 'intransigent', 'quixotic', 'recondite'].includes(word.toLowerCase())) {
    return 5;
  }

  // Complex words
  if (['esoteric', 'pernicious', 'obfuscate', 'insouciant', 'sagacious', 'ineffable', 'mellifluous', 'disparate', 'fastidious', 'vicissitude'].includes(word.toLowerCase())) {
    return 4;
  }

  // Medium complexity
  if (['copacetic', 'ubiquitous', 'ephemeral'].includes(word.toLowerCase())) {
    return 3;
  }

  // Fallback to length-based estimation
  if (length <= 6) return 2;
  if (length <= 9) return 3;
  if (length <= 12) return 4;
  return 5;
}

/**
 * POST /api/vocabulary/import-csv - Import vocabulary from CSV
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Starting CSV vocabulary import...');

    const body = await request.text();

    if (!body || body.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No CSV data provided in request body'
      }, { status: 400 });
    }

    console.log('📝 Parsing CSV data...');
    const csvRows = parseCSV(body);
    console.log(`📊 Parsed ${csvRows.length} vocabulary words from CSV`);

    if (csvRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid vocabulary words found in CSV'
      }, { status: 400 });
    }

    // Convert and import words
    const results = [];
    const skipped = [];

    for (const csvRow of csvRows) {
      try {
        const wordData = csvRowToWordData(csvRow);

        // Check if word already exists
        const existing = await prisma.word.findUnique({
          where: { word: wordData.word }
        });

        if (existing) {
          console.log(`⚠️ Word "${wordData.word}" already exists, skipping`);
          skipped.push({ word: wordData.word, reason: 'already exists' });
          continue;
        }

        // Create new word
        const created = await prisma.word.create({
          data: wordData
        });

        results.push(created);
        console.log(`✅ Imported word: ${wordData.word} (difficulty: ${wordData.difficulty})`);

      } catch (error) {
        console.error(`❌ Failed to import word "${csvRow.word}":`, error);
        skipped.push({
          word: csvRow.word,
          reason: error instanceof Error ? error.message : 'unknown error'
        });
      }
    }

    console.log(`🎉 CSV import completed! Created ${results.length} words, skipped ${skipped.length}`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.length} vocabulary words from CSV`,
      imported: results.length,
      skipped: skipped.length,
      details: {
        importedWords: results.map(w => ({
          id: w.id,
          word: w.word,
          difficulty: w.difficulty,
          category: w.category
        })),
        skippedWords: skipped
      }
    });

  } catch (error) {
    console.error('❌ Error importing CSV vocabulary:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to import vocabulary from CSV',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/vocabulary/import-csv - Show CSV import instructions
 */
export async function GET() {
  const sampleCSV = `word,option_a,option_b,option_c,option_d,correct_option
Esoteric,Easily understood by everyone,Having a pleasant sound,Intended for or understood by a small group with specialized knowledge,Showing exaggerated emotion,c
Copacetic,Lacking in energy or enthusiasm,Showing aggressive or warlike behavior,Having multiple contradictory meanings,In excellent order; very satisfactory,d`;

  return NextResponse.json({
    message: 'CSV Vocabulary Import Endpoint',
    instructions: [
      '1. Send POST request with CSV data in request body',
      '2. CSV must have headers: word,option_a,option_b,option_c,option_d,correct_option',
      '3. correct_option should be "a", "b", "c", or "d"',
      '4. Existing words will be skipped to avoid duplicates'
    ],
    sampleCSV,
    endpoint: '/api/vocabulary/import-csv',
    method: 'POST',
    contentType: 'text/csv or text/plain'
  });
}