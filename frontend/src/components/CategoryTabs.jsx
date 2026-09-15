import "./CategoryTabs.css";

/*
  Search categories backed by the real API:
    All      → general
    News     → news
    Tech     → it
    Science  → science
    Images   → images
    Videos   → videos

  Social is intentionally not included.
*/

const TABS = [
  { label: "All", value: "general" },
  { label: "News", value: "news" },
  { label: "Tech", value: "it" },
  { label: "Science", value: "science" },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
];

function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <nav className="category-tabs" aria-label="Search categories">
      <div className="tabs-inner">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab ${
              activeCategory === tab.value ? "tab--active" : ""
            }`}
            onClick={() => onCategoryChange(tab.value)}
            aria-current={
              activeCategory === tab.value ? "true" : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CategoryTabs;