-- CreateTable
CREATE TABLE "words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "correctDefinition" TEXT NOT NULL,
    "incorrectDefinition1" TEXT NOT NULL,
    "incorrectDefinition2" TEXT NOT NULL,
    "incorrectDefinition3" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'english',
    "partOfSpeech" TEXT,
    "timesShown" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastShown" DATETIME
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "userFid" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "accuracy" REAL NOT NULL,
    "gameStartTime" DATETIME NOT NULL,
    "gameEndTime" DATETIME NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "tokensEarned" INTEGER NOT NULL DEFAULT 0,
    "bonusMultiplier" REAL NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_sessions_userFid_fkey" FOREIGN KEY ("userFid") REFERENCES "user_stats" ("userFid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "question_responses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameSessionId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "shuffledOptions" TEXT NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_responses_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "question_responses_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userFid" INTEGER NOT NULL,
    "totalGamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalCorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "highestScore" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "bestAccuracy" REAL NOT NULL DEFAULT 0,
    "fastestAverageTime" REAL,
    "totalTokensEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpins" INTEGER NOT NULL DEFAULT 0,
    "currentDailyStreak" INTEGER NOT NULL DEFAULT 0,
    "longestDailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedDate" DATETIME,
    "currentDifficultyLevel" INTEGER NOT NULL DEFAULT 1,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "firstGameAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficultyRange" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchName" TEXT NOT NULL,
    "description" TEXT,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "successfulImports" INTEGER NOT NULL DEFAULT 0,
    "failedImports" INTEGER NOT NULL DEFAULT 0,
    "duplicatesSkipped" INTEGER NOT NULL DEFAULT 0,
    "sourceFile" TEXT,
    "importedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "words_word_key" ON "words"("word");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_gameId_key" ON "game_sessions"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userFid_key" ON "user_stats"("userFid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
