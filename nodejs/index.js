const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class SpeedAIClient {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
    this.baseURL = 'https://api3.speedai.chat';
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  /**
   * Rewrite text to reduce plagiarism
   * @param {string} text - Text to rewrite
   * @param {string} lang - Language ('Chinese' or 'English')
   * @param {string} type - Platform type ('zhiwang', 'weipu', 'gezida')
   * @returns {Promise<Object>} Response with rewritten text
   */
  async rewriteText(text, lang = 'Chinese', type = 'zhiwang') {
    try {
      const response = await this.client.post('/v1/rewrite', {
        username: this.apiKey,
        info: text,
        lang: lang,
        type: type
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reduce AI detection rate of text
   * @param {string} text - Text to process
   * @param {string} lang - Language ('Chinese' or 'English')
   * @param {string} type - Platform type ('zhiwang', 'weipu', 'gezida')
   * @returns {Promise<Object>} Response with processed text
   */
  async deAIText(text, lang = 'Chinese', type = 'zhiwang') {
    try {
      const response = await this.client.post('/v1/deai', {
        username: this.apiKey,
        info: text,
        lang: lang,
        type: type
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload and process a document
   * @param {string} filePath - Path to the document file
   * @param {Object} options - Processing options
   * @param {string} options.mode - Processing mode ('rewrite' or 'deai')
   * @param {string} options.type - Platform type ('zhiwang', 'weipu', 'gezida')
   * @param {boolean} options.skipEnglish - Whether to skip English content
   * @returns {Promise<Object>} Response with document ID
   */
  async uploadDocument(filePath, options = {}) {
    const {
      mode = 'rewrite',
      type = 'zhiwang',
      skipEnglish = true
    } = options;

    try {
      const form = new FormData();
      const fileStream = fs.createReadStream(filePath);
      const fileName = path.basename(filePath);
      
      form.append('file', fileStream, fileName);
      form.append('FileName', fileName);
      form.append('username', this.apiKey);
      form.append('mode', mode);
      form.append('type_', type);
      form.append('changed_only', 'false');
      form.append('skip_english', skipEnglish.toString());

      const response = await this.client.post('/v1/docx', form, {
        headers: {
          ...form.getHeaders()
        }
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check document processing status
   * @param {string} docId - Document ID from upload response
   * @returns {Promise<Object>} Status response
   */
  async checkDocumentStatus(docId) {
    try {
      const response = await this.client.post('/v1/docx/status', {
        user_doc_id: docId
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download processed document
   * @param {string} docId - Document ID
   * @param {string} outputPath - Path to save the downloaded file
   * @param {string} fileName - Optional custom filename
   * @returns {Promise<void>}
   */
  async downloadDocument(docId, outputPath, fileName = 'processed_document') {
    try {
      const response = await this.client.post('/v1/download', {
        user_doc_id: docId,
        file_name: fileName
      }, {
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process document with automatic status checking
   * @param {string} filePath - Path to the document
   * @param {Object} options - Processing options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} Document ID when processing is complete
   */
  async processDocumentWithPolling(filePath, options = {}, onProgress = null) {
    // Upload document
    const uploadResponse = await this.uploadDocument(filePath, options);
    
    if (uploadResponse.status !== 'processing') {
      throw new Error(`Upload failed: ${uploadResponse.error || 'Unknown error'}`);
    }

    const docId = uploadResponse.user_doc_id;
    console.log(`Document uploaded successfully. ID: ${docId}`);

    // Poll for status
    let status = 'processing';
    let progress = 0;

    while (status === 'processing') {
      await this.sleep(2000); // Wait 2 seconds between checks
      
      const statusResponse = await this.checkDocumentStatus(docId);
      status = statusResponse.status;
      progress = statusResponse.progress || 0;

      if (onProgress) {
        onProgress(progress, status);
      }

      if (status === 'error') {
        throw new Error(`Processing failed: ${statusResponse.error || 'Unknown error'}`);
      }
    }

    return docId;
  }

  /**
   * Helper method to handle errors
   * @private
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(`API Error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    } else {
      // Something else happened
      return error;
    }
  }

  /**
   * Helper method to sleep
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SpeedAIClient;