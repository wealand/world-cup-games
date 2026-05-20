document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const venueFilter = document.getElementById('venue-filter');
    let allEvents = [];

    const fetchGames = async () => {
        const proxyUrl = 'https://corsproxy.io/?';
        // Fetch the entire tournament schedule
        const apiUrl = `${proxyUrl}http://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allEvents = data.events || [];
            
            populateVenues(allEvents);
            renderGames(allEvents);
        } catch (error) {
            console.error("Error fetching game data:", error);
            gameContainer.innerHTML = `<div class="game-card">Could not retrieve game data. The API may be unavailable or there are no upcoming games.</div>`;
        }
    };

    const populateVenues = (events) => {
        const venues = new Set();
        events.forEach(event => {
            const competition = event.competitions[0];
            if (competition.venue && competition.venue.address) {
                // Use city as the primary filter identifier
                venues.add(competition.venue.address.city);
            }
        });

        const sortedVenues = Array.from(venues).sort();
        sortedVenues.forEach(venue => {
            const option = document.createElement('option');
            option.value = venue;
            option.textContent = venue;
            venueFilter.appendChild(option);
        });
    };

    const renderGames = (events) => {
        gameContainer.innerHTML = '';
        const selectedVenue = venueFilter.value;

        const filteredEvents = selectedVenue === 'all' 
            ? events 
            : events.filter(event => event.competitions[0].venue.address.city === selectedVenue);

        if (filteredEvents.length === 0) {
            gameContainer.innerHTML = '<div class="game-card">No matches found for the selected venue.</div>';
            return;
        }

        // Group by date
        const groupedEvents = filteredEvents.reduce((groups, event) => {
            const date = new Date(event.date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(event);
            return groups;
        }, {});

        Object.keys(groupedEvents).forEach(date => {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = date;
            gameContainer.appendChild(dateHeader);

            groupedEvents[date].forEach(event => {
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
        });
    };

    venueFilter.addEventListener('change', () => {
        renderGames(allEvents);
    });

    fetchGames();
});
