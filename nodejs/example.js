const SpeedAIClient = require('./index');
const path = require('path');
const fs = require('fs');

// Load environment variables if using .env file
// require('dotenv').config();

// Initialize client with your API credentials
const apiKey = ''; // Replace with your API key
const token = '';     // Replace with your token

const client = new SpeedAIClient(apiKey, token);

// Example 1: Text Rewriting
async function rewriteTextExample() {
  console.log('\n=== Text Rewriting Example ===');
  
  const text = '人工智能技术的快速发展正在深刻改变我们的生活方式。从智能手机到自动驾驶汽车，AI已经渗透到日常生活的方方面面。';
  
  try {
    const result = await client.rewriteText(text, 'Chinese', 'zhiwang');
    
    if (result.code === 200) {
      console.log('Original text:', text);
      console.log('Rewritten text:', result.rewrite);
    } else {
      console.error('Rewrite failed:', result.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: AI Detection Reduction
async function deAITextExample() {
  console.log('\n=== AI Detection Reduction Example ===');
  
  const aiGeneratedText = 'The rapid advancement of artificial intelligence technology is fundamentally transforming our daily lives.';
  
  try {
    const result = await client.deAIText(aiGeneratedText, 'English', 'zhiwang');
    
    if (result.code === 200) {
      console.log('Original text:', aiGeneratedText);
      console.log('Processed text:', result.rewrite);
    } else {
      console.error('DeAI failed:', result.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Document Processing
async function processDocumentExample() {
  console.log('\n=== Document Processing Example ===');
  
  // Use the test directory document
  const docPath = 'test/原文档.docx';
  // 可选：报告文件（PDF/HTML）
  const reportPath = 'test/报告.pdf';
  
  // Check if file exists
  if (!fs.existsSync(docPath)) {
    console.log('File not found:', docPath);
    return;
  }
  
  try {
    // Process document with progress tracking
    const docId = await client.processDocumentWithPolling(
      docPath,
      {
        mode: 'rewrite',
        type: 'zhiwang',
        skipEnglish: true,
        // reportPath 存在时，会随 /v1/docx 一起上传（report_file/ReportFileName）
        reportPath: fs.existsSync(reportPath) ? reportPath : null
      },
      (progress, status) => {
        console.log(`Processing progress: ${progress}% - Status: ${status}`);
      }
    );
    
    console.log('Document processing completed!');
    
    // Download the processed document
    const outputPath = 'test/processed_document.docx';
    await client.downloadDocument(docId, outputPath, 'processed_document');
    
    console.log(`Processed document saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: Manual Document Processing (without polling)
async function manualDocumentProcessingExample() {
  console.log('\n=== Manual Document Processing Example ===');
  
  const docPath = '/Users/luoyangyifei/Work/HumanizerAI/test/原文档.docx';
  
  if (!fs.existsSync(docPath)) {
    console.log('File not found:', docPath);
    return;
  }
  
  try {
    // Step 1: Upload document
    const uploadResponse = await client.uploadDocument(docPath, {
      mode: 'deai',
      type: 'weipu',
      skipEnglish: false
    });
    
    if (uploadResponse.status !== 'processing') {
      throw new Error('Upload failed');
    }
    
    const docId = uploadResponse.user_doc_id;
    console.log(`Document uploaded. ID: ${docId}`);
    
    // Step 2: Check status manually
    let isProcessing = true;
    while (isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      const statusResponse = await client.checkDocumentStatus(docId);
      console.log(`Status: ${statusResponse.status}, Progress: ${statusResponse.progress}%`);
      
      if (statusResponse.status === 'completed') {
        isProcessing = false;
      } else if (statusResponse.status === 'error') {
        throw new Error(`Processing error: ${statusResponse.error}`);
      }
    }
    
    // Step 3: Download document
    const outputPath = '/Users/luoyangyifei/Work/HumanizerAI/test/manual_processed_document.docx';
    await client.downloadDocument(docId, outputPath);
    console.log(`Document downloaded to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 5: Get cost (optional with report)
async function getCostExample() {
  console.log('\n=== Get Cost Example ===');
  const docPath = 'test/原文档.docx';
  const reportPath = 'test/报告.pdf';

  if (!fs.existsSync(docPath)) {
    console.log('File not found:', docPath);
    return;
  }

  try {
    const r = await client.getCost(docPath, {
      mode: 'rewrite',
      type: 'zhiwang',
      skipEnglish: true,
      reportPath: fs.existsSync(reportPath) ? reportPath : null
    });
    console.log('Cost response:', r);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all examples
async function runExamples() {
  // Text processing examples
  await rewriteTextExample();
  await deAITextExample();
  
  // Document processing examples (uncomment to run)
  await processDocumentExample();
  
  // Example: Subscribe progress by WS (no polling)
  // const uploadResponse = await client.uploadDocument('test/原文档.docx', { mode: 'rewrite', type: 'zhiwang' });
  // const docId = uploadResponse.user_doc_id;
  // const handle = client.subscribeDocxProgress(docId, {
  //   onProgress: (p, stage) => console.log(`WS progress: ${p}% stage=${stage}`),
  //   onEvent: (evt) => {
  //     if (evt.type === 'need_pay') console.log('need_pay', evt.message);
  //     if (evt.type === 'completed') { console.log('completed'); handle.close(); }
  //   }
  // });

  // await getCostExample();
  // await manualDocumentProcessingExample();
}

// Execute examples
runExamples().catch(console.error);