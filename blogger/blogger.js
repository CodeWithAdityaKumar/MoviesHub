let currentSlide = 0;
let carouselInterval;

async function fetchLatestPosts() {
    const feedUrl = "https://akmovi4upro.blogspot.com/feeds/posts/default?alt=json&max-results=5";
    const tmdbApiKey = "fed65ec6f5d5d783142e768d6dd811e7";

    try {
        const response = await fetch(feedUrl);
        const data = await response.json();
        const posts = data.feed.entry;

        if (!posts || posts.length === 0) {
            console.error('No posts found');
            return;
        }

        const carouselContainer = document.getElementById('carousel');
        const validPosts = await Promise.all(posts.map(async (post) => {
            const content = post.content.$t;
            const imdbId = content.match(/imdb-id: ([\d.]+)/)?.[1];
            
            if (imdbId) {
                try {
                    const tmdbResponse = await fetch(
                        `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbApiKey}&external_source=imdb_id`
                    );
                    const tmdbData = await tmdbResponse.json();
                    if (tmdbData.movie_results?.[0]) {
                        return {
                            post,
                            movieDetails: tmdbData.movie_results[0]
                        };
                    }
                } catch (error) {
                    console.error("Error fetching TMDB data:", error);
                }
            }
            return {
                post,
                movieDetails: null
            };
        }));

        displayCarousel(validPosts);
        startCarousel();
    } catch (error) {
        console.error("Error fetching posts:", error);
        document.getElementById('carousel').style.display = 'none';
    }
}

function displayCarousel(posts) {
    const carouselContainer = document.getElementById('carousel');
    
    carouselContainer.innerHTML = `
        <div class="relative w-full overflow-hidden">
            <div class="flex transition-transform duration-500" style="width: ${posts.length * 100}%">
                ${posts.map((item, index) => {
                    const post = item.post;
                    const movieDetails = item.movieDetails;
                    const title = post.title.$t;
                    const link = post.link.find(l => l.rel === "alternate").href;
                    const content = post.content.$t;
                    const defaultImage = content.match(/<img.*?src="(.*?)"/)?.[1] || "https://via.placeholder.com/800x400";

                    return `
                        <div class="w-full" style="flex: 0 0 ${100/posts.length}%" id="slide-${index}">
                            <div class="relative h-[400px] md:h-[500px] flex">
                                <!-- Backdrop Image with Overlay -->
                                <div class="absolute inset-0 z-0">
                                    <img src="${movieDetails?.backdrop_path ? 
                                        `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}` : 
                                        defaultImage}"
                                         alt=""
                                         class="w-full h-full object-cover opacity-30">
                                    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/50"></div>
                                </div>
                                
                                <!-- Content Container -->
                                <div class="container mx-auto flex items-center relative z-10">
                                    <!-- Rest of the content structure remains the same as in main.js -->
                                    // ...existing code...
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
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
                ${posts.map((_, index) => `
                    <button onclick="moveToSlide(${index})" 
                            class="w-2 h-2 rounded-full bg-white/50 hover:bg-yellow-400 transition-colors
                                   ${index === 0 ? 'bg-yellow-400' : ''}">
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function moveCarousel(direction) {
    const slideContainer = document.querySelector('#carousel .flex');
    const slides = document.querySelectorAll('[id^="slide-"]');
    if (!slides.length) return;
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slideContainer.style.transform = `translateX(${-100 * currentSlide / slides.length}%)`;
    
    updateIndicators();
}

function moveToSlide(slideIndex) {
    const slideContainer = document.querySelector('#carousel .flex');
    const slides = document.querySelectorAll('[id^="slide-"]');
    if (!slides.length) return;

    currentSlide = slideIndex;
    slideContainer.style.transform = `translateX(${-100 * currentSlide / slides.length}%)`;
    
    updateIndicators();
}

function updateIndicators() {
    document.querySelectorAll('.bottom-4 button').forEach((btn, index) => {
        btn.classList.toggle('bg-yellow-400', index === currentSlide);
        btn.classList.toggle('bg-white/50', index !== currentSlide);
    });
}

function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    carouselInterval = setInterval(() => moveCarousel(1), 5000);
}

document.addEventListener('DOMContentLoaded', fetchLatestPosts);
