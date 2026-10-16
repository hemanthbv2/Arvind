/**
 * RVITM AI Admissions Co-Pilot & Chatbot Engine
 * Combining:
 * 1. Step Progress Bar with 1-Tap Undo & Edit Summary
 * 2. Rich Interactive Micro-Cards (Fee breakdown tables, interactive Cutoff Predictor widget)
 * 3. Proactive Behavior Nudges & Visual Page Co-Browsing (Field Highlighting)
 */

class AdmissionsChatbot {
  constructor() {
    this.isOpen = false;
    this.soundEnabled = true;
    this.copilotActive = false;
    this.copilotStep = 0;
    this.copilotData = {
      name: '',
      email: '',
      phone: '',
      branch: '',
      quota: '',
      pcmScore: '',
      state: 'Karnataka'
    };

    // DOM Elements
    this.widgetWindow = document.getElementById('chatbotWindow');
    this.toggleBtn = document.getElementById('chatbotToggleBtn');
    this.closeBtn = document.getElementById('chatbotCloseBtn');
    this.soundBtn = document.getElementById('chatbotSoundBtn');
    this.clearBtn = document.getElementById('chatbotClearBtn');
    this.messagesContainer = document.getElementById('chatbotMessages');
    this.chatInput = document.getElementById('chatbotInput');
    this.sendBtn = document.getElementById('chatbotSendBtn');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.modeBanner = document.getElementById('chatbotModeBanner');
    this.modeToggleLink = document.getElementById('modeToggleLink');
    this.externalCopilotBtn = document.getElementById('triggerCopilotBtn');

    // Stepper Elements
    this.stepperHeader = document.getElementById('copilotStepperHeader');
    this.stepTitle = document.getElementById('copilotStepTitle');
    this.progressFill = document.getElementById('copilotProgressFill');
    this.undoBtn = document.getElementById('copilotUndoBtn');

    // Comprehensive Knowledge Base for RVITM Admissions
    this.knowledgeBase = [
      {
        patterns: ['code', 'kcet code', 'comedk code', 'college code'],
        answer: `🏛️ <strong>Official RVITM Counseling Codes:</strong><br>
        • <strong>KCET Code:</strong> <span style="color:#1d4ed8; font-weight:800;">E270</span><br>
        • <strong>COMEDK Code:</strong> <span style="color:#1d4ed8; font-weight:800;">E175</span><br>
        Use these exact codes during KEA / COMEDK online option entry.`
      },
      {
        patterns: ['fee', 'fees', 'cost', 'fee structure', 'tuition', 'management fee'],
        isRichFee: true
      },
      {
        patterns: ['cutoff', 'cutoffs', 'rank', 'ranks', 'eligibility', 'eligible', 'criteria', 'minimum marks', 'pcm'],
        isRichCutoff: true
      },
      {
        patterns: ['branch', 'courses', 'programs', 'degrees', 'branches'],
        answer: `🎓 <strong>B.E. Specializations Offered at RVITM:</strong><br>
        • <strong>CSE:</strong> Computer Science & Engineering (180 Seats)<br>
        • <strong>AI & ML:</strong> Artificial Intelligence & Machine Learning (120 Seats)<br>
        • <strong>ISE:</strong> Information Science & Engineering (120 Seats)<br>
        • <strong>ECE:</strong> Electronics & Communication Engineering (120 Seats)<br><br>
        All branches are affiliated to VTU Belagavi and approved by AICTE.`
      },
      {
        patterns: ['placement', 'placements', 'highest package', 'average package', 'companies', 'salary', 'ctc'],
        isRichPlacement: true
      },
      {
        patterns: ['hostel', 'hostels', 'accommodation', 'mess', 'rooms', 'living'],
        answer: `🏢 <strong>RVITM On-Campus Hostel Amenities:</strong><br>
        • Separate secure hostels for Boys and Girls.<br>
        • High-speed Wi-Fi throughout residential quarters.<br>
        • Hygienic multi-cuisine South & North Indian dining mess.<br>
        • 24x7 security surveillance, biometric access, and RO drinking water.`
      },
      {
        patterns: ['rvce', 'difference', 'compare', 'rvce vs rvitm'],
        answer: `🌟 <strong>RVCE vs RVITM:</strong><br>
        • Both institutes belong to the 80+ year old <strong>RSST (Rashtreeya Sikshana Samithi Trust)</strong>.<br>
        • RVITM was established in JP Nagar, Bengaluru as a state-of-the-art tech campus with 100% ICT-enabled digital classrooms.<br>
        • RVITM shares centralized RSST industrial collaboration, placement networks, and core faculty training standards with the RV brand.`
      },
      {
        patterns: ['doubt', 'not clear', 'still confused', 'not answered', 'unclear', 'help me talk', 'customer care', 'care', 'support', 'call college', 'phone number', 'contact number', 'helpline', 'representative', 'human', 'call', 'talk to person', 'agent', 'officer', 'contact', 'email', 'timing', 'phone', 'helpdesk'],
        isRichContact: true
      }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.initProactiveNudges();
  }

  bindEvents() {
    // Open/Close
    this.toggleBtn.addEventListener('click', () => this.toggleWindow());
    this.closeBtn.addEventListener('click', () => this.toggleWindow(false));

    // Sound toggle
    this.soundBtn.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      this.soundBtn.textContent = this.soundEnabled ? '🔔' : '🔕';
      this.soundBtn.title = this.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds';
    });

    // Clear chat
    this.clearBtn.addEventListener('click', () => this.resetChat());

    // Send msg
    this.sendBtn.addEventListener('click', () => this.handleUserSend());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleUserSend();
      }
    });

    // Toggle Co-Pilot mode link
    if (this.modeToggleLink) {
      this.modeToggleLink.addEventListener('click', () => {
        if (this.copilotActive) {
          this.exitCopilotMode();
        } else {
          this.startCopilotMode();
        }
      });
    }

    // Trigger Co-Pilot from external button
    if (this.externalCopilotBtn) {
      this.externalCopilotBtn.addEventListener('click', () => {
        this.toggleWindow(true);
        this.startCopilotMode();
      });
    }

    // Stepper Undo Button
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => {
        this.undoStep();
      });
    }
  }

  toggleWindow(forceState) {
    this.isOpen = typeof forceState === 'boolean' ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.widgetWindow.classList.add('open');
      this.chatInput.focus();
      const hint = document.getElementById('chatbotBubbleHint');
      if (hint) hint.style.display = 'none';
      this.playChime('open');
    } else {
      this.widgetWindow.classList.remove('open');
      this.clearFieldHighlight();
    }
  }

  playChime(type = 'message') {
    if (!this.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'message') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else if (type === 'open') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext policy
    }
  }

  appendMessage(htmlContent, sender = 'bot', chips = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = htmlContent;

    msgDiv.appendChild(bubble);

    // If chips provided
    if (chips && chips.length > 0) {
      const chipsWrapper = document.createElement('div');
      chipsWrapper.className = 'quick-chips-container';
      chips.forEach(chip => {
        const btn = document.createElement('button');
        btn.className = `quick-chip ${chip.className || ''}`;
        btn.innerHTML = chip.label;
        btn.onclick = () => {
          this.handleChipClick(chip);
        };
        chipsWrapper.appendChild(btn);
      });
      msgDiv.appendChild(chipsWrapper);
    }

    // Timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'msg-timestamp';
    const now = new Date();
    timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.appendChild(timeSpan);

    this.messagesContainer.appendChild(msgDiv);
    this.scrollToBottom();

    if (sender === 'bot') {
      this.playChime('message');
    }
  }

  showTyping(show = true) {
    if (show) {
      this.typingIndicator.style.display = 'flex';
      this.messagesContainer.appendChild(this.typingIndicator);
      this.scrollToBottom();
    } else {
      this.typingIndicator.style.display = 'none';
    }
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  handleUserSend() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    this.appendMessage(text, 'user');
    this.chatInput.value = '';

    this.showTyping(true);

    setTimeout(() => {
      this.showTyping(false);
      if (this.copilotActive) {
        this.processCopilotInput(text);
      } else {
        this.processKnowledgeQuery(text);
      }
    }, 450);
  }

  handleChipClick(chip) {
    this.appendMessage(chip.label, 'user');
    this.showTyping(true);

    setTimeout(() => {
      this.showTyping(false);
      if (chip.action === 'copilot_start') {
        this.startCopilotMode();
      } else if (chip.action === 'copilot_choice') {
        this.processCopilotInput(chip.value);
      } else if (chip.action === 'faq_query') {
        this.processKnowledgeQuery(chip.query);
      } else if (chip.action === 'jump_step') {
        this.jumpToStep(chip.step);
      }
    }, 400);
  }

  // ==========================================================================
  // Rich Interactive Micro-Cards (Option 1 UX)
  // ==========================================================================
  renderFeeCard() {
    return `
      <div class="chat-rich-card">
        <div class="chat-card-title">
          <span>💰 Annual B.E. Fee Matrix</span>
          <span class="chat-badge-pill" style="background:#fef3c7; color:#92400e;">2025–26</span>
        </div>
        <table class="chat-table-mini">
          <thead>
            <tr><th>Quota</th><th>Approx Fee</th><th>Counseling</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>KCET (Govt)</strong></td>
              <td>~₹1,07,000 / yr</td>
              <td>KEA (Code E270)</td>
            </tr>
            <tr>
              <td><strong>COMEDK</strong></td>
              <td>~₹2,64,000 / yr</td>
              <td>All-India (Code E175)</td>
            </tr>
            <tr>
              <td><strong>Management</strong></td>
              <td>Branch specific</td>
              <td>RSST Screening</td>
            </tr>
          </tbody>
        </table>
        <button class="chat-card-action-btn chat-btn-download" onclick="alert('Downloading Official RVITM 2025–26 Fee Structure & Seat Matrix PDF...')">
          📄 Download Official Fee Matrix (PDF)
        </button>
      </div>
    `;
  }

  renderCutoffPredictorCard() {
    return `
      <div class="chat-rich-card">
        <div class="chat-card-title">
          <span>🎯 Cutoff & Branch Predictor</span>
          <span class="chat-badge-pill" style="background:#e0e7ff; color:#3730a3;">2024 Cutoff Trends</span>
        </div>
        <p style="font-size:0.78rem; color:#64748b; margin-bottom:0.4rem;">Select your KCET / COMEDK rank range:</p>
        <div class="cutoff-tiers-wrap">
          <button class="cutoff-tier-btn" onclick="window.admissionsBot.showCutoffPrediction('tier1', this)">&lt; 5,000</button>
          <button class="cutoff-tier-btn" onclick="window.admissionsBot.showCutoffPrediction('tier2', this)">5,000 – 12,000</button>
          <button class="cutoff-tier-btn" onclick="window.admissionsBot.showCutoffPrediction('tier3', this)">12,000 – 22,000</button>
          <button class="cutoff-tier-btn" onclick="window.admissionsBot.showCutoffPrediction('tier4', this)">22,000+</button>
        </div>
        <div class="cutoff-prediction-result" id="cutoffResultBox">
          👆 Click any rank range above for instant branch eligibility analysis.
        </div>
      </div>
    `;
  }

  showCutoffPrediction(tier, btnEl) {
    // Highlight button
    const parent = btnEl.closest('.cutoff-tiers-wrap');
    if (parent) {
      parent.querySelectorAll('.cutoff-tier-btn').forEach(b => b.classList.remove('selected'));
      btnEl.classList.add('selected');
    }

    const box = document.getElementById('cutoffResultBox');
    if (!box) return;

    if (tier === 'tier1') {
      box.innerHTML = `🟢 <strong>High Probability:</strong> Eligible for all 4 branches including <strong>Computer Science (CSE)</strong> and <strong>AI & ML</strong>. Priority KCET/COMEDK seat allotment.`;
      box.style.borderLeftColor = '#10b981';
    } else if (tier === 'tier2') {
      box.innerHTML = `🟢 <strong>Strong Match:</strong> High probability for <strong>AI & ML</strong>, <strong>Information Science (ISE)</strong>, and <strong>ECE</strong>. Competitive for CSE in Round 1/2.`;
      box.style.borderLeftColor = '#3b82f6';
    } else if (tier === 'tier3') {
      box.innerHTML = `🟡 <strong>Moderate Match:</strong> Strong probability for <strong>Electronics & Communication (ECE)</strong> and <strong>ISE</strong> in subsequent rounds. Early Management seat booking recommended.`;
      box.style.borderLeftColor = '#f59e0b';
    } else {
      box.innerHTML = `ℹ️ <strong>Alternative Pathways:</strong> Consider COMEDK Round 3 mop-up or direct <strong>RSST Management Quota</strong> for confirmed seat booking in CSE/AIML.`;
      box.style.borderLeftColor = '#6366f1';
    }
    this.scrollToBottom();
  }

  renderPlacementCard() {
    return `
      <div class="chat-rich-card">
        <div class="chat-card-title">
          <span>💼 Verified Placement Metrics</span>
          <span class="chat-badge-pill" style="background:#dcfce7; color:#15803d;">RSST Excellence</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.6rem;">
          <div style="background:#f8fafc; padding:0.4rem; border-radius:4px; text-align:center;">
            <div style="font-size:1.15rem; font-weight:800; color:#10b981;">₹45.0 LPA</div>
            <div style="font-size:0.7rem; color:#64748b;">Highest Package</div>
          </div>
          <div style="background:#f8fafc; padding:0.4rem; border-radius:4px; text-align:center;">
            <div style="font-size:1.15rem; font-weight:800; color:#1d4ed8;">94% Placed</div>
            <div style="font-size:0.7rem; color:#64748b;">Placement Rate</div>
          </div>
        </div>
        <p style="font-size:0.78rem; color:#475569; margin-bottom:0.5rem;"><strong>Marquee Recruiters:</strong> Microsoft, Amazon, Cisco, Bosch, Adobe, IBM, Capgemini, Mercedes-Benz.</p>
        <button class="chat-card-action-btn chat-btn-download" onclick="window.location.href='#placements'">
          🔍 View Student Testimonials & Offers
        </button>
      </div>
    `;
  }

  renderContactCard(customNote = "If your doubt is still not clarified, our Admissions Customer Care officers are available to assist you immediately:") {
    return `
      <div class="chat-rich-card" style="border-left: 3px solid #f59e0b;">
        <div class="chat-card-title">
          <span>📞 College Customer Care & Helpdesk</span>
          <span class="chat-badge-pill" style="background:#dcfce7; color:#166534;">Open Mon–Sat</span>
        </div>
        <p style="font-size:0.8rem; color:#475569; margin-bottom:0.65rem; line-height:1.45;">
          ${customNote}
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem; margin-bottom:0.75rem; font-size:0.82rem; line-height:1.7;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.3rem; margin-bottom:0.3rem;">
            <span style="color:#64748b; font-weight:600;">Customer Care (Landline):</span>
            <a href="tel:+918067178000" style="font-weight:800; color:#1d4ed8; text-decoration:underline;">+91 80 6717 8000</a>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.3rem; margin-bottom:0.3rem;">
            <span style="color:#64748b; font-weight:600;">Admissions Mobile Helpline:</span>
            <a href="tel:+919845012345" style="font-weight:800; color:#1d4ed8; text-decoration:underline;">+91 98450 12345</a>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.3rem; margin-bottom:0.3rem;">
            <span style="color:#64748b; font-weight:600;">Admissions Email:</span>
            <a href="mailto:admissions@rvitm.edu.in" style="font-weight:700; color:#0f172a;">admissions@rvitm.edu.in</a>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#64748b; font-weight:600;">Support Timings:</span>
            <span style="font-weight:700; color:#0f172a;">9:00 AM – 5:00 PM IST</span>
          </div>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="tel:+918067178000" class="chat-card-action-btn" style="flex:1; background:#1d4ed8; color:#ffffff; min-width:130px; text-decoration:none;">
            <span>📞 Call Customer Care</span>
          </a>
          <a href="https://wa.me/918067178000?text=Hi%20RVITM%20Admissions%20Customer%20Care,%20my%20doubt%20was%20not%20clarified%20on%20the%20website.%20Could%20you%20please%20assist%20me?" target="_blank" class="chat-card-action-btn chat-btn-whatsapp" style="flex:1; min-width:130px; text-decoration:none;">
            <span>💬 WhatsApp Desk</span>
          </a>
        </div>
      </div>
    `;
  }

  processKnowledgeQuery(text) {
    const cleanText = text.toLowerCase();

    // Check if user explicitly states their doubt is not clarified or asks for customer care / contact
    if (
      cleanText.includes('doubt') || 
      cleanText.includes('not clear') || 
      cleanText.includes('still confused') || 
      cleanText.includes('not answered') || 
      cleanText.includes('unclear') || 
      cleanText.includes('customer care') || 
      cleanText.includes('care number') || 
      cleanText.includes('contact number') || 
      cleanText.includes('phone number') || 
      cleanText.includes('helpline') || 
      cleanText.includes('call college')
    ) {
      this.appendMessage(
        `If your doubt is still not clarified, here are the direct contact details for the <strong>RVITM College Admissions Customer Care Desk</strong>:`,
        'bot'
      );
      this.appendMessage(this.renderContactCard("Please feel free to call our customer care numbers directly or message on WhatsApp:"), 'bot', [
        { label: '📝 Fill Enquiry Form', action: 'copilot_start', className: 'chip-gold' },
        { label: '🎯 Check Cutoffs', action: 'faq_query', query: 'cutoff' },
        { label: '💰 Fee Structure', action: 'faq_query', query: 'fee' }
      ]);
      return;
    }

    // Check if user asks to fill form
    if (cleanText.includes('form') || cleanText.includes('apply') || cleanText.includes('register') || cleanText.includes('enquiry')) {
      this.appendMessage(
        `I can help you fill out the official RVITM admissions enquiry form step-by-step right here in chat! Would you like to start?`,
        'bot',
        [
          { label: '🚀 Start Form Co-Pilot', action: 'copilot_start', className: 'chip-gold' },
          { label: '🎯 Check Eligibility First', action: 'faq_query', query: 'cutoff' },
          { label: '📞 College Customer Care', action: 'faq_query', query: 'customer care' }
        ]
      );
      return;
    }

    // Match against knowledgeBase
    let matched = null;
    for (const item of this.knowledgeBase) {
      for (const pattern of item.patterns) {
        if (cleanText.includes(pattern)) {
          matched = item;
          break;
        }
      }
      if (matched) break;
    }

    if (matched) {
      if (matched.isRichFee) {
        this.appendMessage(this.renderFeeCard(), 'bot', [
          { label: '📝 Fill Enquiry Form', action: 'copilot_start', className: 'chip-gold' },
          { label: '🎯 Check Cutoffs', action: 'faq_query', query: 'cutoff' },
          { label: '📞 Call Customer Care', action: 'faq_query', query: 'customer care' }
        ]);
      } else if (matched.isRichCutoff) {
        this.appendMessage(this.renderCutoffPredictorCard(), 'bot', [
          { label: '📝 Auto-Fill Form', action: 'copilot_start', className: 'chip-gold' },
          { label: '💰 Check Fees', action: 'faq_query', query: 'fee' },
          { label: '📞 Call Customer Care', action: 'faq_query', query: 'customer care' }
        ]);
      } else if (matched.isRichPlacement) {
        this.appendMessage(this.renderPlacementCard(), 'bot', [
          { label: '📝 Apply Now', action: 'copilot_start', className: 'chip-gold' },
          { label: '💰 Fee Structure', action: 'faq_query', query: 'fee' },
          { label: '📞 Call Customer Care', action: 'faq_query', query: 'customer care' }
        ]);
      } else if (matched.isRichContact) {
        this.appendMessage(this.renderContactCard("If your doubt is still not clarified, here are the direct numbers for the College Customer Care Desk:"), 'bot');
      } else {
        this.appendMessage(matched.answer, 'bot', [
          { label: '📝 Fill Form with AI', action: 'copilot_start', className: 'chip-gold' },
          { label: '💰 Fees & Quotas', action: 'faq_query', query: 'fee' },
          { label: '📞 Call Customer Care', action: 'faq_query', query: 'customer care' }
        ]);
      }
    } else {
      // General Fallback: If doubt is unclarified / query not recognized, explicitly give the College Customer Care Card!
      this.appendMessage(
        `I couldn't find a direct automated answer for that query.<br><br>` + 
        this.renderContactCard(`If your doubt is still not clarified, our <strong>College Admissions Customer Care</strong> is available to help you directly:`),
        'bot',
        [
          { label: '📝 Auto-Fill Enquiry Form', action: 'copilot_start', className: 'chip-gold' },
          { label: '🎯 Cutoffs & Predictor', action: 'faq_query', query: 'cutoff' },
          { label: '💰 Fee Structure', action: 'faq_query', query: 'fee' }
        ]
      );
    }
  }

  // ==========================================================================
  // Form Co-Pilot Guided Flow (Option 2) with Progress Stepper & Undo
  // ==========================================================================
  startCopilotMode() {
    this.copilotActive = true;
    this.copilotStep = 1;
    this.updateModeBanner();
    this.updateStepper();

    this.highlightPageField('applicantName');

    this.appendMessage(
      `👋 <strong>Form Co-Pilot Activated!</strong><br>I will walk you through 6 quick steps and auto-fill your application form in real time.<br><br>First, <strong>what is your full name?</strong>`,
      'bot'
    );
  }

  exitCopilotMode() {
    this.copilotActive = false;
    this.copilotStep = 0;
    this.updateModeBanner();
    this.updateStepper();
    this.clearFieldHighlight();

    this.appendMessage(
      `Switching back to Admissions Q&A mode. You can ask any questions regarding cutoffs, syllabus, or hostel facilities!`,
      'bot',
      [
        { label: '🎯 Check Eligibility', action: 'faq_query', query: 'cutoff' },
        { label: '💼 Placement Records', action: 'faq_query', query: 'placement' }
      ]
    );
  }

  updateModeBanner() {
    if (!this.modeBanner) return;
    if (this.copilotActive) {
      this.modeBanner.innerHTML = `
        <span class="mode-badge" style="color:#d97706;">⚡ Mode: Interactive Form Co-Pilot</span>
        <span class="mode-toggle-link" id="modeToggleLink">Exit to Q&A</span>
      `;
    } else {
      this.modeBanner.innerHTML = `
        <span class="mode-badge">🤖 Mode: Admission Q&A Assistant</span>
        <span class="mode-toggle-link" id="modeToggleLink">Fill Form with AI</span>
      `;
    }
    document.getElementById('modeToggleLink').addEventListener('click', () => {
      if (this.copilotActive) this.exitCopilotMode();
      else this.startCopilotMode();
    });
  }

  updateStepper() {
    if (!this.stepperHeader) return;
    if (!this.copilotActive) {
      this.stepperHeader.classList.remove('active');
      return;
    }

    this.stepperHeader.classList.add('active');
    const stepsConfig = [
      { num: 1, label: 'Candidate Full Name', pct: '16%' },
      { num: 2, label: 'Email Address', pct: '33%' },
      { num: 3, label: '10-Digit Mobile Number', pct: '50%' },
      { num: 4, label: 'B.E. Branch Preference', pct: '66%' },
      { num: 5, label: 'Admission Quota', pct: '83%' },
      { num: 6, label: '12th / PUC PCM Marks', pct: '100%' },
      { num: 7, label: 'Application Summary & Review', pct: '100%' }
    ];

    const current = stepsConfig.find(s => s.num === this.copilotStep) || stepsConfig[0];
    if (this.stepTitle) {
      this.stepTitle.textContent = `Step ${current.num} of 6 • ${current.label}`;
    }
    if (this.progressFill) {
      this.progressFill.style.width = current.pct;
    }
  }

  undoStep() {
    if (this.copilotStep <= 1) {
      this.appendMessage(`You are at the first step (Candidate Name).`, 'bot');
      return;
    }

    this.jumpToStep(this.copilotStep - 1);
  }

  jumpToStep(targetStep) {
    this.copilotStep = targetStep;
    this.updateStepper();

    switch (targetStep) {
      case 1:
        this.highlightPageField('applicantName');
        this.appendMessage(`↩️ <strong>Editing Step 1:</strong> What is your corrected <strong>Full Name</strong>?`, 'bot');
        break;
      case 2:
        this.highlightPageField('applicantEmail');
        this.appendMessage(`↩️ <strong>Editing Step 2:</strong> What is your corrected <strong>Email Address</strong>?`, 'bot');
        break;
      case 3:
        this.highlightPageField('applicantPhone');
        this.appendMessage(`↩️ <strong>Editing Step 3:</strong> What is your corrected <strong>10-digit mobile number</strong>?`, 'bot');
        break;
      case 4:
        this.highlightPageField('branchPreference');
        this.appendMessage(`↩️ <strong>Editing Step 4:</strong> Which <strong>B.E. Branch</strong> would you like to choose?`, 'bot', [
          { label: '💻 CSE', action: 'copilot_choice', value: 'CSE' },
          { label: '🤖 AI & ML', action: 'copilot_choice', value: 'AIML' },
          { label: '📊 ISE', action: 'copilot_choice', value: 'ISE' },
          { label: '📡 ECE', action: 'copilot_choice', value: 'ECE' }
        ]);
        break;
      case 5:
        this.highlightPageField('quotaPreference');
        this.appendMessage(`↩️ <strong>Editing Step 5:</strong> Which <strong>Admission Quota</strong>?`, 'bot', [
          { label: '🏛️ KCET (Code E270)', action: 'copilot_choice', value: 'KCET' },
          { label: '🌐 COMEDK (Code E175)', action: 'copilot_choice', value: 'COMEDK' },
          { label: '⭐ Management Quota', action: 'copilot_choice', value: 'Management' }
        ]);
        break;
      case 6:
        this.highlightPageField('pcmScore');
        this.appendMessage(`↩️ <strong>Editing Step 6:</strong> What is your <strong>12th / PUC PCM percentage</strong>, or are results awaiting?`, 'bot', [
          { label: '⏳ Results Awaiting', action: 'copilot_choice', value: 'AWAITING_RESULTS' }
        ]);
        break;
      default:
        this.showReviewSummary();
        break;
    }
  }

  processCopilotInput(text) {
    switch (this.copilotStep) {
      case 1: // Name
        if (text.length < 3 || /\d/.test(text)) {
          this.appendMessage(`Please enter a valid candidate name (at least 3 letters, no digits).`, 'bot');
          return;
        }
        this.copilotData.name = text;
        this.syncPageFormField('applicantName', text);

        this.copilotStep = 2;
        this.updateStepper();
        this.highlightPageField('applicantEmail');
        this.appendMessage(
          `Great to meet you, <strong>${text}</strong>! I've updated your name on the form.<br><br>What is your <strong>email address</strong> for sending the official prospectus & updates?`,
          'bot'
        );
        break;

      case 2: // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          this.appendMessage(`Please enter a valid email address (e.g., yourname@gmail.com).`, 'bot');
          return;
        }
        this.copilotData.email = text;
        this.syncPageFormField('applicantEmail', text);

        this.copilotStep = 3;
        this.updateStepper();
        this.highlightPageField('applicantPhone');
        this.appendMessage(
          `Got it! Now, what is your <strong>10-digit mobile number</strong>? We will send admission alerts and counseling updates here.`,
          'bot'
        );
        break;

      case 3: // Phone
        const cleanPhone = text.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
          this.appendMessage(`Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.`, 'bot');
          return;
        }
        this.copilotData.phone = cleanPhone;
        this.syncPageFormField('applicantPhone', cleanPhone);

        this.copilotStep = 4;
        this.updateStepper();
        this.highlightPageField('branchPreference');
        this.appendMessage(
          `Perfect! Which <strong>B.E. engineering branch</strong> are you interested in pursuing at RVITM?`,
          'bot',
          [
            { label: '💻 Computer Science (CSE)', action: 'copilot_choice', value: 'CSE' },
            { label: '🤖 AI & Machine Learning (AIML)', action: 'copilot_choice', value: 'AIML' },
            { label: '📊 Information Science (ISE)', action: 'copilot_choice', value: 'ISE' },
            { label: '📡 Electronics & Comm (ECE)', action: 'copilot_choice', value: 'ECE' }
          ]
        );
        break;

      case 4: // Branch
        this.copilotData.branch = text;
        this.syncPageFormField('branchPreference', text);

        this.copilotStep = 5;
        this.updateStepper();
        this.highlightPageField('quotaPreference');
        this.appendMessage(
          `Excellent choice! <strong>${text}</strong> is one of our flagship departments.<br><br>Which <strong>admission quota / entrance mode</strong> are you looking to apply under?`,
          'bot',
          [
            { label: '🏛️ KCET (Karnataka Quota)', action: 'copilot_choice', value: 'KCET' },
            { label: '🌐 COMEDK UGET (All India)', action: 'copilot_choice', value: 'COMEDK' },
            { label: '⭐ Management / Direct Quota', action: 'copilot_choice', value: 'Management' },
            { label: '🌍 NRI / Foreign National', action: 'copilot_choice', value: 'NRI' }
          ]
        );
        break;

      case 5: // Quota
        this.copilotData.quota = text;
        this.syncPageFormField('quotaPreference', text);

        this.copilotStep = 6;
        this.updateStepper();
        this.highlightPageField('pcmScore');
        this.appendMessage(
          `Noted! What is your approximate <strong>12th / 2nd PUC PCM score (%)</strong>? Or are you currently awaiting results?`,
          'bot',
          [
            { label: '⏳ Results Awaiting', action: 'copilot_choice', value: 'AWAITING_RESULTS' }
          ]
        );
        break;

      case 6: // PCM Score or Awaiting
        if (text === 'AWAITING_RESULTS' || text.toLowerCase().includes('await') || text.toLowerCase().includes('appearing')) {
          this.copilotData.pcmScore = 'Results Awaiting';
          const awaitingCb = document.getElementById('awaitingResults');
          if (awaitingCb) {
            awaitingCb.checked = true;
            awaitingCb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          const score = parseFloat(text.replace('%', ''));
          if (isNaN(score) || score < 0 || score > 100) {
            this.appendMessage(`Please enter a valid percentage between 40% and 100%, or select 'Results Awaiting'.`, 'bot', [
              { label: '⏳ Results Awaiting', action: 'copilot_choice', value: 'AWAITING_RESULTS' }
            ]);
            return;
          }
          this.copilotData.pcmScore = `${score}%`;
          const awaitingCbToggle = document.getElementById('awaitingResults');
          if (awaitingCbToggle && awaitingCbToggle.checked) {
            awaitingCbToggle.checked = false;
            awaitingCbToggle.dispatchEvent(new Event('change', { bubbles: true }));
          }
          this.syncPageFormField('pcmScore', score.toString());
        }

        this.copilotStep = 7;
        this.updateStepper();
        this.clearFieldHighlight();
        this.showReviewSummary();
        break;

      case 7: // Final Submit or Review
        if (text === 'SUBMIT_NOW' || text.toLowerCase().includes('submit') || text.toLowerCase().includes('yes')) {
          this.appendMessage(`Submitting your verified application enquiry now...`, 'bot');
          const form = document.getElementById('admissionsEnquiryForm');
          if (form) {
            const consent = document.getElementById('agreeTerms');
            if (consent) consent.checked = true;

            setTimeout(() => {
              if (window.handleEnquirySubmit) {
                window.handleEnquirySubmit(new Event('submit'));
              }
              this.appendMessage(
                `🎉 <strong>Submission Successful!</strong> Your Reference ID has been generated on the screen. Our Senior Admissions Counselor will contact you shortly on WhatsApp/Phone.`,
                'bot',
                [
                  { label: '🏛️ Check Cutoff Codes', action: 'faq_query', query: 'code' },
                  { label: '💰 Fee Structure Details', action: 'faq_query', query: 'fee' }
                ]
              );
              this.exitCopilotMode();
            }, 600);
          }
        } else {
          this.appendMessage(
            `You can review your details directly in the form on the left. Whenever you are ready, just click the <strong>"Submit Admission Enquiry"</strong> button!`,
            'bot'
          );
          this.exitCopilotMode();
        }
        break;

      default:
        this.exitCopilotMode();
        break;
    }
  }

  showReviewSummary() {
    const summaryCardHtml = `
      <div class="chat-rich-card">
        <div class="chat-card-title">
          <span>📋 Review Your Application</span>
          <span class="chat-badge-pill" style="background:#dcfce7; color:#15803d;">All Verified</span>
        </div>
        <div class="copilot-summary-list">
          <div class="copilot-summary-item">
            <span>Name: <strong>${this.copilotData.name}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(1)">✏️ Edit</span>
          </div>
          <div class="copilot-summary-item">
            <span>Email: <strong>${this.copilotData.email}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(2)">✏️ Edit</span>
          </div>
          <div class="copilot-summary-item">
            <span>Phone: <strong>+91 ${this.copilotData.phone}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(3)">✏️ Edit</span>
          </div>
          <div class="copilot-summary-item">
            <span>Branch: <strong>${this.copilotData.branch}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(4)">✏️ Edit</span>
          </div>
          <div class="copilot-summary-item">
            <span>Quota: <strong>${this.copilotData.quota}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(5)">✏️ Edit</span>
          </div>
          <div class="copilot-summary-item">
            <span>Marks: <strong>${this.copilotData.pcmScore}</strong></span>
            <span class="copilot-edit-link" onclick="window.admissionsBot.jumpToStep(6)">✏️ Edit</span>
          </div>
        </div>
        <p style="font-size:0.78rem; color:#475569; margin-bottom:0.6rem;">Everything look good? You can submit your application enquiry now or edit any step.</p>
      </div>
    `;

    this.appendMessage(summaryCardHtml, 'bot', [
      { label: '✅ Submit Application Now', action: 'copilot_choice', value: 'SUBMIT_NOW', className: 'chip-gold' },
      { label: '✏️ Review on Webpage', action: 'copilot_choice', value: 'REVIEW_FORM' }
    ]);
  }

  // ==========================================================================
  // Visual Co-Browsing: Highlight Active Field on Webpage
  // ==========================================================================
  highlightPageField(fieldId) {
    this.clearFieldHighlight();
    const input = document.getElementById(fieldId);
    if (!input) return;

    const group = input.closest('.form-group');
    if (group) {
      group.classList.add('field-co-pilot-focus');
      // Smooth scroll the form into view
      group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  clearFieldHighlight() {
    document.querySelectorAll('.field-co-pilot-focus').forEach(el => {
      el.classList.remove('field-co-pilot-focus');
    });
  }

  syncPageFormField(fieldId, value) {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ==========================================================================
  // Proactive Behavioral Nudges (Contextual Triggers)
  // ==========================================================================
  initProactiveNudges() {
    const bubbleHint = document.getElementById('chatbotBubbleHint');
    if (!bubbleHint) return;

    let hasNudged = false;
    let timer = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasNudged && !this.isOpen) {
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (!this.isOpen && !hasNudged) {
              hasNudged = true;
              if (entry.target.id === 'programs') {
                bubbleHint.querySelector('span').textContent = '👋 Exploring B.E. Branches? I can check your cutoff rank eligibility in 1 tap!';
              } else if (entry.target.id === 'pathways') {
                bubbleHint.querySelector('span').textContent = '💡 Confused between KCET & COMEDK? Ask me for fee & seat comparisons!';
              }
              bubbleHint.style.display = 'flex';
            }
          }, 9000); // 9 seconds dwell
        }
      });
    }, { threshold: 0.4 });

    const pathwaysSec = document.getElementById('pathways');
    const programsSec = document.getElementById('programs');
    if (pathwaysSec) observer.observe(pathwaysSec);
    if (programsSec) observer.observe(programsSec);
  }

  resetChat() {
    this.messagesContainer.innerHTML = '';
    this.copilotActive = false;
    this.copilotStep = 0;
    this.updateModeBanner();
    this.updateStepper();
    this.clearFieldHighlight();

    this.appendMessage(
      `Hello! I'm your <strong>RVITM Admissions Co-Pilot</strong>. I can assist you with cutoff ranks, fee details, campus facilities, or even auto-fill your enquiry form for you.<br><br>How can I help you today?`,
      'bot',
      [
        { label: '🎯 Check Cutoffs & Eligibility', action: 'faq_query', query: 'cutoff' },
        { label: '💰 Fee Structure & Quotas', action: 'faq_query', query: 'fee' },
        { label: '💼 Placement Records 2024', action: 'faq_query', query: 'placement' },
        { label: '📝 Help Me Fill The Form', action: 'copilot_start', className: 'chip-gold' },
        { label: '🏢 Hostel & Facilities', action: 'faq_query', query: 'hostel' }
      ]
    );
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.admissionsBot = new AdmissionsChatbot();
});
