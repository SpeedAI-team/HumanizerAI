# HumanizerAI
降AIGC率，降低知网、维普、格子达平台的AIGC检测率，降知网AI，降维普AI，降格子达AI。
# 普通用户请访问[网页版](https://speedai.fun)
普通用户请访问[网页版](https://speedai.fun)
# 下面为开发人员文档，无开发能力的请使用上面的用户版本
# 接口文档说明

## 概述：

本文档描述了多个接口的使用方法，这些接口用于文档上传、文本重写、降AI处理和文件下载。接口提供了基于WebSocket的实时文档处理，以及基于HTTP的文本处理和文件下载功能。

注意：请将test_api更换为实际的api key。api key请联系wx：speed-ai

### 计费说明

所有输入，均以**字符数**计算，而不是按**字数**计算。

#### 附：字符数与字数的区别

#####  **字符数**

**字符数**指的是文本中所有字符的总数量，包括：

- 每一个字母（不论大小写）
- 标点符号（逗号、句号、感叹号等）
- 数字
- 空格、换行符
- 特殊符号（如：@、#、$等）

**计算方式：**

- 在字符数的计算中，**每个字符**都被单独计算，无论它是中文字符、英文字符、数字还是标点符号。例如，"Hello, 世界!" 包含了10个字符（5个英文字母，1个逗号，1个空格，2个中文字符，1个感叹号）。

##### **字数**

**字数**则通常指的是文本中的**汉字**数量。在中文语境下，字数通常不包括标点符号、空格或其他字符。例如：

- 句子"你好，世界！"的字数为**4**，因为它包含4个汉字（"你"、"好"、"世"、"界"），而标点符号和空格不计入字数。

在英文语境下，字数有时会指的是**单词数**，而不是字符数。例如：

- "Hello world!" 被视为**2个单词**，即2个字数。标点符号和空格不算在内。

##### 举例

| 示例文本      | 字符数 | 字数（中文语境） | 单词数（英文语境） |
| ------------- | ------ | ---------------- | ------------------ |
| 你好，世界！  | 6      | 4                | 不适用             |
| Hello, world! | 13     | 不适用           | 2                  |
| 123, ABC.     | 9      | 不适用           | 2                  |

#### 总结

- **字符数**：文本中的所有字符（包括空格、标点符号等）总数。
- **字数**：仅统计有效的汉字数量或英文中的单词数量，通常不包括标点符号和空格。

---

本服务**不使用 Token 鉴权**：
- HTTP 接口直接使用 `username`（即 apikey）即可
- WS 进度订阅接口的 query 参数名仍为 `token`，但其值约定为 **apikey(username)**（即：`token=apikey`）

### 1. **文件下载接口**

注意，所有文件均会在24小时内删除，请尽快下载。

**接口地址：**

- `POST https://api3.speedai.chat/v1/download`

**功能：**
根据 `user_doc_id` 和 `file_name` 下载经过修改的文档。

**请求方式：**

- `POST`

**请求参数：**

| 参数名称      | 类型   | 必填 | 说明                               |
| ------------- | ------ | ---- | ---------------------------------- |
| `user_doc_id` | String | 是   | 文件处理后的唯一标识 ID            |
| `file_name`   | String | 是   | 下载文件的名称，默认后缀为 `.docx` |

**请求示例：**

```json
{
    "user_doc_id": "1234567890",
    "file_name": "修改后论文"
}
```

**响应：**

- 文件下载（`.docx` 格式）

**错误返回示例：**

```json
{
    "error": "File not found or server error"
}
```

---

### 2. **文本重写接口**

**接口地址：**

- `POST https://api3.speedai.chat/v1/rewrite`

**功能：**
根据指定类型对输入的文本进行重写。

**请求方式：**

- `POST`

**请求参数：**

| 参数名称 | 类型   | 必填 | 说明                                    |
| -------- | ------ | ---- | --------------------------------------- |
| `username` | String | 是   | API密钥                                 |
| `info`   | String | 是   | 需要重写的文本                          |
| `lang`   | String | 是   | 文本语言 (`Chinese` 或 `English`)       |
| `type`   | String | 是   | 重写类型 (`zhiwang`, `weipu`, `gezida`) |

**请求示例：**

```json
{
    "username": "test_api",
    "info": "有人说："学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
    "lang": "Chinese",
    "type": "zhiwang"
}
```

**响应：**

```json
{
    "code": 200,
    "rewrite": "学生如同一艘在知识海洋中航行的船只，教师则是引导其到达成功彼岸的灯塔。"
}
```

**错误返回示例：**

```json
{
    "code": 400,
    "message": "Invalid API Key"
}
```

---

### 3. **降AI接口**

**接口地址：**

- `POST https://api3.speedai.chat/v1/deai`

**功能：**
对输入的文本进行降AI处理，根据指定类型去除AI生成的痕迹。

**请求方式：**

- `POST`

**请求参数：**

| 参数名称 | 类型   | 必填 | 说明                                    |
| -------- | ------ | ---- | --------------------------------------- |
| `username` | String | 是   | API密钥                                 |
| `info`   | String | 是   | 需要降AI处理的文本                      |
| `lang`   | String | 是   | 文本语言 (`Chinese` 或 `English`)       |
| `type`   | String | 是   | 降AI类型 (`zhiwang`, `weipu`, `gezida`) |

**请求示例：**

```json
{
    "username": "test_api",
    "info": "有人说："学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
    "lang": "Chinese",
    "type": "zhiwang"
}
```

**响应：**

```json
{
    "code": 200,
    "rewrite": "学生如同在知识海洋中航行的船只，教师为其引导成功。"
}
```

**错误返回示例：**

```json
{
    "code": 500,
    "message": "Server Error"
}
```

---

### 4. **文档 cost 计算接口（支持可选上传报告）**

**接口地址：**

- `POST https://api3.speedai.chat/v1/cost`

**功能：**
上传 docx 并计算 cost（返回 `doc_id`）。可选上传报告文件（`report_file/ReportFileName`），后端会保存到 report 目录（用于后续分步流程复用）。

**请求方式：**

- `POST`（FormData）

**请求参数：**

| 参数名称         | 类型    | 必填 | 说明 |
| --------------- | ------- | ---- | ---- |
| `file`          | File    | 是   | docx 文件 |
| `FileName`      | String  | 是   | docx 原始文件名 |
| `username`      | String  | 是   | API key |
| `mode`          | String  | 是   | `rewrite` / `deai` / `polish` |
| `type_`         | String  | 是   | `zhiwang`/`weipu`/`gezida`/`daya`/`turnitin`/`rewrite_*`/`rewrite_deep_*` |
| `changed_only`  | Boolean | 否   | 保留字段，通常传 `false` |
| `skip_english`  | Boolean | 否   | 是否跳过英文 |
| `report_file`   | File    | 否   | 可选：报告文件（PDF/HTML） |
| `ReportFileName`| String  | 否   | 可选：报告原始文件名 |

**响应示例：**

```json
{
  "status": "success",
  "cost": 1234,
  "doc_id": "xxxx-uuid",
  "report_uploaded": true
}
```

---

### 5. **文档上传和处理接口**

**接口地址：**

- `POST https://api3.speedai.chat/v1/docx`

**功能：**
通过HTTP POST方式上传Word文档（`.docx`），并获取处理ID用于后续状态查询。

**请求方式：**

- `POST`

**请求参数：**
通过FormData形式提交以下参数：

| 参数名称       | 类型    | 必填 | 说明                                          |
| -------------- | ------- | ---- | --------------------------------------------- |
| `file`         | File    | 是   | 上传的文档文件                                |
| `FileName`     | String  | 是   | 上传文件的名称                                |
| `username`     | String  | 是   | 用户名/API密钥                                |
| `mode`         | String  | 是   | 处理模式：`rewrite` / `deai` / `polish`        |
| `type_`        | String  | 是   | 处理类型：`zhiwang` / `weipu` / `gezida` / `daya` / `turnitin` / `rewrite_*` / `rewrite_deep_*` |
| `changed_only` | Boolean | 否   | 是否仅返回修改部分（`true` 为仅返回修改部分） |
| `skip_english` | Boolean | 否   | 是否跳过英文部分（`true` 为不处理英文部分）   |
| `report_file`  | File    | 否   | 可选：检测报告文件（PDF/HTML），用于报告匹配过滤 |
| `ReportFileName` | String | 否   | 可选：报告原始文件名（用于取后缀） |

**请求示例：**

```javascript
// Function for handling document upload via POST
uploadDocumentPostButton.onclick = function () {
  const file = fileInput.files[0];
  const reportFile = reportFileInput.files[0]; // 可选：报告文件（PDF/HTML）
  const username = usernameInput.value;
  const mode = modeSelect.value;
  const type_ = typeSelect.value;
  const changedOnly = changedOnlyCheckbox.checked;
  const skipEnglish = skipEnglishCheckbox.checked;
  if (!file || !username) {
    output.innerHTML = `<p style="color:red;">Please select a file and provide an API key.</p>`;
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("FileName", file.name);
  formData.append("username", username);
  formData.append("mode", mode);
  formData.append("type_", type_);
  formData.append("changed_only", changedOnly);
  formData.append("skip_english", skipEnglish);
  // 可选：上传报告文件（PDF/HTML）
  if (reportFile) {
    formData.append("report_file", reportFile);
    formData.append("ReportFileName", reportFile.name);
  }

  fetch("https://api3.speedai.chat/v1/docx", {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "processing") {
      docId = data.user_doc_id;
      output.innerHTML = `<p>Document uploaded. Processing started with ID: ${docId}</p>`;
      // 推荐：使用 WS 实时进度（/v1/docx/progress），避免轮询
      startDocxProgressWS(docId);
    } else {
      output.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
    }
  })
  .catch(error => {
    console.error("Error:", error);
    output.innerHTML = `<p style="color:red;">Error uploading document.</p>`;
  });
};
```

**响应示例：**

1. **处理开始：**

   ```json
   {
       "status": "processing",
       "user_doc_id": "1234567890"
   }
   ```

2. **处理错误：**

   ```json
   {
       "status": "error",
       "error": "File format not supported"
   }
   ```

---

### 6. **分步上传报告文件接口（可选）**

**接口地址：**

- `POST https://api3.speedai.chat/v1/docx/report`

**功能：**
分步上传“检测报告”（PDF/HTML），只负责落盘保存到 `report/`，命名规则：`report/{doc_id}{ext}`。

**请求方式：**

- `POST`（FormData）

**请求参数：**

| 参数名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `doc_id` | String | 是 | 文档 ID（通常来自 `/v1/cost` 的 `doc_id` 或 `/v1/docx` 的 `user_doc_id`） |
| `file` | File | 是 | 报告文件（PDF/HTML） |
| `FileName` | String | 是 | 报告原始文件名（后端用于取后缀 + 安全校验） |

**响应示例：**

```json
{
  "status": "success",
  "doc_id": "xxxx-uuid",
  "report_path": "report/xxxx-uuid.pdf",
  "platform": "zhiwang"
}
```

---

### 7. **分步启动 docx 处理接口（可选）**

**接口地址：**

- `POST https://api3.speedai.chat/v1/docx/start`

**功能：**
用于“分步流程”启动处理：docx 文件需已在后端落盘（例如已上传到 `temp_docx/{doc_id}.docx`），可通过 `report_name` 复用 `report/` 下同 `doc_id` 的报告文件用于过滤。

**请求方式：**

- `POST`（FormData）

**请求参数：**

| 参数名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `doc_id` | String | 是 | 文档 ID |
| `FileName` | String | 是 | docx 原始文件名（展示用途） |
| `username` | String | 是 | API key |
| `mode` | String | 是 | `rewrite` / `deai` / `polish` |
| `type_` | String | 是 | `zhiwang`/`weipu`/`gezida`/`daya`/`turnitin`/`rewrite_*`/`rewrite_deep_*` |
| `changed_only` | Boolean | 否 | 是否仅返回修改部分 |
| `skip_english` | Boolean | 否 | 是否跳过英文 |
| `report_name` | String | 否 | 报告文件名或后缀（如 `xxx.pdf` / `.pdf` / `pdf`），用于复用 `report/{doc_id}{ext}` |

---

### 8. **文档处理状态检查接口（fallback）**

**接口地址：**

- `POST https://api3.speedai.chat/v1/docx/status`

**功能：**
检查已上传文档的处理状态。**不推荐轮询**，建议优先使用下面的 **WS 实时进度接口**；本接口保留作为 fallback/兼容用途。

**请求方式：**

- `POST`

**请求参数：**

| 参数名称      | 类型   | 必填 | 说明                    |
| ------------- | ------ | ---- | ----------------------- |
| `user_doc_id` | String | 是   | 文件处理后的唯一标识 ID |

**请求示例：**

```json
{
    "user_doc_id": "1234567890"
}
```

**响应示例：**

1. **处理中：**

   ```json
   {
       "status": "processing",
       "progress": 45
   }
   ```

2. **处理完成：**

   ```json
   {
       "status": "completed"
   }
   ```

3. **处理错误：**

   ```json
   {
       "status": "error",
       "error": "处理失败的原因"
   }
   ```

**使用示例：**

```javascript
// Function to check document processing status
function checkProcessingStatus(docId) {
  fetch("https://api3.speedai.chat/v1/docx/status", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_doc_id: docId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "completed") {
      output.innerHTML += `<p>Document processing completed.</p>`;
      downloadFile(docId, "Processed_Document");
    } else if (data.status === "processing") {
      output.innerHTML += `<p>Processing progress: ${data.progress}%</p>`;
      setTimeout(() => checkProcessingStatus(docId), 2000);  // Poll every 2 seconds
    } else {
      output.innerHTML += `<p style="color:red;">Error: ${data.error}</p>`;
    }
  })
  .catch(error => {
    console.error("Error:", error);
    output.innerHTML = `<p style="color:red;">Error checking status.</p>`;
  });
}
```

---

### 9. **文档实时进度（WebSocket，推荐）**

**接口地址：**

- `GET wss://api3.speedai.chat/v1/docx/progress?token=xxx&doc_id=xxx`

**功能：**
用 WebSocket 订阅 docx 处理进度与逐段结果，替代轮询 `/v1/docx/status`。

**关键点：**
- `token`：放在 query 参数里，但其值约定为 **apikey(username)**（即：`token=apikey`）
- `doc_id`：`/v1/docx` 返回的 `user_doc_id`
- 典型推送：`type=status|stage|progress|paragraph|need_pay|completed|error`（`ping` 可忽略）

**使用示例：**

```javascript
function startDocxProgressWS(docId) {
  const token = usernameInput.value; // 约定：token=apikey(username)
  const url = new URL("https://api3.speedai.chat/v1/docx/progress");
  url.protocol = "wss:";
  url.searchParams.set("token", token);
  url.searchParams.set("doc_id", docId);

  const ws = new WebSocket(url.toString());
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.type === "progress") {
      console.log("progress", msg.progress, msg.stage);
    } else if (msg.type === "paragraph") {
      console.log("paragraph", msg.index, msg.status);
    } else if (msg.type === "completed") {
      console.log("completed");
      ws.close();
    } else if (msg.type === "need_pay") {
      console.log("need_pay", msg.message);
      ws.close();
    } else if (msg.type === "error") {
      console.log("error", msg.error, msg.detail);
      ws.close();
    }
  };
}
```

### 错误代码对照表

| 错误代码 | 说明                    |
| -------- | ----------------------- |
| `200`    | 请求成功                |
| `400`    | 请求参数无效            |
| `401`    | 授权失败（API Key无效） |
| `404`    | 资源未找到              |
| `500`    | 服务器内部错误          |

---

### 常见问题：

1. **如何获取 `user_doc_id`？**
   - 通过WebSocket接口处理文件后，当状态为 `completed` 时会返回 `user_doc_id`，用于后续文件下载。
2. **是否可以只返回修改的部分？**
   - 可以，通过设置 `changed_only: true` 来控制返回内容，只返回修改的部分。
3. **如何监控文档处理进度？**
   - 推荐使用 WebSocket：`/v1/docx/progress`（实时推送进度与逐段结果）；`/v1/docx/status` 轮询仅作为 fallback。

---

如有其他问题，请联系技术支持或查看API参考手册。



## python 示例

```python
import requests
import asyncio
import websockets
import json
import os


def test_download_file(
        user_doc_id="",
        file_name="修改后论文"
):
    if user_doc_id == '':
        print("需要填写正确的user_doc_id")
        return
    response = requests.post(
        "https://api3.speedai.chat/v1/download",
        json={
            "user_doc_id": user_doc_id,
            "file_name": file_name,
        }
    )
    if response.status_code == 200:
        with open(f'{file_name}.docx', 'wb') as f:
            f.write(response.content)
        print(f'File {user_doc_id} downloaded successfully.')
    else:
        print('File not found or server error:', response.text)


def test_rewrite(
        text="有人说："学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
):
    response = requests.post(
        "https://api3.speedai.chat/v1/rewrite",
        json={
            "username": "test_api",
            "info": text,
            "lang": "Chinese",  # 可选Chinese和English
            "type": 'zhiwang',  # zhiwang weipu gezida
        }
    ).json()
    if response['code'] == 200:
        print(response['rewrite'])
    else:
        print("error")


def test_deai(
        text="有人说："学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
):
    response = requests.post(
        "https://api3.speedai.chat/v1/deai",
        json={
            "username": "test_api",
            "info": text,
            "lang": "Chinese",  # 可选Chinese和English
            "type": 'zhiwang',  # zhiwang weipu gezida
        }
    ).json()
    if response['code'] == 200:
        print(response['rewrite'])
    else:
        print("error")


async def send_file(file_path):
    async with websockets.connect('wss://api3.speedai.chat/v1/docx') as websocket:
        # Prepare file details
        file_details = {
            "FileName": os.path.basename(file_path),
            "apikey": "test_api",  # 旧 WS(/v1/docx) 示例仍使用 apikey 字段；新进度 WS 见下方 /v1/docx/progress
            "mode": "deai",  # Replace with actual mode [rewrite deai]
            "type": "weipu",  # Replace with actual type [zhiwang weipu gezida]
            "changed_only": True,  # Set true/false, if true, only the changed text will be returned
            "skip_english": False   # Set true/false, if true, the english text will not be processed.
        }

        # Send file details
        await websocket.send(json.dumps(file_details))

        # Send file content
        with open(file_path, "rb") as file:
            await websocket.send(file.read())

        # Receive responses and process them
        while True:
            response = await websocket.recv()
            data = json.loads(response)

            if data.get("status") == "error":
                print(f"Error: {data['error']}")
                break
            elif data.get("status") == "completed":
                print(f"Download the modified document using id : {data['user_doc_id']}")
                break
            else:
                print(f"Original: {data['original']}")
                print(f"Modified: {data['modified']}")
        return data['user_doc_id']


if __name__ == '__main__':
    # 1.修改全文
    # 设置docx文件路径
    file_path = '文本.docx'
    # 运行websocket获取实时逐步输出，同时获取最终的user_doc_id用于下一步的文件下载
    user_doc_id = asyncio.get_event_loop().run_until_complete(send_file(file_path))
    # 下载文件
    test_download_file(user_doc_id=user_doc_id, file_name="修改后论文")

    # 2.重写段落
    test_rewrite()

    # 3.降AI
    test_deai()

```

> 推荐：不要轮询 `/v1/docx/status`，请用 WS `/v1/docx/progress` 订阅进度（与本仓库 `main.py` 的 `subscribe_docx_progress` 一致）：

```python
import asyncio
import json
import websockets

async def subscribe_docx_progress(token: str, doc_id: str):
    ws_url = f"wss://api3.speedai.chat/v1/docx/progress?token={token}&doc_id={doc_id}&snapshot_chunk_size=50"
    async with websockets.connect(ws_url) as ws:
        while True:
            msg = json.loads(await ws.recv())
            t = msg.get("type")
            if t in ("ping", "pong"):
                continue
            if t == "progress":
                print("progress", msg.get("progress"), "stage", msg.get("stage"))
            elif t == "paragraph":
                print("paragraph", msg.get("index"), msg.get("status"))
            elif t in ("need_pay", "completed", "error"):
                print(t, msg)
                break
```

## HTML 示例

见index.html
