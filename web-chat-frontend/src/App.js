import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css'; // Import CSS file
import ChatBox from './ChatBox'; // Import ChatBox component

const backendUrl = 'http://localhost:5000'; // Replace with your actual backend URL

const App = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (text.trim() === '' && !recording) {
      // Do not send empty message if not recording
      return;
    }

    try {
      if (recording) {
        stopRecording();
        return;
      }

      if (text.trim() !== '') {
        await axios.post(`${backendUrl}/api/messages`, { text });
      }

      fetchMessages(); // Refresh messages after sending
      setText(''); // Clear input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };



  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>ReactChat</h1>
        <p>Check out the code on <a href="https://github.com/jdxm3i/ReactChatApp">GitHub</a></p>
      </div>
      <div className="chat-container">
        <div className="message-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${index === messages.length - 1 ? 'last-message' : ''}`}>
              {message.sent ? (
                <div className="sent-message">
                  {message.text && <p>{message.text}</p>}
                  {message.audioUrl && (
                    <audio controls>
                      <source src={message.audioUrl} type="audio/wav" />
                    </audio>
                  )}
                  <span className="time">{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="received-message">
                  {message.text && <p>{message.text}</p>}
                  {message.audioUrl && (
                    <audio controls>
                      <source src={message.audioUrl} type="audio/wav" />
                    </audio>
                  )}
                  <span className="time">{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <ChatBox text={text} setText={setText} sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};

export default App;
