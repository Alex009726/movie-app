import { useState, useEffect, useCallback } from 'react'
import Navbar from './Navbar'
import MovieCard from './MovieCard'
import splashLogo from './assets/logo.jpeg'
import AdUnit from './AdUnit'   // ← Ad component

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing TMDB API Key! Please add VITE_TMDB_API_KEY to your .env file");
}

const categories = [
  { name: "Popular", endpoint: "popular" },
  { name: "Top Rated", endpoint: "top_rated" },
  { name: "Now Playing", endpoint: "now_playing" },
  { name: "Upcoming", endpoint: "upcoming" },
]

const genres = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }, { id: 18, name: "Drama" },
  { id: 27, name: "Horror" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
]

function App() {
  const [movies, setMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("popular")
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState("home")
  const [sortOption, setSortOption] = useState("rating-desc")
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Infinite Scroll
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Back to Top
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Modal
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [trailerKey, setTrailerKey] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // ✅ NEW: Cast & Related Movies
  const [cast, setCast] = useState([])
  const [relatedMovies, setRelatedMovies] = useState([])

  // Dark Mode
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "light") {
      setIsDarkMode(false)
      document.body.classList.remove("dark-mode")
    } else {
      setIsDarkMode(true)
      document.body.classList.add("dark-mode")
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.body.classList.add("dark-mode")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-mode")
      localStorage.setItem("theme", "light")
    }
  }

  // Back to Top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  // Watchlist
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist")) || []
    setWatchlist(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
  }, [watchlist])

  const fetchMovies = (category, genreId = null, pageNum = 1) => {
    let url = `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&language=en-US&page=${pageNum}`
    if (genreId) url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${pageNum}`
    return fetch(url).then(res => res.json())
  }

  const loadInitialMovies = () => {
    setPage(1)
    setHasMore(true)
    setMovies([])
    fetchMovies(activeCategory, selectedGenre, 1).then(data => {
      setMovies(data.results || [])
      setHasMore(data.page < data.total_pages)
    })
  }

  useEffect(() => {
    if (currentView === "home" && searchTerm.length === 0) {
      loadInitialMovies()
    }
  }, [activeCategory, selectedGenre, currentView])

  const loadMoreMovies = useCallback(() => {
    if (isLoadingMore || !hasMore || searchTerm.length > 0) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    fetchMovies(activeCategory, selectedGenre, nextPage)
      .then(data => {
        if (data.results?.length > 0) {
          setMovies(prev => [...prev, ...data.results])
          setPage(nextPage)
          setHasMore(data.page < data.total_pages)
        } else {
          setHasMore(false)
        }
        setIsLoadingMore(false)
      })
      .catch(() => setIsLoadingMore(false))
  }, [page, activeCategory, selectedGenre, hasMore, isLoadingMore, searchTerm])

  useEffect(() => {
    const handleScroll = () => {
      if (currentView !== "home" || searchTerm.length > 0) return
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight

      if (scrollPosition > documentHeight - 400 && !isLoadingMore && hasMore) {
        loadMoreMovies()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMoreMovies, currentView, searchTerm, isLoadingMore, hasMore])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length > 2) {
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => setMovies(data.results || []))
    } else if (value.length === 0) {
      loadInitialMovies()
    }
  }

  // ✅ UPDATED: openMovieDetail now also fetches cast and related movies
  const openMovieDetail = (movie) => {
    setSelectedMovie(movie)
    setDetailLoading(true)
    setTrailerKey(null)
    setCast([])
    setRelatedMovies([])

    // Fetch trailer
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube")
        setTrailerKey(trailer ? trailer.key : null)
        setDetailLoading(false)
      })
      .catch(() => setDetailLoading(false))

    // Fetch cast (credits)
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setCast(data.cast?.slice(0, 10) || []) // Top 10 actors
      })
      .catch(() => setCast([]))

    // Fetch related/similar movies
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${API_KEY}&page=1`)
      .then(res => res.json())
      .then(data => {
        setRelatedMovies(data.results?.slice(0, 8) || []) // Top 8 related
      })
      .catch(() => setRelatedMovies([]))
  }

  const closeDetail = () => {
    setSelectedMovie(null)
    setTrailerKey(null)
    setCast([])
    setRelatedMovies([])
  }

  const toggleWatchlist = (movie) => {
    if (watchlist.some(m => m.id === movie.id)) {
      setWatchlist(watchlist.filter(m => m.id !== movie.id))
    } else {
      setWatchlist([...watchlist, movie])
    }
  }

  const removeAllFromWatchlist = () => {
    if (window.confirm("Remove all movies from watchlist?")) setWatchlist([])
  }

  const isInWatchlist = (movieId) => watchlist.some(m => m.id === movieId)

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    if (sortOption === "rating-desc") return (b.vote_average || 0) - (a.vote_average || 0)
    if (sortOption === "rating-asc") return (a.vote_average || 0) - (b.vote_average || 0)
    if (sortOption === "year-desc") return (b.release_date || "").localeCompare(a.release_date || "")
    return (a.title || "").localeCompare(b.title || "")
  })

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <img src={splashLogo} alt="JDC Logo" className="h-60 w-auto mb-10 animate-pulse" />
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-xl tracking-widest mt-8">JDC MOVIES...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className={isDarkMode ? "dark-mode" : ""}>
          <Navbar
            setActiveCategory={setActiveCategory}
            setSearchTerm={setSearchTerm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
          />

          <div className="min-h-screen bg-white dark-mode:bg-gray-950 text-gray-900 dark-mode:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-red-600">JDC MOVIES</h1>

              {currentView === "home" && (
                <>
                  <input
                    type="text"
                    placeholder="Search movies... (e.g. Batman, Spider-Man)"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full max-w-xl mx-auto block bg-gray-100 dark-mode:bg-gray-900 border border-gray-300 dark-mode:border-gray-700 rounded-full px-6 py-4 text-lg focus:outline-none focus:border-red-600 mb-8"
                  />

                  {searchTerm.length === 0 && (
                    <>
                      <div className="mb-8">
                        <p className="text-gray-500 dark-mode:text-gray-400 mb-3 text-center">Filter by Genre</p>
                        <div className="flex gap-2 overflow-x-auto pb-4 snap-x scrollbar-hide">
                          <button onClick={() => setSelectedGenre(null)} className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedGenre === null ? 'bg-red-600 text-white' : 'bg-gray-200 dark-mode:bg-gray-800'}`}>All Genres</button>
                          {genres.map(genre => (
                            <button key={genre.id} onClick={() => setSelectedGenre(genre.id)} className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedGenre === genre.id ? 'bg-red-600 text-white' : 'bg-gray-200 dark-mode:bg-gray-800'}`}>{genre.name}</button>
                          ))}
                        </div>
                      </div>

                      {/* Top Banner Ad */}
                      <AdUnit adCode="https://pl29567189.effectivecpmnetwork.com/29/92/dc/2992dc1f6fb087dc9c856288c4c0da23.js" title="Sponsored" />

                      <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {categories.map(cat => (
                          <button key={cat.endpoint} onClick={() => { setActiveCategory(cat.endpoint); setSearchTerm(""); }} className={`px-6 py-3 rounded-full font-medium ${activeCategory === cat.endpoint ? 'bg-red-600 text-white' : 'bg-gray-200 dark-mode:bg-gray-800'}`}>{cat.name}</button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex justify-end mb-6">
                <button onClick={() => setCurrentView(currentView === "home" ? "watchlist" : "home")} className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg flex items-center gap-3 text-lg font-medium">
                  ❤️ Watchlist ({watchlist.length})
                </button>
              </div>

              {currentView === "home" ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {movies.map((movie, index) => (
                      <>
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          toggleWatchlist={toggleWatchlist}
                          isInWatchlist={isInWatchlist(movie.id)}
                          onClick={() => openMovieDetail(movie)}
                        />

                        {/* In-feed Ad every 6 movies */}
                        {(index + 1) % 6 === 0 && (
                          <AdUnit 
                            adCode="https://www.highperformanceformat.com/3035eca599a838c2f35bf8e36fd2111c/invoke.js" 
                            title="Advertisement" 
                          />
                        )}
                      </>
                    ))}
                  </div>

                  {isLoadingMore && <p className="text-center py-10 text-lg">Loading more movies...</p>}
                  {!hasMore && movies.length > 0 && <p className="text-center py-10 text-gray-500">You've reached the end 🎬</p>}
                </>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold">My Watchlist</h2>
                    {watchlist.length > 0 && (
                      <div className="flex gap-3">
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-gray-100 dark-mode:bg-gray-800 border border-gray-300 dark-mode:border-gray-700 rounded-lg px-4 py-2">
                          <option value="rating-desc">Rating High to Low</option>
                          <option value="rating-asc">Rating Low to High</option>
                          <option value="year-desc">Year (Newest)</option>
                          <option value="title-asc">Title (A-Z)</option>
                        </select>
                        <button onClick={removeAllFromWatchlist} className="bg-red-700 hover:bg-red-800 px-5 py-2 rounded-lg">Remove All</button>
                      </div>
                    )}
                  </div>

                  {watchlist.length === 0 ? (
                    <p className="text-center text-2xl py-20 text-gray-400">Your watchlist is empty ❤️</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                      {sortedWatchlist.map(movie => (
                        <MovieCard key={movie.id} movie={movie} toggleWatchlist={toggleWatchlist} isInWatchlist={true} onClick={() => openMovieDetail(movie)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Back to Top Button */}
          {showBackToTop && (
            <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-50 text-2xl">
              ↑
            </button>
          )}
        </div>
      )}

      {/* ✅ UPDATED Movie Detail Modal with Cast & Related Movies */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-gray-900 w-full max-w-4xl rounded-2xl overflow-hidden max-h-[95vh] flex flex-col">

            {/* Trailer */}
            <div className="aspect-video bg-black flex-shrink-0">
              {trailerKey ? (
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
              ) : detailLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading trailer...</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No trailer available</div>
              )}
            </div>

            {/* Scrollable content below trailer */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">

              {/* Title & Close */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl sm:text-4xl font-bold text-white">{selectedMovie.title}</h2>
                <button onClick={closeDetail} className="text-4xl text-gray-400 hover:text-white ml-4 flex-shrink-0">✕</button>
              </div>

              {/* Rating & Date */}
              <p className="text-yellow-400 text-lg sm:text-xl mb-4">
                ⭐ {selectedMovie.vote_average?.toFixed(1)} • {selectedMovie.release_date}
              </p>

              {/* Overview */}
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg mb-6">{selectedMovie.overview}</p>

              {/* Watchlist Button */}
              <button onClick={() => toggleWatchlist(selectedMovie)} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl text-lg font-medium text-white mb-8">
                {isInWatchlist(selectedMovie.id) ? "❤️ Remove from Watchlist" : "♡ Add to Watchlist"}
              </button>

              {/* ✅ Cast Section */}
              {cast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">🎭 Cast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                    {cast.map(actor => (
                      <div key={actor.id} className="flex-shrink-0 text-center w-20 sm:w-24">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center text-2xl">
                            🎭
                          </div>
                        )}
                        <p className="text-white text-xs font-semibold leading-tight">{actor.name}</p>
                        <p className="text-gray-400 text-xs leading-tight mt-1">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ Related Movies Section */}
              {relatedMovies.length > 0 && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">🎬 Related Movies</h3>
                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                    {relatedMovies.map(movie => (
                      <div
                        key={movie.id}
                        onClick={() => openMovieDetail(movie)}
                        className="flex-shrink-0 w-28 sm:w-36 cursor-pointer group"
                      >
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform duration-200 border-2 border-transparent group-hover:border-red-600"
                          />
                        ) : (
                          <div className="w-full h-40 sm:h-48 bg-gray-800 rounded-xl mb-2 flex items-center justify-center text-3xl">
                            🎬
                          </div>
                        )}
                        <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2">{movie.title}</p>
                        <p className="text-yellow-400 text-xs text-center mt-1">⭐ {movie.vote_average?.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App