const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const USER_TEAM_FILE = path.join(DATA_DIR, 'userteam.json');
const MOCK_DATA_FILE = path.join(DATA_DIR, 'mockdata.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read user team
const getUserTeam = () => {
    if (!fs.existsSync(USER_TEAM_FILE)) return null;
    try {
        const data = fs.readFileSync(USER_TEAM_FILE, 'utf8');
        return JSON.parse(data).team;
    } catch (e) {
        return null;
    }
};

// Helper to save user team
const saveUserTeam = (team) => {
    fs.writeFileSync(USER_TEAM_FILE, JSON.stringify({ team }));
};

// Helper to get Mock Data
const getMockData = () => {
    if (!fs.existsSync(MOCK_DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(MOCK_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const TEAMS = [
    'KIA Tigers', 'Samsung Lions', 'LG Twins', 'Doosan Bears', 'KT Wiz',
    'SSG Landers', 'Lotte Giants', 'Hanwha Eagles', 'NC Dinos', 'Kiwoom Heroes'
];

// --- APIs ---

// 1. Get User Team
app.get('/api/user/team', (req, res) => {
    const team = getUserTeam();
    res.json({ team });
});

// 2. Set User Team
app.post('/api/user/team', (req, res) => {
    const { team } = req.body;
    if (!team || !TEAMS.includes(team)) {
        return res.status(400).json({ error: 'Invalid team name' });
    }
    saveUserTeam(team);
    res.json({ success: true, team });
});

// 3. Get Random Game Data (Auto-Fill)
app.get('/api/games/random', (req, res) => {
    const { date } = req.query;
    const userTeam = getUserTeam();
    const mockData = getMockData();

    if (mockData.length === 0) {
        return res.status(500).json({ error: 'No mock data available' });
    }

    let candidateMatchups = mockData;
    let myTeamName = userTeam;

    // Filter matchups if user has a team
    if (userTeam) {
        candidateMatchups = mockData.filter(m => m.team1 === userTeam || m.team2 === userTeam);
    }

    // Fallback if no matchups found (logic error) or no user team
    if (candidateMatchups.length === 0) {
        candidateMatchups = mockData;
    }

    // Pick random match
    const match = candidateMatchups[Math.floor(Math.random() * candidateMatchups.length)];

    // If we didn't have a user team, pick one side as "mine"
    if (!myTeamName) {
        myTeamName = Math.random() > 0.5 ? match.team1 : match.team2;
    }

    // Determine perspective
    const isTeam1 = match.team1 === myTeamName;
    const opponentTeamName = isTeam1 ? match.team2 : match.team1;
    const myScore = isTeam1 ? match.score1 : match.score2;
    const opponentScore = isTeam1 ? match.score2 : match.score1;

    let result = 'draw';
    if (myScore > opponentScore) result = 'win';
    if (myScore < opponentScore) result = 'loss';

    const gameData = {
        date: date || new Date().toISOString().split('T')[0],
        myTeam: myTeamName,
        opponentTeam: opponentTeamName,
        myScore,
        opponentScore,
        result,
        stadium: match.stadium,
        broadcaster: match.broadcaster
    };

    res.json(gameData);
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
