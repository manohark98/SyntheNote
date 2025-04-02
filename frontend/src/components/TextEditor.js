import React, { useState, useEffect } from 'react';

const TextEditor = ({ initialText, initialFileName }) => {
  const [text, setText] = useState(initialText || '');
  const [fileName, setFileName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [fileNameError, setFileNameError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Update text and filename when props change
  useEffect(() => {
    console.log('TextEditor received new text:', initialText);
    setText(initialText || '');
    
    // Only set filename if coming from editor tab or ReEdit function
    // Don't use initialFileName from Ask tab
    if (initialFileName && initialFileName !== '') {
      setFileName(initialFileName);
    }
    
    // Update counts for new text
    if (initialText) {
      updateCounts(initialText);
    }
  }, [initialText, initialFileName]);
  
  // Update character and word counts
  const updateCounts = (textContent) => {
    setCharCount(textContent.length);
    const wordArray = textContent.match(/\S+/g) || [];
    setWordCount(wordArray.length);
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    updateCounts(newText);
  };

  const handleSave = async () => {
    // Validate filename
    if (!fileName.trim()) {
      setFileNameError('Please enter a filename before saving');
      return;
    }
    
    setFileNameError('');
    setIsSaving(true);
    
    try {
      setSaveStatus('Saving...');
      const response = await fetch('http://localhost:5000/api/save-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          filename: fileName.endsWith('.txt') ? fileName : `${fileName}.txt`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save text');
      }

      const data = await response.json();
      setSaveStatus(`Saved as ${data.filename}`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClearText = () => {
    if (window.confirm('Are you sure you want to clear all text?')) {
      setText('');
      updateCounts('');
    }
  };

  return (
    <div className="editor-container">
      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group mb-3">
            <label htmlFor="fileName" className="form-label">
              <i className="bi bi-file-earmark-text me-2"></i>
              File Name
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-pencil"></i>
              </span>
              <input
                type="text"
                className="form-control"
                id="fileName"
                placeholder="Enter file name (e.g., my-text.txt)"
                value={fileName}
                onChange={(e) => {
                  setFileName(e.target.value);
                  if (fileNameError && e.target.value.trim()) {
                    setFileNameError('');
                  }
                }}
              />
            </div>
            {fileNameError && (
              <div className="text-danger mt-1">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {fileNameError}
              </div>
            )}
          </div>
          
          <div className="form-group mb-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label htmlFor="textArea" className="form-label mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Edit Text
              </label>
              <div className="text-muted small">
                <span className="me-3">
                  <i className="bi bi-hash me-1"></i>
                  {charCount} characters
                </span>
                <span>
                  <i className="bi bi-chat-square-text me-1"></i>
                  {wordCount} words
                </span>
              </div>
            </div>
            <textarea
              className="form-control custom-textarea"
              id="textArea"
              rows="15"
              value={text}
              onChange={handleTextChange}
              style={{
                resize: "vertical",
                fontSize: "1rem",
                lineHeight: "1.6",
                fontFamily: "monospace"
              }}
            />
          </div>
        </div>
        
        <div className="card-footer d-flex justify-content-between">
          <div>
            <button 
              className="btn btn-outline-secondary me-2" 
              onClick={handleClearText}
              disabled={!text || isSaving}
            >
              <i className="bi bi-trash me-2"></i>Clear
            </button>
          </div>
          <div className="d-flex align-items-center">
            {saveStatus && (
              <div className={`save-status me-3 ${saveStatus.includes('Error') ? 'text-danger' : 'text-success'}`}>
                <i className={`bi me-1 ${saveStatus.includes('Error') ? 'bi-exclamation-circle' : 'bi-check-circle'}`}></i>
                {saveStatus}
              </div>
            )}
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>Save Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;