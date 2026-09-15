import "./SearchResult.css";

// Extract just the domain from a full URL
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

// Strip protocol for the display URL breadcrumb
function getDisplayUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (!parsed.pathname || parsed.pathname === "/") {
      return hostname;
    }

    const path = parsed.pathname.replace(/\/$/, "");

    if (path.length > 32) {
      return `${hostname}${path.slice(0, 32)}...`;
    }

    return `${hostname}${path}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}
function SearchResult({
  title,
  url,
  content,
  engine,
  type,
  img_src,
  thumbnail_src,
  video_thumbnail,
  video_duration,
  iframe_src,
}) {
  const domain = getDomain(url);
  const displayUrl = getDisplayUrl(url);

  // ---------------------------------
  // Image result
  // ---------------------------------

  if (type === "image") {
    const imageUrl = thumbnail_src || img_src;

    return (
      <article className="result-item result-item--image">

        {imageUrl && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="image-result-image-link"
          >
            <img
              src={imageUrl}
              alt={title}
              className="image-result-image"
              loading="lazy"
            />
          </a>
        )}

        <div className="result-domain">
          <img
            className="result-favicon"
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width="14"
            height="14"
          />

          <span className="result-url-text">
            {displayUrl}
          </span>
        </div>

        <a
          className="result-title"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {title}
        </a>

        {engine && (
          <span className="result-source">
            <span className="result-source-label">
              via{" "}
            </span>
            {engine}
          </span>
        )}

      </article>
    );
  }
  if (type === "video") {
  const videoSource = iframe_src || url;

  return (
    <article className="result-item result-item--video">
      <div className="video-preview">
        {iframe_src ? (
          <iframe
            src={videoSource}
            title={title}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="video-fallback"
          >
            Watch video
          </a>
        )}

        {video_duration && (
          <span className="video-duration">
            {typeof video_duration === "number"
              ? `${Math.floor(video_duration / 60)}:${String(
                  Math.floor(video_duration % 60)
                ).padStart(2, "0")}`
              : video_duration}
          </span>
        )}
      </div>

      <div className="result-domain">
        <span className="result-url-text">
          {displayUrl}
        </span>
      </div>

      <a
        className="result-title"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {title}
      </a>

      {content && (
        <p className="result-snippet">
          {content}
        </p>
      )}

      {engine && (
        <span className="result-source">
          via {engine}
        </span>
      )}
    </article>
  );
}

  // ---------------------------------
  // Normal web result
  // ---------------------------------

  return (
    <article className="result-item">

      <div className="result-domain">
        <img
          className="result-favicon"
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width="14"
          height="14"
        />

        <span className="result-url-text">
          {displayUrl}
        </span>
      </div>

      <a
        className="result-title"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {title}
      </a>

      {content && (
        <p className="result-snippet">
          {content}
        </p>
      )}

      {engine && (
        <span className="result-source">
          <span className="result-source-label">
            via{" "}
          </span>
          {engine}
        </span>
      )}

    </article>
  );
  
}

export default SearchResult;