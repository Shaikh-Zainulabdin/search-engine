import { useState } from "react";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import SearchResults from "./components/SearchResults";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import { searchApi } from "./api/searchApi";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general");

  // Search results
  const [results, setResults] = useState([]);
  const [visibleResults, setVisibleResults] = useState(10);

  // Search state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Temporary in-memory search history
  const [searchHistory, setSearchHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  async function handleSearch() {
    if (!query.trim()) return;

    const cleanQuery = query.trim();

    setLoading(true);
    setError(false);
    setHasSearched(true);
    setSubmittedQuery(cleanQuery);
    setVisibleResults(10);

    // Add search to temporary in-memory history
    const newSearch = {
      query: cleanQuery,
      category,
    };

    const newHistory = [
      ...searchHistory.slice(0, historyIndex + 1),
      newSearch,
    ];

    setSearchHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    try {
      const data = await searchApi(cleanQuery, category, 20);
      setResults(data);
    } catch (err) {
      console.error("Search request failed:", err);
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const previousSearch = searchHistory[newIndex];

    setHistoryIndex(newIndex);
    setQuery(previousSearch.query);
    setCategory(previousSearch.category);
    setSubmittedQuery(previousSearch.query);
    setVisibleResults(10);
    setLoading(true);
    setError(false);
    setHasSearched(true);

    searchApi(
      previousSearch.query,
      previousSearch.category,
      20
    )
      .then((data) => {
        setResults(data);
      })
      .catch((err) => {
        console.error("Search request failed:", err);
        setError(true);
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function goForward() {
    if (historyIndex >= searchHistory.length - 1) return;

    const newIndex = historyIndex + 1;
    const nextSearch = searchHistory[newIndex];

    setHistoryIndex(newIndex);
    setQuery(nextSearch.query);
    setCategory(nextSearch.category);
    setSubmittedQuery(nextSearch.query);
    setVisibleResults(10);
    setLoading(true);
    setError(false);
    setHasSearched(true);

    searchApi(
      nextSearch.query,
      nextSearch.category,
      20
    )
      .then((data) => {
        setResults(data);
      })
      .catch((err) => {
        console.error("Search request failed:", err);
        setError(true);
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleCategoryChange(newCategory) {
    setCategory(newCategory);

    if (hasSearched && submittedQuery.trim()) {
      triggerSearchWithCategory(newCategory);
    }
  }

  async function triggerSearchWithCategory(cat) {
    setLoading(true);
    setError(false);
    setVisibleResults(10);

    try {
      const data = await searchApi(
        submittedQuery,
        cat,
        20
      );

      setResults(data);
    } catch (err) {
      console.error("Search request failed:", err);
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoClick(e) {
    e.preventDefault();

    setHasSearched(false);
    setResults([]);
    setError(false);
    setQuery("");
    setCategory("general");
    setSubmittedQuery("");
    setVisibleResults(10);

    // Reset temporary search history
    setSearchHistory([]);
    setHistoryIndex(-1);
  }

  function renderBody() {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState onRetry={handleSearch} />;
    }

    if (
      hasSearched &&
      results.length === 0
    ) {
      return (
        <EmptyState
          query={submittedQuery}
        />
      );
    }

    if (results.length > 0) {
      return (
        <>
          <SearchResults
            results={results.slice(
              0,
              visibleResults
            )}
            query={submittedQuery}
          />

          {visibleResults < results.length && (
            <div className="load-more-wrapper">
              <button
                className="load-more-button"
                onClick={() =>
                  setVisibleResults(
                    (current) => current + 10
                  )
                }
              >
                Load more
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  }

  const isLandingPage =
    !hasSearched && !loading;

  return (
    <div
      className={`app ${
        isLandingPage
          ? "app--landing"
          : ""
      }`}
    >
      {/* Results-mode header */}
      <header className="app-header">
        <a
          href="/"
          className="app-logo"
          onClick={handleLogoClick}
        >
          Search
          <span className="logo-accent">
            X
          </span>
        </a>

        <div className="navigation-buttons">
          <button
            className="navigation-button"
            onClick={goBack}
            disabled={historyIndex <= 0}
            aria-label="Go back"
          >
            ←
          </button>

          <button
            className="navigation-button"
            onClick={goForward}
            disabled={
              historyIndex >=
              searchHistory.length - 1
            }
            aria-label="Go forward"
          >
            →
          </button>
        </div>

        <div className="header-search">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
            compact
          />
        </div>
      </header>

      <main
        className={`app-main ${
          isLandingPage
            ? "app-main--centered"
            : ""
        }`}
      >
        {/* Landing hero */}
        {isLandingPage && (
          <div className="hero">
            <h1 className="hero-logo">
              Search
              <span className="logo-accent">
                X
              </span>
            </h1>

            <p className="hero-tagline">
              Private search — no tracking,
              no profiles, just results.
            </p>
          </div>
        )}

        {/* Landing search */}
        {isLandingPage && (
          <div className="search-section">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
            />

            <CategoryTabs
              activeCategory={category}
              onCategoryChange={
                handleCategoryChange
              }
            />
          </div>
        )}

        {/* Results-mode categories */}
        {!isLandingPage && (
          <CategoryTabs
            activeCategory={category}
            onCategoryChange={
              handleCategoryChange
            }
          />
        )}

        {/* Results / states */}
        <div className="body-section">
          {renderBody()}
        </div>
      </main>
    </div>
  );
}

export default App;