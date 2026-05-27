import { useState } from 'react'
import logo from './assets/logo.jpeg'   // ← This is the correct way

export default function Navbar({ 
  setActiveCategory, 
  setSearchTerm, 
  setCurrentView, 
  currentView,
  toggleTheme,
  isDarkMode 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavClick = (view, category = "popular") => {
    setCurrentView(view)
    if (view === "home") {
      setActiveCategory(category)
      setSearchTerm("")
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-gray-950 dark:bg-black sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Custom Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="JDC Movies Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-lg">
          <button 
            onClick={() => handleNavClick("home", "popular")} 
            className="hover:text-red-500 transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick("home", "popular")} 
            className="hover:text-red-500 transition-colors"
          >
            Popular
          </button>
          <button 
            onClick={() => handleNavClick("home", "top_rated")} 
            className="hover:text-red-500 transition-colors"
          >
            Top Rated
          </button>
          <button 
            onClick={() => handleNavClick("watchlist")}
            className={`hover:text-red-500 transition-colors flex items-center gap-2 ${currentView === "watchlist" ? "text-red-500" : ""}`}
          >
            ❤️ Watchlist
          </button>
        </div>

        {/* Right Side: Theme Toggle + Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-xl"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          <button 
            className="md:hidden text-3xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 py-6">
          <div className="flex flex-col gap-6 px-8 text-xl">
            <button onClick={() => handleNavClick("home", "popular")}>Home</button>
            <button onClick={() => handleNavClick("home", "popular")}>Popular</button>
            <button onClick={() => handleNavClick("home", "top_rated")}>Top Rated</button>
            <button onClick={() => handleNavClick("watchlist")}>❤️ Watchlist</button>
          </div>
        </div>
      )}
    </nav>
  )
}