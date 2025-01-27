let viewerCount = 1000; // Initial viewer count

// Add cricket match data
const cricketMatches = [
    {
        id: 1,
        type: "T20",
        status: "LIVE",
        tournament: "IPL 2024",
        team1: {
            name: "CSK",
            score: "186/4",
            overs: "18.2",
            flag: "path/to/csk-logo.png"
        },
        team2: {
            name: "MI",
            score: "145/6",
            overs: "16.0",
            flag: "path/to/mi-logo.png"
        },
        runRate: "8.6",
        reqRate: "12.4",
        lastBall: "4",
        commentary: "Dhoni comes to bat!",
        batsmen: [
            { name: "Dhoni", runs: "24", balls: "12", fours: "2", sixes: "2", strikeRate: "200.0" },
            { name: "Jadeja", runs: "18", balls: "14", fours: "1", sixes: "1", strikeRate: "128.57" }
        ],
        bowler: { name: "Bumrah", overs: "3.2", maidens: "0", runs: "28", wickets: "2", economy: "8.40" }
    }
    // Add more matches...
];

// Update current match data
const currentMatch = {
    tournament: "ICC Cricket World Cup 2024",
    match: "India vs Australia",
    date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateViewerCount();
    displayCricketScoreboard(); // Add cricket scoreboard
    initializeVideoPlayer(); // Add video player initialization
    displayMatchDetails(); // Add this line
});

function updateViewerCount() {
    // Simulate fluctuating viewer count
    setInterval(() => {
        viewerCount += Math.floor(Math.random() * 21) - 10; // Random change between -10 and +10
        document.getElementById('viewer-count').textContent = viewerCount.toLocaleString();
    }, 5000);
}

// Add function to display cricket scoreboard
function displayCricketScoreboard() {
    const container = document.getElementById('cricket-scoreboard');
    container.innerHTML = cricketMatches.map(match => `
        <div class="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-yellow-400">${match.tournament}</span>
                    <span class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-red-500 rounded-full live-indicator"></span>
                        <span class="text-red-500 text-sm">${match.type}</span>
                    </span>
                </div>
            </div>
            
            <div class="p-4">
                <!-- Team 1 -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <img src="${match.team1.flag}" alt="${match.team1.name}" class="w-8 h-8">
                        <div>
                            <span class="font-bold text-lg">${match.team1.name}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xl font-bold text-yellow-400">${match.team1.score}</span>
                                <span class="text-sm text-gray-400">(${match.team1.overs} ov)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team 2 -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <img src="${match.team2.flag}" alt="${match.team2.name}" class="w-8 h-8">
                        <div>
                            <span class="font-bold text-lg">${match.team2.name}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xl font-bold text-yellow-400">${match.team2.score}</span>
                                <span class="text-sm text-gray-400">(${match.team2.overs} ov)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Match Stats -->
                <div class="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <div>
                        <span class="text-sm text-gray-400">Run Rate</span>
                        <span class="block text-lg font-bold">${match.runRate}</span>
                    </div>
                    <div>
                        <span class="text-sm text-gray-400">Required Rate</span>
                        <span class="block text-lg font-bold">${match.reqRate}</span>
                    </div>
                </div>

                <!-- Live Players -->
                <div class="border-t border-gray-700 pt-4">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Batsmen -->
                        <div>
                            <h4 class="text-sm text-gray-400 mb-2">Batting</h4>
                            ${match.batsmen.map(batsman => `
                                <div class="flex justify-between mb-2">
                                    <span class="font-semibold">${batsman.name}</span>
                                    <span>${batsman.runs}(${batsman.balls})</span>
                                </div>
                            `).join('')}
                        </div>
                        <!-- Bowler -->
                        <div>
                            <h4 class="text-sm text-gray-400 mb-2">Bowling</h4>
                            <div class="flex justify-between">
                                <span class="font-semibold">${match.bowler.name}</span>
                                <span>${match.bowler.overs}-${match.bowler.wickets}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Last Ball Commentary -->
                <div class="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <span class="text-yellow-400 text-lg font-bold mr-2">${match.lastBall}</span>
                    <span class="text-sm">${match.commentary}</span>
                </div>

                <button onclick="watchCricketMatch(${match.id})" 
                        class="w-full mt-4 px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold 
                               hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-play-circle"></i>
                    Watch Live
                </button>
            </div>
        </div>
    `).join('');
}

// Add function to handle cricket match selection
function watchCricketMatch(matchId) {
    const match = cricketMatches.find(m => m.id === matchId);
    if (match) {
        document.getElementById('match-title').textContent = 
            `${match.team1.name} vs ${match.team2.name} (${match.tournament})`;
        // Update YouTube embed with your cricket stream URL
        document.getElementById(
          "stream-player"
        ).src = `https://webplayer-live.pages.dev/?url=https://amg01269-amg01269c1-willowtv-us-5479.playouts.now.amagi.tv/playlist/amg01269-willowtvfast-willowplus-willowtvus/playlist.m3u8`;
        document.getElementById('featured-match').scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleFullscreen() {
    const streamPlayer = document.getElementById('stream-player');
    
    if (!document.fullscreenElement) {
        streamPlayer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Add function to handle iframe resizing
function initializeVideoPlayer() {
    const iframe = document.getElementById('stream-player');
    const container = iframe.parentElement;
    
    // Set iframe dimensions based on container
    function updateIframeSize() {
        const width = container.offsetWidth;
        const height = width * (9/16); // maintain 16:9 aspect ratio
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
    }

    // Initial size
    updateIframeSize();
    
    // Update on window resize
    window.addEventListener('resize', updateIframeSize);
}

// Update display match details function
function displayMatchDetails() {
    const matchTitleElement = document.getElementById('match-title');
    const matchDetailsContainer = document.getElementById('match-details');
    
    matchTitleElement.innerHTML = `
        <span class="text-yellow-400">${currentMatch.tournament}</span>
        <span class="block text-2xl mt-1">${currentMatch.match}</span>
    `;

    matchDetailsContainer.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span class="flex items-center gap-1">
                <i class="fas fa-calendar text-yellow-400"></i>
                ${currentMatch.date}
            </span>
        </div>
    `;
}
