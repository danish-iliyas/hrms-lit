function EmptyState({ icon = '📭', title, message, action }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h4>{title}</h4>
            <p>{message}</p>
            {action && <div style={{ marginTop: 20 }}>{action}</div>}
        </div>
    );
}

export default EmptyState;
