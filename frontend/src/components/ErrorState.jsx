import "./ErrorState.css";

function ErrorState({ onRetry }) {
  return (
    <div className="error-state" role="alert">
      <hr className="error-rule" />
      <p className="error-heading">Something went wrong</p>
      <p className="error-subtext">
        We couldn't reach the search backend. Make sure the server is running,
        then try again.
      </p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
