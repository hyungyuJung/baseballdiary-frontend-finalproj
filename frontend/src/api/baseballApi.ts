const BASE_URL = 'http://localhost:3000/api';

export interface GameDataResponse {
    date: string;
    myTeam: string;
    opponentTeam: string;
    myScore: number;
    opponentScore: number;
    result: 'win' | 'loss' | 'draw';
    stadium: string;
    broadcaster: string;
}

export const baseballApi = {
    // Get User Team
    getUserTeam: async (): Promise<string | null> => {
        try {
            const res = await fetch(`${BASE_URL}/user/team`);
            if (!res.ok) throw new Error('Failed to fetch user team');
            const data = await res.json();
            return data.team;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // Update User Team
    updateUserTeam: async (team: string): Promise<boolean> => {
        try {
            const res = await fetch(`${BASE_URL}/user/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team }),
            });
            return res.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    // Get Random Game Data
    getRandomGame: async (date: string): Promise<GameDataResponse | null> => {
        try {
            const res = await fetch(`${BASE_URL}/games/random?date=${date}`);
            if (!res.ok) throw new Error('Failed to fetch game data');
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};
