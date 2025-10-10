/**
 * 📚 LEXIPOP DATABASE SCHEMA
 *
 * Scalable vocabulary management with SQLite + Drizzle ORM
 * Supports bulk imports, difficulty levels, and analytics
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Vocabulary words table
export const words = sqliteTable('words', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(),
  correctDefinition: text('correct_definition').notNull(),
  incorrectDefinition1: text('incorrect_definition_1').notNull(),
  incorrectDefinition2: text('incorrect_definition_2').notNull(),
  incorrectDefinition3: text('incorrect_definition_3').notNull(),

  // Metadata
  difficulty: integer('difficulty').notNull().default(1), // 1-5 scale
  category: text('category'), // e.g., 'academic', 'business', 'science'
  sourceLanguage: text('source_language').default('english'),
  partOfSpeech: text('part_of_speech'), // noun, verb, adjective, etc.

  // Analytics
  timesShown: integer('times_shown').notNull().default(0),
  timesCorrect: integer('times_correct').notNull().default(0),
  averageResponseTime: real('average_response_time'), // milliseconds

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  lastShown: integer('last_shown', { mode: 'timestamp' }),
}, (table) => ({
  wordIdx: uniqueIndex('word_idx').on(table.word),
}));

// Game sessions table
export const gameSessions = sqliteTable('game_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().unique(),
  userFid: integer('user_fid'), // Farcaster FID

  // Game results
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  streak: integer('streak').notNull().default(0),
  accuracy: real('accuracy').notNull(), // percentage

  // Timing
  gameStartTime: integer('game_start_time', { mode: 'timestamp' }).notNull(),
  gameEndTime: integer('game_end_time', { mode: 'timestamp' }).notNull(),
  totalDuration: integer('total_duration').notNull(), // milliseconds

  // Rewards
  tokensEarned: integer('tokens_earned').notNull().default(0),
  bonusMultiplier: real('bonus_multiplier').notNull().default(1),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  gameIdIdx: uniqueIndex('game_id_idx').on(table.gameId),
  userFidIdx: uniqueIndex('user_fid_idx').on(table.userFid),
  scoreIdx: uniqueIndex('score_idx').on(table.score),
}));

// Individual question responses
export const questionResponses = sqliteTable('question_responses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameSessionId: integer('game_session_id').notNull().references(() => gameSessions.id),
  wordId: integer('word_id').notNull().references(() => words.id),

  // Response data
  selectedAnswer: text('selected_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  responseTime: integer('response_time').notNull(), // milliseconds
  questionOrder: integer('question_order').notNull(), // 1-5 within game

  // Context
  shuffledOptions: text('shuffled_options', { mode: 'json' }).notNull(), // JSON array of all 4 options

  // Timestamp
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  gameSessionIdx: uniqueIndex('game_session_idx').on(table.gameSessionId),
  wordIdx: uniqueIndex('word_response_idx').on(table.wordId),
}));

// User statistics and progress
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userFid: integer('user_fid').notNull().unique(),

  // Overall performance
  totalGamesPlayed: integer('total_games_played').notNull().default(0),
  totalQuestionsAnswered: integer('total_questions_answered').notNull().default(0),
  totalCorrectAnswers: integer('total_correct_answers').notNull().default(0),

  // Best scores
  highestScore: integer('highest_score').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  bestAccuracy: real('best_accuracy').notNull().default(0),
  fastestAverageTime: real('fastest_average_time'), // milliseconds

  // Tokens and rewards
  totalTokensEarned: integer('total_tokens_earned').notNull().default(0),
  totalSpins: integer('total_spins').notNull().default(0),

  // Streaks and achievements
  currentDailyStreak: integer('current_daily_streak').notNull().default(0),
  longestDailyStreak: integer('longest_daily_streak').notNull().default(0),
  lastPlayedDate: integer('last_played_date', { mode: 'timestamp' }),

  // Difficulty progression
  currentDifficultyLevel: integer('current_difficulty_level').notNull().default(1),
  wordsLearned: integer('words_learned').notNull().default(0), // unique words answered correctly

  // Timestamps
  firstGameAt: integer('first_game_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userFidIdx: uniqueIndex('user_fid_stats_idx').on(table.userFid),
  highestScoreIdx: uniqueIndex('highest_score_idx').on(table.highestScore),
  totalTokensIdx: uniqueIndex('total_tokens_idx').on(table.totalTokensEarned),
}));

// Word categories for organization
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  difficultyRange: text('difficulty_range'), // e.g., "1-3" for beginner categories
  wordCount: integer('word_count').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  nameIdx: uniqueIndex('category_name_idx').on(table.name),
}));

// Import batches for tracking bulk vocabulary uploads
export const importBatches = sqliteTable('import_batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchName: text('batch_name').notNull(),
  description: text('description'),

  // Import stats
  totalWords: integer('total_words').notNull(),
  successfulImports: integer('successful_imports').notNull().default(0),
  failedImports: integer('failed_imports').notNull().default(0),
  duplicatesSkipped: integer('duplicates_skipped').notNull().default(0),

  // Metadata
  sourceFile: text('source_file'),
  importedBy: text('imported_by'), // admin user identifier
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed

  // Timestamps
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => ({
  batchNameIdx: uniqueIndex('batch_name_idx').on(table.batchName),
  statusIdx: uniqueIndex('import_status_idx').on(table.status),
}));

// Type exports for TypeScript
export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type QuestionResponse = typeof questionResponses.$inferSelect;
export type NewQuestionResponse = typeof questionResponses.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type ImportBatch = typeof importBatches.$inferSelect;
export type NewImportBatch = typeof importBatches.$inferInsert;