import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { connectToChatServer } from '../chat/mock-chat-server';

const ChatWidget = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = connectToChatServer();

    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        user: user.name,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('message', message);
      setNewMessage('');
    }
  };

  return (
    <Paper 
      elevation={10}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300
      }}
    >
      <Box 
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Typography variant="h6">Chat Support</Typography>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <Avatar sx={{ mr: 2 }}>{msg.user.charAt(0)}</Avatar>
              <ListItemText primary={msg.text} secondary={msg.user} />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSendMessage}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton type="submit" color="primary">
                  <SendIcon />
                </IconButton>
              )
            }}
          />
        </form>
      </Box>
    </Paper>
  );
};

export default ChatWidget;
