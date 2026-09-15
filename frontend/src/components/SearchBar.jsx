import "./SearchBar.css";

function SearchBar({ query, onQueryChange, onSearch, loading, compact = false }) {
  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch();
  }

  return (
    <div className={`search-bar ${compact ? "search-bar--compact" : ""}`}>
      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search the web…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search query"
          autoFocus={!compact}
        />
      </div>
      <button
        className="search-button"
        onClick={onSearch}
        disabled={loading}
        aria-label="Submit search"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </div>
  );
}

export default SearchBar;
