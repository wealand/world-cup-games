document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
    };

    const fetchGames = async () => {
        const today = new Date();
        const proxyUrl = 'https://corsproxy.io/?';
        // The API returns upcoming games, so we will filter for today's matches.
        // We fetch for the current date to get today's schedule.
        const apiUrl = `${proxyUrl}http://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${formatDate(today)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // If today fails, try fetching the generic endpoint which gives upcoming games
                const genericApiUrl = `${proxyUrl}http://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
                const genericResponse = await fetch(genericApiUrl);
                if(!genericResponse.ok) {
                    throw new Error(`HTTP error! status: ${genericResponse.status}`);
                }
                const data = await genericResponse.json();
                renderGames(data.events, true); // Pass a flag to indicate these are upcoming, not necessarily today
            } else {
                 const data = await response.json();
                 renderGames(data.events, false);
            }
        } catch (error) {
            console.error("Error fetching game data:", error);
            gameContainer.innerHTML = `<div class="game-card">Could not retrieve game data. The API may be unavailable or there are no upcoming games.</div>`;
        }
    };

    const renderGames = (events, isUpcoming) => {
        gameContainer.innerHTML = '';

        if (events.length === 0) {
            const message = isUpcoming ? "No upcoming World Cup matches found." : "No World Cup matches scheduled for today.";
            gameContainer.innerHTML = `<div class="game-card">${message}</div>`;
            return;
        }

        const todayDate = new Date().toDateString();

        const todaysEvents = isUpcoming 
            ? events 
            : events.filter(event => new Date(event.date).toDateString() === todayDate);

        if (todaysEvents.length === 0) {
             gameContainer.innerHTML = '<div class="game-card">No World Cup matches scheduled for today.</div>';
            return;
        }

        todaysEvents.forEach(event => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            const competition = event.competitions[0];
            const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
            const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

            const homeTeam = homeCompetitor.team;
            const awayTeam = awayCompetitor.team;

            const homeRecord = (homeCompetitor.records || [{summary:'0-0-0'}])[0].summary;
            const awayRecord = (awayCompetitor.records || [{summary:'0-0-0'}])[0].summary;
            
            const gameTime = new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const location = `${competition.venue.address.city}, ${competition.venue.fullName}`;
            
            let analysis = "No odds available for this match.";
            if (competition.odds && competition.odds[0]) {
                analysis = `Favored: ${competition.odds[0].details}`;
            }

            gameCard.innerHTML = `
                <div class="game-time">${gameTime}</div>
                <div class="teams">
                    <div class="team">
                        <img src="${awayTeam.logo}" alt="${awayTeam.name}" class="team-logo">
                        <span class="team-name">${awayTeam.name}</span>
                        <span class="record">${awayRecord}</span>
                    </div>
                    <div class="vs">vs</div>
                    <div class="team">
                        <img src="${homeTeam.logo}" alt="${homeTeam.name}" class="team-logo">
                        <span class="team-name">${homeTeam.name}</span>
                        <span class="record">${homeRecord}</span>
                    </div>
                </div>
                <div class="location-info">
                    <strong>Location:</strong> ${location}
                </div>
                <div class="analysis">
                    <strong>Analysis:</strong> ${analysis}
                </div>
            `;
            gameContainer.appendChild(gameCard);
        });
    };

    fetchGames();
});
