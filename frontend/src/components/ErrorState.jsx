function ErrorState({ message = 'Something went wrong', onRetry }) {
    return (
        <div className="error-state">
            <div className="error-state-icon">⚠️</div>
            <h4>Error Occurred</h4>
            <p>{message}</p>
            {onRetry && (
                <button className="btn btn-outline" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorState;
