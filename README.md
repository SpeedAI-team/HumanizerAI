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

所有请求都需要在header中添加token
```
 'Authorization': `Bearer ${token}`
```

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
| `apikey` | String | 是   | API密钥                                 |
| `info`   | String | 是   | 需要重写的文本                          |
| `lang`   | String | 是   | 文本语言 (`Chinese` 或 `English`)       |
| `type`   | String | 是   | 重写类型 (`zhiwang`, `weipu`, `gezida`) |

**请求示例：**

```json
{
    "apikey": "test_api",
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
| `apikey` | String | 是   | API密钥                                 |
| `info`   | String | 是   | 需要降AI处理的文本                      |
| `lang`   | String | 是   | 文本语言 (`Chinese` 或 `English`)       |
| `type`   | String | 是   | 降AI类型 (`zhiwang`, `weipu`, `gezida`) |

**请求示例：**

```json
{
    "apikey": "test_api",
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

### 4. **WebSocket文件上传和实时处理接口**

**接口地址：**

- `wss://api3.speedai.chat/v1/docx`

**功能：**
通过WebSocket连接上传Word文档（`.docx`），并实时获取处理进度和修改结果。

**请求方式：**

- `WebSocket`

**请求参数：**
通过WebSocket连接时发送以下JSON格式的参数：

| 参数名称       | 类型    | 必填 | 说明                                          |
| -------------- | ------- | ---- | --------------------------------------------- |
| `FileName`     | String  | 是   | 上传文件的名称                                |
| `apikey`       | String  | 是   | API密钥                                       |
| `mode`         | String  | 是   | 处理模式 (`rewrite` 或 `deai`)                |
| `type`         | String  | 是   | 处理类型 (`zhiwang`, `weipu`, `gezida`)       |
| `changed_only` | Boolean | 否   | 是否仅返回修改部分（`true` 为仅返回修改部分） |
| `skip_english` | Boolean | 否   | 是否跳过英文部分（`true` 为不处理英文部分）   |

**请求示例：**

```json
{
    "FileName": "mydocument.docx",
    "apikey": "test_api",
    "mode": "deai",
    "type": "weipu",
    "changed_only": true,
    "skip_english": true
}
```

**实时返回格式：**

1. **修改部分返回：**

   ```json
   {
       "status": "running",
       "original": "学生是一艘轮船",
       "modified": "学生如同一艘船只"
   }
   ```

2. **处理完成：**

   ```json
   {
       "status": "completed",
       "user_doc_id": "1234567890"
   }
   ```

3. **错误返回：**

   ```json
   {
       "status": "error",
       "error": "File format not supported"
   }
   ```

### 5. **文档处理状态检查接口**

**接口地址：**

- `POST https://api3.speedai.chat/v1/docx/status`

**功能：**
检查已上传文档的处理状态，可用于轮询获取处理进度。

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
  const token = tokenInput.value;
  fetch("https://api3.speedai.chat/v1/docx/status", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
   - 可以使用文档处理状态检查接口，通过轮询方式获取处理进度。

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
            "apikey": "test_api",
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
            "apikey": "test_api",
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
            "apikey": "test_api",  # Replace with actual API key
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

## HTML 示例

见index.html
