import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Fade,
  Collapse,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Chat,
  Send,
  Mic,
  MicOff,
  Close,
  ExpandMore,
  ExpandLess,
  Help,
  Psychology,
  Language,
  VolumeUp,
  ThumbUp,
  ThumbDown,
  AutoAwesome,
  Security,
  AccountBalance
} from '@mui/icons-material';
import { OID_ROOT } from '../config/oidConfig';

const AIAssistant = ({ language = 'en', isRTL = false, userId = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assistantMood, setAssistantMood] = useState('helpful');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [conversationContext, setConversationContext] = useState('general');

  // AI Assistant personality configuration
  const assistantPersonality = useMemo(() => ({
    name: language === 'ar' ? 'حكيم' : 'Hakim',
    description: language === 'ar' 
      ? 'مساعد حكومي ذكي للخدمات السودانية' 
      : 'Your intelligent Sudan Government Services assistant',
    avatar: '🧠', // Could be replaced with actual avatar image
    expertise: [
      'government services',
      'OID system navigation',
      'document requirements',
      'application processes',
      'Sudan regulations',
      'ministry information'
    ],
    personality_traits: {
      helpful: { emoji: '😊', description: 'Ready to help with any government service' },
      thinking: { emoji: '🤔', description: 'Processing your request...' },
      excited: { emoji: '🌟', description: 'Great question! Let me help you with that' },
      concerned: { emoji: '😟', description: 'I want to make sure I give you accurate information' },
      confident: { emoji: '💪', description: 'I know exactly how to help you!' }
    }
  }), [language]);

  // Predefined responses with cultural awareness
  const responseDatabase = useMemo(() => ({
    greetings: {
      en: [
        "Hello! I'm Hakim, your Sudan Government Services assistant. How can I help you today?",
        "Welcome to the Sudan OID Portal! I'm here to guide you through any government services.",
        "Greetings! I'm Hakim, ready to assist with your government service needs."
      ],
      ar: [
        "أهلاً وسهلاً! أنا حكيم، مساعدك للخدمات الحكومية السودانية. كيف يمكنني مساعدتك اليوم؟",
        "مرحباً بك في بوابة OID السودانية! أنا هنا لإرشادك في أي خدمة حكومية.",
        "السلام عليكم! أنا حكيم، مستعد لمساعدتك في احتياجاتك للخدمات الحكومية."
      ]
    },
    services: {
      en: [
        "I can help you with various government services including health, education, finance, justice, and more. What specific service are you looking for?",
        "Our portal offers services from 11 different ministries. Would you like me to guide you to a specific department?",
        "From passport renewals to business licenses, I can help you navigate any government service. What do you need assistance with?"
      ],
      ar: [
        "يمكنني مساعدتك في الخدمات الحكومية المختلفة بما في ذلك الصحة والتعليم والمالية والعدالة وغيرها. ما الخدمة المحددة التي تبحث عنها؟",
        "تقدم بوابتنا خدمات من 11 وزارة مختلفة. هل تريد مني توجيهك إلى قسم معين؟",
        "من تجديد جوازات السفر إلى تراخيص الأعمال، يمكنني مساعدتك في التنقل في أي خدمة حكومية. ما الذي تحتاج المساعدة فيه؟"
      ]
    },
    oid: {
      en: [
        "The OID (Object Identifier) system helps organize and identify government services efficiently. Each ministry has its own OID branch for better service management.",
        "Our OID system follows international standards to ensure seamless integration with global systems while serving Sudan's unique needs.",
        `The Sudan OID structure starts with ${OID_ROOT} and branches out to different ministries and services.`
      ],
      ar: [
        "نظام OID (معرف الكائن) يساعد في تنظيم وتحديد الخدمات الحكومية بكفاءة. كل وزارة لديها فرع OID الخاص بها لإدارة أفضل للخدمات.",
        "يتبع نظام OID الخاص بنا المعايير الدولية لضمان التكامل السلس مع الأنظمة العالمية مع خدمة احتياجات السودان الفريدة.",
        `يبدأ هيكل OID السوداني بـ ${OID_ROOT} ويتفرع إلى الوزارات والخدمات المختلفة.`
      ]
    },
    error: {
      en: [
        "I apologize, but I didn't quite understand your question. Could you please rephrase it?",
        "I'm still learning! Could you provide more details about what you need help with?",
        "That's an interesting question. Let me connect you with the appropriate ministry for detailed information."
      ],
      ar: [
        "أعتذر، ولكنني لم أفهم سؤالك تماماً. هل يمكنك إعادة صياغته من فضلك؟",
        "ما زلت أتعلم! هل يمكنك تقديم المزيد من التفاصيل حول ما تحتاج المساعدة فيه؟",
        "هذا سؤال مثير للاهتمام. دعني أوصلك بالوزارة المناسبة للحصول على معلومات مفصلة."
      ]
    }
  }), []);

  // Context-aware suggested questions
  const contextualSuggestions = useMemo(() => ({
    general: {
      en: [
        "How do I register for government services?",
        "What documents do I need for passport renewal?",
        "How can I check my application status?",
        "What are the available online services?"
      ],
      ar: [
        "كيف يمكنني التسجيل للخدمات الحكومية؟",
        "ما الوثائق التي أحتاجها لتجديد جواز السفر؟",
        "كيف يمكنني فحص حالة طلبي؟",
        "ما هي الخدمات الإلكترونية المتاحة؟"
      ]
    },
    health: {
      en: [
        "How do I book a medical appointment?",
        "Where can I get my vaccination certificate?",
        "How do I register for health insurance?",
        "What are the emergency medical services?"
      ],
      ar: [
        "كيف يمكنني حجز موعد طبي؟",
        "أين يمكنني الحصول على شهادة التطعيم؟",
        "كيف يمكنني التسجيل للتأمين الصحي؟",
        "ما هي خدمات الطوارئ الطبية؟"
      ]
    },
    education: {
      en: [
        "How do I apply for university admission?",
        "Where can I get my academic certificates verified?",
        "What are the scholarship opportunities?",
        "How do I register my child for school?"
      ],
      ar: [
        "كيف يمكنني التقدم للقبول الجامعي؟",
        "أين يمكنني توثيق شهاداتي الأكاديمية؟",
        "ما هي فرص المنح الدراسية؟",
        "كيف يمكنني تسجيل طفلي في المدرسة؟"
      ]
    }
  }), []);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'assistant',
        text: responseDatabase.greetings[language][0],
        timestamp: new Date(),
        mood: 'helpful'
      };
      setMessages([welcomeMessage]);
      setSuggestedQuestions(contextualSuggestions.general[language]);
      setAssistantMood('helpful');
    }
  }, [isOpen, messages.length, language, responseDatabase, contextualSuggestions]);

  // Process user message and generate response
  const processMessage = useCallback(async (userMessage) => {
    setIsTyping(true);
    
    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const messageText = userMessage.toLowerCase();
    let responseCategory = 'error';
    let newMood = 'helpful';
    let newContext = conversationContext;
    
    // Simple keyword matching for demo (in production, use NLP/ML)
    if (messageText.includes('hello') || messageText.includes('hi') || messageText.includes('مرحبا') || messageText.includes('سلام')) {
      responseCategory = 'greetings';
      newMood = 'excited';
    } else if (messageText.includes('service') || messageText.includes('help') || messageText.includes('خدمة') || messageText.includes('مساعدة')) {
      responseCategory = 'services';
      newMood = 'confident';
      newContext = 'general';
    } else if (messageText.includes('oid') || messageText.includes('identifier') || messageText.includes('معرف')) {
      responseCategory = 'oid';
      newMood = 'thinking';
    } else if (messageText.includes('health') || messageText.includes('medical') || messageText.includes('صحة') || messageText.includes('طبي')) {
      responseCategory = 'services';
      newContext = 'health';
      newMood = 'helpful';
    } else if (messageText.includes('education') || messageText.includes('school') || messageText.includes('تعليم') || messageText.includes('مدرسة')) {
      responseCategory = 'services';
      newContext = 'education';
      newMood = 'helpful';
    }
    
    const responses = responseDatabase[responseCategory][language];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      text: randomResponse,
      timestamp: new Date(),
      mood: newMood,
      context: newContext
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setAssistantMood(newMood);
    setConversationContext(newContext);
    setSuggestedQuestions(contextualSuggestions[newContext]?.[language] || contextualSuggestions.general[language]);
    setIsTyping(false);
  }, [conversationContext, language, responseDatabase, contextualSuggestions]);

  // Handle user input
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    await processMessage(inputText);
  }, [inputText, processMessage]);

  // Handle suggested question click
  const handleSuggestedQuestion = useCallback((question) => {
    setInputText(question);
  }, []);

  // Voice input simulation (would integrate with actual speech recognition)
  const toggleVoiceInput = useCallback(() => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setInputText(language === 'ar' ? 'أريد المساعدة في الخدمات الحكومية' : 'I need help with government services');
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  }, [isListening, language]);

  const currentPersonality = assistantPersonality.personality_traits[assistantMood];

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title={language === 'ar' ? 'مساعد ذكي' : 'AI Assistant'}>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: isRTL ? 'auto' : 20,
            left: isRTL ? 20 : 'auto',
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #ce1126 0%, #a00e1f 100%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(206, 17, 38, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a00e1f 0%, #7a0a17 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 30px rgba(206, 17, 38, 0.6)'
            },
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            zIndex: 1000
          }}
        >
          <AutoAwesome sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>

      {/* Chat Dialog */}
      <Fade in={isOpen}>
        <Card
          sx={{
            position: 'fixed',
            bottom: 100,
            right: isRTL ? 'auto' : 20,
            left: isRTL ? 20 : 'auto',
            width: 400,
            maxWidth: '90vw',
            height: 600,
            maxHeight: '80vh',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            zIndex: 1001,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            borderRadius: 3,
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ce1126 0%, #a00e1f 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Typography sx={{ fontSize: '1.5rem' }}>
                {currentPersonality.emoji}
              </Typography>
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {assistantPersonality.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {currentPersonality.description}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'white' }}>
                <Language />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={() => setIsOpen(false)}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            <List sx={{ py: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    py: 1,
                    px: 2
                  }}
                >
                  <Card
                    sx={{
                      maxWidth: '80%',
                      bgcolor: message.type === 'user' 
                        ? 'linear-gradient(135deg, #ce1126 0%, #a00e1f 100%)'
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      color: message.type === 'user' ? 'white' : 'text.primary',
                      borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      animation: 'messageSlide 0.3s ease-out'
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="body2">
                        {message.text}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ mt: 0.5, px: 1 }}
                  >
                    {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SD' : 'en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </ListItem>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <ListItem sx={{ alignItems: 'flex-start', py: 1, px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <Typography sx={{ fontSize: '1rem' }}>
                        {assistantPersonality.personality_traits.thinking.emoji}
                      </Typography>
                    </Avatar>
                    <Card sx={{ bgcolor: '#f5f5f5', borderRadius: '20px 20px 20px 5px' }}>
                      <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {[0, 1, 2].map((dot) => (
                            <Box
                              key={dot}
                              sx={{
                                width: 8,
                                height: 8,
                                bgcolor: '#ce1126',
                                borderRadius: '50%',
                                animation: 'typingDot 1.4s infinite',
                                animationDelay: `${dot * 0.2}s`
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </ListItem>
              )}
            </List>
          </Box>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {language === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {suggestedQuestions.slice(0, 2).map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    size="small"
                    onClick={() => handleSuggestedQuestion(question)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#ce1126',
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.8)'
                  }
                }}
              />
              <IconButton
                onClick={toggleVoiceInput}
                color={isListening ? "error" : "primary"}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  animation: isListening ? 'pulse 1s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff /> : <Mic />}
              </IconButton>
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                color="primary"
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  bgcolor: '#ce1126',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#a00e1f'
                  },
                  '&:disabled': {
                    bgcolor: '#ccc'
                  }
                }}
              >
                {isTyping ? <CircularProgress size={20} color="inherit" /> : <Send />}
              </IconButton>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Custom Animations */}
      <style>{`
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes typingDot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
