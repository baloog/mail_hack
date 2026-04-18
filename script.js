// ==========================================
// MAIL APP - JavaScript Logic
// ==========================================

// Hardcoded messages data - simulates a database
const messages = [
  {
    id: 1,
    sender: "john@example.com",
    subject: "Project Update",
    body: "Hi,\n\nHere's the latest update on the project. Everything is progressing well and we're on track for the deadline.\n\nBest regards,\nJohn"
  },
  {
    id: 2,
    sender: "sarah@example.com",
    subject: "Meeting Tomorrow",
    body: "Don't forget about our meeting tomorrow at 2 PM. We'll be discussing the Q2 roadmap.\n\nSee you then!\nSarah"
  },
  {
    id: 3,
    sender: "alex@example.com",
    subject: "Code Review",
    body: "I've reviewed your pull request. Great work overall! Just a few minor suggestions:\n\n1. Consider refactoring the utility function\n2. Add more comments to explain the logic\n\nLet's discuss this in our next standup.\n\nAlex"
  }
];

// Sent messages array - stores replies
const sentMessages = [];

// Variable to track which message is currently selected
let selectedMessageId = null;

// Voice reply flow state tracking
let isInVoiceReplyFlow = false;
let voiceReplyDraft = '';
let isWaitingForReplyConfirmation = false;

// ==========================================
// Initialize the app when page loads
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  renderMessageList();
  renderSentList();
  setupEventListeners();
  updateAssistantStatus('Ready to help. Select a message to begin.');
});

// ==========================================
// RENDER MESSAGE LIST
// ==========================================
// This function displays all messages in the sidebar inbox
function renderMessageList() {
  const messageList = document.getElementById('messageList');
  messageList.innerHTML = ''; // Clear existing messages

  // Loop through each message and create an element for it
  messages.forEach(message => {
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    messageItem.dataset.id = message.id; // Store message ID for reference

    // Add selected class to the first message automatically
    if (selectedMessageId === null && message.id === messages[0].id) {
      messageItem.classList.add('selected');
      selectedMessageId = message.id;
    }

    // Highlight if this is the currently selected message
    if (selectedMessageId === message.id) {
      messageItem.classList.add('selected');
    }

    // Create HTML for sender and subject
    messageItem.innerHTML = `
      <div class="sender">${message.sender}</div>
      <div class="subject">${message.subject}</div>
    `;

    // Add click handler to select this message
    messageItem.addEventListener('click', function() {
      selectMessage(message.id);
    });

    messageList.appendChild(messageItem);
  });
}

// ==========================================
// RENDER SENT LIST
// ==========================================
// This function displays all sent messages (replies) in the Sent folder
function renderSentList() {
  const sentList = document.getElementById('sentList');
  const sentEmpty = document.getElementById('sentEmpty');
  
  sentList.innerHTML = ''; // Clear existing sent messages

  if (sentMessages.length === 0) {
    // Show empty message if no sent messages
    if (sentEmpty) {
      sentEmpty.style.display = 'block';
    }
    return;
  }

  // Hide empty message
  if (sentEmpty) {
    sentEmpty.style.display = 'none';
  }

  // Loop through each sent message and create an element for it
  sentMessages.forEach(message => {
    const sentItem = document.createElement('div');
    sentItem.className = 'message-item sent-item';
    sentItem.dataset.id = message.id;

    // Create HTML for sender (recipient) and subject
    sentItem.innerHTML = `
      <div class="sender">To: ${message.recipient}</div>
      <div class="subject">${message.subject}</div>
      <div class="sent-timestamp">${message.timestamp}</div>
    `;

    // Add click handler to view sent message
    sentItem.addEventListener('click', function() {
      displaySentMessage(message.id);
    });

    sentList.appendChild(sentItem);
  });
}

// ==========================================
// DISPLAY SENT MESSAGE
// ==========================================
// Show a sent message in the message view area
function displaySentMessage(sentMessageId) {
  const sentMessage = sentMessages.find(msg => msg.id === sentMessageId);
  
  if (!sentMessage) return;

  const messageContent = document.getElementById('messageContent');
  messageContent.innerHTML = `
    <h2>Re: ${sentMessage.subject}</h2>
    <div class="message-from">
      <strong>To:</strong> ${sentMessage.recipient}
    </div>
    <div class="message-timestamp">
      <em>Sent: ${sentMessage.timestamp}</em>
    </div>
    <div class="message-body">${sentMessage.body}</div>
  `;

  // Hide voice features when viewing sent messages
  document.getElementById('voiceSection').style.display = 'none';
}

// ==========================================
// SELECT MESSAGE
// ==========================================
// This function handles when user clicks a message
function selectMessage(messageId) {
  selectedMessageId = messageId;

  // Remove 'selected' class from all messages
  document.querySelectorAll('.message-item').forEach(item => {
    item.classList.remove('selected');
  });

  // Add 'selected' class to clicked message
  const selectedItem = document.querySelector(`[data-id="${messageId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  // Display the message content
  displayMessage(messageId);
}

// ==========================================
// DISPLAY MESSAGE CONTENT
// ==========================================
// This function shows the full message in the main area
function displayMessage(messageId) {
  // Find the message with matching ID
  const message = messages.find(msg => msg.id === messageId);

  if (!message) return;

  // Create and display the message HTML
  const messageContent = document.getElementById('messageContent');
  messageContent.innerHTML = `
    <h2>${message.subject}</h2>
    <div class="message-from">
      <strong>From:</strong> ${message.sender}
    </div>
    <div class="message-body">${message.body}</div>
  `;

  // Show the voice features section when a message is displayed
  document.getElementById('voiceSection').style.display = 'block';
  
  // Reset voice reply section
  hideVoiceReplySection();
}

// ==========================================
// SETUP EVENT LISTENERS
// ==========================================
// This function sets up all button click handlers
function setupEventListeners() {
  // Compose button - open modal
  document.getElementById('composeBtn').addEventListener('click', openComposeModal);

  // Close modal button
  document.getElementById('closeModal').addEventListener('click', closeComposeModal);

  // Cancel button in form
  document.getElementById('cancelBtn').addEventListener('click', closeComposeModal);

  // Compose form submission
  document.getElementById('composeForm').addEventListener('submit', handleComposeSend);

  // Close modal when clicking outside of it
  document.getElementById('composeModal').addEventListener('click', function(event) {
    // Only close if clicking on the modal background, not the content
    if (event.target === this) {
      closeComposeModal();
    }
  });

  // ===== VOICE FEATURE EVENT LISTENERS =====
  // Read Aloud button
  document.getElementById('readAloudBtn').addEventListener('click', startReadAloud);

  // Stop Reading button
  document.getElementById('stopReadingBtn').addEventListener('click', stopReadAloud);

  // Voice Reply button
  document.getElementById('voiceReplyBtn').addEventListener('click', startVoiceReply);

  // Generate Reply button
  document.getElementById('generateReplyBtn').addEventListener('click', generateVoiceReply);

  // Cancel Voice Reply button
  document.getElementById('cancelVoiceReplyBtn').addEventListener('click', cancelVoiceReply);

  // Send Reply button
  document.getElementById('sendReplyBtn').addEventListener('click', handleSendReply);

  // Edit Reply button
  document.getElementById('editReplyBtn').addEventListener('click', handleEditReply);

  // Cancel Send button
  document.getElementById('cancelSendBtn').addEventListener('click', handleCancelSend);

  // ===== NEW MAIL NOTIFICATION EVENT LISTENERS =====
  // Simulate New Mail button
  document.getElementById('simulateMailBtn').addEventListener('click', simulateNewMail);

  // Close notification button
  document.getElementById('closeNotification').addEventListener('click', closeNotification);
}

// ==========================================
// OPEN COMPOSE MODAL
// ==========================================
// Display the compose form
function openComposeModal() {
  const modal = document.getElementById('composeModal');
  modal.classList.add('show');

  // Focus on the "To" field for better UX
  setTimeout(() => {
    document.getElementById('toField').focus();
  }, 100);
}

// ==========================================
// CLOSE COMPOSE MODAL
// ==========================================
// Hide the compose form and reset it
function closeComposeModal() {
  const modal = document.getElementById('composeModal');
  modal.classList.remove('show');

  // Reset the form fields
  document.getElementById('composeForm').reset();
}

// ==========================================
// HANDLE COMPOSE SEND
// ==========================================
// This function is called when user submits the compose form
function handleComposeSend(event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const toField = document.getElementById('toField').value;
  const subjectField = document.getElementById('subjectField').value;
  const messageField = document.getElementById('messageField').value;

  // Create a new message object
  const newMessage = {
    id: messages.length + 1, // Simple ID generation (in production, use proper IDs)
    sender: toField, // In this demo, we use "to" as the sender
    subject: subjectField,
    body: messageField
  };

  // Add new message to the messages array
  messages.unshift(newMessage); // Add to beginning so newest appears first

  // Update the UI
  renderMessageList();
  selectMessage(newMessage.id); // Automatically select the new message

  // Close the modal
  closeComposeModal();

  // Optional: Show success message (you could add a toast notification here)
  console.log('Message sent successfully!', newMessage);
}

// ==========================================
// VOICE FEATURES - SPEECH SYNTHESIS (Read Aloud)
// ==========================================

// Variable to track if currently reading
let isReading = false;

// Speech Synthesis: Read the selected email aloud
function startReadAloud() {
  // Stop any previous reading
  if (isReading) {
    stopReadAloud();
    return;
  }

  // Get the currently selected message
  const message = messages.find(msg => msg.id === selectedMessageId);
  if (!message) return;

  // Combine sender, subject, and body into a complete text
  const textToRead = `Email from ${message.sender}. Subject: ${message.subject}. ${message.body}`;

  // Create a Speech Synthesis Utterance
  const utterance = new SpeechSynthesisUtterance(textToRead);
  
  // Configure speech synthesis settings
  utterance.rate = 0.9; // Slightly slower speech
  utterance.pitch = 1;
  utterance.volume = 1;

  // Handle when speech starts
  utterance.onstart = function() {
    isReading = true;
    // Hide Read Aloud button, show Stop Reading button
    document.getElementById('readAloudBtn').style.display = 'none';
    document.getElementById('stopReadingBtn').style.display = 'inline-flex';
  };

  // Handle when speech ends or is cancelled
  utterance.onend = function() {
    isReading = false;
    // Show Read Aloud button, hide Stop Reading button
    document.getElementById('readAloudBtn').style.display = 'inline-flex';
    document.getElementById('stopReadingBtn').style.display = 'none';
    
    // After reading email, ask if user wants to reply by voice
    setTimeout(() => {
      askForVoiceReply();
    }, 500);
  };

  // Start speaking
  window.speechSynthesis.speak(utterance);
}

// Stop reading aloud
function stopReadAloud() {
  // Cancel all pending speech synthesis
  window.speechSynthesis.cancel();
  
  isReading = false;
  
  // Show Read Aloud button, hide Stop Reading button
  document.getElementById('readAloudBtn').style.display = 'inline-flex';
  document.getElementById('stopReadingBtn').style.display = 'none';
}

// ==========================================
// VOICE FEATURES - SPEECH RECOGNITION (Voice Reply)
// ==========================================

// Initialize Speech Recognition (cross-browser support)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let voiceTranscript = '';

// Check if Speech Recognition is available
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  
  // Configure recognition settings
  recognition.continuous = true; // Keep listening until stopped
  recognition.interimResults = true; // Show interim results as user speaks
  recognition.lang = 'en-US'; // Set language

  // Handle recognition results
  recognition.onresult = function(event) {
    let interim = '';
    
    // Combine all recognized speech
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      // Add to final transcript if it's a final result
      if (event.results[i].isFinal) {
        voiceTranscript += transcript + ' ';
      } else {
        // Show interim results in blue
        interim += transcript;
      }
    }
    
    // Update textarea with final + interim transcript
    document.getElementById('voiceTranscript').value = voiceTranscript + interim;
  };

  // Handle errors
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    alert('Error during speech recognition: ' + event.error);
    stopListening();
  };

  // Handle end of recognition
  recognition.onend = function() {
    stopListening();
  };
}

// Start voice reply (listening to user)
function startVoiceReply() {
  // Check if browser supports Speech Recognition
  if (!recognition) {
    alert('Sorry, your browser does not support speech recognition. Please try Google Chrome, Microsoft Edge, or Safari.');
    return;
  }

  // Show the voice reply section
  document.getElementById('voiceReplySection').style.display = 'block';
  document.getElementById('voiceTranscript').value = '';
  voiceTranscript = '';
  
  // Show listening status
  document.getElementById('listeningStatus').style.display = 'flex';
  
  // Show action buttons (Generate/Cancel)
  document.getElementById('voiceReplyActions').style.display = 'flex';
  document.getElementById('voiceSendActions').style.display = 'none';
  
  // Hide transcript groups until we have content
  document.getElementById('rawTranscriptGroup').style.display = 'none';
  document.getElementById('cleanedTranscriptGroup').style.display = 'none';
  document.getElementById('polishedDraftGroup').style.display = 'none';
  
  // Disable voice reply button while listening
  document.getElementById('voiceReplyBtn').disabled = true;

  isListening = true;
  recognition.start();
}

// Stop listening
function stopListening() {
  if (isListening) {
    isListening = false;
    recognition.stop();
    
    // Hide listening status
    document.getElementById('listeningStatus').style.display = 'none';
    
    // Enable voice reply button
    document.getElementById('voiceReplyBtn').disabled = false;
  }
}

// Hide voice reply section
function hideVoiceReplySection() {
  if (isListening) {
    stopListening();
  }
  document.getElementById('voiceReplySection').style.display = 'none';
  
  // Reset all transcript fields
  document.getElementById('voiceTranscript').value = '';
  document.getElementById('rawTranscript').value = '';
  document.getElementById('cleanedTranscript').value = '';
  
  // Hide all transcript groups
  document.getElementById('rawTranscriptGroup').style.display = 'none';
  document.getElementById('cleanedTranscriptGroup').style.display = 'none';
  document.getElementById('polishedDraftGroup').style.display = 'none';
  
  // Hide all action buttons
  document.getElementById('voiceReplyActions').style.display = 'none';
  document.getElementById('voiceSendActions').style.display = 'none';
  
  voiceTranscript = '';
}

// Cancel voice reply
function cancelVoiceReply() {
  stopListening();
  hideVoiceReplySection();
}

// ==========================================
// VOICE REPLY GENERATION
// ==========================================

// Generate a polished email reply based on voice transcript
function generateVoiceReply() {
  const rawTranscript = document.getElementById('voiceTranscript').value.trim();
  
  if (!rawTranscript) {
    alert('Please provide voice input first.');
    return;
  }

  // Get the current message
  const message = messages.find(msg => msg.id === selectedMessageId);
  if (!message) return;

  // Show the transcript processing sections
  document.getElementById('listeningStatus').style.display = 'none';
  document.getElementById('voiceReplyActions').style.display = 'none';

  // Use the new improved generation function
  generateAndReadReplyDraft(rawTranscript);
}

// Generate a polished email reply from voice transcript
// This uses simple rule-based logic to create professional-sounding emails
function generatePolishedReply(originalMessage, transcript) {
  // Extract the sender's name from email
  const senderName = originalMessage.sender.split('@')[0];
  
  // Capitalize first letter of transcript
  const capitalizedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
  
  // Add appropriate punctuation if missing
  let processedTranscript = capitalizedTranscript;
  if (!processedTranscript.match(/[.!?]$/)) {
    processedTranscript += '.';
  }

  // Build the polished reply based on common phrases in transcript
  let reply = `Hi,\n\n`;

  // Add a greeting/acknowledgment based on keywords
  if (transcript.toLowerCase().includes('thank')) {
    reply += `Thank you for your message. `;
  } else {
    reply += `Thank you for reaching out. `;
  }

  // Add the user's actual message
  reply += `${processedTranscript}\n\n`;

  // Add closing based on context
  if (transcript.toLowerCase().includes('meeting') || transcript.toLowerCase().includes('discuss')) {
    reply += `Looking forward to connecting soon.\n\n`;
  } else if (transcript.toLowerCase().includes('question') || transcript.toLowerCase().includes('help')) {
    reply += `Feel free to reach out if you need anything else.\n\n`;
  }

  // Standard closing
  reply += `Best regards,`;

  return reply;
}

// Display the first message when page loads
if (messages.length > 0) {
  displayMessage(messages[0].id);
}

// ==========================================
// SMART VOICE NOTIFICATION FLOW
// ==========================================

// Demo emails to rotate through on simulate
const demoEmails = [
  {
    sender: "emma@example.com",
    subject: "Lunch Meeting Next Week",
    body: "Hi,\n\nWould you like to join us for lunch next Tuesday? We're planning to discuss the new product roadmap.\n\nLet me know!\n\nEmma"
  },
  {
    sender: "david@example.com",
    subject: "Design Review Complete",
    body: "Great news! I've completed the design review for the landing page. The mockups look fantastic. Please check your shared folder for the latest versions.\n\nDavid"
  },
  {
    sender: "lisa@example.com",
    subject: "Bug Report: Login Issue",
    body: "Hi,\n\nWe've identified a bug in the login flow that affects Safari users. Can you take a look when you get a chance?\n\nThanks,\nLisa"
  },
  {
    sender: "mike@example.com",
    subject: "Quarterly Results",
    body: "The quarterly results are now available in the finance dashboard. Revenue is up 15% compared to last quarter!\n\nMike"
  }
];

// Track notification state
let currentNotificationMessageId = null;
let isWaitingForNotificationResponse = false;
let notificationRecognition = null;
let notificationTranscript = '';

// Initialize notification speech recognition
if (SpeechRecognition && !notificationRecognition) {
  notificationRecognition = new SpeechRecognition();
  notificationRecognition.continuous = false;
  notificationRecognition.lang = 'en-US';

  // Handle notification recognition results
  notificationRecognition.onresult = function(event) {
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    
    if (finalTranscript) {
      handleNotificationResponse(finalTranscript);
    }
  };

  notificationRecognition.onerror = function(event) {
    console.error('Notification recognition error:', event.error);
    updateInboxStatus('❌ Could not understand - mail dismissed');
    closeNotificationUI();
  };

  notificationRecognition.onend = function() {
    if (isWaitingForNotificationResponse) {
      updateInboxStatus('❌ Could not understand - mail dismissed');
      closeNotificationUI();
    }
  };
}

// ==========================================
// SIMULATE NEW MAIL
// ==========================================
// Create a demo email and trigger the notification flow
function simulateNewMail() {
  // Stop any current speech
  window.speechSynthesis.cancel();

  // Pick a random demo email
  const demoEmail = demoEmails[Math.floor(Math.random() * demoEmails.length)];
  
  // Create new message with new ID
  const newMessageId = Math.max(...messages.map(m => m.id), 0) + 1;
  const newMessage = {
    id: newMessageId,
    sender: demoEmail.sender,
    subject: demoEmail.subject,
    body: demoEmail.body
  };

  // Add to beginning of messages array
  messages.unshift(newMessage);
  
  // Update inbox display
  renderMessageList();
  
  // Start notification flow
  announceNewMail(newMessage);
}

// ==========================================
// ANNOUNCE NEW MAIL
// ==========================================
// Speak a notification about new mail and ask to open/read it
function announceNewMail(message) {
  // Store the notification message ID
  currentNotificationMessageId = message.id;
  
  // Show notification at top
  showNotification(`📧 New mail from ${message.sender}`);
  
  // Update inbox status
  updateInboxStatus('🔊 New mail arriving...');

  // Create the announcement text
  const questionText = `You have new mail from ${message.sender}. Do you want me to open and read it?`;

  // Use the reusable yes/no question helper with unified listening UI
  askYesNoQuestion(
    questionText,
    // onYes callback
    function(transcript) {
      updateInboxStatus('✅ Opening and reading mail...');
      
      // Auto-select the new message
      selectMessage(currentNotificationMessageId);
      
      // Give a moment for message to display, then read aloud
      setTimeout(() => {
        startReadAloud();
      }, 300);
    },
    // onNo callback
    function(transcript) {
      updateInboxStatus('👋 Mail notification dismissed');
      closeNotificationUI();
    },
    // onUnclear callback
    function(reason) {
      updateInboxStatus('❌ Could not understand - waiting for your response');
      // Don't auto-close, let user try again
    },
    // options
    {
      listeningDuration: 8000,      // 8 seconds to respond
      delayBeforeListening: 1000,   // 1 second delay after announcement
      retryOnUnclear: true          // Retry once if unclear
    }
  );
}

// ==========================================
// START NOTIFICATION LISTENING (LEGACY)
// ==========================================
// This function is now handled by askYesNoQuestion in announceNewMail
function startNotificationListening() {
  // Deprecated - using askYesNoQuestion helper instead
}

// ==========================================
// HANDLE NOTIFICATION RESPONSE (LEGACY)
// ==========================================
// This function is now handled by askYesNoQuestion in announceNewMail
function handleNotificationResponse(response) {
  // Deprecated - using askYesNoQuestion helper instead
}

// ==========================================
// INTERPRET YES/NO RESPONSE
// ==========================================
// Check if response contains yes or no
function interpretYesNo(text) {
  // Use the new classifier function
  return classifyYesNo(text);
}

// ==========================================
// IMPROVED YES/NO CLASSIFIER (Reusable)
// ==========================================
// Classify text responses as yes, no, or unclear
// Handles phrases like "yes please", "no thank you", etc.
function classifyYesNo(text) {
  const lowerText = text.toLowerCase().trim();
  
  // Remove punctuation for better matching
  const cleanText = lowerText.replace(/[.,!?;:\-]/g, '');

  // YES variations - comprehensive list including phrases
  const yesPatterns = [
    'yes please',
    'yes go ahead',
    'yeah',
    'yep',
    'yup',
    'sure',
    'okay',
    'ok',
    'go ahead',
    'please do',
    'do it',
    'reply please',
    'yes'       // Must be last as catch-all
  ];

  // NO variations - comprehensive list including phrases
  const noPatterns = [
    'no thank you',
    'no thanks',
    'no please',
    'not now',
    'not today',
    "don't",
    'do not',
    "don't reply",
    'do not reply',
    'please don\'t',
    'please don\'t reply',
    'nope',
    'cancel',
    'stop',
    'skip',
    'no'        // Must be last as catch-all
  ];

  // Check YES patterns (order matters - longer phrases first)
  for (let pattern of yesPatterns) {
    if (cleanText.includes(pattern)) {
      return 'yes';
    }
  }

  // Check NO patterns (order matters - longer phrases first)
  for (let pattern of noPatterns) {
    if (cleanText.includes(pattern)) {
      return 'no';
    }
  }

  // Could not determine
  return 'unclear';
}


// ==========================================
// YES/NO QUESTION HELPER (Reusable)
// ==========================================
// Create a separate SpeechRecognition instance for yes/no questions
// This avoids conflicts with other recognition instances
function createYesNoRecognition() {
  if (!SpeechRecognition) return null;
  
  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;           // Stop after one utterance
  recognizer.interimResults = false;        // Don't show interim results
  recognizer.maxAlternatives = 3;           // Try up to 3 alternatives
  recognizer.lang = 'en-US';
  
  return recognizer;
}

// Main reusable helper function for asking yes/no questions
// Usage: askYesNoQuestion("Do you want to reply?", onYes, onNo, onUnclear)
function askYesNoQuestion(questionText, onYes, onNo, onUnclear, options = {}) {
  // Default options
  const listeningDuration = options.listeningDuration || 8000;   // 8 seconds
  const delayBeforeListening = options.delayBeforeListening || 1000; // 1 second
  const retryOnUnclear = options.retryOnUnclear !== false; // Default: true
  
  // Create a new recognition instance for this question
  const yesNoRecognition = createYesNoRecognition();
  if (!yesNoRecognition) {
    updateAssistantStatus('❌ Speech recognition not available');
    if (onUnclear) onUnclear('no_support');
    return;
  }
  
  // Show listening modal
  showListeningModal(questionText);
  
  // State variables for this question flow
  let heardTranscript = '';
  let timeoutId = null;
  let countdownId = null;
  let listeningStartTime = null;
  let isProcessing = false; // Prevent double-processing
  
  // Handle results
  yesNoRecognition.onresult = function(event) {
    if (isProcessing) return; // Ignore if already processing
    
    heardTranscript = '';
    
    // Get best result from alternatives
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        // Use transcript with highest confidence
        heardTranscript = event.results[i][0].transcript;
      }
    }
    
    if (heardTranscript.trim()) {
      isProcessing = true;
      
      // Show what was heard
      showHeardTranscript(heardTranscript);
      
      // Stop recognition and clear timeout
      yesNoRecognition.stop();
      if (timeoutId) clearTimeout(timeoutId);
      if (countdownId) clearTimeout(countdownId);
      
      // Small delay to show the heard text
      setTimeout(() => {
        hideListeningModal();
        
        // Classify the response
        const answer = interpretYesNo(heardTranscript);
        
        if (answer === 'yes') {
          updateAssistantStatus('✓ Heard: Yes');
          setTimeout(() => {
            if (onYes) onYes(heardTranscript);
          }, 200);
        } else if (answer === 'no') {
          updateAssistantStatus('✓ Heard: No');
          setTimeout(() => {
            if (onNo) onNo(heardTranscript);
          }, 200);
        } else {
          // Unclear - retry or give up
          if (retryOnUnclear) {
            updateAssistantStatus('❓ Did not understand clearly. Retrying...');
            setTimeout(() => {
              // Retry once more
              askYesNoQuestion(
                `I didn't catch that. ${questionText}`,
                onYes,
                onNo,
                onUnclear,
                { ...options, retryOnUnclear: false } // Don't retry again
              );
            }, 1000);
          } else {
            updateAssistantStatus('❌ Could not understand response');
            hideListeningModal();
            if (onUnclear) onUnclear('unclear');
          }
        }
      }, 500);
    }
  };
  
  // Handle errors
  yesNoRecognition.onerror = function(event) {
    console.error('Yes/No recognition error:', event.error);
    isProcessing = true;
    updateAssistantStatus('❌ Listening error: ' + event.error);
    if (timeoutId) clearTimeout(timeoutId);
    if (countdownId) clearTimeout(countdownId);
    hideListeningModal();
    if (onUnclear) onUnclear('error');
  };
  
  // Handle end of recognition
  yesNoRecognition.onend = function() {
    if (!isProcessing && heardTranscript.trim()) {
      // Results were already processed in onresult
      return;
    }
    if (!isProcessing) {
      // No clear answer before timeout
      isProcessing = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (countdownId) clearTimeout(countdownId);
      updateAssistantStatus('⏱️ No response - listening ended');
      hideListeningModal();
      if (onUnclear) onUnclear('timeout');
    }
  };
  
  // Start speaking the question
  const utterance = new SpeechSynthesisUtterance(questionText);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  utterance.onend = function() {
    // Speech synthesis finished - now wait before starting recognition
    updateAssistantStatus('🎤 Waiting to listen...');
    
    setTimeout(() => {
      if (isProcessing) return; // User already responded
      
      updateAssistantStatus('🎤 Listening...');
      listeningStartTime = Date.now();
      
      // Start countdown timer
      updateCountdownDisplay(listeningDuration);
      countdownId = setInterval(() => {
        const elapsed = Date.now() - listeningStartTime;
        const remaining = Math.max(0, listeningDuration - elapsed);
        updateCountdownDisplay(remaining);
      }, 100);
      
      // Start listening
      yesNoRecognition.start();
      
      // Set timeout for listening duration
      timeoutId = setTimeout(() => {
        if (!isProcessing) {
          isProcessing = true;
          yesNoRecognition.stop();
          if (countdownId) clearTimeout(countdownId);
        }
      }, listeningDuration);
      
    }, delayBeforeListening);
  };
  
  utterance.onerror = function(event) {
    console.error('Speech synthesis error:', event.error);
    isProcessing = true;
    updateAssistantStatus('❌ Speech synthesis error');
    hideListeningModal();
    if (onUnclear) onUnclear('synthesis_error');
  };
  
  // Start speaking
  window.speechSynthesis.cancel(); // Cancel any pending speech
  window.speechSynthesis.speak(utterance);
}

// Helper: Show listening modal
function showListeningModal(questionText) {
  const modal = document.getElementById('listeningModAl');
  const question = document.getElementById('listeningQuestion');
  question.textContent = questionText;
  
  // Reset display
  document.getElementById('heardTranscript').style.display = 'none';
  document.getElementById('heardText').textContent = '';
  document.getElementById('countdownDisplay').textContent = '8s';
  
  modal.style.display = 'flex';
}

// Helper: Hide listening modal
function hideListeningModal() {
  const modal = document.getElementById('listeningModAl');
  modal.style.display = 'none';
}

// Helper: Show what was heard
function showHeardTranscript(transcript) {
  document.getElementById('heardTranscript').style.display = 'block';
  document.getElementById('heardText').textContent = transcript;
}

// Helper: Update countdown display
function updateCountdownDisplay(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  document.getElementById('countdownDisplay').textContent = seconds + 's';
}

// Setup cancel button for listening modal
document.addEventListener('DOMContentLoaded', function() {
  const cancelBtn = document.getElementById('cancelListeningBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      hideListeningModal();
      // Try to stop any active speech recognition
      if (window.SpeechRecognition) {
        // Can't directly stop from here, but the modal being hidden
        // signals the user cancelled
      }
    });
  }
});


// ==========================================
// SHOW NOTIFICATION
// ==========================================
// Display notification bar at top
function showNotification(message) {
  const notificationStatus = document.getElementById('notificationStatus');
  const notificationText = document.getElementById('notificationText');
  
  if (notificationStatus && notificationText) {
    notificationText.textContent = message;
    notificationStatus.style.display = 'flex';
  }
}

// ==========================================
// CLOSE NOTIFICATION UI
// ==========================================
// Hide notifications and reset state
function closeNotificationUI() {
  closeNotification();
  
  // Clear inbox status after 3 seconds
  setTimeout(() => {
    const inboxStatus = document.getElementById('inboxStatus');
    if (inboxStatus) {
      inboxStatus.style.display = 'none';
    }
  }, 3000);
}

// ==========================================
// CLOSE NOTIFICATION
// ==========================================
// Hide the notification bar
function closeNotification() {
  const notificationStatus = document.getElementById('notificationStatus');
  if (notificationStatus) {
    notificationStatus.style.display = 'none';
  }
  
  isWaitingForNotificationResponse = false;
  if (notificationRecognition) {
    notificationRecognition.stop();
  }
}

// ==========================================
// UPDATE INBOX STATUS
// ==========================================
// Show status message in sidebar
function updateInboxStatus(statusText) {
  const inboxStatus = document.getElementById('inboxStatus');
  if (inboxStatus) {
    inboxStatus.innerHTML = `<p>${statusText}</p>`;
    inboxStatus.style.display = 'block';
  }
}

// ==========================================
// VOICE REPLY FLOW - HANDS-FREE CONVERSATION
// ==========================================

// Create a dedicated recognition instance for reply flow
let replyRecognition = null;
if (SpeechRecognition && !replyRecognition) {
  replyRecognition = new SpeechRecognition();
  replyRecognition.continuous = true;
  replyRecognition.lang = 'en-US';
}

// Track reply flow state
let replyFlowState = 'idle'; // idle, awaiting_reply_confirmation, capturing_reply, awaiting_send_confirmation

// ==========================================
// ASK FOR VOICE REPLY
// ==========================================
// After reading email, ask if user wants to reply by voice
function askForVoiceReply() {
  // Only ask if we're still looking at the selected message
  const message = messages.find(msg => msg.id === selectedMessageId);
  if (!message) return;

  updateAssistantStatus('💬 Asking if you want to reply...');
  
  // Use the reusable yes/no question helper
  askYesNoQuestion(
    "Do you want to reply by voice?",
    // onYes callback
    function(transcript) {
      updateAssistantStatus('✓ Starting voice reply capture...');
      setTimeout(() => {
        captureVoiceReply();
      }, 300);
    },
    // onNo callback
    function(transcript) {
      updateAssistantStatus('👋 Reply declined. Ready for next action.');
      replyFlowState = 'idle';
    },
    // onUnclear callback
    function(reason) {
      updateAssistantStatus('👋 Reply cancelled. Ready for next action.');
      replyFlowState = 'idle';
    },
    // options
    {
      listeningDuration: 8000,    // 8 seconds
      delayBeforeListening: 1000,  // 1 second delay after speech ends
      retryOnUnclear: true          // Retry once if unclear
    }
  );
}

// ==========================================
// LISTEN FOR REPLY CONFIRMATION (LEGACY)
// ==========================================
// This function is kept for reference but is now replaced by the new helper
// Can be removed in future refactoring
function listenForReplyConfirmation() {
  // Deprecated - using askYesNoQuestion helper instead
}

// ==========================================
// HANDLE REPLY CONFIRMATION (LEGACY)
// ==========================================
// This function is kept for reference but is now replaced by the new helper
// Can be removed in future refactoring
function handleReplyConfirmation(response) {
  // Deprecated - using askYesNoQuestion helper instead
}

// ==========================================
// CAPTURE VOICE REPLY
// ==========================================
// Listen for and capture user's spoken reply
function captureVoiceReply() {
  if (!replyRecognition) {
    updateAssistantStatus('❌ Speech recognition not available');
    return;
  }

  updateAssistantStatus('🎤 Listening for your reply...');
  replyFlowState = 'capturing_reply';
  
  let capturedReply = '';
  
  const tempResultHandler = function(event) {
    let interim = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        capturedReply += transcript + ' ';
      } else {
        interim += transcript;
      }
    }

    // Update transcript display
    document.getElementById('voiceTranscript').value = capturedReply + interim;
  };

  const tempEndHandler = function() {
    if (replyFlowState === 'capturing_reply' && capturedReply.trim()) {
      // Generate and read the reply draft
      generateAndReadReplyDraft(capturedReply);
    } else if (replyFlowState === 'capturing_reply') {
      updateAssistantStatus('❌ No reply captured - cancelled');
      replyFlowState = 'idle';
    }
  };

  replyRecognition.onresult = tempResultHandler;
  replyRecognition.onend = tempEndHandler;

  // Auto-stop after 15 seconds of listening
  setTimeout(() => {
    if (replyFlowState === 'capturing_reply') {
      replyRecognition.stop();
    }
  }, 15000);

  replyRecognition.start();
}

// ==========================================
// GENERATE AND READ REPLY DRAFT
// ==========================================
// Generate a polished reply and read it aloud
function generateAndReadReplyDraft(transcript) {
  // Get the current message
  const message = messages.find(msg => msg.id === selectedMessageId);
  if (!message) {
    updateAssistantStatus('❌ Message not found');
    return;
  }

  // Show the voice reply section
  document.getElementById('voiceReplySection').style.display = 'block';
  document.getElementById('listeningStatus').style.display = 'none';

  // ===== Display all three versions of the transcript =====
  
  // 1. Show raw transcript
  const rawText = transcript.trim();
  document.getElementById('rawTranscript').value = rawText;
  document.getElementById('rawTranscriptGroup').style.display = 'block';

  updateAssistantStatus('🧹 Normalizing transcript...');

  // Give a moment for visual feedback, then normalize and process
  setTimeout(async () => {
    // 2. Normalize the transcript (grammar fixes, capitalization, etc.)
    const normalizedText = normalizeTranscript(rawText);
    document.getElementById('cleanedTranscript').value = normalizedText;
    document.getElementById('cleanedTranscriptGroup').style.display = 'block';

    updateAssistantStatus('🤖 Generating AI reply...');

    console.log('[AI] Requesting rewrite for transcript:', rawText);
    console.log('[AI] Original message subject:', message.subject);

    console.log('Calling URL:', 'http://localhost:3000/generate-reply');

    let professionalReply = '';

    try {
      const response = await fetch('http://localhost:3000/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalEmailSubject: message.subject,
          originalEmailBody: message.body,
          senderName: message.sender,
          senderEmail: message.sender,
          voiceTranscript: rawText
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log('[AI] API response data:', data);
      professionalReply = data.polishedReply?.trim();

      if (!professionalReply) {
        throw new Error('AI returned empty reply');
      }
    } catch (error) {
      console.error('[AI] reply generation failed:', error);
      updateAssistantStatus('❌ AI generation failed. Please try again.');
      document.getElementById('voiceTranscript').value = 'AI reply generation failed. Please retry.';
      document.getElementById('polishedDraftGroup').style.display = 'block';
      document.getElementById('voiceReplyActions').style.display = 'flex';
      document.getElementById('voiceSendActions').style.display = 'none';
      return;
    }

    voiceReplyDraft = professionalReply;
    document.getElementById('voiceTranscript').value = professionalReply;
    document.getElementById('polishedDraftGroup').style.display = 'block';

    const schedule = extractSchedulingInfo(normalizedText);
    const tasks = extractTasks(normalizedText);
    const issues = extractIssues(normalizedText);
    const requests = extractRequests(normalizedText);
    const ideaLines = [schedule, tasks, issues, requests].filter(Boolean);
    document.getElementById('interpretedIdeas').value = ideaLines.length > 0 ? ideaLines.join('\n') : 'No distinct ideas detected.';
    document.getElementById('interpretedIdeasGroup').style.display = 'block';

    // Hide action buttons and show send/edit/cancel buttons instead
    document.getElementById('voiceReplyActions').style.display = 'none';
    document.getElementById('voiceSendActions').style.display = 'flex';

    updateAssistantStatus('🔊 Reading the polished email to you...');

    // Read the polished reply aloud
    const utterance = new SpeechSynthesisUtterance(professionalReply);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = function() {
      // After reading, ask if they want to send
      updateAssistantStatus('❓ Asking if you want to send...');
      askToSendReply();
    };

    window.speechSynthesis.speak(utterance);
  }, 800);
}

// ==========================================
// ASK TO SEND REPLY
// ==========================================
// After reading draft, ask if user wants to send (uses unified listening UI)
function askToSendReply() {
  updateAssistantStatus('❓ Asking if you want to send...');
  
  // Use the reusable yes/no question helper with unified listening UI
  askYesNoQuestion(
    "Do you want to send this reply?",
    // onYes callback
    function(transcript) {
      updateAssistantStatus('✓ Sending reply...');
      setTimeout(() => {
        saveReplyToSent();
      }, 300);
    },
    // onNo callback
    function(transcript) {
      updateAssistantStatus('💾 Reply kept as draft.');
      replyFlowState = 'idle';
      
      // Keep the draft visible, user can edit or send later
      updateAssistantStatus('✏️ You can edit the draft and send it later.');
    },
    // onUnclear callback
    function(reason) {
      updateAssistantStatus('❌ Could not hear response - reply kept as draft');
      replyFlowState = 'idle';
    },
    // options
    {
      listeningDuration: 6000,    // 6 seconds for send confirmation
      delayBeforeListening: 800,  // 800ms delay after speech ends
      retryOnUnclear: true        // Retry once if unclear
    }
  );
}

// ==========================================
// LISTEN FOR SEND CONFIRMATION (LEGACY)
// ==========================================
// This function is kept for reference but now uses askYesNoQuestion
function listenForSendConfirmation() {
  // Now handled by askYesNoQuestion in askToSendReply
}

// ==========================================
// HANDLE SEND CONFIRMATION (LEGACY)
// ==========================================
// This function is kept for reference but now uses askYesNoQuestion
function handleSendConfirmation(response) {
  // Now handled by askYesNoQuestion in askToSendReply
}

// ==========================================
// SAVE REPLY TO SENT
// ==========================================
// Save the reply to the Sent folder
function saveReplyToSent() {
  // Get the original message
  const message = messages.find(msg => msg.id === selectedMessageId);
  if (!message) {
    updateAssistantStatus('❌ Error: Message not found');
    return;
  }

  // Create sent message object
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });

  const sentMessage = {
    id: Math.max(...sentMessages.map(m => m.id), 0) + 1,
    recipient: message.sender,
    subject: `Re: ${message.subject}`,
    body: voiceReplyDraft,
    timestamp: timestamp
  };

  // Add to sent messages
  sentMessages.unshift(sentMessage);

  // Update UI
  renderSentList();

  updateAssistantStatus('✅ Reply sent! Check the Sent folder.');
  
  // Clear voice reply section
  hideVoiceReplySection();
  
  replyFlowState = 'idle';

  // Show success message
  console.log('Reply sent successfully!', sentMessage);
}

// ==========================================
// BUTTON HANDLERS FOR SEND/EDIT/CANCEL
// ==========================================

// Handle Send Reply button
function handleSendReply() {
  saveReplyToSent();
}

// Handle Edit Reply button - allow manual editing
function handleEditReply() {
  // Make the polished draft editable
  const draftField = document.getElementById('voiceTranscript');
  draftField.readOnly = false;
  draftField.focus();
  
  // Update the draft when user finishes editing
  draftField.addEventListener('blur', function() {
    voiceReplyDraft = draftField.value;
  });

  updateAssistantStatus('✏️ You can now edit the draft. Click Send when ready.');
  
  // Hide send/edit/cancel buttons and show send button only
  document.getElementById('voiceSendActions').style.display = 'flex';
}

// Handle Cancel Send button
function handleCancelSend() {
  updateAssistantStatus('❌ Reply cancelled. Ready for next action.');
  hideVoiceReplySection();
  replyFlowState = 'idle';
}

// ==========================================
// UPDATE ASSISTANT STATUS
// ==========================================
// Display status in the assistant status box
function updateAssistantStatus(statusText) {
  const assistantStatus = document.getElementById('assistantStatus');
  const assistantStatusText = document.getElementById('assistantStatusText');
  
  if (assistantStatus && assistantStatusText) {
    assistantStatusText.textContent = statusText;
    assistantStatus.style.display = 'block';
  }
}

// ==========================================
// TRANSCRIPT CLEANUP FUNCTIONS
// ==========================================
// Clean and improve raw voice transcript

// List of common filler words to remove
const FILLER_WORDS = [
  'um', 'uh', 'umm', 'uhh', 'like', 'you know', 'i mean', 'sort of', 'kind of',
  'basically', 'actually', 'well', 'okay', 'alright', 'so', 'uh huh', 'yeah yeah'
];

// ==========================================
// PROFESSIONAL EMAIL REWRITING PIPELINE
// ==========================================
// Convert raw speech into proper professional emails

// Step 1: Normalize the raw transcript to fix grammar and common speech patterns
function normalizeTranscript(rawText) {
  let text = rawText.trim();
  
  // Fix common speech patterns
  const replacements = {
    // Grammar fixes
    "i send": "I will send",
    "i check": "I will check",
    "i update": "I will update",
    "i review": "I will review",
    "i looked": "I have looked",
    "i checked": "I have checked",
    "can you": "Could you",
    "you know": "",
    "i mean": "",
    
    // Capitalization fixes
    "^i ": "I ",
    
    // Pronoun/verb fixes
    "please update it": "please update it",
    "needs changes": "needs to be changed",
    "needs update": "needs to be updated",
    "good but": "looks good, but it",
    "the markups": "the markups",
    "the folders": "the folders",
    
    // Formality improvals
    "okay": "okay",
    "so": "",
    "like": "",
    "basically": "",
  };
  
  // Apply replacements (case-insensitive)
  let normalized = text;
  for (let [oldPhrase, newPhrase] of Object.entries(replacements)) {
    const regex = new RegExp(oldPhrase, 'gi');
    normalized = normalized.replace(regex, newPhrase);
  }
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Apply grammar fixes for common broken phrases
  normalized = fixGrammar(normalized);
  
  // Capitalize first letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  // Ensure ends with punctuation
  if (normalized && !normalized.match(/[.!?]$/)) {
    normalized += '.';
  }
  
  return normalized;
}

// Step 2: Split normalized text into ideas/sentences
function splitTranscriptIntoIdeas(text) {
  // Split on sentence boundaries, preserving context
  let sentences = text.split(/([.!?])/);
  let ideas = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    let idea = sentences[i].trim();
    if (idea.length > 0) {
      // Add back the punctuation
      if (sentences[i + 1]) {
        idea += sentences[i + 1];
      }
      ideas.push(idea);
    }
  }
  
  return ideas.length > 0 ? ideas : [text];
}

// Step 3: Detect recipient name from original email
function detectRecipientFromSpeech(text, originalEmail) {
  if (!originalEmail || !originalEmail.sender) {
    return "there"; // Default fallback
  }
  
  // Extract name from sender email
  const senderEmail = originalEmail.sender;
  const namePart = senderEmail.split('@')[0];
  
  // Convert email username to name (john.doe@... => John Doe)
  let name = namePart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  
  return name || "there";
}

// Helper: Fix common broken grammar and make phrases complete
function fixGrammar(text) {
  let corrected = text;

  const replacements = {
    "haven't receive": "haven't received",
    "haven't recived": "haven't received",
    "haven't recieved": "haven't received",
    "i haven't received": "I haven't received",
    "please updated": "please update it",
    "please updates": "please update it",
    "mock-up needs to be finished": "the mock-up needs to be finished",
    "mockup needs to be finished": "the mock-up needs to be finished",
    "design review for the landing page will be conducted again tomorrow": "the design review for the landing page will be conducted again tomorrow",
    "i havent": "I haven't",
    "i havent received": "I haven't received",
    "by 2:00": "by 2:00",
    "at 2:00": "at 2:00",
    "the mock up": "the mock-up",
    "mock up": "mock-up",
    "need to be finished": "needs to be finished",
    "please update it": "please update it"
  };

  for (let [oldPhrase, newPhrase] of Object.entries(replacements)) {
    const regex = new RegExp(oldPhrase, 'gi');
    corrected = corrected.replace(regex, newPhrase);
  }

  return corrected;
}

function extractSchedulingInfo(text) {
  const matches = text.match(/[^.?!]*\b(?:tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|by \d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?|at \d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?|deadline|meeting|review|conducted again)\b[^.?!]*/gi);
  if (!matches) {
    return '';
  }

  const uniqueMatches = Array.from(new Set(matches.map(match => fixGrammar(match.trim()))));
  const sentences = uniqueMatches.map(sentence => {
    if (!sentence.match(/[.!?]$/)) {
      sentence += '.';
    }
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  });

  return sentences.join(' ');
}

function extractTasks(text) {
  const matches = text.match(/[^.?!]*\b(?:needs? to be finished|needs? to be updated|needs? changes|please update it|mock-?up|design review|finish(?:ed|ing)?|update(?:d|s)?|complete(?:d|s)?|deliver(?:ed|ies)?)\b[^.?!]*/gi);
  if (!matches) {
    return '';
  }

  const tasks = Array.from(new Set(matches.map(task => fixGrammar(task.trim()))));
  return tasks.map(task => {
    if (!task.match(/[.!?]$/)) {
      task = task + '.';
    }
    return task.charAt(0).toUpperCase() + task.slice(1);
  }).join(' ');
}

function extractIssues(text) {
  const matches = text.match(/[^.?!]*\b(?:haven't received|haven't recived|haven't recieved|haven't|missing|no .* received|nothing in the shared folder|problem|issue|delayed|delay|not received|not yet received)\b[^.?!]*/gi);
  if (!matches) {
    return '';
  }

  const issues = Array.from(new Set(matches.map(issue => fixGrammar(issue.trim()))));
  return issues.map(issue => {
    if (!issue.match(/[.!?]$/)) {
      issue = issue + '.';
    }
    return issue.charAt(0).toUpperCase() + issue.slice(1);
  }).join(' ');
}

function extractRequests(text) {
  const matches = text.match(/[^.?!]*\b(?:please|could you|can you|would you|kindly|let me know|update it|send it|share it|review it)\b[^.?!]*/gi);
  if (!matches) {
    return '';
  }

  const requests = Array.from(new Set(matches.map(request => fixGrammar(request.trim()))));
  return requests.map(request => {
    if (!request.match(/[.!?]$/)) {
      request = request + '.';
    }
    return request.charAt(0).toUpperCase() + request.slice(1);
  }).join(' ');
}

// Step 4: Detect the purpose/intent of the reply from context
function detectReplyPurpose(text, originalEmail) {
  const lower = text.toLowerCase();
  const subject = (originalEmail?.subject || "").toLowerCase();
  const body = (originalEmail?.body || "").toLowerCase();
  
  // Check for different intents
  if (lower.includes('thank') || lower.includes('appreciate')) {
    return 'appreciation';
  }
  if (lower.includes('agree') || lower.includes('confirm') || lower.includes('approved')) {
    return 'confirmation';
  }
  if (lower.includes('meet') || lower.includes('tuesday') || lower.includes('tomorrow') || lower.includes('today')) {
    return 'scheduling';
  }
  if (lower.includes('send') || lower.includes('update') || lower.includes('check') || lower.includes('review')) {
    return 'promise';
  }
  if (lower.includes('issue') || lower.includes('problem') || lower.includes('bug') || lower.includes('concern') || lower.includes('missing')) {
    return 'concern';
  }
  
  // Generic response
  return 'generic';
}

// Step 5: Main rewriter - convert normalized text into professional email
function rewriteAsProfessionalEmail(rawTranscript, originalEmail) {
  // Step 1: Normalize the raw speech
  const normalized = normalizeTranscript(rawTranscript);
  
  // Step 2: Extract structured ideas from the transcript
  const schedule = extractSchedulingInfo(normalized);
  const task = extractTasks(normalized);
  const issue = extractIssues(normalized);
  const request = extractRequests(normalized);
  
  // Step 3: Detect recipient
  const recipient = detectRecipientFromSpeech(rawTranscript, originalEmail);
  
  // Step 4: Use structured blocks for the email
  let emailBody = `Hi ${recipient},\n\n`;
  emailBody += `Thank you for the update.\n\n`;

  const blocks = [];
  if (schedule) {
    blocks.push(schedule);
  }
  if (task) {
    blocks.push(task);
  }
  if (issue) {
    blocks.push(issue);
  }
  if (request) {
    blocks.push(request);
  }

  if (blocks.length > 0) {
    emailBody += blocks.join(' ') + '\n\n';
  } else {
    // Fallback if no specific content was found
    emailBody += normalizeTranscript(rawTranscript) + '\n\n';
  }

  emailBody += 'Best regards,';

  return {
    email: emailBody,
    ideas: [schedule, task, issue, request].filter(Boolean)
  };
}

// Helper: Improve individual ideas/sentences for professionalism
function improveIdea(idea, purpose) {
  if (!idea || idea.trim().length === 0) return "";
  
  let improved = idea.trim();
  const lower = improved.toLowerCase();
  
  // Apply purpose-specific improvements
  switch (purpose) {
    case 'promise':
      improved = improvePromiseIdea(improved);
      break;
    case 'concern':
      improved = improveConcernIdea(improved);
      break;
    case 'scheduling':
      improved = improveSchedulingIdea(improved);
      break;
    case 'appreciation':
      improved = improveAppreciationIdea(improved);
      break;
  }
  
  // Ensure proper capitalization and punctuation
  if (improved.length > 0) {
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    if (!improved.match(/[.!?]$/)) {
      improved += ".";
    }
  }
  
  return improved;
}

function improvePromiseIdea(text) {
  // Convert promises to actionable statements
  const lower = text.toLowerCase();
  
  if (lower.includes('send') && lower.includes('tonight')) {
    return "I will send it tonight.";
  }
  if (lower.includes('send') && lower.includes('tomorrow')) {
    return "I will send it tomorrow.";
  }
  if (lower.includes('check') && lower.includes('tomorrow')) {
    return "I will check on this and update you tomorrow.";
  }
  if (lower.includes('update') && lower.includes('tomorrow')) {
    return "I will update you tomorrow.";
  }
  if (lower.includes('reviewed') || lower.includes('review')) {
    return "I have reviewed your message and will share my thoughts.";
  }
  if (lower.includes('folder')) {
    return "I will update the folders as requested.";
  }
  
  return text;
}

function improveConcernIdea(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('issue') || lower.includes('problem') || lower.includes('bug')) {
    return "I will investigate this right away and report back to you.";
  }
  if (lower.includes('question')) {
    return "I will help clarify this for you.";
  }
  
  return text;
}

function improveSchedulingIdea(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('tuesday')) return "Tuesday works well for me.";
  if (lower.includes('wednesday')) return "Wednesday would be perfect.";
  if (lower.includes('thursday')) return "Thursday is convenient for me.";
  if (lower.includes('friday')) return "Friday afternoon would be great.";
  if (lower.includes('tomorrow')) return "Tomorrow would work well.";
  if (lower.includes('lunch')) return "I would be happy to join you for lunch.";
  if (lower.includes('coffee')) return "Let's grab coffee and catch up.";
  
  return text;
}

function improveAppreciationIdea(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('great') || lower.includes('excellent')) {
    return "I really appreciated your thoughtful feedback.";
  }
  if (lower.includes('thank')) {
    return "Thank you again for your support.";
  }
  
  return text;
}

// ==========================================
// CLEAN TRANSCRIPT
// ==========================================
// Remove filler words, duplicates, and clean up formatting
function cleanTranscript(rawText) {
  let cleaned = rawText.trim();

  // Convert to lowercase for processing
  let processed = cleaned.toLowerCase();

  // Remove filler words
  FILLER_WORDS.forEach(filler => {
    // Use word boundaries to only match whole words
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    processed = processed.replace(regex, ' ');
  });

  // Remove duplicate words (e.g., "I I need" becomes "I need")
  processed = processed.replace(/\b(\w+)(\s+\1)+\b/gi, '$1');

  // Clean up extra spaces
  processed = processed.replace(/\s+/g, ' ').trim();

  // Split into sentences and clean each one
  let sentences = processed.split(/([.!?])/);
  let cleanedSentences = [];

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i].trim();
    
    if (sentence.length > 0) {
      // Capitalize first letter of sentence
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      
      // Add back punctuation if it was removed
      if (i % 2 === 0 && sentence && !sentence.match(/[.!?]$/)) {
        // Capitalize first letter for a new sentence
        cleanedSentences.push(sentence);
      } else if (sentence.match(/[.!?]/)) {
        cleanedSentences.push(sentence);
      }
    }
  }

  // Join sentences back together
  processed = cleanedSentences.join('');

  // Ensure proper spacing before punctuation
  processed = processed.replace(/\s+([.!?])/g, '$1');
  processed = processed.replace(/([.!?])\s*/g, '$1 ').trim();

  return processed;
}

// ==========================================
// DETECT REPLY INTENT
// ==========================================
// Analyze speech and detect the user's intent category
function detectReplyIntent(cleanedText, originalEmail) {
  const text = cleanedText.toLowerCase();
  const subject = originalEmail.subject.toLowerCase();
  const body = originalEmail.body.toLowerCase();

  // Keywords for different intent categories
  const confirmationKeywords = ['confirm', 'confirmed', 'yes', 'approved', 'done', 'completed', 'finished'];
  const appreciationKeywords = ['thank', 'thanks', 'grateful', 'appreciate', 'loved', 'enjoyed', 'great job', 'excellent', 'wonderful', 'fantastic', 'amazing'];
  const schedulingKeywords = ['meet', 'meeting', 'lunch', 'coffee', 'call', 'tuesday', 'wednesday', 'thursday', 'friday', 'tomorrow', 'next', 'schedule', 'time'];
  const promiseKeywords = ['send', 'update', 'check', 'review', 'submit', 'provide', 'share', 'give', 'email', 'forward', 'tonight', 'tomorrow', 'soon'];
  const concernKeywords = ['issue', 'problem', 'bug', 'error', 'concern', 'worried', 'question', 'help', 'need', 'urgent', 'asap'];

  let matchCount = {
    confirmation: 0,
    appreciation: 0,
    scheduling: 0,
    promise: 0,
    concern: 0
  };

  // Count keyword matches
  confirmationKeywords.forEach(kw => {
    if (text.includes(kw)) matchCount.confirmation++;
  });
  appreciationKeywords.forEach(kw => {
    if (text.includes(kw)) matchCount.appreciation++;
  });
  schedulingKeywords.forEach(kw => {
    if (text.includes(kw)) matchCount.scheduling++;
  });
  promiseKeywords.forEach(kw => {
    if (text.includes(kw)) matchCount.promise++;
  });
  concernKeywords.forEach(kw => {
    if (text.includes(kw)) matchCount.concern++;
  });

  // Find the highest scoring intent
  let maxCount = Math.max(...Object.values(matchCount));
  
  if (maxCount === 0) {
    return 'generic';
  }

  // Return the intent with highest match count
  for (let [intent, count] of Object.entries(matchCount)) {
    if (count === maxCount) {
      return intent;
    }
  }

  return 'generic';
}

// ==========================================
// GENERATE IMPROVED POLISHED REPLY
// ==========================================
// Generate a professional email reply using intent-aware rewriting
function generateImprovedReply(cleanedTranscript, originalMessage) {
  // Use the new professional email rewriting pipeline
  // This converts raw speech into proper professional emails
  const professionalReply = rewriteAsProfessionalEmail(cleanedTranscript, originalMessage);
  return professionalReply.email || professionalReply;
}


// ==========================================
// INTENT-SPECIFIC REWRITING FUNCTIONS
// ==========================================

function rewriteForAppreciation(text) {
  // Extract the core message and make it sound more natural
  // Remove repeated thank yous
  let rewritten = text.replace(/thank.*?\./gi, '').trim();
  
  if (!rewritten) {
    return "Your email meant a lot to me.";
  }

  // Capitalize and ensure punctuation
  rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
  if (!rewritten.match(/[.!?]$/)) {
    rewritten += '.';
  }

  return rewritten;
}

function rewriteForConfirmation(text) {
  // Make confirmation sound clear and concise
  const lower = text.toLowerCase();
  
  if (lower.includes('agree') || lower.includes('yes')) {
    return "I fully agree with your proposal.";
  } else if (lower.includes('approved')) {
    return "Everything looks good to me.";
  }

  // Generic confirmation
  let rewritten = text.charAt(0).toUpperCase() + text.slice(1);
  if (!rewritten.match(/[.!?]$/)) {
    rewritten += '.';
  }

  return rewritten;
}

function rewriteForScheduling(text) {
  // Extract day/time references and create professional schedule message
  const lower = text.toLowerCase();
  
  if (lower.includes('tuesday')) return "I would love to meet on Tuesday.";
  if (lower.includes('wednesday')) return "Wednesday works well for me.";
  if (lower.includes('thursday')) return "Thursday is perfect.";
  if (lower.includes('friday')) return "Friday afternoon would be great.";
  if (lower.includes('tomorrow')) return "Tomorrow would be convenient for me.";
  if (lower.includes('lunch')) return "I would be happy to join you for lunch.";
  if (lower.includes('coffee')) return "Let's grab coffee soon.";

  let rewritten = text.charAt(0).toUpperCase() + text.slice(1);
  if (!rewritten.match(/[.!?]$/)) {
    rewritten += '.';
  }

  return rewritten;
}

function rewriteForPromise(text) {
  // Extract what the promise is about and make it actionable
  const lower = text.toLowerCase();

  if (lower.includes('send')) {
    return extractTimingAndAdd('I will send', text, 'to you shortly.');
  } else if (lower.includes('check')) {
    return extractTimingAndAdd('I will check', text, 'and get back to you.');
  } else if (lower.includes('update')) {
    return extractTimingAndAdd('I will update', text, 'for you.');
  } else if (lower.includes('review')) {
    return extractTimingAndAdd('I will review', text, 'and share my thoughts.');
  }

  let rewritten = text.charAt(0).toUpperCase() + text.slice(1);
  if (!rewritten.match(/[.!?]$/)) {
    rewritten += '.';
  }

  return rewritten;
}

function rewriteForConcern(text) {
  // Make concerns sound professional and actionable
  const lower = text.toLowerCase();

  if (lower.includes('issue') || lower.includes('bug') || lower.includes('problem')) {
    return "I will investigate this right away and report back to you.";
  }

  let rewritten = text.charAt(0).toUpperCase() + text.slice(1);
  if (!rewritten.match(/[.!?]$/)) {
    rewritten += '.';
  }

  return rewritten;
}

// Helper function to extract timing info and create professional response
function extractTimingAndAdd(action, text, ending) {
  const lower = text.toLowerCase();
  
  if (lower.includes('tonight')) {
    return `${action} it tonight ${ending}`;
  } else if (lower.includes('tomorrow')) {
    return `${action} it tomorrow ${ending}`;
  } else if (lower.includes('today')) {
    return `${action} it today ${ending}`;
  }

  return `${action} this ${ending}`;
}

// ==========================================
// REPLACE OLD REPLY GENERATION
// ==========================================
// Override the old generatePolishedReply function with improved version
const originalGeneratePolishedReply = generatePolishedReply;

function generatePolishedReply(originalMessage, rawTranscript) {
  // Clean the transcript first
  const cleaned = cleanTranscript(rawTranscript);

  // Generate improved reply based on intent
  const improved = generateImprovedReply(cleaned, originalMessage);

  return improved;
}