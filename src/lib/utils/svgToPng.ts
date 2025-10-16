/**
 * 🖼️ SVG to PNG Conversion Utility
 *
 * Converts SVG content to PNG for social sharing
 */

export interface SvgToPngOptions {
  width?: number;
  height?: number;
  quality?: number;
  backgroundColor?: string;
}

/**
 * Convert SVG string to PNG blob
 */
export async function svgToPng(
  svgContent: string,
  options: SvgToPngOptions = {}
): Promise<Blob> {
  const {
    width = 600,
    height = 600,
    quality = 0.95,
    backgroundColor = 'white'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create SVG element
      const svg = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);

      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Set background color
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create PNG blob'));
              }
            },
            'image/png',
            quality
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert SVG to data URL (base64 PNG)
 */
export async function svgToPngDataUrl(
  svgContent: string,
  options: SvgToPngOptions = {}
): Promise<string> {
  const blob = await svgToPng(svgContent, options);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate score share SVG content
 */
export function generateScoreShareSvg(data: {
  score: number;
  words: string[];
  streakBonus: number;
  dailyStreak: number;
}): string {
  const { score, words, streakBonus, dailyStreak } = data;
  const finalScore = score + streakBonus;

  // Determine colors based on score
  const getColors = (score: number) => {
    if (score >= 500) return { primary: '#FFD700', secondary: '#FFA500' }; // Gold
    if (score >= 400) return { primary: '#B794F4', secondary: '#9F7AEA' }; // Purple
    if (score >= 300) return { primary: '#4FD1C5', secondary: '#38B2AC' }; // Teal
    if (score >= 200) return { primary: '#68D391', secondary: '#48BB78' }; // Green
    return { primary: '#90CDF4', secondary: '#63B3ED' }; // Blue
  };

  const colors = getColors(finalScore);

  return `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colors.primary}" stop-opacity="0.3"/>
        <stop offset="1" stop-color="${colors.secondary}" stop-opacity="0.1"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="600" height="600" fill="white"/>
    <rect width="600" height="600" fill="url(#bg)"/>

    <!-- Header -->
    <text x="20" y="40" font-family="Arial" font-size="28" fill="#1a202c">🎈</text>
    <text x="580" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#1a202c" text-anchor="end">Lexipop</text>

    <!-- Score Section -->
    <text x="300" y="100" font-family="Arial Black" font-size="32" font-weight="900" fill="#1a202c" text-anchor="middle">Final Score</text>
    <text x="300" y="140" font-family="Arial Black" font-size="48" font-weight="900" fill="${colors.primary}" text-anchor="middle">${finalScore} pts</text>

    ${streakBonus > 0 ? `
    <!-- Streak Bonus -->
    <text x="300" y="170" font-family="Arial" font-size="16" fill="#1a202c" text-anchor="middle">Base: ${score} + Streak Bonus: +${streakBonus}</text>
    <text x="300" y="190" font-family="Arial" font-size="14" fill="#ff6b35" text-anchor="middle">🔥 ${dailyStreak} day streak!</text>
    ` : ''}

    <!-- Words -->
    <text x="300" y="${streakBonus > 0 ? 230 : 200}" font-family="Arial" font-size="18" font-weight="bold" fill="#1a202c" text-anchor="middle">Words Mastered:</text>
    ${words.map((word, index) => `
      <text x="300" y="${(streakBonus > 0 ? 260 : 230) + (index * 35)}" font-family="Arial Black" font-size="24" font-weight="900" fill="#1a202c" text-anchor="middle">${word.toUpperCase()}</text>
    `).join('')}

    <!-- Footer -->
    <text x="300" y="580" font-family="Arial" font-size="14" fill="#666" text-anchor="middle">Play Lexipop to improve your vocabulary!</text>
  </svg>`;
}