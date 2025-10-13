const { PrismaClient } = require('@prisma/client');

async function checkWordCount() {
  const prisma = new PrismaClient();

  try {
    // Get total word count
    const totalWords = await prisma.word.count();
    console.log(`📚 Total words in database: ${totalWords}`);

    // Get words by difficulty
    const wordsByDifficulty = await prisma.word.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: {
        difficulty: 'asc'
      }
    });

    console.log('\n📊 Words by difficulty:');
    wordsByDifficulty.forEach(group => {
      console.log(`  Difficulty ${group.difficulty}: ${group._count} words`);
    });

    // Get words by category
    const wordsByCategory = await prisma.word.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: 'desc'
      }
    });

    console.log('\n🏷️ Words by category:');
    wordsByCategory.forEach(group => {
      console.log(`  ${group.category || 'No category'}: ${group._count} words`);
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

    console.log('\n📖 Sample words:');
    sampleWords.forEach(word => {
      console.log(`  "${word.word}" (${word.difficulty}/${word.category}) - ${word.correctDefinition}`);
    });

  } catch (error) {
    console.error('❌ Error checking words:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWordCount();