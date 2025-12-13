const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_DIR = path.join(__dirname, '../data');
const DIARY_FILE = path.join(DATA_DIR, 'diaries.json');

// Helper to read diaries
const getDiaries = () => {
    if (!fs.existsSync(DIARY_FILE)) return [];
    try {
        const data = fs.readFileSync(DIARY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// Helper to save diaries
const saveDiaries = (diaries) => {
    fs.writeFileSync(DIARY_FILE, JSON.stringify(diaries, null, 2));
};

// GET /api/diaries/:date
router.get('/:date', (req, res) => {
    const { date } = req.params;
    const diaries = getDiaries();
    const diary = diaries.find(d => d.date === date);

    if (!diary) {
        return res.status(404).json({ message: 'Diary not found' });
    }
    res.json(diary);
});

// POST /api/diaries
router.post('/', (req, res) => {
    const newDiary = req.body;
    if (!newDiary.date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const diaries = getDiaries();
    const existingIndex = diaries.findIndex(d => d.date === newDiary.date);

    if (existingIndex !== -1) {
        return res.status(409).json({ error: 'Diary for this date already exists' });
    }

    // Add ID and Timestamps
    newDiary.id = Date.now().toString();
    newDiary.createdAt = new Date().toISOString();
    newDiary.updatedAt = new Date().toISOString();

    diaries.push(newDiary);
    saveDiaries(diaries);

    res.status(201).json(newDiary);
});

// PUT /api/diaries/:date
router.put('/:date', (req, res) => {
    const { date } = req.params;
    const updates = req.body;

    const diaries = getDiaries();
    const diaryIndex = diaries.findIndex(d => d.date === date);

    if (diaryIndex === -1) {
        return res.status(404).json({ error: 'Diary not found' });
    }

    // Update fields
    const updatedDiary = {
        ...diaries[diaryIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    // Protect immutable fields if necessary (like id, createdAt) by overwriting them back if they were in upgrades
    updatedDiary.id = diaries[diaryIndex].id;
    updatedDiary.date = diaries[diaryIndex].date; // Ensure date key doesn't change via body
    updatedDiary.createdAt = diaries[diaryIndex].createdAt;

    diaries[diaryIndex] = updatedDiary;
    saveDiaries(diaries);

    res.json(updatedDiary);
});

// DELETE /api/diaries/:date
router.delete('/:date', (req, res) => {
    const { date } = req.params;
    let diaries = getDiaries();
    const initialLength = diaries.length;

    diaries = diaries.filter(d => d.date !== date);

    if (diaries.length === initialLength) {
        return res.status(404).json({ error: 'Diary not found' });
    }

    saveDiaries(diaries);
    res.json({ success: true });
});

module.exports = router;
