import React, { useState, useRef } from "react";

const PDFUploader = ({ onTextExtracted, uploadOnly = false, onGoToEditor }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [promptText, setPromptText] = useState("");
  const [showEditorButton, setShowEditorButton] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState("");
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setFilename(file.name);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract text from PDF");
      }

      const data = await response.json();
      
      // Always pass the extracted text to the parent component
      onTextExtracted(data.text);
      
      // Show success message and editor button
      setExtractedText(`PDF text extracted successfully from ${file.name}`);
      setShowEditorButton(true);
      
      // Clear the success message after 5 seconds, but keep the editor button
      setTimeout(() => {
        setExtractedText("");
      }, 5000);
      
    } catch (err) {
      setError(`Failed to process PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim()) {
      onTextExtracted(promptText);
      setPromptText("");
    } else {
      setError("Please enter text in the prompt");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-4">
      {!uploadOnly && (
        <div className="form-group mb-4">
          <label htmlFor="promptInput" className="form-label">
            Enter Text Prompt
          </label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              id="promptInput"
              placeholder="Enter your text here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handlePromptSubmit}
              disabled={loading || !promptText.trim()}
            >
              <i className="bi bi-send me-2"></i>Submit
            </button>
          </div>
        </div>
      )}

      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="d-none"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={loading}
        />
        
        <i className="bi bi-file-earmark-pdf upload-icon"></i>
        
        <h4 className="mb-3">Drag & Drop your PDF here</h4>
        <p className="text-muted mb-3">or click to browse your files</p>
        
        {filename && !loading && !error && (
          <div className="selected-file mt-3">
            <i className="bi bi-file-earmark-check me-2"></i>
            <span>{filename}</span>
          </div>
        )}
        
        {loading && (
          <div className="text-center mt-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Processing your PDF...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}
      
      {extractedText && (
        <div className="alert alert-success mt-3">
          <i className="bi bi-check-circle me-2"></i>{extractedText}
        </div>
      )}
      
      {showEditorButton && uploadOnly && (
        <div className="d-grid gap-2 col-6 mx-auto mt-3">
          <button 
            className="btn btn-primary" 
            onClick={onGoToEditor}
          >
            <i className="bi bi-pencil-square me-2"></i>Go to Editor with Extracted Text
          </button>
        </div>
      )}
      
      {uploadOnly && !loading && !error && !extractedText && !showEditorButton && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-info-circle me-2"></i>How it works
            </h5>
            <ol className="mb-0 ps-3 mt-3">
              <li className="mb-2">Upload your PDF document using the drag & drop area above</li>
              <li className="mb-2">Our system will extract all the text from your PDF</li>
              <li className="mb-2">Click the <strong>Go to Editor</strong> button to view and edit the extracted text</li>
              <li className="mb-2">Save your text or make further edits in the Editor tab</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
