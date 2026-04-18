// ==========================================
// MEETINGS PAGE - JavaScript Logic
// ==========================================

// Local meetings storage
const meetings = JSON.parse(localStorage.getItem('mailHackMeetings') || '[]');

// Speech recognition setup
const MeetingSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let meetingRecognition = null;
let isMeetingListening = false;
let meetingTranscript = '';

// ==========================================
// INITIALIZE PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  setupMeetingSpeechRecognition();
  setupMeetingsEventListeners();
  renderMeetingsList();
  updateMeetingStatus('Ready to create a meeting.');
});

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupMeetingsEventListeners() {
  const createMeetingBtn = document.getElementById('createMeetingBtn');
  const clearMeetingBtn = document.getElementById('clearMeetingBtn');
  const voiceMeetingBtn = document.getElementById('voiceMeetingBtn');
  const stopVoiceMeetingBtn = document.getElementById('stopVoiceMeetingBtn');

  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', handleCreateMeeting);
  }

  if (clearMeetingBtn) {
    clearMeetingBtn.addEventListener('click', clearMeetingForm);
  }

  if (voiceMeetingBtn) {
    voiceMeetingBtn.addEventListener('click', startMeetingVoiceInput);
  }

  if (stopVoiceMeetingBtn) {
    stopVoiceMeetingBtn.addEventListener('click', stopMeetingVoiceInput);
  }
}

// ==========================================
// SPEECH RECOGNITION SETUP
// ==========================================
function setupMeetingSpeechRecognition() {
  if (!MeetingSpeechRecognition) {
    console.log('Speech recognition not supported in this browser.');
    return;
  }

  meetingRecognition = new MeetingSpeechRecognition();
  meetingRecognition.continuous = true;
  meetingRecognition.interimResults = true;
  meetingRecognition.lang = 'en-US';

  meetingRecognition.onstart = function () {
    isMeetingListening = true;
    showMeetingListeningUI(true);
    updateMeetingStatus('Listening for meeting details...');
  };

  meetingRecognition.onresult = function (event) {
    let finalText = '';
    let interimText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript + ' ';
      } else {
        interimText += transcript;
      }
    }

    if (finalText) {
      meetingTranscript += finalText;
    }

    const textarea = document.getElementById('meetingRequest');
    textarea.value = (meetingTranscript + interimText).trim();
  };

  meetingRecognition.onerror = function (event) {
    console.error('Meeting speech recognition error:', event.error);
    showMeetingListeningUI(false);
    isMeetingListening = false;
    updateMeetingStatus('Voice input failed: ' + event.error);
  };

  meetingRecognition.onend = function () {
    showMeetingListeningUI(false);
    isMeetingListening = false;
    updateMeetingStatus('Voice input stopped. Review the text and click Create Meeting.');
  };
}

// ==========================================
// START / STOP VOICE INPUT
// ==========================================
function startMeetingVoiceInput() {
  if (!meetingRecognition) {
    alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
    return;
  }

  if (isMeetingListening) {
    return;
  }

  meetingTranscript = document.getElementById('meetingRequest').value.trim();
  if (meetingTranscript.length > 0 && !meetingTranscript.endsWith(' ')) {
    meetingTranscript += ' ';
  }

  try {
    meetingRecognition.start();
  } catch (error) {
    console.error('Could not start meeting voice input:', error);
  }
}

function stopMeetingVoiceInput() {
  if (meetingRecognition && isMeetingListening) {
    meetingRecognition.stop();
  }
}

function showMeetingListeningUI(isVisible) {
  const statusBox = document.getElementById('meetingListeningStatus');
  const voiceBtn = document.getElementById('voiceMeetingBtn');
  const stopBtn = document.getElementById('stopVoiceMeetingBtn');

  if (statusBox) {
    statusBox.style.display = isVisible ? 'flex' : 'none';
  }

  if (voiceBtn) {
    voiceBtn.style.display = isVisible ? 'none' : 'inline-block';
  }

  if (stopBtn) {
    stopBtn.style.display = isVisible ? 'inline-block' : 'none';
  }
}

// ==========================================
// CREATE MEETING
// ==========================================
async function handleCreateMeeting() {
  const userEmail = document.getElementById('meetingUserEmail').value.trim();
  const meetingRequest = document.getElementById('meetingRequest').value.trim();

  if (!userEmail || !meetingRequest) {
    alert('Please enter your email and meeting request.');
    return;
  }

  updateMeetingStatus('Extracting meeting details with AI...');

  try {
    const response = await fetch('http://localhost:3000/schedule-meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail, meetingRequest }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.meeting) {
      throw new Error('Meeting data missing from server response.');
    }

    const meeting = {
      id: Date.now(),
      userEmail,
      title: data.meeting.title || 'Untitled Meeting',
      date: data.meeting.date || 'Not specified',
      time: data.meeting.time || 'Not specified',
      attendees: Array.isArray(data.meeting.attendees) ? data.meeting.attendees : [],
      purpose: data.meeting.purpose || 'No purpose provided',
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    meetings.unshift(meeting);
    saveMeetingsToStorage();
    renderMeetingsList();
    showMeetingResult(meeting);
    createLocalSentConfirmation(meeting);

    updateMeetingStatus('Meeting created successfully and confirmation added to Sent.');

    document.getElementById('meetingRequest').value = '';
    meetingTranscript = '';
  } catch (error) {
    console.error('Meeting creation failed:', error);
    updateMeetingStatus('Meeting creation failed. Please try again.');
    alert('Meeting creation failed. Please try again.');
  }
}

// ==========================================
// SHOW PARSED RESULT
// ==========================================
function showMeetingResult(meeting) {
  const meetingResultCard = document.getElementById('meetingResultCard');

  document.getElementById('meetingResultTitle').textContent = meeting.title;
  document.getElementById('meetingResultDate').textContent = meeting.date;
  document.getElementById('meetingResultTime').textContent = meeting.time;
  document.getElementById('meetingResultAttendees').textContent =
    meeting.attendees.length > 0 ? meeting.attendees.join(', ') : 'None listed';
  document.getElementById('meetingResultPurpose').textContent = meeting.purpose;

  meetingResultCard.style.display = 'block';
}

// ==========================================
// RENDER SAVED MEETINGS
// ==========================================
function renderMeetingsList() {
  const meetingsList = document.getElementById('meetingsList');
  const meetingsEmpty = document.getElementById('meetingsEmpty');

  meetingsList.innerHTML = '';

  if (meetings.length === 0) {
    meetingsEmpty.style.display = 'block';
    return;
  }

  meetingsEmpty.style.display = 'none';

  meetings.forEach((meeting) => {
    const meetingItem = document.createElement('div');
    meetingItem.className = 'meeting-item';

    meetingItem.innerHTML = `
      <div class="meeting-item-title">${escapeHtml(meeting.title)}</div>
      <div class="meeting-item-meta"><strong>Date:</strong> ${escapeHtml(meeting.date)}</div>
      <div class="meeting-item-meta"><strong>Time:</strong> ${escapeHtml(meeting.time)}</div>
      <div class="meeting-item-meta"><strong>Attendees:</strong> ${escapeHtml(
        meeting.attendees.length > 0 ? meeting.attendees.join(', ') : 'None listed'
      )}</div>
      <div class="meeting-item-meta"><strong>Created:</strong> ${escapeHtml(meeting.createdAt)}</div>
      <div class="meeting-item-purpose">${escapeHtml(meeting.purpose)}</div>
    `;

    meetingsList.appendChild(meetingItem);
  });
}

// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================
function saveMeetingsToStorage() {
  localStorage.setItem('mailHackMeetings', JSON.stringify(meetings));
}

// ==========================================
// CREATE LOCAL SENT CONFIRMATION
// ==========================================
function createLocalSentConfirmation(meeting) {
  const sentMessages = JSON.parse(localStorage.getItem('mailHackSentMessages') || '[]');

  const confirmationBody = `Hi,

Your meeting has been scheduled successfully.

Title: ${meeting.title}
Date: ${meeting.date}
Time: ${meeting.time}
Attendees: ${meeting.attendees.length > 0 ? meeting.attendees.join(', ') : 'None listed'}
Purpose: ${meeting.purpose}

Best regards,
Mail Hack Assistant`;

  const confirmationMessage = {
    id: Date.now(),
    recipient: meeting.userEmail,
    subject: `Meeting Scheduled: ${meeting.title}`,
    body: confirmationBody,
    timestamp: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };

  sentMessages.unshift(confirmationMessage);
  localStorage.setItem('mailHackSentMessages', JSON.stringify(sentMessages));
}

// ==========================================
// CLEAR FORM
// ==========================================
function clearMeetingForm() {
  document.getElementById('meetingUserEmail').value = '';
  document.getElementById('meetingRequest').value = '';
  document.getElementById('meetingResultCard').style.display = 'none';
  meetingTranscript = '';
  updateMeetingStatus('Form cleared.');
}

// ==========================================
// STATUS
// ==========================================
function updateMeetingStatus(message) {
  const statusText = document.getElementById('meetingStatusText');
  if (statusText) {
    statusText.textContent = message;
  }
}

// ==========================================
// HELPER: ESCAPE HTML
// ==========================================
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}