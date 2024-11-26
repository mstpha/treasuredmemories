// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../axiosConfig';

const UserContext = createContext();

export function UserProvider({ children }) {
  // Initialize state from localStorage if it exists
  const [memid, setMemid] = useState();
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      name: '',
      id: null,
      token: null,
    };
  });

  // Add map control functions
  const [disableMapFn, setDisableMapFn] = useState(() => () => {});
  const [enableMapFn, setEnableMapFn] = useState(() => () => {});

  // Function to set map control functions
  const setMapControls = (disable, enable) => {
    setDisableMapFn(() => disable);
    setEnableMapFn(() => enable);
  };

  // Effect for localStorage
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Updated socket connection logic
  useEffect(() => {
    if (user.id && !socket) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')).accessToken : null
        },
        transports: ['polling', 'websocket'], // Note the order here is important
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      newSocket.on('notification', (notification) => {
        console.log('Received notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user.id]);

  // Fetch initial notifications on login
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user.id) {
        try {
          const response = await api.get(`/notification/${user.id}`);
          setNotifications(response.data.data);
          const unreadResponse = await api.get(`/notification/unread/${user.id}`);
          setUnreadCount(unreadResponse.data.data.length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [user.id]);

  const updateMemoriesShowcase = (memoid) => {
    setMemid(memoid);
  };

  const updateUser = (name, id) => {
    setUser({
      name,
      id,
    });
  };

  const logout = () => {
    setUser({
      name: '',
      id: null,
    });
    localStorage.removeItem('user');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setNotifications([]);
    setUnreadCount(0);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notification/${notificationId}`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user.id) return;
    try {
      await api.put(`/notification/all/${user.id}`);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user,
      memid,
      updateMemoriesShowcase, 
      updateUser, 
      logout,
      setMapControls,
      disableMap: disableMapFn,
      enableMap: enableMapFn,
      isAnyModalOpen,
      setIsAnyModalOpen,
      // Notification-related values
      notifications,
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      socket
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;