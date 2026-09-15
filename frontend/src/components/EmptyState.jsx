import "./EmptyState.css";

function EmptyState({ query }) {
  return (
    <div className="empty-state">
      <hr className="empty-rule" />
      <p className="empty-heading">No results found</p>
      <p className="empty-query">
        Your search — <em>{query}</em> — did not match any results.
      </p>
      <p className="empty-suggestions-label">Suggestions</p>
      <ul className="empty-suggestions">
        <li className="empty-suggestion">Try different or fewer keywords</li>
        <li className="empty-suggestion">Check your spelling</li>
        <li className="empty-suggestion">Try a different category</li>
      </ul>
    </div>
  );
}

export default EmptyState;
