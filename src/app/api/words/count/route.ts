import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total word count
    const totalWords = await prisma.word.count();

    // Get words by difficulty
    const wordsByDifficulty = await prisma.word.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: {
        difficulty: 'asc'
      }
    });

    // Get words by category
    const wordsByCategory = await prisma.word.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: 'desc'
      }
    });

    // Sample a few words
    const sampleWords = await prisma.word.findMany({
      take: 5,
      select: {
        word: true,
        correctDefinition: true,
        difficulty: true,
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      totalWords,
      wordsByDifficulty: wordsByDifficulty.map(group => ({
        difficulty: group.difficulty,
        count: group._count
      })),
      wordsByCategory: wordsByCategory.map(group => ({
        category: group.category || 'No category',
        count: group._count
      })),
      sampleWords
    });

  } catch (error) {
    console.error('❌ Error checking words:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to count words'
    }, { status: 500 });
  }
}