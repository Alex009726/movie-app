export default function MovieCard({ movie, toggleWatchlist, isInWatchlist, onClick }) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div 
      className="bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group relative"
      onClick={onClick}
    >
      <img 
        src={posterUrl} 
        alt={movie.title}
        className="w-full h-80 object-cover"
      />
      
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{movie.title}</h3>
        <p className="text-yellow-400 mt-1">⭐ {movie.vote_average?.toFixed(1)}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleWatchlist(movie)
        }}
        className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 p-2 rounded-full transition-colors"
      >
        {isInWatchlist ? "❤️" : "♡"}
      </button>
    </div>
  )
}