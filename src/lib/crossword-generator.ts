export interface Cell {
    char: string;
    x: number;
    y: number;
    used: boolean;
}

export interface Clue {
    id: string;
    number: number;
    direction: 'across' | 'down';
    x: number;
    y: number;
    length: number;
    question: string; // Meaning
    answer: string;   // Reading (Hiragana)
}

export interface CrosswordData {
    width: number;
    height: number;
    grid: (string | null)[][]; // char or null
    clues: Clue[];
}

export function generateCrossword(words: { word: string; clue: string }[]): CrosswordData | null {
    // Basic constants
    const GRID_SIZE = 20; // Max grid size
    const MAX_RETRIES = 50;

    // Filter valid words (at least 2 chars, hiragana/katakana preferred)
    const validWords = words.filter(w => w.word.length >= 2 && w.word.length <= 10);
    if (validWords.length === 0) return null;

    // Helper to create empty grid
    const createGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    // Best result container
    let bestGrid: (string | null)[][] | null = null;
    let bestClues: Clue[] = [];
    let bestScore = -1;

    for (let retry = 0; retry < MAX_RETRIES; retry++) {
        const grid = createGrid();
        const clues: Clue[] = [];
        const placedWords: { word: string, x: number, y: number, dir: 'across' | 'down' }[] = [];

        // Shuffle words for random placement
        const shuffled = [...validWords].sort(() => Math.random() - 0.5);

        // Place first word in center (Across)
        const first = shuffled[0];
        const mid = Math.floor(GRID_SIZE / 2);
        const startX = mid - Math.floor(first.word.length / 2);
        const startY = mid;

        // Place chars
        let success = true;
        for (let i = 0; i < first.word.length; i++) {
            grid[startY][startX + i] = first.word[i];
        }
        placedWords.push({ word: first.word, x: startX, y: startY, dir: 'across' });
        clues.push({
            id: `1-across`,
            number: 1,
            direction: 'across',
            x: startX,
            y: startY,
            length: first.word.length,
            question: first.clue,
            answer: first.word
        });

        // Place remaining words
        for (let i = 1; i < shuffled.length; i++) {
            const current = shuffled[i];
            let placed = false;

            // Try to intersect with existing words
            // Randomize placed words order to try intersections
            const potentialIntersections = [...placedWords].sort(() => Math.random() - 0.5);

            for (const existing of potentialIntersections) {
                if (placed) break;

                // Check common characters
                for (let j = 0; j < current.word.length; j++) {
                    if (placed) break;
                    const char = current.word[j];

                    for (let k = 0; k < existing.word.length; k++) {
                        if (existing.word[k] === char) {
                            // Found intersection point
                            // If existing is ACROSS, new must be DOWN, or vice versa
                            const newDir = existing.dir === 'across' ? 'down' : 'across';

                            // Calculate new position
                            let newX = 0, newY = 0;
                            if (newDir === 'down') {
                                newX = existing.x + k;
                                newY = existing.y - j; // Start Y is existing Y minus index of char in new word
                            } else {
                                newX = existing.x - j;
                                newY = existing.y + k;
                            }

                            // Validate placement
                            if (canPlace(grid, current.word, newX, newY, newDir)) {
                                placeWord(grid, current.word, newX, newY, newDir);
                                placedWords.push({ word: current.word, x: newX, y: newY, dir: newDir });
                                clues.push({
                                    id: `${clues.length + 1}-${newDir}`, // Temp ID, will renumber later
                                    number: 0, // Temp
                                    direction: newDir,
                                    x: newX,
                                    y: newY,
                                    length: current.word.length,
                                    question: current.clue,
                                    answer: current.word
                                });
                                placed = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Score logic: more words placed is better
        if (placedWords.length > bestScore) {
            bestScore = placedWords.length;
            bestGrid = grid;
            bestClues = clues;
        }

        // If we placed enough words (e.g. 5+ or 80%), good enough
        if (bestScore >= Math.min(validWords.length, 8)) break;
    }

    if (!bestGrid || bestScore < 2) return null; // Need at least 2 words

    // Crop grid
    const { cropGrid, offsetX, offsetY, width, height } = trimGrid(bestGrid);

    // Adjust clue coordinates and add numbers
    const finalClues = bestClues.map(c => ({
        ...c,
        x: c.x - offsetX,
        y: c.y - offsetY
    })).sort((a, b) => (a.y - b.y) || (a.x - b.x));

    // Assign numbers based on position (standard crossword numbering)
    // 1, 2, 3... top-left usage first
    let counter = 1;
    // Map of "x,y" to number
    const numberMap = new Map<string, number>();

    finalClues.forEach(c => {
        const key = `${c.x},${c.y}`;
        if (!numberMap.has(key)) {
            numberMap.set(key, counter++);
        }
        c.number = numberMap.get(key)!;
        c.id = `${c.number}-${c.direction}`;
    });

    return {
        width,
        height,
        grid: cropGrid,
        clues: finalClues
    };
}

function canPlace(grid: (string | null)[][], word: string, x: number, y: number, dir: 'across' | 'down'): boolean {
    const height = grid.length;
    const width = grid[0].length;

    // Boundary check
    if (x < 0 || y < 0) return false;
    if (dir === 'across' && x + word.length > width) return false;
    if (dir === 'down' && y + word.length > height) return false;

    // Check cells
    for (let i = 0; i < word.length; i++) {
        const cx = dir === 'across' ? x + i : x;
        const cy = dir === 'down' ? y + i : y;
        const char = word[i];
        const existing = grid[cy][cx];

        // Conflict check
        if (existing !== null && existing !== char) return false;

        // Neighbor check (adjacent rule) - strictly speaking we need to check surrounding cells
        // to prevent accidental word formation, but for simple MVP we relax this.
        // However, we MUST check that we don't overwrite/touch ends incorrectly.

        // Before start
        if (i === 0) {
            const px = dir === 'across' ? x - 1 : x;
            const py = dir === 'down' ? y - 1 : y;
            if (px >= 0 && py >= 0 && px < width && py < height && grid[py][px] !== null) return false;
        }
        // After end
        if (i === word.length - 1) {
            const nx = dir === 'across' ? x + 1 : x;
            const ny = dir === 'down' ? y + 1 : y;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height && grid[ny][nx] !== null) return false;
        }
    }

    return true;
}

function placeWord(grid: (string | null)[][], word: string, x: number, y: number, dir: 'across' | 'down') {
    for (let i = 0; i < word.length; i++) {
        const cx = dir === 'across' ? x + i : x;
        const cy = dir === 'down' ? y + i : y;
        grid[cy][cx] = word[i];
    }
}

function trimGrid(grid: (string | null)[][]) {
    let minX = grid.length, minY = grid.length, maxX = 0, maxY = 0;

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] !== null) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cropGrid = Array(height).fill(null).map(() => Array(width).fill(null));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            cropGrid[y][x] = grid[minY + y][minX + x];
        }
    }

    return { cropGrid, offsetX: minX, offsetY: minY, width, height };
}
