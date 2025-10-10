import { NextRequest, NextResponse } from 'next/server';
import { importVocabulary, parseCSV, generateCSVTemplate, type VocabularyEntry } from '@/lib/vocabulary-import';

/**
 * 📚 VOCABULARY IMPORT API
 *
 * POST /api/vocabulary/import - Import vocabulary from JSON or CSV
 * GET /api/vocabulary/import - Get CSV template
 */

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let entries: VocabularyEntry[] = [];
    let batchName = `Import ${new Date().toISOString()}`;

    if (contentType.includes('application/json')) {
      // JSON import
      const body = await request.json();
      entries = body.entries || body;
      batchName = body.batchName || batchName;

      if (!Array.isArray(entries)) {
        return NextResponse.json(
          { error: 'Expected array of vocabulary entries' },
          { status: 400 }
        );
      }

    } else if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
      // CSV import
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const batchNameForm = formData.get('batchName') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No CSV file provided' },
          { status: 400 }
        );
      }

      if (batchNameForm) {
        batchName = batchNameForm;
      }

      const csvContent = await file.text();
      entries = parseCSV(csvContent);

    } else {
      return NextResponse.json(
        { error: 'Unsupported content type. Use application/json or text/csv' },
        { status: 400 }
      );
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid entries found' },
        { status: 400 }
      );
    }

    if (entries.length > 1000) {
      return NextResponse.json(
        { error: 'Too many entries. Maximum 1000 words per import' },
        { status: 400 }
      );
    }

    // Perform the import
    const result = await importVocabulary(entries, batchName);

    if (!result.success && result.stats.imported === 0) {
      return NextResponse.json(
        {
          error: 'Import failed',
          details: result.errors,
          stats: result.stats
        },
        { status: 400 }
      );
    }

    console.log(`✅ Vocabulary import completed: ${result.stats.imported}/${result.stats.total} words imported`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.stats.imported} words`,
      batchId: result.batchId,
      stats: result.stats,
      warnings: result.errors.length > 0 ? result.errors : undefined
    });

  } catch (error) {
    console.error('❌ Vocabulary import error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return CSV template for vocabulary import
    const template = generateCSVTemplate();

    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="lexipop-vocabulary-template.csv"'
      }
    });

  } catch (error) {
    console.error('❌ Template generation error:', error);

    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}