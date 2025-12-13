import React, { useEffect, useState } from 'react';
import { KBO_TEAMS } from '../../constants/baseball';
import { baseballApi } from '../../api/baseballApi';

const Header: React.FC = () => {
    const [myTeam, setMyTeam] = useState<string>('');

    useEffect(() => {
        const fetchTeam = async () => {
            const team = await baseballApi.getUserTeam();
            if (team) setMyTeam(team);
        };
        fetchTeam();
    }, []);

    const handleTeamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTeam = e.target.value;
        setMyTeam(newTeam);
        if (newTeam) {
            await baseballApi.updateUserTeam(newTeam);
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-bg-secondary border-b border-bg-tertiary flex items-center justify-between px-4 z-50">
            <h1 className="text-xl font-bold text-text-accent">
                ⚾️ KBO Baseball Diary
            </h1>

            <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary hidden sm:inline">My Team:</span>
                <select
                    value={myTeam}
                    onChange={handleTeamChange}
                    className="bg-bg-primary text-text-primary text-sm p-2 rounded border border-bg-tertiary focus:border-brand-primary outline-none"
                >
                    <option value="">Select Team</option>
                    {KBO_TEAMS.map(team => (
                        <option key={team} value={team}>{team}</option>
                    ))}
                </select>
            </div>
        </header>
    );
};

export default Header;
