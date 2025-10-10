/**
 * 📚 IMPORT VOCABULARY COLLECTION
 *
 * Imports the comprehensive vocabulary collection into Lexipop database
 * Run with: npm run import-collection
 */

import { importVocabulary, type VocabularyEntry } from '@/lib/vocabulary-import';

// Comprehensive vocabulary collection
const vocabularyCollection: VocabularyEntry[] = [
  // Set 1 (1-50)
  {
    word: 'esoteric',
    correctDefinition: 'intended for or understood by a small group with specialized knowledge',
    incorrectDefinition1: 'easily understood by everyone',
    incorrectDefinition2: 'having a pleasant sound',
    incorrectDefinition3: 'showing exaggerated emotion',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'copacetic',
    correctDefinition: 'in excellent order; very satisfactory',
    incorrectDefinition1: 'lacking in energy or enthusiasm',
    incorrectDefinition2: 'showing aggressive or warlike behavior',
    incorrectDefinition3: 'having multiple contradictory meanings',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pernicious',
    correctDefinition: 'causing great harm in a subtle or gradual way',
    incorrectDefinition1: 'having a strong pleasant aroma',
    incorrectDefinition2: 'playful or lighthearted',
    incorrectDefinition3: 'open to new experiences',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obfuscate',
    correctDefinition: 'to confuse or make obscure',
    incorrectDefinition1: 'to make something clear or simple',
    incorrectDefinition2: 'to strengthen through repetition',
    incorrectDefinition3: 'to reduce in size or scope',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'pulchritudinous',
    correctDefinition: 'possessing great physical beauty',
    incorrectDefinition1: 'ugly or unpleasant to look at',
    incorrectDefinition2: 'deceitful or two-faced',
    incorrectDefinition3: 'of small or delicate build',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'insouciant',
    correctDefinition: 'cheerfully unconcerned; carefree',
    incorrectDefinition1: 'deeply worried',
    incorrectDefinition2: 'rude or dismissive',
    incorrectDefinition3: 'extremely cautious',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'perspicacious',
    correctDefinition: 'having keen understanding and insight',
    incorrectDefinition1: 'lacking interest or excitement',
    incorrectDefinition2: 'easily deceived',
    incorrectDefinition3: 'difficult to persuade',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sagacious',
    correctDefinition: 'wise or shrewd',
    incorrectDefinition1: 'foolish or short-sighted',
    incorrectDefinition2: 'easily influenced',
    incorrectDefinition3: 'reluctant or unwilling',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'recalcitrant',
    correctDefinition: 'resistant to authority or control',
    incorrectDefinition1: 'submissive and obedient',
    incorrectDefinition2: 'quick to forgive',
    incorrectDefinition3: 'easily satisfied',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ubiquitous',
    correctDefinition: 'existing everywhere at once',
    incorrectDefinition1: 'rare or unique',
    incorrectDefinition2: 'hard to identify',
    incorrectDefinition3: 'located in one place only',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ineffable',
    correctDefinition: 'too sacred or extreme to be expressed in words',
    incorrectDefinition1: 'lacking purpose',
    incorrectDefinition2: 'capable of being measured',
    incorrectDefinition3: 'without moral standards',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'mellifluous',
    correctDefinition: 'sweet or musical; pleasant to hear',
    incorrectDefinition1: 'harsh or unpleasant sounding',
    incorrectDefinition2: 'simple and rustic',
    incorrectDefinition3: 'dry and monotonous',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'intransigent',
    correctDefinition: 'unwilling to compromise',
    incorrectDefinition1: 'flexible and cooperative',
    incorrectDefinition2: 'unreliable or inconsistent',
    incorrectDefinition3: 'capable of change',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obsequious',
    correctDefinition: 'excessively obedient or attentive',
    incorrectDefinition1: 'harsh and critical',
    incorrectDefinition2: 'dull or unimaginative',
    incorrectDefinition3: 'bold and assertive',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'quixotic',
    correctDefinition: 'extremely idealistic or impractical',
    incorrectDefinition1: 'realistic and practical',
    incorrectDefinition2: 'deceptive or dishonest',
    incorrectDefinition3: 'hostile or angry',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'disparate',
    correctDefinition: 'essentially different in kind; not comparable',
    incorrectDefinition1: 'closely related or similar',
    incorrectDefinition2: 'extremely abundant',
    incorrectDefinition3: 'hidden or obscure',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'fastidious',
    correctDefinition: 'very attentive to accuracy and detail',
    incorrectDefinition1: 'not concerned with detail',
    incorrectDefinition2: 'uninterested or indifferent',
    incorrectDefinition3: 'easily pleased',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ephemeral',
    correctDefinition: 'lasting for a very short time',
    incorrectDefinition1: 'eternal or unending',
    incorrectDefinition2: 'unchanging',
    incorrectDefinition3: 'easily forgotten',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'recondite',
    correctDefinition: 'little known or obscure',
    incorrectDefinition1: 'widely known',
    incorrectDefinition2: 'loud and showy',
    incorrectDefinition3: 'based on emotion',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'vicissitude',
    correctDefinition: 'a sudden change of circumstances or fortune',
    incorrectDefinition1: 'a moral principle',
    incorrectDefinition2: 'a planned sequence of events',
    incorrectDefinition3: 'an argument or disagreement',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'loquacious',
    correctDefinition: 'tending to talk a great deal; talkative',
    incorrectDefinition1: 'silent and withdrawn',
    incorrectDefinition2: 'lacking confidence',
    incorrectDefinition3: 'easily distracted',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'misanthrope',
    correctDefinition: 'one who hates or distrusts humankind',
    incorrectDefinition1: 'one who loves humanity',
    incorrectDefinition2: 'one who seeks solitude for meditation',
    incorrectDefinition3: 'one who acts without thought',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'inimical',
    correctDefinition: 'harmful or hostile',
    incorrectDefinition1: 'friendly or supportive',
    incorrectDefinition2: 'neutral or indifferent',
    incorrectDefinition3: 'insignificant',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'laconic',
    correctDefinition: 'using few words; concise',
    incorrectDefinition1: 'verbose and long-winded',
    incorrectDefinition2: 'unclear or vague',
    incorrectDefinition3: 'cheerful and loud',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'munificent',
    correctDefinition: 'generous or liberal in giving',
    incorrectDefinition1: 'miserly or stingy',
    incorrectDefinition2: 'selfish and proud',
    incorrectDefinition3: 'polite but distant',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'paragon',
    correctDefinition: 'a model of excellence or perfection',
    incorrectDefinition1: 'a false appearance',
    incorrectDefinition2: 'a random occurrence',
    incorrectDefinition3: 'a kind of gemstone',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'cacophony',
    correctDefinition: 'a harsh, discordant mixture of sounds',
    incorrectDefinition1: 'a pleasant harmony',
    incorrectDefinition2: 'a rhythmic sequence',
    incorrectDefinition3: 'a whisper or murmur',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'disconsolate',
    correctDefinition: 'unable to be comforted; deeply unhappy',
    incorrectDefinition1: 'full of joy',
    incorrectDefinition2: 'energetic and ambitious',
    incorrectDefinition3: 'indifferent',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'equanimity',
    correctDefinition: 'mental calmness and composure',
    incorrectDefinition1: 'a strong sense of pride',
    incorrectDefinition2: 'great confusion or turmoil',
    incorrectDefinition3: 'playful behavior',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'halcyon',
    correctDefinition: 'denoting a period of peace and happiness',
    incorrectDefinition1: 'chaotic or violent',
    incorrectDefinition2: 'harsh or stormy',
    incorrectDefinition3: 'sad and melancholic',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pernickety',
    correctDefinition: 'fussy about details; finicky',
    incorrectDefinition1: 'quick-tempered',
    incorrectDefinition2: 'forgetful or absent-minded',
    incorrectDefinition3: 'cheerful and sociable',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ebullient',
    correctDefinition: 'overflowing with enthusiasm or excitement',
    incorrectDefinition1: 'depressed or moody',
    incorrectDefinition2: 'cautious or reserved',
    incorrectDefinition3: 'polite and formal',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'callow',
    correctDefinition: 'inexperienced and immature',
    incorrectDefinition1: 'clever and witty',
    incorrectDefinition2: 'honest and direct',
    incorrectDefinition3: 'calm and composed',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pulchritude',
    correctDefinition: 'physical beauty',
    incorrectDefinition1: 'intellectual depth',
    incorrectDefinition2: 'cruel behavior',
    incorrectDefinition3: 'excessive pride',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'lachrymose',
    correctDefinition: 'tearful or inclined to weep',
    incorrectDefinition1: 'funny and cheerful',
    incorrectDefinition2: 'lacking emotion',
    incorrectDefinition3: 'tired and drowsy',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'supercilious',
    correctDefinition: 'arrogant or disdainful',
    incorrectDefinition1: 'honest and humble',
    incorrectDefinition2: 'confused or uncertain',
    incorrectDefinition3: 'caring and empathetic',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'perfunctory',
    correctDefinition: 'carried out with little effort or interest',
    incorrectDefinition1: 'carefully planned',
    incorrectDefinition2: 'done with great enthusiasm',
    incorrectDefinition3: 'overly cautious',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'inure',
    correctDefinition: 'to accustom someone to something unpleasant',
    incorrectDefinition1: 'to remove or withdraw',
    incorrectDefinition2: 'to excite or energize',
    incorrectDefinition3: 'to make fragile',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'sagacity',
    correctDefinition: 'the quality of having good judgment; wisdom',
    incorrectDefinition1: 'extreme foolishness',
    incorrectDefinition2: 'clever deception',
    incorrectDefinition3: 'deep sorrow',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'tergiversate',
    correctDefinition: 'to change sides or abandon one\'s position',
    incorrectDefinition1: 'to clarify a complex idea',
    incorrectDefinition2: 'to strengthen an argument',
    incorrectDefinition3: 'to act decisively',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'pariah',
    correctDefinition: 'a social outcast',
    incorrectDefinition1: 'a loyal supporter',
    incorrectDefinition2: 'a famous leader',
    incorrectDefinition3: 'a close friend',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'redolent',
    correctDefinition: 'strongly reminiscent or suggestive of something',
    incorrectDefinition1: 'without smell or flavor',
    incorrectDefinition2: 'extremely tired',
    incorrectDefinition3: 'dull and lifeless',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'abstruse',
    correctDefinition: 'difficult to understand; obscure',
    incorrectDefinition1: 'easy and clear',
    incorrectDefinition2: 'physically distant',
    incorrectDefinition3: 'loud and obvious',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'trenchant',
    correctDefinition: 'sharp and effective in expression or style',
    incorrectDefinition1: 'weak and indecisive',
    incorrectDefinition2: 'long-winded',
    incorrectDefinition3: 'dull and boring',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'juxtapose',
    correctDefinition: 'to place side by side for comparison',
    incorrectDefinition1: 'to separate entirely',
    incorrectDefinition2: 'to exaggerate differences',
    incorrectDefinition3: 'to hide from view',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'nebulous',
    correctDefinition: 'unclear or vague',
    incorrectDefinition1: 'bright and distinct',
    incorrectDefinition2: 'empty and meaningless',
    incorrectDefinition3: 'sharp and defined',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },

  // Set 2 (1-50)
  {
    word: 'rebarbative',
    correctDefinition: 'irritating and unattractive',
    incorrectDefinition1: 'charming or delightful',
    incorrectDefinition2: 'weak or ineffective',
    incorrectDefinition3: 'smooth and persuasive',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'apocryphal',
    correctDefinition: 'of doubtful authenticity, though widely circulated as true',
    incorrectDefinition1: 'confirmed and factual',
    incorrectDefinition2: 'obvious and transparent',
    incorrectDefinition3: 'philosophical or abstract',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sesquipedalian',
    correctDefinition: 'given to using long words',
    incorrectDefinition1: 'extremely brief',
    incorrectDefinition2: 'childishly simple',
    incorrectDefinition3: 'lacking confidence',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'lugubrious',
    correctDefinition: 'looking or sounding sad and dismal',
    incorrectDefinition1: 'carefree and relaxed',
    incorrectDefinition2: 'stern and serious',
    incorrectDefinition3: 'cunning and deceitful',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'insalubrious',
    correctDefinition: 'not healthy or wholesome',
    incorrectDefinition1: 'luxurious and comfortable',
    incorrectDefinition2: 'cheap but cheerful',
    incorrectDefinition3: 'financially successful',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pusillanimous',
    correctDefinition: 'lacking courage; cowardly',
    incorrectDefinition1: 'honest and brave',
    incorrectDefinition2: 'clever but deceptive',
    incorrectDefinition3: 'harsh and critical',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'propinquity',
    correctDefinition: 'nearness in place or relationship',
    incorrectDefinition1: 'sudden change or movement',
    incorrectDefinition2: 'moral purity',
    incorrectDefinition3: 'formal permission',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'persiflage',
    correctDefinition: 'light, teasing banter',
    incorrectDefinition1: 'serious conversation',
    incorrectDefinition2: 'harsh criticism',
    incorrectDefinition3: 'profound reflection',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'saturnine',
    correctDefinition: 'gloomy, morose, or sullen',
    incorrectDefinition1: 'bright and optimistic',
    incorrectDefinition2: 'quick-tempered',
    incorrectDefinition3: 'easily distracted',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'abstemious',
    correctDefinition: 'not self-indulgent, especially in eating or drinking',
    incorrectDefinition1: 'gluttonous and greedy',
    incorrectDefinition2: 'emotionally distant',
    incorrectDefinition3: 'strict and judgmental',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'uxorious',
    correctDefinition: 'excessively devoted to one\'s wife',
    incorrectDefinition1: 'proudly independent',
    incorrectDefinition2: 'disloyal or unfaithful',
    incorrectDefinition3: 'indifferent toward others',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'inveterate',
    correctDefinition: 'long-established and unlikely to change',
    incorrectDefinition1: 'temporary or new',
    incorrectDefinition2: 'easily influenced',
    incorrectDefinition3: 'unplanned and spontaneous',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'defenestrate',
    correctDefinition: 'to throw someone or something out of a window',
    incorrectDefinition1: 'to silence through ridicule',
    incorrectDefinition2: 'to exile or banish',
    incorrectDefinition3: 'to strip of rank',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'supererogatory',
    correctDefinition: 'beyond what is required or expected',
    incorrectDefinition1: 'done carelessly',
    incorrectDefinition2: 'failing to meet standards',
    incorrectDefinition3: 'common or mediocre',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'disputatious',
    correctDefinition: 'fond of arguing; contentious',
    incorrectDefinition1: 'easygoing and agreeable',
    incorrectDefinition2: 'honest and loyal',
    incorrectDefinition3: 'shy and withdrawn',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'quiescent',
    correctDefinition: 'in a state of inactivity or dormancy',
    incorrectDefinition1: 'highly energetic',
    incorrectDefinition2: 'restless or impatient',
    incorrectDefinition3: 'easily excited',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'evanescent',
    correctDefinition: 'quickly fading or disappearing',
    incorrectDefinition1: 'strong and enduring',
    incorrectDefinition2: 'vibrant and colorful',
    incorrectDefinition3: 'unchangeable',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'mendacious',
    correctDefinition: 'habitually dishonest; lying',
    incorrectDefinition1: 'innocently mistaken',
    incorrectDefinition2: 'reluctant to speak',
    incorrectDefinition3: 'sincere and open',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'disquisition',
    correctDefinition: 'a formal, detailed discussion on a subject',
    incorrectDefinition1: 'a brief disagreement',
    incorrectDefinition2: 'a rumor or hearsay',
    incorrectDefinition3: 'a simple explanation',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'malapropism',
    correctDefinition: 'the mistaken use of a word in place of a similar-sounding one',
    incorrectDefinition1: 'the art of persuasion',
    incorrectDefinition2: 'a deliberate exaggeration',
    incorrectDefinition3: 'a pun or wordplay',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'truculent',
    correctDefinition: 'eager or quick to argue or fight',
    incorrectDefinition1: 'gentle and patient',
    incorrectDefinition2: 'boring or uninspired',
    incorrectDefinition3: 'calm and thoughtful',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'imbroglio',
    correctDefinition: 'a confused or complicated situation',
    incorrectDefinition1: 'a romantic relationship',
    incorrectDefinition2: 'a bold statement',
    incorrectDefinition3: 'a minor misunderstanding',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'cunctation',
    correctDefinition: 'delay or procrastination',
    incorrectDefinition1: 'rash decision-making',
    incorrectDefinition2: 'argumentative behavior',
    incorrectDefinition3: 'unnecessary repetition',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'fatuous',
    correctDefinition: 'silly and pointless',
    incorrectDefinition1: 'clever and witty',
    incorrectDefinition2: 'deeply serious',
    incorrectDefinition3: 'gracious and polite',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obdurate',
    correctDefinition: 'stubbornly refusing to change opinion or action',
    incorrectDefinition1: 'easily persuaded',
    incorrectDefinition2: 'emotionally fragile',
    incorrectDefinition3: 'hesitant and shy',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'antediluvian',
    correctDefinition: 'extremely old-fashioned',
    incorrectDefinition1: 'recently developed',
    incorrectDefinition2: 'futuristic',
    incorrectDefinition3: 'repetitive and dull',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'enervate',
    correctDefinition: 'to weaken or drain energy from',
    incorrectDefinition1: 'to strengthen or encourage',
    incorrectDefinition2: 'to confuse or distract',
    incorrectDefinition3: 'to cheer or uplift',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'impecunious',
    correctDefinition: 'having little or no money',
    incorrectDefinition1: 'generous and charitable',
    incorrectDefinition2: 'proud and boastful',
    incorrectDefinition3: 'cautious and calculating',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'obstreperous',
    correctDefinition: 'noisy and difficult to control',
    incorrectDefinition1: 'calm and quiet',
    incorrectDefinition2: 'lazy and unmotivated',
    incorrectDefinition3: 'sad and withdrawn',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'nefarious',
    correctDefinition: 'wicked or criminal',
    incorrectDefinition1: 'honest and fair',
    incorrectDefinition2: 'weak and indecisive',
    incorrectDefinition3: 'boring and repetitive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'opprobrium',
    correctDefinition: 'harsh criticism or public disgrace',
    incorrectDefinition1: 'sudden praise',
    incorrectDefinition2: 'deep regret',
    incorrectDefinition3: 'formal debate',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'phlegmatic',
    correctDefinition: 'calm and unemotional',
    incorrectDefinition1: 'excitable and erratic',
    incorrectDefinition2: 'depressed or hopeless',
    incorrectDefinition3: 'carefree and loud',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pellucid',
    correctDefinition: 'clear and easy to understand',
    incorrectDefinition1: 'dark and opaque',
    incorrectDefinition2: 'rough or jagged',
    incorrectDefinition3: 'confusing and abstract',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'vituperative',
    correctDefinition: 'harshly abusive or scolding',
    incorrectDefinition1: 'friendly and helpful',
    incorrectDefinition2: 'quiet and timid',
    incorrectDefinition3: 'dull and passive',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sententious',
    correctDefinition: 'given to moralizing in a pompous way',
    incorrectDefinition1: 'shy and withdrawn',
    incorrectDefinition2: 'excessively wordy',
    incorrectDefinition3: 'brief and direct',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'chimerical',
    correctDefinition: 'wildly unrealistic or fanciful',
    incorrectDefinition1: 'clearly achievable',
    incorrectDefinition2: 'repetitive and dull',
    incorrectDefinition3: 'simple and predictable',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'excoriate',
    correctDefinition: 'to criticize severely',
    incorrectDefinition1: 'to heal or soothe',
    incorrectDefinition2: 'to confuse or distort',
    incorrectDefinition3: 'to exaggerate or embellish',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'ineluctable',
    correctDefinition: 'impossible to avoid or escape',
    incorrectDefinition1: 'easily prevented',
    incorrectDefinition2: 'temporary or brief',
    incorrectDefinition3: 'unpredictable',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'contumacious',
    correctDefinition: 'stubbornly disobedient',
    incorrectDefinition1: 'respectful and polite',
    incorrectDefinition2: 'absent-minded',
    incorrectDefinition3: 'curious and questioning',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'recrudescent',
    correctDefinition: 'breaking out again after a period of dormancy',
    incorrectDefinition1: 'slowly fading away',
    incorrectDefinition2: 'gradually developing',
    incorrectDefinition3: 'declining permanently',
    difficulty: 5,
    category: 'academic',
    partOfSpeech: 'adjective'
  },

  // Set 3 (1-50)
  {
    word: 'garrulous',
    correctDefinition: 'excessively talkative',
    incorrectDefinition1: 'quiet and withdrawn',
    incorrectDefinition2: 'uncertain or hesitant',
    incorrectDefinition3: 'clever and witty',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pragmatic',
    correctDefinition: 'dealing with things sensibly and realistically',
    incorrectDefinition1: 'focused on theory or ideals',
    incorrectDefinition2: 'overly cautious',
    incorrectDefinition3: 'unpredictable',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'restive',
    correctDefinition: 'unable to keep still or silent; restless',
    incorrectDefinition1: 'calm and composed',
    incorrectDefinition2: 'lazy and unmotivated',
    incorrectDefinition3: 'easily distracted',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'epistolary',
    correctDefinition: 'written in the form of letters',
    incorrectDefinition1: 'relating to spoken dialogue',
    incorrectDefinition2: 'lacking clear structure',
    incorrectDefinition3: 'focused on ancient topics',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ineffectual',
    correctDefinition: 'not producing the desired result',
    incorrectDefinition1: 'overly confident',
    incorrectDefinition2: 'difficult to measure',
    incorrectDefinition3: 'pleasantly surprising',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'bombastic',
    correctDefinition: 'high-sounding but with little meaning; inflated',
    incorrectDefinition1: 'subtle and persuasive',
    incorrectDefinition2: 'calm and analytical',
    incorrectDefinition3: 'playful and humorous',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'onerous',
    correctDefinition: 'involving a great deal of effort or difficulty',
    incorrectDefinition1: 'simple and enjoyable',
    incorrectDefinition2: 'rarely required',
    incorrectDefinition3: 'optional and flexible',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'verbose',
    correctDefinition: 'using more words than necessary',
    incorrectDefinition1: 'sharp and concise',
    incorrectDefinition2: 'dull and monotone',
    incorrectDefinition3: 'harsh and unpleasant',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'cursory',
    correctDefinition: 'hasty and not thorough',
    incorrectDefinition1: 'detailed and careful',
    incorrectDefinition2: 'extremely complex',
    incorrectDefinition3: 'elegant and refined',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'austere',
    correctDefinition: 'severe or strict in manner or appearance',
    incorrectDefinition1: 'soft and delicate',
    incorrectDefinition2: 'comfortably casual',
    incorrectDefinition3: 'bright and decorative',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'circumspect',
    correctDefinition: 'careful and unwilling to take risks',
    incorrectDefinition1: 'rash and daring',
    incorrectDefinition2: 'dishonest or evasive',
    incorrectDefinition3: 'lacking focus',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'didactic',
    correctDefinition: 'intended to teach, often in a moralizing way',
    incorrectDefinition1: 'vague and indirect',
    incorrectDefinition2: 'entertaining only',
    incorrectDefinition3: 'philosophically neutral',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'reticent',
    correctDefinition: 'reserved; not revealing one\'s thoughts easily',
    incorrectDefinition1: 'open and enthusiastic',
    incorrectDefinition2: 'careless in speech',
    incorrectDefinition3: 'impulsive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'prosaic',
    correctDefinition: 'lacking imagination; dull',
    incorrectDefinition1: 'deeply poetic',
    incorrectDefinition2: 'confusing or abstract',
    incorrectDefinition3: 'amusing and witty',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'magnanimous',
    correctDefinition: 'generous or forgiving toward a rival',
    incorrectDefinition1: 'cautious and calculating',
    incorrectDefinition2: 'arrogant or proud',
    incorrectDefinition3: 'strict and judgmental',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ostentatious',
    correctDefinition: 'characterized by vulgar or showy display',
    incorrectDefinition1: 'plain and modest',
    incorrectDefinition2: 'subtle and elegant',
    incorrectDefinition3: 'outdated',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'capitulate',
    correctDefinition: 'to surrender or give in after resistance',
    incorrectDefinition1: 'to negotiate terms',
    incorrectDefinition2: 'to argue relentlessly',
    incorrectDefinition3: 'to make peace temporarily',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'verb'
  },
  {
    word: 'poignant',
    correctDefinition: 'deeply touching or emotionally moving',
    incorrectDefinition1: 'harsh or offensive',
    incorrectDefinition2: 'unrealistic',
    incorrectDefinition3: 'indirect or subtle',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'implacable',
    correctDefinition: 'unable to be appeased or pacified',
    incorrectDefinition1: 'easily satisfied',
    incorrectDefinition2: 'calm and forgiving',
    incorrectDefinition3: 'flexible and open-minded',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'myopic',
    correctDefinition: 'short-sighted; lacking foresight',
    incorrectDefinition1: 'broadly visionary',
    incorrectDefinition2: 'morally unclear',
    incorrectDefinition3: 'hesitant and indecisive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sycophant',
    correctDefinition: 'a person who flatters for personal gain',
    incorrectDefinition1: 'a self-reliant thinker',
    incorrectDefinition2: 'a loyal critic',
    incorrectDefinition3: 'a cheerful helper',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'vicarious',
    correctDefinition: 'experienced through the actions of another',
    incorrectDefinition1: 'performed firsthand',
    incorrectDefinition2: 'shallow or fake',
    incorrectDefinition3: 'loud and expressive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'tenacious',
    correctDefinition: 'persistent and determined',
    incorrectDefinition1: 'carefree and relaxed',
    incorrectDefinition2: 'easily discouraged',
    incorrectDefinition3: 'thoughtless',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'circuitous',
    correctDefinition: 'longer and more indirect than the most direct route',
    incorrectDefinition1: 'direct and efficient',
    incorrectDefinition2: 'round or circular',
    incorrectDefinition3: 'temporary',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'immutable',
    correctDefinition: 'unchanging over time',
    incorrectDefinition1: 'constantly developing',
    incorrectDefinition2: 'fragile and temporary',
    incorrectDefinition3: 'hidden or secret',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'incredulous',
    correctDefinition: 'unwilling or unable to believe something',
    incorrectDefinition1: 'open-minded',
    incorrectDefinition2: 'easily persuaded',
    incorrectDefinition3: 'deeply thoughtful',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'inane',
    correctDefinition: 'silly or meaningless',
    incorrectDefinition1: 'clever and sharp',
    incorrectDefinition2: 'uncommon',
    incorrectDefinition3: 'unpleasant',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ascetic',
    correctDefinition: 'practicing severe self-discipline; avoiding indulgence',
    incorrectDefinition1: 'interested in luxury',
    incorrectDefinition2: 'emotionally closed',
    incorrectDefinition3: 'highly social',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'furtive',
    correctDefinition: 'attempting to avoid notice or attention',
    incorrectDefinition1: 'open and confident',
    incorrectDefinition2: 'cheerful and playful',
    incorrectDefinition3: 'thoughtless',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'prolific',
    correctDefinition: 'producing many works or results',
    incorrectDefinition1: 'slow and careful',
    incorrectDefinition2: 'creative but inconsistent',
    incorrectDefinition3: 'selective and rare',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'impetuous',
    correctDefinition: 'acting quickly without thought',
    incorrectDefinition1: 'hesitant and uncertain',
    incorrectDefinition2: 'calculated and strategic',
    incorrectDefinition3: 'polite and deliberate',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'querulous',
    correctDefinition: 'complaining in a petulant way',
    incorrectDefinition1: 'quiet and reserved',
    incorrectDefinition2: 'easily amused',
    incorrectDefinition3: 'honest and blunt',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'diffident',
    correctDefinition: 'lacking self-confidence',
    incorrectDefinition1: 'bold and outspoken',
    incorrectDefinition2: 'aggressive',
    incorrectDefinition3: 'curious and open',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'enigmatic',
    correctDefinition: 'mysterious or difficult to interpret',
    incorrectDefinition1: 'easily explained',
    incorrectDefinition2: 'simple and open',
    incorrectDefinition3: 'loud and obvious',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'avaricious',
    correctDefinition: 'extremely greedy for wealth',
    incorrectDefinition1: 'cautiously frugal',
    incorrectDefinition2: 'generous and kind',
    incorrectDefinition3: 'disorganized',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'disingenuous',
    correctDefinition: 'not sincere or honest; pretending ignorance',
    incorrectDefinition1: 'completely transparent',
    incorrectDefinition2: 'overly emotional',
    incorrectDefinition3: 'confident and bold',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ambivalent',
    correctDefinition: 'having mixed feelings about something',
    incorrectDefinition1: 'clearly decided',
    incorrectDefinition2: 'emotionally detached',
    incorrectDefinition3: 'strongly opposed',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pedantic',
    correctDefinition: 'overly concerned with minor details or rules',
    incorrectDefinition1: 'flexible and creative',
    incorrectDefinition2: 'intuitive and emotional',
    incorrectDefinition3: 'playful and casual',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'bellicose',
    correctDefinition: 'demonstrating aggression or willingness to fight',
    incorrectDefinition1: 'peaceful and quiet',
    incorrectDefinition2: 'defensive and reserved',
    incorrectDefinition3: 'unsure and timid',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'insidious',
    correctDefinition: 'proceeding subtly but with harmful effects',
    incorrectDefinition1: 'openly aggressive',
    incorrectDefinition2: 'mildly unpleasant',
    incorrectDefinition3: 'overly complex',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },

  // Set 4 (1-50)
  {
    word: 'ambiguous',
    correctDefinition: 'having more than one possible meaning',
    incorrectDefinition1: 'clear and direct',
    incorrectDefinition2: 'harsh or critical',
    incorrectDefinition3: 'completely false',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'juxtaposition',
    correctDefinition: 'placing two things side by side for contrast',
    incorrectDefinition1: 'a form of artistic exaggeration',
    incorrectDefinition2: 'the act of replacing something',
    incorrectDefinition3: 'a sharp disagreement',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'nuance',
    correctDefinition: 'a subtle difference in meaning or expression',
    incorrectDefinition1: 'a repetitive phrase',
    incorrectDefinition2: 'a bold opinion',
    incorrectDefinition3: 'a logical contradiction',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'noun'
  },
  {
    word: 'aesthetic',
    correctDefinition: 'concerned with beauty or artistic taste',
    incorrectDefinition1: 'practical and useful',
    incorrectDefinition2: 'scientific or factual',
    incorrectDefinition3: 'harsh and unrefined',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'verisimilitude',
    correctDefinition: 'the appearance of being true or real',
    incorrectDefinition1: 'a deliberate falsehood',
    incorrectDefinition2: 'a form of exaggeration',
    incorrectDefinition3: 'a logical deduction',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'eloquent',
    correctDefinition: 'fluent and persuasive in speaking or writing',
    incorrectDefinition1: 'harsh and direct',
    incorrectDefinition2: 'short and incomplete',
    incorrectDefinition3: 'hesitant and uncertain',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'paradigm',
    correctDefinition: 'a model or typical example',
    incorrectDefinition1: 'a contradiction',
    incorrectDefinition2: 'a minor issue',
    incorrectDefinition3: 'an outdated theory',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'idiosyncratic',
    correctDefinition: 'peculiar or individual',
    incorrectDefinition1: 'common and predictable',
    incorrectDefinition2: 'based on imitation',
    incorrectDefinition3: 'uniform and consistent',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sentient',
    correctDefinition: 'able to perceive or feel things',
    incorrectDefinition1: 'easily influenced',
    incorrectDefinition2: 'cold and mechanical',
    incorrectDefinition3: 'overly intellectual',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'luminous',
    correctDefinition: 'full of light; shining brightly',
    incorrectDefinition1: 'dull or faint',
    incorrectDefinition2: 'short-lived',
    incorrectDefinition3: 'emotionally distant',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'incongruous',
    correctDefinition: 'out of place or inconsistent',
    incorrectDefinition1: 'highly logical',
    incorrectDefinition2: 'gradually improving',
    incorrectDefinition3: 'smooth and uniform',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'lucid',
    correctDefinition: 'clear and easy to understand',
    incorrectDefinition1: 'overly detailed',
    incorrectDefinition2: 'emotionally charged',
    incorrectDefinition3: 'uncertain and vague',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'altruistic',
    correctDefinition: 'showing selfless concern for others',
    incorrectDefinition1: 'self-centered',
    incorrectDefinition2: 'cautiously ambitious',
    incorrectDefinition3: 'morally indifferent',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'oblique',
    correctDefinition: 'indirect or not straightforward',
    incorrectDefinition1: 'precise and exact',
    incorrectDefinition2: 'harshly critical',
    incorrectDefinition3: 'transparent',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'sardonic',
    correctDefinition: 'grimly mocking or cynical',
    incorrectDefinition1: 'cheerful and polite',
    incorrectDefinition2: 'dry and dull',
    incorrectDefinition3: 'emotionally detached',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'incisive',
    correctDefinition: 'clear and sharp in analysis or expression',
    incorrectDefinition1: 'confusing and vague',
    incorrectDefinition2: 'repetitive and dull',
    incorrectDefinition3: 'cold and emotionless',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'paradoxical',
    correctDefinition: 'seemingly contradictory but possibly true',
    incorrectDefinition1: 'obviously false',
    incorrectDefinition2: 'plainly logical',
    incorrectDefinition3: 'simplistic',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'subversive',
    correctDefinition: 'seeking to undermine authority or convention',
    incorrectDefinition1: 'completely supportive',
    incorrectDefinition2: 'emotionally manipulative',
    incorrectDefinition3: 'narrow-minded',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'cynical',
    correctDefinition: 'distrustful of human sincerity or motives',
    incorrectDefinition1: 'hopeful and trusting',
    incorrectDefinition2: 'academic and detached',
    incorrectDefinition3: 'nervous and indecisive',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ostensible',
    correctDefinition: 'appearing true but not necessarily so',
    incorrectDefinition1: 'hidden and secretive',
    incorrectDefinition2: 'clearly false',
    incorrectDefinition3: 'overly detailed',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'convoluted',
    correctDefinition: 'extremely complex and difficult to follow',
    incorrectDefinition1: 'simple and elegant',
    incorrectDefinition2: 'harsh and abrupt',
    incorrectDefinition3: 'unoriginal',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'inept',
    correctDefinition: 'lacking skill or ability',
    incorrectDefinition1: 'extremely careful',
    incorrectDefinition2: 'confident and clever',
    incorrectDefinition3: 'highly educated',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'veracity',
    correctDefinition: 'truthfulness or accuracy',
    incorrectDefinition1: 'bias or exaggeration',
    incorrectDefinition2: 'emotional intensity',
    incorrectDefinition3: 'moral uncertainty',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'capricious',
    correctDefinition: 'sudden and unpredictable in mood or behavior',
    incorrectDefinition1: 'consistent and reliable',
    incorrectDefinition2: 'calm and patient',
    incorrectDefinition3: 'rational and steady',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'salient',
    correctDefinition: 'most noticeable or important',
    incorrectDefinition1: 'hidden and subtle',
    incorrectDefinition2: 'short-lived',
    incorrectDefinition3: 'dull and repetitive',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'myriad',
    correctDefinition: 'a countless or extremely great number',
    incorrectDefinition1: 'a rare or unique example',
    incorrectDefinition2: 'a repeating cycle',
    incorrectDefinition3: 'a structured sequence',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'banal',
    correctDefinition: 'so lacking in originality as to be obvious',
    incorrectDefinition1: 'deeply profound',
    incorrectDefinition2: 'shockingly strange',
    incorrectDefinition3: 'historically important',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'avarice',
    correctDefinition: 'extreme greed for wealth or material gain',
    incorrectDefinition1: 'kind generosity',
    incorrectDefinition2: 'thoughtful moderation',
    incorrectDefinition3: 'stubborn pride',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'magnanimity',
    correctDefinition: 'generosity or nobility of spirit',
    incorrectDefinition1: 'harshness',
    incorrectDefinition2: 'self-importance',
    incorrectDefinition3: 'intellectual arrogance',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'noun'
  },
  {
    word: 'tenable',
    correctDefinition: 'able to be defended or maintained (of an argument)',
    incorrectDefinition1: 'morally questionable',
    incorrectDefinition2: 'easily broken',
    incorrectDefinition3: 'temporary',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'pragmatism',
    correctDefinition: 'a practical approach to problems',
    incorrectDefinition1: 'emotional idealism',
    incorrectDefinition2: 'blind obedience',
    incorrectDefinition3: 'abstract theorizing',
    difficulty: 3,
    category: 'general',
    partOfSpeech: 'noun'
  },
  {
    word: 'dispassionate',
    correctDefinition: 'not influenced by emotion; impartial',
    incorrectDefinition1: 'lacking any opinion',
    incorrectDefinition2: 'cold and cruel',
    incorrectDefinition3: 'passive and weak',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'incipient',
    correctDefinition: 'beginning to develop or exist',
    incorrectDefinition1: 'already fully formed',
    incorrectDefinition2: 'declining rapidly',
    incorrectDefinition3: 'hidden from sight',
    difficulty: 4,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'redundant',
    correctDefinition: 'no longer needed or useful',
    incorrectDefinition1: 'strongly relevant',
    incorrectDefinition2: 'misunderstood',
    incorrectDefinition3: 'deeply symbolic',
    difficulty: 2,
    category: 'general',
    partOfSpeech: 'adjective'
  },
  {
    word: 'derivative',
    correctDefinition: 'imitative of another\'s work; lacking originality',
    incorrectDefinition1: 'entirely unique',
    incorrectDefinition2: 'poorly constructed',
    incorrectDefinition3: 'old-fashioned',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  },
  {
    word: 'cogent',
    correctDefinition: 'clear, logical, and convincing',
    incorrectDefinition1: 'emotionally manipulative',
    incorrectDefinition2: 'rambling and vague',
    incorrectDefinition3: 'philosophically abstract',
    difficulty: 3,
    category: 'academic',
    partOfSpeech: 'adjective'
  }
];

async function importCollection() {
  console.log('🌱 Starting vocabulary collection import...');
  console.log(`📚 Total words to import: ${vocabularyCollection.length}`);

  try {
    const result = await importVocabulary(
      vocabularyCollection,
      'Comprehensive Vocabulary Collection',
      'Complete Lexipop vocabulary database with challenging academic and general words across multiple difficulty levels'
    );

    console.log('\n📊 Import Results:');
    console.log(`✅ Total words: ${result.stats.total}`);
    console.log(`✅ Successfully imported: ${result.stats.imported}`);
    console.log(`⚠️  Duplicates skipped: ${result.stats.duplicates}`);
    console.log(`❌ Failed imports: ${result.stats.failed}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Warnings/Errors:');
      result.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more errors`);
      }
    }

    if (result.success) {
      console.log('\n🎉 Vocabulary collection import completed successfully!');
      console.log(`📚 Your Lexipop database now contains ${result.stats.imported} challenging words!`);
      console.log(`🎮 Players can now enjoy a much richer vocabulary experience!`);
      console.log(`Batch ID: ${result.batchId}`);
    } else {
      console.log('\n❌ Vocabulary collection import failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Import error:', error);
    process.exit(1);
  }
}

// Run the import
importCollection();