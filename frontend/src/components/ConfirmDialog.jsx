import Modal from './Modal';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="confirm-dialog">
                <div className="warning-icon">🗑️</div>
                <h4>{title}</h4>
                <p>{message}</p>
                <div className="actions">
                    <button className="btn btn-outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;
