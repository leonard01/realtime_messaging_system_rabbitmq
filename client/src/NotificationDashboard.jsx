import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the Socket.IO server (adjust the URL and port if needed)
const socket = io('http://localhost:3000');

const NotificationDashboard = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for the 'notification' event from the server
    socket.on('notification', (data) => {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    // Clean up the listener on component unmount
    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Real-Time Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {notifications.map((notif, index) => (
            <li key={index}>
              <strong>{notif.timestamp}</strong>: {notif.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDashboard;
