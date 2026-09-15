import SearchResult from "./SearchResult";
import "./SearchResults.css";

function SearchResults({ results, query }) {
  const hasImages = results.some((result) => result.type === "image");

  return (
    <section className="search-results">
      <p className="results-meta">
        About {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
        <strong>"{query}"</strong>
      </p>

      <div className={`results-list ${hasImages ? "results-list--images" : ""}`}>
        {results.map((result, index) => (
          <SearchResult
  key={index}
  title={result.title}
  url={result.url}
  content={result.content}
  engine={result.engine}
  type={result.type}
  img_src={result.img_src}
  thumbnail_src={result.thumbnail_src}
  video_thumbnail={result.video_thumbnail}
  video_duration={result.video_duration}
  iframe_src={result.iframe_src}
/>
        ))}
      </div>
    </section>
  );
}

export default SearchResults;