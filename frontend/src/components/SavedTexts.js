import React, { useState, useEffect } from 'react';

const SavedTexts = ({ onReEdit }) => {
  const [savedFiles, setSavedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedFilename, setSelectedFilename] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSavedTexts();
  }, []);

  const fetchSavedTexts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/saved-texts');
      if (!response.ok) {
        throw new Error('Failed to fetch saved texts');
      }
      const data = await response.json();
      setSavedFiles(data.files);
    } catch (err) {
      setError('Error loading saved texts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (filename) => {
    setDeleteConfirm(filename);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDelete = async (filename) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/delete-text/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete text');
      }

      // Reset delete confirmation
      setDeleteConfirm(null);
      
      // Refresh the list after successful deletion
      fetchSavedTexts();
    } catch (err) {
      setError('Error deleting text: ' + err.message);
      setLoading(false);
    }
  };

  const openPopup = (text, filename) => {
    setSelectedText(text);
    setSelectedFilename(filename);
    setShowPopup(true);
    // Add modal-open class to body when modal is shown
    document.body.classList.add('modal-open');
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedText(null);
    setSelectedFilename(null);
    // Remove modal-open class from body when modal is closed
    document.body.classList.remove('modal-open');
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your saved texts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (savedFiles.length === 0) {
    return (
      <div className="card text-center p-5">
        <i className="bi bi-archive display-1 mb-3 text-muted"></i>
        <h4>No saved texts found</h4>
        <p className="text-muted">
          Upload a PDF or use the Editor to create and save some text files.
        </p>
      </div>
    );
  }

  return (
    <div className="saved-texts">
      <div className="row">
        {savedFiles.map((file, index) => (
          <div key={index} className="col-lg-12 mb-4">
            <div className="saved-text-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="bi bi-file-text me-2"></i>
                  {file.filename}
                </h5>
                <span className="badge bg-primary">
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(file.created * 1000).toLocaleDateString()}
                </span>
              </div>
              
              <div className="text-preview p-3 rounded mb-3" style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid var(--primary-color)',
                maxHeight: '200px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ 
                  maxHeight: '180px', 
                  overflowY: 'hidden', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word' 
                }}>
                  {file.content}
                </div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '30px', 
                  background: 'linear-gradient(transparent, var(--bg-gradient-start))'
                }}></div>
              </div>
              
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={() => onReEdit(file.content, file.filename)}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit
                </button>
                <button
                  className="btn btn-outline-secondary flex-grow-1"
                  onClick={() => openPopup(file.content, file.filename)}
                >
                  <i className="bi bi-eye me-2"></i>View
                </button>
                {deleteConfirm === file.filename ? (
                  <div className="d-flex gap-2 flex-grow-1">
                    <button
                      className="btn btn-danger flex-grow-1"
                      onClick={() => handleDelete(file.filename)}
                    >
                      <i className="bi bi-check-lg me-1"></i>Yes
                    </button>
                    <button
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={cancelDelete}
                    >
                      <i className="bi bi-x-lg me-1"></i>No
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => confirmDelete(file.filename)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for viewing full text */}
      {showPopup && (
        <>
          <div 
            className="modal d-block" 
            tabIndex="-1" 
            role="dialog"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={closePopup}
          >
            <div 
              className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
              style={{ maxWidth: '90vw', width: '90vw' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-file-text me-2"></i>
                    {selectedFilename}
                  </h5>
                  <button 
                    type="button" 
                   
                    onClick={closePopup}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    maxHeight: '80vh',
                    minHeight: '60vh',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '1.05rem',
                    lineHeight: '1.6'
                  }}>
                    {selectedText}
                  </pre>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    
                    onClick={closePopup}
                  >
                    <i className="bi bi-x-circle me-2"></i>Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => {
                      closePopup();
                      onReEdit(selectedText, selectedFilename);
                    }}
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit this text
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SavedTexts;