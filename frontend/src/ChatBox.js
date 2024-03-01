import React from 'react';

const ChatBox = ({ text, setText, sendMessage }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default behavior of Enter key
      sendMessage(); // Call sendMessage function
    }
  };

  return (
    <div className="chat-box">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown} // Add keydown event listener
        placeholder="Type your message..."
        className="chat-input"
      />
      <button onClick={sendMessage} className="send-button">Send</button>
    </div>
  );
};

export default ChatBox;
