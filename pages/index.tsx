import io from 'socket.io-client';
import { useState } from 'react';

export default function Home() {
  interface chat {
    id: number;
    name?: string;
    content?: string;
  }

  const [messages, setMessages] = useState<(chat | undefined)[]>([]);
  const [message, setMessage] = useState<chat>({
    id: 0,
    name: 'yuki',
    content: 'hello',
  });

  const socket = io('http://localhost:3001');

  socket.on('connect', () => {
    // either with send()
    socket.send('connect to server');
  });
  // handle the event sent with socket.send()
  socket.on('message', (data: string) => {
    console.log(`message: ${data}`);
  });

  socket.on('recieve', (data: string) => {
    console.log(data);
  });

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    // messages stateの更新
    setMessages([...messages, message]);
    // messageのid更新
    setMessage({
      id: message.id + 1,
      name: message?.name,
      content: message?.content,
    });
    console.log('set messages!');
    // serverにメッセージの送信
    socket.emit('content', messages);
    socket.on('content', (messages: (chat | undefined)[]) => {
      console.log(messages);
    });
  }

  function handleChangeMessage(e: any) {
    // stateのmessageを修正
    setMessage({
      id: message.id,
      name: message?.name,
      content: e.target.value,
    });
  }

  function handleChangeName(e: any) {
    // stateのnameを修正
    setMessage({
      id: message.id,
      name: e.target.value,
      content: message?.content,
    });
  }

  return (
    <div>
      <h1>ルーム</h1>
      <h2>Chat</h2>
      <form onSubmit={handleSubmit}>
        <label>
          name:
          <input type="text" name="name" onChange={handleChangeName} />
        </label>
        <label>
          chat:
          <input type="text" name="message" onChange={handleChangeMessage} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      {messages.map((message: chat | undefined) => {
        return <li>{message?.content}</li>;
      })}
    </div>
  );
}
