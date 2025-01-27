const API_KEY = 'fed65ec6f5d5d783142e768d6dd811e7';
let currentPage = 1;
let currentCategory = 'popular';
let currentLanguage = 'en';
let isMenuOpen = false;
let isLoading = false;
let hasMoreMovies = true;

// Add new variable for observer
let currentObserver = null;

// Add new constants for content types
const CONTENT_TYPES = {
    MOVIES: 'movie',
    TV: 'tv'
};
let currentContentType = CONTENT_TYPES.MOVIES;

// Add new constants for industries
const INDUSTRIES = {
    ALL: 'all',
    HOLLYWOOD: 'hollywood',
    BOLLYWOOD: 'bollywood',
    SOUTH: 'south'
};

let currentIndustry = INDUSTRIES.ALL;

// Update the fetchIndianMovies function to fetch latest releases from different regions
async function fetchLatestMovies() {
    try {
        // Fetch movies from different regions in parallel
        const [indianMovies, hollywoodMovies, southMovies] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&region=IN&language=hi&page=1`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&region=US&language=en&page=1`).then(res => res.json()),
            fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&region=IN&language=ta&page=1`).then(res => res.json())
        ]);

        // Get recent date threshold (last 2 months)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        // Filter and combine movies
        const allMovies = [...indianMovies.results, ...hollywoodMovies.results, ...southMovies.results]
            .filter(movie => {
                // Strict validation of required fields
                return movie.backdrop_path && 
                       movie.poster_path && 
                       movie.release_date &&
                       movie.title &&
                       movie.overview &&
                       new Date(movie.release_date) > twoMonthsAgo &&
                       movie.vote_average !== undefined;
            })
            // Sort by release date (newest first)
            .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
            // Take only first 5 movies
            .slice(0, 10);

        if (allMovies.length > 0) {
            displayCarousel(allMovies);
        } else {
            document.getElementById('carousel').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching latest movies:', error);
        document.getElementById('carousel').style.display = 'none';
    }
}

// Update the carousel display function to show industry/language info
function displayCarousel(movies) {
    const carouselContainer = document.getElementById('carousel');
    
    // Additional validation before display
    const validMovies = movies.filter(movie => {
        try {
            return Boolean(
                movie.backdrop_path &&
                movie.poster_path &&
                movie.title.trim() &&
                movie.overview.trim() &&
                new Date(movie.release_date).getTime() &&
                typeof movie.vote_average === 'number'
            );
        } catch {
            return false;
        }
    });

    if (validMovies.length === 0) {
        carouselContainer.style.display = 'none';
        return;
    }

    carouselContainer.innerHTML = `
        <div class="relative w-full overflow-hidden">
            <div class="flex transition-transform duration-500" style="width: ${validMovies.length * 100}%">
                ${validMovies.map((movie, index) => `
                    <div class="w-full" style="flex: 0 0 ${100/validMovies.length}%" id="slide-${index}">
                        <div class="relative h-[400px] md:h-[500px] flex">
                            <!-- Backdrop Image with Overlay -->
                            <div class="absolute inset-0 z-0">
                                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}"
                                     alt=""
                                     class="w-full h-full object-cover opacity-30">
                                <div class="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/50"></div>
                            </div>
                            
                            <!-- Content Container -->
                            <div class="container mx-auto flex items-center relative z-10">
                                <!-- Poster -->
                                <div class="hidden md:block w-1/3 p-6">
                                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                                         alt="${movie.title}"
                                         class="w-full max-w-[300px] rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300">
                                </div>
                                
                                <!-- Movie Details -->
                                <div class="w-full md:w-2/3 p-6 md:p-10">
                                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">${movie.title}</h2>
                                    <div class="flex flex-wrap items-center gap-4 mb-4">
                                        <span class="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-semibold">
                                            ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ★
                                        </span>
                                        <span class="text-yellow-400">
                                            ${new Date(movie.release_date).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                        <span class="text-gray-300 text-sm">
                                            ${movie.original_language === 'hi' ? '🇮🇳 Bollywood' : 
                                              movie.original_language === 'en' ? '🌟 Hollywood' : 
                                              movie.original_language === 'ta' || movie.original_language === 'te' ? '🎬 South Indian' : 
                                              '🎥 International'}
                                        </span>
                                    </div>
                                    <p class="text-gray-300 text-base md:text-lg mb-6 line-clamp-3 md:line-clamp-4">
                                        ${movie.overview}
                                    </p>
                                    <div class="flex gap-4">
                                        <button class="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                                            Watch Now
                                        </button>
                                        <button class="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                                            More Info
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Navigation Buttons -->
            <button onclick="moveCarousel(-1)" 
                    class="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-4 hover:bg-yellow-400 hover:text-black transition-all">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button onclick="moveCarousel(1)" 
                    class="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-4 hover:bg-yellow-400 hover:text-black transition-all">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <!-- Slide Indicators -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                ${validMovies.map((_, index) => `
                    <button onclick="moveToSlide(${index})" 
                            class="w-2 h-2 rounded-full bg-white/50 hover:bg-yellow-400 transition-colors
                                   ${index === 0 ? 'bg-yellow-400' : ''}">
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Initialize carousel with proper widths
    const slideContainer = carouselContainer.querySelector('.flex');
    const slides = carouselContainer.querySelectorAll('[id^="slide-"]');
    
    // Reset transform on all slides
    slides.forEach((slide, index) => {
        slide.style.transform = `translateX(${-100 * currentSlide}%)`;
    });

    startCarousel();
}

// Add new function to move to specific slide
function moveToSlide(slideIndex) {
    const slideContainer = document.querySelector('#carousel .flex');
    const slides = document.querySelectorAll('[id^="slide-"]');
    if (!slides.length) return;

    currentSlide = slideIndex;
    slideContainer.style.transform = `translateX(${-100 * currentSlide / slides.length}%)`;
    
    // Update indicators
    document.querySelectorAll('.bottom-4 button').forEach((btn, index) => {
        btn.classList.toggle('bg-yellow-400', index === slideIndex);
        btn.classList.toggle('bg-white/50', index !== slideIndex);
    });
}

// Update moveCarousel to handle indicators
function moveCarousel(direction) {
    const slideContainer = document.querySelector('#carousel .flex');
    const slides = document.querySelectorAll('[id^="slide-"]');
    if (!slides.length) return;
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    // Move all slides together
    slideContainer.style.transform = `translateX(${-100 * currentSlide / slides.length}%)`;
    
    // Update indicators
    document.querySelectorAll('.bottom-4 button').forEach((btn, index) => {
        btn.classList.toggle('bg-yellow-400', index === currentSlide);
        btn.classList.toggle('bg-white/50', index !== currentSlide);
    });
}

let currentSlide = 0;

let carouselInterval;
function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    carouselInterval = setInterval(() => moveCarousel(1), 5000);
}

// Update fetchMovies function with debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedFetch = debounce(async (category, page, append) => {
    if (isLoading || (!append && !hasMoreMovies)) return;
    
    try {
        isLoading = true;
        updateLoadingState(true);
        
        const url = `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&page=${page}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        hasMoreMovies = page < data.total_pages;
        await displayMovies(data.results, append);
        
        if (!append) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        hasMoreMovies = false;
    } finally {
        isLoading = false;
        updateLoadingState(false);
    }
}, 300);

// Update the fetchMovies function to use debouncing
async function fetchMovies(category = 'popular', page = currentPage, append = false) {
    debouncedFetch(category, page, append);
}

// Add new function to handle loading state
function updateLoadingState(loading) {
    const existingIndicator = document.querySelector('.loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    if (loading && hasMoreMovies) {
        const moviesContainer = document.querySelector('#content-grid'); // Changed from #movies .grid
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator col-span-full text-center py-4';
        loadingIndicator.innerHTML = '<div class="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>';
        moviesContainer.appendChild(loadingIndicator);
    }
}

// Add new search function
async function searchMovies(query) {
    if (!query) return;
    currentPage = 1;
    hasMoreMovies = true;
    isLoading = false;
    
    try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${currentLanguage}&page=${currentPage}`;
        const response = await fetch(url);
        const data = await response.json();
        
        hasMoreMovies = currentPage < data.total_pages;
        await displayMovies(data.results, false);
    } catch (error) {
        console.error('Error searching movies:', error);
        hasMoreMovies = false;
    }
}

// Add language change function
function changeLanguage(language) {
    currentLanguage = language;
    fetchMovies(currentCategory, currentPage);
    updateActiveLanguage(language);
}

function updateActiveLanguage(language) {
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('bg-yellow-400', btn.dataset.lang === language);
        btn.classList.toggle('bg-gray-700', btn.dataset.lang !== language);
    });
}

function updatePagination(current, total) {
    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
        document.getElementById('current-page').textContent = `Page ${current}`;
        document.getElementById('prev-btn').disabled = current === 1;
        document.getElementById('next-btn').disabled = current === total;
    }
}

async function fetchGenres() {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}

// Update displayMovies to support appending
function displayMovies(movies, append = false) {
    const moviesContainer = document.querySelector('#content-grid'); // Changed from #movies .grid
    if (!append) {
        moviesContainer.innerHTML = '';
    }

    const moviesWithPosters = movies.filter(movie => movie.poster_path);
    
    if (moviesWithPosters.length === 0 && !append) {
        moviesContainer.innerHTML = '<p class="text-yellow-400 col-span-full text-center">No movies found</p>';
        return;
    }

    const movieElements = moviesWithPosters.map(movie => `
        <div class="bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div class="aspect-[2/3] overflow-hidden rounded-t-lg">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                     alt="${movie.title}" 
                     class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                     loading="lazy">
            </div>
            <div class="p-2 sm:p-3">
                <h4 class="text-sm sm:text-base font-semibold truncate" title="${movie.title}">${movie.title}</h4>
                <p class="text-xs text-gray-400">Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                <a href="downloadPage.html?id=${movie.id}" 
                   class="block mt-1 sm:mt-2 w-full px-2 py-1 text-center text-xs sm:text-sm bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors duration-300">
                    Watch Now
                </a>
            </div>
        </div>
    `).join('');

    if (append) {
        moviesContainer.insertAdjacentHTML('beforeend', movieElements);
    } else {
        moviesContainer.innerHTML = movieElements;
    }

    // Add loading indicator
    if (hasMoreMovies) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator col-span-full text-center py-4';
        loadingIndicator.innerHTML = '<div class="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>';
        moviesContainer.appendChild(loadingIndicator);
    }
}

// Update setupInfiniteScroll with better observer management
function setupInfiniteScroll() {
    // Disconnect existing observer if any
    if (currentObserver) {
        currentObserver.disconnect();
    }

    const options = {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
    };

    currentObserver = new IntersectionObserver((entries) => {
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.isIntersecting && !isLoading && hasMoreMovies) {
            currentPage++;
            fetchMovies(currentCategory, currentPage, true);
        }
    }, options);

    function updateObserver() {
        if (currentObserver) {
            currentObserver.disconnect();
        }
        const moviesContainer = document.querySelector('#content-grid'); // Changed from #movies .grid
        const movieCards = moviesContainer.querySelectorAll('.bg-gray-800');
        if (movieCards.length > 0) {
            currentObserver.observe(movieCards[movieCards.length - 1]);
        }
    }

    // Update displayMovies to call updateObserver
    const originalDisplayMovies = displayMovies;
    displayMovies = async function(movies, append = false) {
        await originalDisplayMovies(movies, append);
        updateObserver();
    };

    // Update category change handler
    const originalHandleCategoryChange = handleCategoryChange;
    handleCategoryChange = function(category) {
        if (currentObserver) {
            currentObserver.disconnect();
        }
        isLoading = false;
        originalHandleCategoryChange(category);
    };
}

// Add new functions for TV shows and Web Series
async function fetchTVContent(type = 'popular', page = currentPage, append = false) {
    if (isLoading || (!append && !hasMoreMovies)) return;
    
    try {
        isLoading = true;
        updateLoadingState(true);
        
        const url = `https://api.themoviedb.org/3/tv/${type}?api_key=${API_KEY}&page=${page}&language=${currentLanguage}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        hasMoreMovies = page < data.total_pages;
        await displayTVContent(data.results, append);
        
        if (!append) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } finally {
        isLoading = false;
        updateLoadingState(false);
    }
}

function displayTVContent(shows, append = false) {
    const container = document.querySelector('#content-grid');
    if (!append) {
        container.innerHTML = '';
    }

    const validShows = shows.filter(show => show.poster_path);
    
    if (validShows.length === 0 && !append) {
        container.innerHTML = '<p class="text-yellow-400 col-span-full text-center">No content found</p>';
        return;
    }

    const showElements = validShows.map(show => `
        <div class="bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div class="aspect-[2/3] overflow-hidden rounded-t-lg">
                <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" 
                     alt="${show.name}" 
                     class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                     loading="lazy">
            </div>
            <div class="p-2 sm:p-3">
                <h4 class="text-sm sm:text-base font-semibold truncate" title="${show.name}">${show.name}</h4>
                <p class="text-xs text-gray-400">Rating: ${show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</p>
                <p class="text-xs text-gray-400 mb-2">First Air: ${new Date(show.first_air_date).getFullYear()}</p>
                <button class="w-full px-2 py-1 text-xs sm:text-sm bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors duration-300">
                    Watch Now
                </button>
            </div>
        </div>
    `).join('');

    if (append) {
        container.insertAdjacentHTML('beforeend', showElements);
    } else {
        container.innerHTML = showElements;
    }

    if (hasMoreMovies) {
        updateLoadingState(true);
    }
}

// Add content type switcher
function switchContentType(type) {
    currentContentType = type;
    currentPage = 1;
    hasMoreMovies = true;
    isLoading = false;

    // Update UI for active content type
    document.querySelectorAll('.content-type-btn').forEach(btn => {
        btn.classList.toggle('bg-yellow-400', btn.dataset.type === type);
        btn.classList.toggle('bg-gray-700', btn.dataset.type !== type);
    });

    // Update category buttons visibility and labels
    updateCategoryButtons(type);

    // Fetch appropriate content
    if (type === CONTENT_TYPES.TV) {
        fetchTVContent('popular', 1, false);
    } else {
        fetchMovies('popular', 1, false);
    }
}

function updateCategoryButtons(contentType) {
    const categoryContainer = document.querySelector('.category-buttons');
    if (contentType === CONTENT_TYPES.TV) {
        categoryContainer.innerHTML = `
            <button class="category-btn px-6 py-2 bg-yellow-400 text-black rounded-lg" 
                    data-category="popular" 
                    onclick="handleTVCategoryChange('popular')">Popular</button>
            <button class="category-btn px-6 py-2 bg-gray-700 rounded-lg" 
                    data-category="top_rated" 
                    onclick="handleTVCategoryChange('top_rated')">Top Rated</button>
            <button class="category-btn px-6 py-2 bg-gray-700 rounded-lg" 
                    data-category="on_the_air" 
                    onclick="handleTVCategoryChange('on_the_air')">On TV</button>
        `;
    } else {
        // Restore original movie categories
        // ...existing movie category buttons HTML...
    }
}

// Update handleCategoryChange for TV shows
function handleTVCategoryChange(category) {
    currentPage = 1;
    hasMoreMovies = true;
    isLoading = false;
    fetchTVContent(category, currentPage, false);
    updateActiveCategory(category);
}

// Add new function to filter by industry
async function filterByIndustry(industry) {
    currentIndustry = industry;
    currentPage = 1;
    hasMoreMovies = true;
    
    // Update UI
    updateActiveIndustry(industry);
    
    try {
        let url;
        switch(industry) {
            case INDUSTRIES.HOLLYWOOD:
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=en&region=US&page=${currentPage}`;
                break;
            case INDUSTRIES.BOLLYWOOD:
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&page=${currentPage}`;
                break;
            case INDUSTRIES.SOUTH:
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=ta|te|ml|kn&region=IN&page=${currentPage}`;
                break;
            default:
                url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${currentPage}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        hasMoreMovies = currentPage < data.total_pages;
        await displayMovies(data.results, false);
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        document.querySelector('#content-grid').innerHTML = 
            '<p class="text-red-500 col-span-full text-center">Error loading movies. Please try again later.</p>';
    }
}

function updateActiveIndustry(industry) {
    document.querySelectorAll('.industry-btn').forEach(btn => {
        btn.classList.toggle('bg-yellow-400', btn.dataset.industry === industry);
        btn.classList.toggle('text-black', btn.dataset.industry === industry);
        btn.classList.toggle('bg-gray-700', btn.dataset.industry !== industry);
        btn.classList.toggle('text-white', btn.dataset.industry !== industry);
    });
}

// Update handlePageChange to work with industry filters
function handlePageChange(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    }
    
    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', currentPage);
    window.history.pushState({}, '', newUrl);
    
    // Fetch appropriate content based on current industry
    if (currentIndustry === INDUSTRIES.ALL) {
        fetchMovies(currentCategory, currentPage, true);
    } else {
        filterByIndustry(currentIndustry);
    }
}

// Update initialization
document.addEventListener('DOMContentLoaded', async () => {
    await fetchLatestMovies();
    const genres = await fetchGenres();
    displayGenres(genres);
    fetchMovies(currentCategory, getPageFromUrl());

    // Add search input listener
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                searchMovies(query);
            } else {
                fetchMovies(currentCategory, currentPage);
            }
        }, 500);
    });

    // Hamburger menu functionality
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('#nav-menu a');

    menuBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        navMenu.classList.toggle('hidden');
        menuBtn.innerHTML = isMenuOpen 
            ? '<i class="fas fa-times text-2xl"></i>' 
            : '<i class="fas fa-bars text-2xl"></i>';
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // mobile view
                navMenu.classList.add('hidden');
                isMenuOpen = false;
                menuBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) { // desktop view
            navMenu.classList.remove('hidden');
        } else if (!isMenuOpen) {
            navMenu.classList.add('hidden');
        }
    });

    setupInfiniteScroll();

    // Initialize industry filter
    const industryFromUrl = new URLSearchParams(window.location.search).get('industry');
    if (industryFromUrl && Object.values(INDUSTRIES).includes(industryFromUrl)) {
        filterByIndustry(industryFromUrl);
    }
});

function displayGenres(genres) {
    const genresContainer = document.getElementById('genres-container');
    genresContainer.innerHTML = genres.map(genre => `
        <button onclick="filterByGenre(${genre.id})" 
                class="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-700 rounded-full hover:bg-yellow-400 hover:text-black">
            ${genre.name}
        </button>
    `).join('');
}

async function filterByGenre(genreId) {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${currentPage}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.results && Array.isArray(data.results)) {
            displayMovies(data.results);
        } else {
            throw new Error('Invalid data format received');
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        document.querySelector('#content-grid').innerHTML = // Changed from #movies .grid
            '<p class="text-red-500 col-span-full text-center">Error loading movies. Please try again later.</p>';
    }
}

function getPageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('page')) || 1;
}

// Add this to your existing styles or inline in the HTML
const style = document.createElement('style');
style.textContent = `
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;
document.head.appendChild(style);

// Update handleCategoryChange
function handleCategoryChange(category) {
    currentPage = 1;
    currentCategory = category;
    hasMoreMovies = true;
    isLoading = false;
    updateActiveCategory(category);
    fetchMovies(category, currentPage, false);
}

// Add navbar search functionality
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Add navbar search functionality
    const navSearchInput = document.getElementById('nav-search');
    let navSearchTimeout;
    
    navSearchInput.addEventListener('input', (e) => {
        clearTimeout(navSearchTimeout);
        navSearchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                searchMovies(query);
            } else {
                fetchMovies(currentCategory, currentPage);
            }
        }, 500);
    });
});
