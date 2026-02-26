import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';

const FeedbackForm = ({ language = 'en' }) => {
  const isRTL = language === 'ar';

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log({ subject, category, message, contact });
    setSnackbarMessage(isRTL ? 'تم إرسال ملاحظاتك بنجاح!' : 'Feedback submitted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setSubject('');
    setCategory('');
    setMessage('');
    setContact('');
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isRTL ? 'نظام ملاحظات المواطنين' : 'Citizen Feedback System'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={isRTL ? 'الموضوع' : 'Subject'}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{isRTL ? 'الفئة' : 'Category'}</InputLabel>
            <Select
              value={category}
              label={isRTL ? 'الفئة' : 'Category'}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="suggestion">{isRTL ? 'اقتراح' : 'Suggestion'}</MenuItem>
              <MenuItem value="complaint">{isRTL ? 'شكوى' : 'Complaint'}</MenuItem>
              <MenuItem value="bug">{isRTL ? 'تقرير خطأ' : 'Bug Report'}</MenuItem>
              <MenuItem value="other">{isRTL ? 'أخرى' : 'Other'}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={isRTL ? 'الرسالة' : 'Message'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label={isRTL ? 'معلومات الاتصال (اختياري)' : 'Contact Information (Optional)'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            margin="normal"
            helperText={isRTL ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            {isRTL ? 'إرسال الملاحظات' : 'Submit Feedback'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackForm;
