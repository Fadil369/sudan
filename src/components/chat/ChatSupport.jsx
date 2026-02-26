import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Paper,
  Grid,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Translate as TranslateIcon,
  Support as SupportIcon,
  Phone as PhoneIcon,
  VideoCall as VideoIcon,
  MoreVert as MoreIcon,
  Star as RatingIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  PersonAdd as TransferIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const ChatSupport = ({ citizenData, isOpen, onClose }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [supportAgent, setSupportAgent] = useState(null);
  const [chatRating, setChatRating] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  
  const messagesEndRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const supportAgents = [
    {
      id: 'agent_001',
      name: 'أحمد محمد / Ahmed Mohammed',
      avatar: '/avatars/agent1.jpg',
      status: 'online',
      department: 'technical',
      languages: ['ar', 'en'],
      rating: 4.8
    },
    {
      id: 'agent_002', 
      name: 'فاطمة أحمد / Fatima Ahmed',
      avatar: '/avatars/agent2.jpg',
      status: 'online',
      department: 'legal',
      languages: ['ar', 'en'],
      rating: 4.9
    },
    {
      id: 'agent_003',
      name: 'محمد عثمان / Mohammed Osman',
      avatar: '/avatars/agent3.jpg',
      status: 'busy',
      department: 'services',
      languages: ['ar', 'en'],
      rating: 4.7
    }
  ];

  const quickResponses = [
    { ar: 'كيف يمكنني مساعدتك؟', en: 'How can I help you?' },
    { ar: 'أحتاج مساعدة في تجديد الهوية', en: 'I need help renewing my ID' },
    { ar: 'مشكلة في الدخول للحساب', en: 'Login problem' },
    { ar: 'استفسار عن الخدمات', en: 'Service inquiry' },
    { ar: 'تحديث البيانات الشخصية', en: 'Update personal data' },
    { ar: 'شكراً لكم', en: 'Thank you' }
  ];

  useEffect(() => {
    if (isOpen && !chatSession) {
      initializeChatSession();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate receiving messages
    const interval = setInterval(() => {
      if (chatSession && Math.random() < 0.1) { // 10% chance every interval
        receiveMessage();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [chatSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChatSession = async () => {
    try {
      // Simulate finding available agent
      const availableAgent = supportAgents.find(agent => agent.status === 'online');
      setSupportAgent(availableAgent);

      const session = {
        id: `chat_${Date.now()}`,
        startTime: new Date().toISOString(),
        citizenId: citizenData?.oid || 'anonymous',
        agentId: availableAgent?.id,
        status: 'active',
        department: 'general'
      };

      setChatSession(session);

      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        content: isRTL 
          ? `مرحباً بك في خدمة الدعم الفوري، أنا ${availableAgent?.name.split(' / ')[0]}، كيف يمكنني مساعدتك اليوم؟`
          : `Welcome to live support. I'm ${availableAgent?.name.split(' / ')[1] || availableAgent?.name}, how can I help you today?`,
        timestamp: new Date().toISOString(),
        type: 'text',
        agent: availableAgent
      };

      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    }
  };

  const sendMessage = async (content = newMessage, type = 'text') => {
    if (!content.trim() && type === 'text') return;

    const message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: content,
      timestamp: new Date().toISOString(),
      type: type
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate AI/Agent response after delay
    setTimeout(() => {
      receiveMessage(content);
    }, 1000 + Math.random() * 2000);
  };

  const receiveMessage = (userMessage = '') => {
    setIsTyping(false);

    // Generate contextual response based on user message
    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('هوية') || lowerMessage.includes('identity') || lowerMessage.includes('id')) {
      response = isRTL 
        ? 'يمكنني مساعدتك في جميع الأمور المتعلقة بالهوية الرقمية. ما هي المشكلة تحديداً؟'
        : 'I can help you with all digital identity matters. What specific issue are you facing?';
    } else if (lowerMessage.includes('تجديد') || lowerMessage.includes('renew')) {
      response = isRTL
        ? 'لتجديد الهوية، يرجى الدخول إلى قسم "خدماتي" واتباع الخطوات المطلوبة. هل تحتاج إلى مساعدة إضافية؟'
        : 'To renew your ID, please go to "My Services" section and follow the required steps. Do you need additional assistance?';
    } else if (lowerMessage.includes('دخول') || lowerMessage.includes('login')) {
      response = isRTL
        ? 'إذا واجهت مشكلة في الدخول، تأكد من صحة البيانات أو استخدم خاصية إعادة تعيين كلمة المرور. هل جربت ذلك؟'
        : 'If you\'re having login issues, please verify your credentials or use the password reset feature. Have you tried that?';
    } else {
      const responses = [
        isRTL ? 'أفهم مشكلتك، دعني أساعدك في حلها.' : 'I understand your concern, let me help you resolve it.',
        isRTL ? 'شكراً لك على التواصل. ما الذي تحتاج إليه تحديداً؟' : 'Thank you for reaching out. What specifically do you need?',
        isRTL ? 'يمكنني توجيهك للقسم المناسب أو المساعدة مباشرة.' : 'I can direct you to the appropriate department or help directly.',
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    const agentMessage = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      content: response,
      timestamp: new Date().toISOString(),
      type: 'text',
      agent: supportAgent
    };

    setMessages(prev => [...prev, agentMessage]);

    // Update unread count if minimized
    if (isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendMessage(audioUrl, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const endChat = () => {
    if (messages.length > 1) {
      setShowRatingDialog(true);
    } else {
      onClose();
    }
  };

  const submitRating = (rating, feedback = '') => {
    setChatRating(rating);
    // Here you would send rating to backend
    console.log('Chat rated:', rating, feedback);
    setShowRatingDialog(false);
    onClose();
  };

  const transferToAgent = (departmentOrAgent) => {
    const transferMessage = {
      id: `msg_${Date.now()}`,
      sender: 'system',
      content: isRTL 
        ? `تم تحويل المحادثة إلى ${departmentOrAgent}`
        : `Chat transferred to ${departmentOrAgent}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    setMessages(prev => [...prev, transferMessage]);
    setShowTransferDialog(false);
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          flexDirection: isRTL ? (isUser ? 'row-reverse' : 'row') : (isUser ? 'row-reverse' : 'row'),
          mb: 1,
          alignItems: 'flex-end'
        }}
      >
        {!isUser && !isSystem && (
          <Avatar
            src={message.agent?.avatar}
            sx={{ width: 32, height: 32, mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0 }}
          >
            <SupportIcon />
          </Avatar>
        )}
        
        <Paper
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: isSystem 
              ? 'grey.100' 
              : isUser 
                ? 'primary.main' 
                : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            ...(isSystem && { 
              textAlign: 'center', 
              fontStyle: 'italic',
              color: 'text.secondary' 
            })
          }}
        >
          {message.type === 'audio' ? (
            <audio controls src={message.content} style={{ width: '200px' }} />
          ) : (
            <Typography variant="body2">
              {message.content}
            </Typography>
          )}
          
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
    );
  };

  if (!isOpen) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: '100vw', sm: 400 },
          height: '100vh'
        }
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Avatar sx={{ mr: 2 }}>
            <ChatIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {isRTL ? 'الدعم الفوري' : 'Live Support'}
            </Typography>
            {supportAgent && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {isRTL 
                  ? `مع ${supportAgent.name.split(' / ')[0]}` 
                  : `with ${supportAgent.name.split(' / ')[1] || supportAgent.name}`
                }
              </Typography>
            )}
          </Box>
          
          <IconButton
            color="inherit"
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
          >
            <MoreIcon />
          </IconButton>
          
          <IconButton color="inherit" onClick={endChat}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map(renderMessage)}
        
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              <SupportIcon />
            </Avatar>
            <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="body2" color="textSecondary">
                {isRTL ? 'يكتب...' : 'Typing...'}
              </Typography>
              <LinearProgress size="small" />
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Responses */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {isRTL ? 'ردود سريعة:' : 'Quick responses:'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {quickResponses.slice(0, 3).map((response, index) => (
            <Chip
              key={index}
              label={response[isRTL ? 'ar' : 'en']}
              size="small"
              onClick={() => sendMessage(response[isRTL ? 'ar' : 'en'])}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            size="small"
          />
          
          <IconButton
            color={isRecording ? 'error' : 'default'}
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          
          <IconButton color="primary" onClick={() => sendMessage()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
      >
        <MenuItemComponent onClick={() => setShowTransferDialog(true)}>
          <TransferIcon sx={{ mr: 1 }} />
          {isRTL ? 'تحويل المحادثة' : 'Transfer Chat'}
        </MenuItemComponent>
        <MenuItemComponent>
          <PhoneIcon sx={{ mr: 1 }} />
          {isRTL ? 'مكالمة صوتية' : 'Voice Call'}
        </MenuItemComponent>
        <MenuItemComponent>
          <VideoIcon sx={{ mr: 1 }} />
          {isRTL ? 'مكالمة فيديو' : 'Video Call'}
        </MenuItemComponent>
      </Menu>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onClose={() => setShowTransferDialog(false)}>
        <DialogTitle>
          {isRTL ? 'تحويل المحادثة' : 'Transfer Chat'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{isRTL ? 'اختر القسم' : 'Select Department'}</InputLabel>
            <Select defaultValue="">
              <MenuItem value="technical">
                {isRTL ? 'الدعم التقني' : 'Technical Support'}
              </MenuItem>
              <MenuItem value="legal">
                {isRTL ? 'الشؤون القانونية' : 'Legal Affairs'}
              </MenuItem>
              <MenuItem value="services">
                {isRTL ? 'خدمات المواطنين' : 'Citizen Services'}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransferDialog(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => transferToAgent('Technical Support')}>
            {isRTL ? 'تحويل' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onClose={() => setShowRatingDialog(false)}>
        <DialogTitle>
          {isRTL ? 'قيم تجربتك' : 'Rate Your Experience'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {isRTL 
              ? 'كيف كانت تجربتك مع خدمة الدعم؟'
              : 'How was your experience with our support service?'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setChatRating(star)}
                color={star <= chatRating ? 'primary' : 'default'}
              >
                <RatingIcon />
              </IconButton>
            ))}
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label={isRTL ? 'تعليقاتك (اختيارية)' : 'Your feedback (optional)'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => submitRating(0)}>
            {isRTL ? 'تخطي' : 'Skip'}
          </Button>
          <Button variant="contained" onClick={() => submitRating(chatRating)}>
            {isRTL ? 'إرسال' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

// Chat Support FAB Component
export const ChatSupportFAB = ({ citizenData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          [isRTL ? 'left' : 'right']: 24,
          zIndex: 1000
        }}
        onClick={() => setIsOpen(true)}
      >
        <Badge color="error" variant="dot" invisible={!hasNewMessages}>
          <ChatIcon />
        </Badge>
      </Fab>

      <ChatSupport
        citizenData={citizenData}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setHasNewMessages(false);
        }}
      />
    </>
  );
};

export default ChatSupport;