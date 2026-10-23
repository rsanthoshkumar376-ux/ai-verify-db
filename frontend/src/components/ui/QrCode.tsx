import React from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Lightweight, zero-dependency SVG QR-style visual identifier
 * Renders a crisp deterministic matrix pattern representing the verification hash.
 */
export const QrCode: React.FC<QrCodeProps> = ({ value, size = 100, className = '' }) => {
  // Generate deterministic binary pattern from value string
  const hash = Array.from(value).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);
  const gridSize = 15;
  const cells: boolean[][] = [];

  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      // Corner alignment markers (standard QR look)
      const isTopLeft = r < 4 && c < 4;
      const isTopRight = r < 4 && c >= gridSize - 4;
      const isBottomLeft = r >= gridSize - 4 && c < 4;
      
      if (isTopLeft || isTopRight || isBottomLeft) {
        const border = (r === 0 || r === 3 || c === 0 || c === 3) ||
                       (r === 0 || r === 3 || c === gridSize - 4 || c === gridSize - 1) ||
                       (r === gridSize - 4 || r === gridSize - 1 || c === 0 || c === 3);
        const center = (r === 1 && c === 1) ||
                       (r === 1 && c === gridSize - 3) ||
                       (r === gridSize - 3 && c === 1);
        cells[r][c] = border || center;
      } else {
        const seed = (hash ^ (r * 31 + c * 17)) & 0xfffff;
        cells[r][c] = seed % 3 === 0;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className={`inline-block bg-white p-2 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize - 0.4}
                height={cellSize - 0.4}
                rx={1}
                className="fill-slate-900 dark:fill-slate-100"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
