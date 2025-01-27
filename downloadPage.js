const API_KEY = 'fed65ec6f5d5d783142e768d6dd811e7';

async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const [movieDetails, videoData, credits, similar] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`).then(res => res.json())
        ]);

        displayMovieDetails(movieDetails, credits);
        
        const trailer = videoData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        
        if (trailer) displayTrailer(trailer.key);
        
        displayScreenshots(movieDetails);
        displaySimilarMovies(similar.results.slice(0, 6));
        updateDownloadLinks(movieDetails.title);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMovieDetails(movie, credits) {
    // Set both background elements
    const pageBackground = document.getElementById('pageBackground');
    const movieShowcase = document.getElementById('movieBackgroundShowcase');
    const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    
    pageBackground.style.backgroundImage = `url(${backdropUrl})`;
    movieShowcase.style.backgroundImage = `url(${backdropUrl})`;

    const detailsContainer = document.getElementById('movieDetails');
    const director = credits.crew.find(person => person.job === 'Director');
    const cast = credits.cast.slice(0, 5);

    detailsContainer.innerHTML = `
        <div class="relative">
            <!-- Black overlay for the entire page -->
            <div class="fixed inset-0 bg-black opacity-90 -z-10"></div>
            
            <div class="flex flex-col md:flex-row gap-6 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <div class="w-full md:w-1/3">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                         alt="${movie.title}"
                         class="w-full rounded-lg shadow-md">
                    <div class="mt-4 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-yellow-400">IMDb Rating</span>
                            <span>⭐ ${movie.vote_average.toFixed(1)} (${movie.vote_count.toLocaleString()} votes)</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-yellow-400">Revenue</span>
                            <span>$${(movie.revenue || 0).toLocaleString()}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-yellow-400">Budget</span>
                            <span>$${(movie.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3">
                    <h1 class="text-3xl font-bold text-yellow-400 mb-2">${movie.title}</h1>
                    <h2 class="text-xl text-gray-300 mb-4">${movie.tagline || ''}</h2>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="px-3 py-1 bg-gray-700 rounded-full text-sm">
                            ${new Date(movie.release_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span class="px-3 py-1 bg-gray-700 rounded-full text-sm">
                            ${movie.runtime} minutes
                        </span>
                        <span class="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-semibold">
                            ${movie.adult ? '18+' : 'All Ages'}
                        </span>
                    </div>
                    <p class="text-gray-300 mb-6">${movie.overview}</p>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 class="text-yellow-400 font-semibold mb-2">Director</h3>
                            <p>${director ? director.name : 'N/A'}</p>
                        </div>
                        <div>
                            <h3 class="text-yellow-400 font-semibold mb-2">Languages</h3>
                            <p>${movie.spoken_languages.map(l => l.english_name).join(', ')}</p>
                        </div>
                        <div>
                            <h3 class="text-yellow-400 font-semibold mb-2">Genres</h3>
                            <p>${movie.genres.map(g => g.name).join(', ')}</p>
                        </div>
                        <div>
                            <h3 class="text-yellow-400 font-semibold mb-2">Production</h3>
                            <p>${movie.production_companies.map(c => c.name).slice(0, 2).join(', ')}</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-yellow-400 font-semibold mb-2">Top Cast</h3>
                        <div class="flex flex-wrap gap-2">
                            ${cast.map(actor => `
                                <span class="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                    ${actor.name} as ${actor.character}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayTrailer(videoKey) {
    const trailerSection = document.getElementById('trailerSection');
    trailerSection.innerHTML = `
        <div class="bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-6 relative z-20">
            <h2 class="text-2xl font-bold text-yellow-400 mb-4">Movie Trailer</h2>
            <div class="w-full h-[200px] md:h-[500px] relative z-20">
                <iframe src="https://www.youtube.com/embed/${videoKey}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        class="w-full h-full rounded-lg"></iframe>
            </div>
        </div>
    `;
}

function displayScreenshots(movie) {
    const screenshotsSection = document.getElementById('screenshotsSection');
    screenshotsSection.innerHTML = `
        <div class="bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-6 relative z-10 mb-8">
        <h2 class="text-2xl font-bold text-yellow-400 mb-4">Screenshots</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-2">
                <img src="https://image.tmdb.org/t/p/w500${movie.backdrop_path}" 
                     alt="Movie Screenshot"
                     class="w-full h-48 object-cover rounded-lg">
                <img src="https://image.tmdb.org/t/p/w780${movie.backdrop_path}" 
                     alt="Movie Screenshot"
                     class="w-full h-48 object-cover rounded-lg">
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" 
                     alt="Movie Screenshot"
                     class="w-full h-48 object-cover rounded-lg">
            </div>
        </div>
    `;
}

function displaySimilarMovies(movies) {
    if (!movies || movies.length === 0) return;
    
    const similarSection = document.createElement('div');
    similarSection.className = 'container mx-auto px-4';
    similarSection.innerHTML = `
        <div class="bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-6 relative z-10">
            <h2 class="text-2xl font-bold text-yellow-400 mb-6">More Like This</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[600px] overflow-y-auto pr-2">
                ${movies.filter(movie => movie.poster_path).map(movie => `
                    <a href="downloadPage.html?id=${movie.id}" 
                       class="bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div class="aspect-[2/3] overflow-hidden rounded-t-lg">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                                 alt="${movie.title}" 
                                 class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                 loading="lazy">
                        </div>
                        <div class="p-2 sm:p-3">
                            <h4 class="text-sm sm:text-base font-semibold truncate" title="${movie.title}">${movie.title}</h4>
                            <p class="text-xs text-gray-400">Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ★</p>
                            <p class="text-xs text-gray-400">${new Date(movie.release_date).getFullYear()}</p>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    
    document.querySelector('#movieBackgroundShowcase').before(similarSection);
}

function updateDownloadLinks(movieTitle) {
    const downloadButtons = document.getElementById('downloadButtons');
    const sanitizedTitle = movieTitle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    const qualities = [
        { name: '480p', size: '800MB', type: 'WebRip' },
        { name: '720p', size: '1.2GB', type: 'BluRay' },
        { name: '1080p', size: '2.1GB', type: 'BluRay' },
        { name: '4K', size: '4.5GB', type: 'UHD BluRay' }
    ];

    downloadButtons.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            ${qualities.map(quality => `
                <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-300 group">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <h3 class="text-lg font-semibold text-yellow-400">${quality.name}</h3>
                            <p class="text-xs text-gray-300">${quality.type}</p>
                        </div>
                        <span class="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">${quality.size}</span>
                    </div>
                    <button onclick="handleDownload('${quality.name}', '${sanitizedTitle}')" 
                            class="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold 
                                   hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-download"></i>
                        <span>Download ${quality.name}</span>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function handleDownload(quality, movieTitle) {
    const linksDiv = document.getElementById('downloadLinks');
    const downloadServers = [
        { name: 'Direct Download', icon: 'fas fa-server', speed: 'Fast' },
        { name: 'Mirror Server', icon: 'fas fa-cloud-download-alt', speed: 'Medium' },
        { name: 'Torrent', icon: 'fas fa-magnet', speed: 'Varies' }
    ];

    linksDiv.innerHTML = `
        <div class="mt-6 p-6 bg-gray-700 rounded-lg backdrop-blur-sm">
            <h3 class="text-xl font-semibold text-yellow-400 mb-4">Download Links for ${quality}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${downloadServers.map(server => `
                    <button onclick="startDownload('${server.name}', '${quality}', '${movieTitle}')" 
                            class="flex flex-col items-center gap-2 p-4 bg-gray-800 hover:bg-gray-700 
                                   rounded-lg transition-colors cursor-pointer group">
                        <i class="${server.icon} text-yellow-400 text-2xl group-hover:scale-110 transition-transform"></i>
                        <span class="font-semibold">${server.name}</span>
                        <span class="text-xs text-gray-400">Speed: ${server.speed}</span>
                    </button>
                `).join('')}
            </div>
            <div class="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                <p class="flex items-center gap-2">
                    <i class="fas fa-shield-alt text-yellow-400"></i>
                    All download links are protected and checked for viruses
                </p>
            </div>
        </div>
    `;
}

function startDownload(server, quality, movieTitle) {
    const linksDiv = document.getElementById('downloadLinks');
    
    const downloadElement = document.createElement('div');
    downloadElement.className = 'mt-4 p-4 bg-green-800/50 rounded-lg clickable';
    downloadElement.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas fa-circle-notch fa-spin text-yellow-400"></i>
            <span>Preparing download from ${server} (${quality})...</span>
        </div>
        <div class="mt-2 text-sm">
            <p>Your download will begin shortly. If it doesn't start automatically, </p>
            <button onclick="initiateDownload('${movieTitle}', '${quality}')" 
                    class="text-yellow-400 hover:underline interactive-element">
                click here
            </button>
        </div>
    `;
    
    linksDiv.appendChild(downloadElement);

    // Simulate download preparation
    setTimeout(() => {
        initiateDownload(movieTitle, quality);
    }, 2000);
}

function initiateDownload(movieTitle, quality) {
    // Replace with your actual download logic
    const downloadUrl = `https://example.com/download/${movieTitle}/${quality.toLowerCase()}`;
    window.open(downloadUrl, '_blank');
}

function showDownloadGuide() {
    const guide = document.getElementById('downloadGuide');
    guide.classList.remove('hidden');
    guide.classList.add('flex');
}

function hideDownloadGuide() {
    const guide = document.getElementById('downloadGuide');
    guide.classList.add('hidden');
    guide.classList.remove('flex');
    
    // Reset iframe src to stop video playback
    const iframe = guide.querySelector('iframe');
    const currentSrc = iframe.src;
    iframe.src = '';
    iframe.src = currentSrc;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchMovieDetails();
    
    // Add background image blur effect
    const pageBackground = document.getElementById('pageBackground');
    pageBackground.classList.add('filter', 'blur-sm');
});
