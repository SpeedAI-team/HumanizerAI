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
        "https://api.speedai.vip/v1/download",
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
        text="有人说：“学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
):
    response = requests.post(
        "https://api.speedai.vip/v1/rewrite",
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
        text="有人说：“学生是一艘轮船，在知识的海洋中航行，能否顺利到达成功的彼岸，教师这个航标起到导航的关键作用。",
):
    response = requests.post(
        "https://api.speedai.vip/v1/deai",
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
    async with websockets.connect('wss://api.speedai.vip/v1/docx') as websocket:
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


async def subscribe_docx_progress(*, token: str, doc_id: str, base_ws: str = "wss://api3.speedai.chat"):
    """
    订阅 AISurvey 最新 docx 处理进度：/v1/docx/progress
    - 连接方式：ws(s)://host/v1/docx/progress?token=xxx&doc_id=xxx
    - 服务端推送：type=status/progress/paragraph/completed/need_pay/stage/error/...
    """
    token = (token or "").strip()
    doc_id = (doc_id or "").strip()
    if not token or not doc_id:
        raise ValueError("token 和 doc_id 必填")

    ws_url = f"{base_ws.rstrip('/')}/v1/docx/progress?token={token}&doc_id={doc_id}&snapshot_chunk_size=50"
    async with websockets.connect(ws_url) as websocket:
        while True:
            raw = await websocket.recv()
            try:
                msg = json.loads(raw)
            except Exception:
                continue

            t = msg.get("type")
            if t in ("ping", "pong"):
                continue

            # 你可以在这里做更复杂的渲染（逐段输出、进度条等）
            if t == "progress":
                print(f"[progress] doc_id={doc_id} {msg.get('progress')}% stage={msg.get('stage')}")
                continue

            if t == "paragraph":
                idx = msg.get("index")
                st = msg.get("status")
                if st == "processed":
                    print(f"[paragraph] #{idx} processed cost={msg.get('cost')}")
                elif st == "skipped":
                    print(f"[paragraph] #{idx} skipped reason={msg.get('skip_reason')}")
                else:
                    print(f"[paragraph] #{idx} status={st} detail={msg.get('detail') or msg.get('error')}")
                continue

            if t == "need_pay":
                print(f"[need_pay] {msg.get('message')} hint={msg.get('hint')}")
                break

            if t == "completed":
                print("[completed] 处理完成，可以调用 /v1/download 下载")
                break

            if t == "error":
                print(f"[error] {msg.get('error')} detail={msg.get('detail')}")
                break

            # 其他：status/stage/doc_meta/doc_snapshot_* 等
            print(f"[event] {msg}")


if __name__ == '__main__':
    # 1.修改全文
    # 设置docx文件路径
    file_path = '文本.docx'
    # 运行websocket获取实时逐步输出，同时获取最终的user_doc_id用于下一步的文件下载
    user_doc_id = asyncio.get_event_loop().run_until_complete(send_file(file_path))
    # 下载文件
    test_download_file(user_doc_id=user_doc_id, file_name="修改后论文")

    # 4.（可选）订阅最新进度 WS（需要你填 token，且 doc_id 来自 /v1/docx 的返回）
    # token = "YOUR_BEARER_TOKEN"
    # asyncio.get_event_loop().run_until_complete(subscribe_docx_progress(token=token, doc_id=user_doc_id))

    # 2.重写段落
    test_rewrite()

    # 3.降AI
    test_deai()
