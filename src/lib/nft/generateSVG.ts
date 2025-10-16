/**
 * 🎨 SVG NFT Generator for Lexipop
 *
 * Creates beautiful SVG artwork from game words
 * Designed for on-chain storage on Base network
 */

export interface NFTMetadata {
  words: string[];
  score: number;
  streak: number;
  date: string;
  playerFid?: number;
}

/**
 * Generate SVG artwork for NFT
 */
export function generateNFTSVG(metadata: NFTMetadata): string {
  const { words, score, streak } = metadata;

  // Determine background gradient based on score
  const getBackgroundGradient = (score: number) => {
    if (score >= 500) return ['#FFD700', '#FFA500']; // Gold
    if (score >= 400) return ['#B794F4', '#9F7AEA']; // Purple
    if (score >= 300) return ['#4FD1C5', '#38B2AC']; // Teal
    if (score >= 200) return ['#68D391', '#48BB78']; // Green
    return ['#90CDF4', '#63B3ED']; // Blue
  };

  const [gradStart, gradEnd] = getBackgroundGradient(score);

  const svg = `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${gradStart}" stop-opacity=".2"/><stop offset="1" stop-color="${gradEnd}" stop-opacity=".3"/></linearGradient></defs><rect width="600" height="600" fill="#fff"/><rect width="600" height="600" fill="url(#bg)"/><text x="20" y="40" font-family="Arial" font-size="28" fill="#1a202c">&#x1F388;</text><text x="580" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#1a202c" text-anchor="end">Lexipop</text>${words.map((word, index) => `<text x="300" y="${170 + (index * 80)}" font-family="Arial Black" font-size="48" font-weight="900" fill="#1a202c" text-anchor="middle">${word.toUpperCase()}</text>`).join('')}</svg>`;

  return svg;
}

/**
 * Convert SVG to base64 data URI for on-chain storage
 */
export function svgToBase64DataURI(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate complete token metadata JSON
 */
export function generateTokenMetadata(metadata: NFTMetadata): string {
  const svg = generateNFTSVG(metadata);
  const image = svgToBase64DataURI(svg);

  const tokenMetadata = {
    name: `Lexipop Game #${metadata.date}`,
    description: `Words mastered: ${metadata.words.join(', ')}. Score: ${metadata.score} points${metadata.streak > 1 ? ` with a ${metadata.streak} day streak!` : '.'}`,
    image: image,
    attributes: [
      {
        trait_type: 'Score',
        value: metadata.score
      },
      {
        trait_type: 'Streak',
        value: metadata.streak
      },
      {
        trait_type: 'Words Count',
        value: metadata.words.length
      },
      {
        trait_type: 'Perfect Game',
        value: metadata.score >= 500 ? 'Yes' : 'No'
      },
      {
        trait_type: 'Date',
        value: metadata.date
      }
    ]
  };

  return JSON.stringify(tokenMetadata);
}

/**
 * Generate a preview URL for testing
 */
export function generatePreviewURL(metadata: NFTMetadata): string {
  const svg = generateNFTSVG(metadata);
  return svgToBase64DataURI(svg);
}