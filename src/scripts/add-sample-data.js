/**
 * Simple script to add sample leaderboard data via API calls
 * Run this with: node src/scripts/add-sample-data.js
 */

const sampleUsers = [
  { fid: 12345, score: 5, streak: 5, name: 'VocabMaster' },
  { fid: 67890, score: 4, streak: 3, name: 'WordWizard' },
  { fid: 54321, score: 3, streak: 2, name: 'LexiLearner' },
  { fid: 98765, score: 5, streak: 4, name: 'DefinitionDude' },
  { fid: 11111, score: 2, streak: 1, name: 'VocabNewbie' },
];

async function addSampleData() {
  console.log('🎯 Adding sample leaderboard data...\n');

  for (const user of sampleUsers) {
    try {
      const gameData = {
        fid: user.fid,
        score: user.score,
        streak: user.streak,
        totalQuestions: 5,
        gameId: `sample_game_${Date.now()}_${user.fid}`,
      };

      console.log(`📤 Adding score for ${user.name} (FID: ${user.fid}): ${user.score}/5`);

      const response = await fetch('http://localhost:3004/api/game/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added: ${user.name} - Score: ${user.score}/5, Streak: ${user.streak}`);
      } else {
        console.error(`❌ Failed to add ${user.name}: ${response.status} ${response.statusText}`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error adding ${user.name}:`, error.message);
    }
  }

  console.log('\n🔍 Testing leaderboard API...');

  try {
    const response = await fetch('http://localhost:3004/api/game/score?type=leaderboard');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Leaderboard now has ${data.leaderboard?.length || 0} entries`);

      if (data.leaderboard?.length > 0) {
        console.log('\n🏆 Top 3:');
        data.leaderboard.slice(0, 3).forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.username}: ${entry.latestScore}/${entry.totalQuestions}`);
        });
      }
    } else {
      console.error('❌ Failed to fetch leaderboard');
    }
  } catch (error) {
    console.error('❌ Error testing leaderboard:', error.message);
  }

  console.log('\n🎉 Sample data addition complete!');
}

// Check if running in Node.js
if (typeof window === 'undefined') {
  addSampleData().catch(console.error);
} else {
  console.log('This script is meant to be run in Node.js');
}