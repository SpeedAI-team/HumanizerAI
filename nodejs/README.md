# SpeedAI Node.js Client

Node.js client library for SpeedAI document and text processing API.

## Installation

```bash
npm install
```

> 说明：实时进度订阅需要 WebSocket。我们已加入依赖 `ws`（用于 Node 环境）。

## Quick Start

修改example.js中的API_KEY和TOKEN，然后运行
```bash
node example.js
```

```javascript
const SpeedAIClient = require('./index');

// Initialize client
const client = new SpeedAIClient('your_api_key', 'your_token');

// Rewrite text
const result = await client.rewriteText('您的文本内容', 'Chinese', 'zhiwang');
console.log(result.rewrite);
```

## API Reference

### Constructor

```javascript
const client = new SpeedAIClient(apiKey, token);
```

- `apiKey` - Your SpeedAI API key
- `token` - Your authentication token

### Methods

#### rewriteText(text, lang, type)

Rewrite text to reduce plagiarism.

```javascript
const result = await client.rewriteText(
  '需要重写的文本',
  'Chinese',  // 'Chinese' or 'English'
  'zhiwang'   // 'zhiwang', 'weipu', or 'gezida'
);
```

#### deAIText(text, lang, type)

Reduce AI detection rate of text.

```javascript
const result = await client.deAIText(
  'AI generated text',
  'English',
  'zhiwang'
);
```

#### uploadDocument(filePath, options)

Upload and process a document.

```javascript
const response = await client.uploadDocument('./document.docx', {
  mode: 'rewrite',      // 'rewrite' or 'deai'
  type: 'zhiwang',      // 'zhiwang', 'weipu', or 'gezida'
  skipEnglish: true,    // Skip English content
  reportPath: './report.pdf' // 可选：报告文件（PDF/HTML），用于报告匹配过滤
});
```

#### getCost(filePath, options)

计算文档 cost（对应 AISurvey 新接口 `POST /v1/cost`），也支持可选上传报告文件：

```javascript
const r = await client.getCost('./document.docx', {
  mode: 'rewrite',
  type: 'zhiwang',
  skipEnglish: true,
  reportPath: './report.pdf' // 可选：报告文件（PDF/HTML）
});
console.log(r);
```

#### uploadReportFile(docId, reportPath, fileName)

分步上传报告文件（对应 AISurvey 新接口 `POST /v1/docx/report`）。

```javascript
const r = await client.uploadReportFile(docId, './report.pdf');
console.log(r);
```

#### checkDocumentStatus(docId)

Check the processing status of a document.

```javascript
const status = await client.checkDocumentStatus('doc_id_here');
console.log(`Progress: ${status.progress}%`);
```

#### downloadDocument(docId, outputPath, fileName)

Download a processed document.

```javascript
await client.downloadDocument(
  'doc_id_here',
  './output/processed.docx',
  'processed_document'
);
```

#### processDocumentWithPolling(filePath, options, onProgress)

Process a document with automatic status polling.

```javascript
const docId = await client.processDocumentWithPolling(
  './document.docx',
  { mode: 'rewrite', type: 'zhiwang' },
  (progress, status) => {
    console.log(`Progress: ${progress}%`);
  }
);
```

#### subscribeDocxProgress(docId, options)

用 WebSocket 订阅 docx 实时进度（对应 AISurvey `GET ws /v1/docx/progress?token&doc_id`），替代轮询 `/v1/docx/status`。

```javascript
const handle = client.subscribeDocxProgress(docId, {
  onProgress: (p, stage) => console.log('progress', p, stage),
  onEvent: (evt) => {
    if (evt.type === 'paragraph' && evt.status === 'processed') {
      console.log('paragraph processed', evt.index);
    }
    if (evt.type === 'completed') {
      console.log('completed');
      handle.close();
    }
  }
});
```

## Complete Example

```javascript
const SpeedAIClient = require('./index');
const path = require('path');

async function main() {
  const client = new SpeedAIClient('your_api_key', 'your_token');
  
  try {
    // Text processing
    const textResult = await client.rewriteText(
      '这是需要处理的文本内容',
      'Chinese',
      'zhiwang'
    );
    console.log('Processed text:', textResult.rewrite);
    
    // Document processing
    const docId = await client.processDocumentWithPolling(
      './test.docx',
      { mode: 'rewrite', type: 'zhiwang' },
      (progress) => console.log(`Processing: ${progress}%`)
    );
    
    // Download result
    await client.downloadDocument(
      docId,
      './processed_test.docx'
    );
    
    console.log('Document processed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Environment Variables

You can use environment variables to store credentials:

```bash
# .env file
SPEEDAI_API_KEY=your_api_key_here
SPEEDAI_TOKEN=your_token_here
```

```javascript
require('dotenv').config();

const client = new SpeedAIClient(
  process.env.SPEEDAI_API_KEY,
  process.env.SPEEDAI_TOKEN
);
```

## Error Handling

The client provides detailed error messages:

```javascript
try {
  const result = await client.rewriteText(text);
} catch (error) {
  console.error('API Error:', error.message);
}
```

## Rate Limiting

Please be aware of the API rate limits:
- Text processing: Based on character count
- Document processing: Based on file size and complexity

## Support

For API documentation and support, please refer to the main README.md file in the project root.