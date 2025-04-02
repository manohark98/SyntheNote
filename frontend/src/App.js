import React, { useState } from 'react';
import PDFUploader from './components/PDFUploader';
import TextEditor from './components/TextEditor';
import SavedTexts from './components/SavedTexts';
import './App.css';


function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState('upload');
  
  // Text content for different tabs
  const [editorText, setEditorText] = useState('');
  const [editorFileName, setEditorFileName] = useState('');
  
  // Ask tab related states
  const [promptText, setPromptText] = useState('');
  const [askResponseText, setAskResponseText] = useState('');
  
  // Handle text extracted from PDF
  const handleTextExtracted = (text) => {
    console.log('Text received in App:', text);
    // Set the editor text without affecting Ask tab
    setEditorText(text);
    setEditorFileName('pdf-extract.txt');
  };

  // Handle editing saved texts
  const handleReEdit = (text, filename) => {
    console.log('Re-editing text:', text);
    setEditorText(text);
    setEditorFileName(filename);
    setActiveTab('editor');
  };

  // Function to generate dummy content for Ask tab
  const handlePromptSubmit = () => {
    if (!promptText.trim()) return;
    
    // Generate dummy response
    const dummyResponse = `This is a dummy response for: "${promptText}"\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;
    
    setAskResponseText(dummyResponse);
  };

  return (
    <div className="container mt-5">
      <h1 className="app-title">PDF to Text Converter</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Upload PDFs/Doc
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ask' ? 'active' : ''}`}
            onClick={() => setActiveTab('ask')}
          >
            <i className="bi bi-chat-dots me-2"></i>Ask
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <i className="bi bi-pencil-square me-2"></i>Editor
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <i className="bi bi-archive me-2"></i>Saved Texts
          </button>
        </li>
      </ul>

      <div className="row">
        <div className="col-12">
          <div className="card">
            {activeTab === 'upload' && (
              <div>
                <h3 className="mb-4"><i className="bi bi-file-earmark-pdf me-2"></i>Upload PDF Document</h3>
                <PDFUploader 
                  onTextExtracted={handleTextExtracted} 
                  uploadOnly={true}
                  onGoToEditor={() => setActiveTab('editor')}
                />
              </div>
            )}
            
            {activeTab === 'ask' && (
              <div>
                <h3 className="mb-4"><i className="bi bi-chat-dots me-2"></i>Ask a Question</h3>
                <div className="card mb-4">
                  <div className="form-group">
                    <label htmlFor="promptInput" className="form-label">
                      Enter Your Query
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        id="promptInput"
                        placeholder="What would you like to know?"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handlePromptSubmit}
                        disabled={!promptText.trim()}
                      >
                        <i className="bi bi-send me-2"></i>Submit
                      </button>
                    </div>
                  </div>
                </div>
                
                {askResponseText && (
                  <div className="response-card">
                    <TextEditor 
                      key={`ask-${askResponseText}`}
                      initialText={askResponseText} 
                      initialFileName={""}
                    />
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'editor' && (
              <div>
                <h3 className="mb-4"><i className="bi bi-pencil-square me-2"></i>Text Editor</h3>
                <TextEditor 
                  key={`edit-${editorText}-${editorFileName}`}
                  initialText={editorText} 
                  initialFileName={editorFileName}
                />
              </div>
            )}
            
            {activeTab === 'saved' && (
              <div>
                <h3 className="mb-4"><i className="bi bi-archive me-2"></i>Your Saved Texts</h3>
                <SavedTexts onReEdit={handleReEdit} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;