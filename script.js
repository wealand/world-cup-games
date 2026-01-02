document.addEventListener('DOMContentLoaded', () => {
    // --- START OF CONFIGURATION ---
    // 1. Replace "YOUR_API_KEY" with the key you got from api-football.com
    const API_KEY = "4538a2d783af1b3db4eb87c6d7431664"; 

    // 2. Replace 1 with the real League ID for the World Cup
    const LEAGUE_ID = 39; 
    // --- END OF CONFIGURATION ---


    const gameContainer = document.getElementById('game-container');
    const today = new Date().toISOString().split('T')[0];
    const season = new Date().getFullYear();

    const fetchGames = async () => {

        const fixturesUrl = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${season}&date=${today}`;
        
        try {
            const response = await fetch(fixturesUrl, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": "v3.football.api-sports.io",
                    "x-rapidapi-key": API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors && Object.keys(data.errors).length > 0) {
                let errorMsg = Object.values(data.errors).join(', ');
                throw new Error(`API Error: ${errorMsg}`);
            }
            
            renderGames(data.response || []);

        } catch (error) {
            console.error("Error fetching game data:", error);
            gameContainer.innerHTML = `<div class="game-card">Could not retrieve game data. <br><br>Error: ${error.message}</div>`;
        }
    };

    const renderGames = (games) => {
        gameContainer.innerHTML = '';

        if (games.length === 0) {
            gameContainer.innerHTML = '<div class="game-card">No World Cup matches scheduled for today.</div>';
            return;
        }

        games.forEach(match => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            const homeTeam = match.teams.home;
            const awayTeam = match.teams.away;
            const fixture = match.fixture;

            const gameTime = new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const location = `${fixture.venue.city}, ${fixture.venue.name}`;
            const timezone = fixture.timezone;

            gameCard.innerHTML = `
                <div class="game-time">${gameTime}</div>
                <div class="teams">
                    <div class="team">
                        <img src="${homeTeam.logo}" alt="${homeTeam.name}" class="team-logo">
                        <span class="team-name">${homeTeam.name}</span>
                    </div>
                    <div class="vs">vs</div>
                    <div class="team">
                        <img src="${awayTeam.logo}" alt="${awayTeam.name}" class="team-logo">
                        <span class="team-name">${awayTeam.name}</span>
                    </div>
                </div>
                <div class="location-info">
                    <strong>Location:</strong> ${location} (${timezone})
                </div>
            `;
            gameContainer.appendChild(gameCard);
        });
    };

    fetchGames();
});
