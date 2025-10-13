#!/usr/bin/env tsx

/**
 * 🔍 LEADERBOARD DEBUG SCRIPT
 * Tests the leaderboard functionality and identifies issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLeaderboard() {
  console.log('🔍 Testing leaderboard functionality...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Test 2: Check if UserStats table exists and has data
    console.log('2. Checking UserStats table...');
    const userStatsCount = await prisma.userStats.count();
    console.log(`📊 Found ${userStatsCount} user stats records\n`);

    if (userStatsCount === 0) {
      console.log('⚠️ No user stats found. Creating sample data...\n');

      // Create sample user stats
      await prisma.userStats.createMany({
        data: [
          {
            userFid: 12345,
            totalGamesPlayed: 5,
            totalQuestionsAnswered: 25,
            totalCorrectAnswers: 20,
            highestScore: 5,
            longestStreak: 3,
            bestAccuracy: 100.0,
            totalTokensEarned: 500,
            totalSpins: 2,
            currentDailyStreak: 3,
            longestDailyStreak: 3,
            lastPlayedDate: new Date(),
            currentDifficultyLevel: 2,
            wordsLearned: 20,
          },
          {
            userFid: 67890,
            totalGamesPlayed: 3,
            totalQuestionsAnswered: 15,
            totalCorrectAnswers: 12,
            highestScore: 4,
            longestStreak: 2,
            bestAccuracy: 80.0,
            totalTokensEarned: 300,
            totalSpins: 1,
            currentDailyStreak: 1,
            longestDailyStreak: 2,
            lastPlayedDate: new Date(),
            currentDifficultyLevel: 1,
            wordsLearned: 12,
          },
        ],
        skipDuplicates: true,
      });

      // Create sample game sessions
      await prisma.gameSession.createMany({
        data: [
          {
            gameId: 'game_test_12345_1',
            userFid: 12345,
            score: 5,
            totalQuestions: 5,
            streak: 3,
            accuracy: 100.0,
            gameStartTime: new Date(),
            gameEndTime: new Date(),
            totalDuration: 120,
            tokensEarned: 250,
            bonusMultiplier: 1.5,
          },
          {
            gameId: 'game_test_67890_1',
            userFid: 67890,
            score: 4,
            totalQuestions: 5,
            streak: 2,
            accuracy: 80.0,
            gameStartTime: new Date(),
            gameEndTime: new Date(),
            totalDuration: 150,
            tokensEarned: 150,
            bonusMultiplier: 1.0,
          },
        ],
        skipDuplicates: true,
      });

      console.log('✅ Sample data created\n');
    }

    // Test 3: Query leaderboard like the API does
    console.log('3. Testing leaderboard query...');
    const topPlayers = await prisma.userStats.findMany({
      orderBy: [
        { highestScore: 'desc' },
        { bestAccuracy: 'desc' }
      ],
      take: 100,
      include: {
        gameSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            score: true,
            totalQuestions: true,
            gameId: true,
            createdAt: true,
          }
        }
      }
    });

    console.log(`📋 Found ${topPlayers.length} players for leaderboard:`);

    topPlayers.forEach((player, index) => {
      const latestGame = player.gameSessions[0];
      console.log(`  ${index + 1}. FID ${player.userFid}: ${player.highestScore}/5 best, ${latestGame?.score || 0}/${latestGame?.totalQuestions || 0} latest`);
    });

    console.log('\n✅ Leaderboard query successful');

    // Test 4: Format data like the API does
    console.log('\n4. Testing data formatting...');
    const formattedLeaderboard = topPlayers.map(player => {
      const latestGame = player.gameSessions[0];
      return {
        fid: player.userFid,
        username: `User ${player.userFid}`,
        latestScore: latestGame?.score || 0,
        totalQuestions: latestGame?.totalQuestions || 0,
        gameId: latestGame?.gameId || '',
        timestamp: latestGame?.createdAt || '',
        highestScore: player.highestScore,
        longestStreak: player.longestStreak,
        totalGames: player.totalGamesPlayed,
        bestAccuracy: player.bestAccuracy,
      };
    });

    console.log('📋 Formatted leaderboard:', JSON.stringify(formattedLeaderboard, null, 2));
    console.log('\n✅ All tests passed! Leaderboard should work now.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testLeaderboard().catch(console.error);