import styles from '../styles/Home.module.css';
import io from 'socket.io-client';

export default function Home() {
  const socket = io('http://localhost:3001');

  socket.on('connect', () => {
    // either with send()
    socket.send('connect to server');
  });
  // handle the event sent with socket.send()
  socket.on('message', (data) => {
    console.log(`message: ${data}`);
  });

  socket.on('recieve', (data) => {
    console.log(data);
  });
  return (
    <div className={styles.container}>
      <h1>ルーム</h1>
    </div>
  );
}
