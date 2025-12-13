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

// KBO Teams
const TEAMS = [
    'KIA Tigers', 'Samsung Lions', 'LG Twins', 'Doosan Bears', 'KT Wiz',
    'SSG Landers', 'Lotte Giants', 'Hanwha Eagles', 'NC Dinos', 'Kiwoom Heroes'
];

// Generate 45 Matchups (10C2)
const MATCHUPS = [];
for (let i = 0; i < TEAMS.length; i++) {
    for (let j = i + 1; j < TEAMS.length; j++) {
        MATCHUPS.push([TEAMS[i], TEAMS[j]]);
    }
}

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
    const { date } = req.query; // Expect YYYY-MM-DD
    const userTeam = getUserTeam();

    // Filter matchups to include userTeam if it exists
    let candidateMatchups = MATCHUPS;
    let myTeamName = userTeam;

    if (userTeam) {
        candidateMatchups = MATCHUPS.filter(m => m.includes(userTeam));
    }

    // Pick random matchup
    const matchup = candidateMatchups[Math.floor(Math.random() * candidateMatchups.length)];

    // If no userTeam, pick one random from matchup as "myTeam"
    if (!myTeamName) {
        myTeamName = matchup[Math.floor(Math.random() * 2)];
    }

    const opponentTeamName = matchup[0] === myTeamName ? matchup[1] : matchup[0];

    // Random Scores
    const myScore = Math.floor(Math.random() * 15);
    const opponentScore = Math.floor(Math.random() * 15);

    let result = 'draw';
    if (myScore > opponentScore) result = 'win';
    if (myScore < opponentScore) result = 'loss';

    const STADIUMS = ['Jamsil', 'Sajik', 'Daejeon', 'Gwangju', 'Daegu', 'Changwon', 'Incheon', 'Suwon', 'Gocheok'];
    const BROADCASTERS = ['SPOTV', 'KBS N Sports', 'MBC Sports+', 'SBS Sports', 'Rhie Cast'];

    const gameData = {
        date: date || new Date().toISOString().split('T')[0],
        myTeam: myTeamName,
        opponentTeam: opponentTeamName,
        myScore,
        opponentScore,
        result,
        stadium: STADIUMS[Math.floor(Math.random() * STADIUMS.length)],
        broadcaster: BROADCASTERS[Math.floor(Math.random() * BROADCASTERS.length)]
    };

    res.json(gameData);
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
