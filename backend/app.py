import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import PyPDF2
import logging
import io

# Configure logging with more detailed format
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://0.0.0.0:3000", "https://*.repl.co", "https://*.replit.dev"],
        "methods": ["GET", "POST", "OPTIONS", "DELETE"], # Added DELETE method
        "allow_headers": ["Content-Type"]
    }
})
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Create saved_texts directory if it doesn't exist
SAVED_TEXTS_DIR = os.path.join(os.path.dirname(__file__), 'saved_texts')
os.makedirs(SAVED_TEXTS_DIR, exist_ok=True)

@app.route('/')
def index():
    logger.info("Root endpoint called")
    return jsonify({"status": "Flask server is running"}), 200

@app.route('/api/ping', methods=['GET'])
def ping():
    logger.info("Ping endpoint called")
    return jsonify({"status": "ok"}), 200

@app.route('/api/extract-pdf', methods=['POST'])
def extract_pdf():
    try:
        logger.info("PDF extraction endpoint called")
        if 'file' not in request.files:
            logger.warning("No file provided in request")
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            logger.warning("Empty filename provided")
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.pdf'):
            logger.warning(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'File must be a PDF'}), 400

        # Read the PDF file
        logger.info(f"Processing PDF file: {file.filename}")
        pdf_file = io.BytesIO(file.read())
        pdf_reader = PyPDF2.PdfReader(pdf_file)

        # Extract text from all pages
        text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            logger.debug(f"Processing page {page_num + 1}")
            text += page.extract_text()

        logger.info("PDF extraction completed successfully")
        return jsonify({'text': text})

    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error processing PDF file'}), 500

@app.route('/api/save-text', methods=['POST'])
def save_text():
    try:
        data = request.get_json()
        if not data or 'text' not in data or 'filename' not in data:
            return jsonify({'error': 'Missing text or filename'}), 400

        filename = data['filename']
        if not filename.endswith('.txt'):
            filename += '.txt'

        file_path = os.path.join(SAVED_TEXTS_DIR, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(data['text'])

        logger.info(f"Text saved successfully to {filename}")
        return jsonify({'message': 'Text saved successfully', 'filename': filename})

    except Exception as e:
        logger.error(f"Error saving text: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error saving text file'}), 500

@app.route('/api/saved-texts', methods=['GET'])
def get_saved_texts():
    try:
        files = []
        for filename in os.listdir(SAVED_TEXTS_DIR):
            if filename.endswith('.txt'):
                file_path = os.path.join(SAVED_TEXTS_DIR, filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                files.append({
                    'filename': filename,
                    'content': content,
                    'created': os.path.getctime(file_path)
                })

        # Sort files by creation time, newest first
        files.sort(key=lambda x: x['created'], reverse=True)
        return jsonify({'files': files})

    except Exception as e:
        logger.error(f"Error retrieving saved texts: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error retrieving saved texts'}), 500

@app.route('/api/delete-text/<filename>', methods=['DELETE'])
def delete_text(filename):
    try:
        file_path = os.path.join(SAVED_TEXTS_DIR, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        os.remove(file_path)
        logger.info(f"Text file {filename} deleted successfully")
        return jsonify({'message': 'Text deleted successfully'})

    except Exception as e:
        logger.error(f"Error deleting text file: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error deleting text file'}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    app.run(host='127.0.0.1', port=5000, debug=True)