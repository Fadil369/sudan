export const submitFeedback = async (feedbackData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock API: Feedback received:', feedbackData);
      resolve({ success: true, message: 'Feedback submitted successfully!' });
    }, 1000);
  });
};
