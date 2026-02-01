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
   * @param {string} options.reportPath - Optional: Path to report file (PDF/HTML)
   * @returns {Promise<Object>} Response with document ID
   */
  async uploadDocument(filePath, options = {}) {
    const {
      mode = 'rewrite',
      type = 'zhiwang',
      skipEnglish = true,
      reportPath = null
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

      // 可选：随文档一起上传报告文件（AISurvey 最新后端支持 report_file/ReportFileName）
      if (reportPath) {
        const reportStream = fs.createReadStream(reportPath);
        const reportName = path.basename(reportPath);
        form.append('report_file', reportStream, reportName);
        form.append('ReportFileName', reportName);
      }

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
   * Upload report file step-by-step (AISurvey: POST /v1/docx/report)
   * @param {string} docId - Document ID (used as report file name prefix on backend)
   * @param {string} reportPath - Path to report file (PDF/HTML)
   * @param {string} [fileName] - Optional original report filename (for extension)
   * @returns {Promise<Object>} Response {status, doc_id, report_path, platform}
   */
  async uploadReportFile(docId, reportPath, fileName = null) {
    if (!docId) throw new Error('docId is required');
    if (!reportPath) throw new Error('reportPath is required');

    try {
      const form = new FormData();
      const reportStream = fs.createReadStream(reportPath);
      const reportName = fileName || path.basename(reportPath);

      form.append('doc_id', docId);
      form.append('file', reportStream, reportName);
      // 后端用 FileName 来取后缀并做安全校验
      form.append('FileName', reportName);

      const response = await this.client.post('/v1/docx/report', form, {
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
   * Calculate document cost (AISurvey: POST /v1/cost)
   * @param {string} filePath - Path to the document file
   * @param {Object} options - Options
   * @param {string} options.mode - Processing mode ('rewrite'/'deai'/'polish'...)，后端目前主要用于记录
   * @param {string} options.type - Platform type (zhiwang/weipu/gezida/daya/turnitin...)
   * @param {boolean} options.skipEnglish - Whether to skip English content
   * @param {string} options.reportPath - Optional: Path to report file (PDF/HTML)
   * @returns {Promise<Object>} Response {status, cost, doc_id, report_uploaded}
   */
  async getCost(filePath, options = {}) {
    const {
      mode = 'rewrite',
      type = 'zhiwang',
      skipEnglish = true,
      reportPath = null
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

      // 可选：上传报告文件（AISurvey /v1/cost 支持 report_file/ReportFileName）
      if (reportPath) {
        const reportStream = fs.createReadStream(reportPath);
        const reportName = path.basename(reportPath);
        form.append('report_file', reportStream, reportName);
        form.append('ReportFileName', reportName);
      }

      const response = await this.client.post('/v1/cost', form, {
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
   * Subscribe docx progress via WebSocket (AISurvey: GET ws /v1/docx/progress?token&doc_id)
   * @param {string} docId - Document ID
   * @param {Object} options
   * @param {(event: any) => void} [options.onEvent] - Receive every parsed event
   * @param {(progress: number, stage?: string) => void} [options.onProgress] - Progress callback
   * @param {number} [options.snapshotChunkSize] - Optional snapshot chunk size (default 50)
   * @returns {{ close: Function }} handle
   */
  subscribeDocxProgress(docId, options = {}) {
    const {
      onEvent = null,
      onProgress = null,
      snapshotChunkSize = 50
    } = options;

    if (!docId) throw new Error('docId is required');
    if (!this.token) throw new Error('token is required');

    // Prefer global WebSocket (browser / newer Node). Fallback to ws package.
    let WSImpl = globalThis.WebSocket;
    if (!WSImpl) {
      try {
        WSImpl = require('ws');
      } catch (e) {
        throw new Error('WebSocket is not available. Please use Node >= 18 with global WebSocket or install dependency "ws".');
      }
    }

    const base = new URL(this.baseURL);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    base.pathname = '/v1/docx/progress';
    base.searchParams.set('token', this.token);
    base.searchParams.set('doc_id', docId);
    base.searchParams.set('snapshot_chunk_size', String(snapshotChunkSize));

    const ws = new WSImpl(base.toString());

    const safeEmit = (evt) => {
      try { if (onEvent) onEvent(evt); } catch (_) {}
      if (evt && evt.type === 'progress') {
        try { if (onProgress) onProgress(Number(evt.progress || 0), evt.stage); } catch (_) {}
      }
    };

    // ws (node) uses "message" event; browser WebSocket uses onmessage callback
    if (typeof ws.on === 'function') {
      ws.on('open', () => safeEmit({ type: 'client_open', doc_id: docId }));
      ws.on('message', (data) => {
        const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data);
        try {
          const evt = JSON.parse(text);
          safeEmit(evt);
        } catch (_) {}
      });
      ws.on('error', (err) => safeEmit({ type: 'client_error', error: String(err && err.message ? err.message : err) }));
      ws.on('close', () => safeEmit({ type: 'client_close', doc_id: docId }));
    } else {
      ws.onopen = () => safeEmit({ type: 'client_open', doc_id: docId });
      ws.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          safeEmit(evt);
        } catch (_) {}
      };
      ws.onerror = (e) => safeEmit({ type: 'client_error', error: 'ws_error', detail: e });
      ws.onclose = () => safeEmit({ type: 'client_close', doc_id: docId });
    }

    return {
      close: () => {
        try { ws.close(); } catch (_) {}
      }
    };
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