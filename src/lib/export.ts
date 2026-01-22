import { LearningHistoryItem } from "./types";

export function exportToCSV(items: LearningHistoryItem[]) {
    const headers = ['Type', 'Japanese', 'Reading', 'Meaning', 'Explanation', 'JLPT', 'NextReview'];
    const rows = items.map(item => [
        item.type || '',
        item.text || '',
        // Extract reading if possible, else empty
        '',
        item.meaning || '',
        // Flatten simple explanation if available (history doesn't store explanation by default unless we update it)
        '',
        item.jlpt || '',
        item.nextReviewDate ? new Date(item.nextReviewDate).toLocaleDateString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
        + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "j_learning_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToAnki(items: LearningHistoryItem[]) {
    // Basic CSV format compatible with Anki import (Front, Back)
    // Front: Japanese [Reading]
    // Back: Meaning <br> JLPT

    const rows = items.map(item => {
        const front = `${item.text}`;
        const back = `${item.meaning} <br><small>${item.jlpt || ''}</small>`;
        return `${front};${back}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "j_learning_anki_import.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
