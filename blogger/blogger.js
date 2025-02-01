async function fetchLatestPosts() {
  const feedUrl =
    "https://akmovi4upro.blogspot.com/feeds/posts/default?alt=json&max-results=5";

  try {
    const response = await fetch(feedUrl);
    const data = await response.json();
    const posts = data.feed.entry;

    if (!posts) return;

    let carouselInner = document.getElementById("carousel-inner");
    let indicators = document.getElementById("carousel-indicators");

    carouselInner.innerHTML = "";
    indicators.innerHTML = "";

    posts.forEach((post, index) => {
      const title = post.title.$t;
      const link = post.link.find((l) => l.rel === "alternate").href;
      const content = post.content.$t;
      const image =
        content.match(/<img.*?src="(.*?)"/)?.[1] ||
        "https://via.placeholder.com/800x400"; // Extract first image

      // Add slide
      carouselInner.innerHTML += `
                <div class="w-full" style="flex: 0 0 100%" id="slide-${index}">
                    <div class="relative h-[400px] md:h-[500px] flex">
                        <div class="absolute inset-0 z-0">
                            <img src="${image}" alt="${title}" class="w-full h-full object-cover opacity-30">
                            <div class="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/50"></div>
                        </div>
                        <div class="container mx-auto flex items-center relative z-10 p-6">
                            <div class="w-full md:w-2/3">
                                <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">${title}</h2>
                                <p class="text-gray-300 text-base md:text-lg mb-6 line-clamp-3 md:line-clamp-4">
                                    ${content
                                      .replace(/(<([^>]+)>)/gi, "")
                                      .substring(0, 150)}...
                                </p>
                                <a href="${link}" target="_blank" class="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                                    Read More
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Add indicators
      indicators.innerHTML += `
                <button onclick="moveToSlide(${index})" 
                        class="w-2 h-2 rounded-full bg-white/50 hover:bg-yellow-400 transition-colors
                               ${
                                 index === 0 ? "bg-yellow-400" : ""
                               }" id="indicator-${index}">
                </button>
            `;
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

fetchLatestPosts();



let currentIndex = 0;

function moveCarousel(direction) {
  const slides = document.querySelectorAll("#carousel-inner > div");
  const totalSlides = slides.length;

  currentIndex += direction;
  if (currentIndex < 0) currentIndex = totalSlides - 1;
  if (currentIndex >= totalSlides) currentIndex = 0;

  updateCarousel();
}

function moveToSlide(index) {
  currentIndex = index;
  updateCarousel();
}

function updateCarousel() {
  const slides = document.getElementById("carousel-inner");
  const indicators = document.querySelectorAll("#carousel-indicators > button");

  slides.style.transform = `translateX(-${currentIndex * 100}%)`;

  indicators.forEach((indicator, i) => {
    indicator.classList.toggle("bg-yellow-400", i === currentIndex);
  });
}

// Auto-slide every 5 seconds
setInterval(() => moveCarousel(1), 5000);

