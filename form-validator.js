/**
 * RVITM Admissions Enquiry Form Validation & Submission Handler
 * Enhanced UX:
 * - Lazy / Gentle validation (no aggressive red errors on the first keystroke)
 * - Validates on 'blur' first; only activates live 'input' correction after an error has occurred
 * - "Results Awaiting / Class 12 Appearing" support
 * - Dynamic Reference ID generation
 * - Celebratory modal with PDF brochure download & WhatsApp counselor connect
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admissionsEnquiryForm');
  if (!form) return;

  const awaitingResultsCheckbox = document.getElementById('awaitingResults');
  const pcmScoreInput = document.getElementById('pcmScore');

  const fields = {
    name: {
      input: document.getElementById('applicantName'),
      group: document.getElementById('nameGroup'),
      feedback: document.getElementById('nameFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Please enter your full name';
        if (val.trim().length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z\s.]+$/.test(val.trim())) return 'Name should contain only letters and spaces';
        return '';
      }
    },
    email: {
      input: document.getElementById('applicantEmail'),
      group: document.getElementById('emailGroup'),
      feedback: document.getElementById('emailFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Email address is required';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val.trim())) return 'Please enter a valid email address (e.g. name@example.com)';
        return '';
      }
    },
    phone: {
      input: document.getElementById('applicantPhone'),
      group: document.getElementById('phoneGroup'),
      feedback: document.getElementById('phoneFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        const cleaned = (val || '').replace(/\D/g, '');
        if (cleaned.length === 0) return '10-digit mobile number is required';
        if (cleaned.length !== 10) return `Must be 10 digits (currently ${cleaned.length} digits)`;
        if (!/^[6-9]/.test(cleaned)) return 'Indian mobile numbers must start with 6, 7, 8, or 9';
        return '';
      }
    },
    state: {
      input: document.getElementById('applicantState'),
      group: document.getElementById('stateGroup'),
      feedback: document.getElementById('stateFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        if (!val || val === '') return 'Please select your state of domicile';
        return '';
      }
    },
    branch: {
      input: document.getElementById('branchPreference'),
      group: document.getElementById('branchGroup'),
      feedback: document.getElementById('branchFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        if (!val || val === '') return 'Please select your preferred engineering branch';
        return '';
      }
    },
    quota: {
      input: document.getElementById('quotaPreference'),
      group: document.getElementById('quotaGroup'),
      feedback: document.getElementById('quotaFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        if (!val || val === '') return 'Please select your planned admission pathway';
        return '';
      }
    },
    pcmScore: {
      input: pcmScoreInput,
      group: document.getElementById('pcmGroup'),
      feedback: document.getElementById('pcmFeedback'),
      touched: false,
      hasError: false,
      validate: (val) => {
        // If results awaiting is checked, marks input is exempt
        if (awaitingResultsCheckbox && awaitingResultsCheckbox.checked) {
          return '';
        }
        if (!val || val.trim() === '') return 'Please enter your Class 12 / PUC PCM percentage';
        const num = parseFloat(val);
        if (isNaN(num) || num < 35 || num > 100) return 'Percentage must be between 35% and 100%';
        return '';
      }
    },
    consent: {
      input: document.getElementById('agreeTerms'),
      group: document.getElementById('consentGroup'),
      feedback: document.getElementById('consentFeedback'),
      touched: false,
      hasError: false,
      validate: (checked) => {
        if (!checked) return 'You must agree to the admission policies to proceed';
        return '';
      }
    }
  };

  // Graceful Validation Engine
  function applyValidationUI(key, errorMsg, isCorrection = false) {
    const item = fields[key];
    if (!item || !item.group) return;

    if (errorMsg) {
      item.hasError = true;
      item.group.classList.remove('valid');
      item.group.classList.add('invalid');
      if (item.feedback) {
        item.feedback.textContent = errorMsg;
      }
    } else {
      item.hasError = false;
      item.group.classList.remove('invalid');
      item.group.classList.add('valid');
      if (item.feedback) {
        if (key === 'pcmScore') {
          if (awaitingResultsCheckbox && awaitingResultsCheckbox.checked) {
            item.feedback.textContent = '✓ Results Awaiting registered (Provisional counseling)';
          } else {
            const score = parseFloat(item.input.value);
            if (score >= 45) {
              item.feedback.textContent = '✓ Eligible for VTU Engineering Admissions';
            } else {
              item.feedback.textContent = 'ℹ️ Note: VTU requires 45% for General, 40% for Reserved categories';
            }
          }
        } else {
          item.feedback.textContent = '✓ Valid entry';
        }
      }
    }
  }

  // Attach event listeners with lazy evaluation
  Object.keys(fields).forEach(key => {
    const item = fields[key];
    if (!item.input) return;

    // 1. On BLUR: user has finished editing this field, validate now
    item.input.addEventListener('blur', () => {
      item.touched = true;
      const value = item.input.type === 'checkbox' ? item.input.checked : item.input.value;
      const errorMsg = item.validate(value);
      applyValidationUI(key, errorMsg);
    });

    // 2. On INPUT: only re-validate live if the field previously had an error (so user gets instant positive reinforcement)
    const eventType = item.input.type === 'checkbox' ? 'change' : 'input';
    item.input.addEventListener(eventType, () => {
      const value = item.input.type === 'checkbox' ? item.input.checked : item.input.value;
      
      if (item.hasError) {
        // Active correction mode: remove error immediately when fixed
        const errorMsg = item.validate(value);
        applyValidationUI(key, errorMsg, true);
      } else if (item.touched) {
        // If already touched, keep positive feedback up to date
        const errorMsg = item.validate(value);
        if (!errorMsg) {
          applyValidationUI(key, '');
        }
      }
    });
  });

  // Phone number: restrict non-digits cleanly
  if (fields.phone.input) {
    fields.phone.input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Handle "Results Awaiting" Checkbox Toggle
  if (awaitingResultsCheckbox && pcmScoreInput) {
    awaitingResultsCheckbox.addEventListener('change', () => {
      const pcmGroup = document.getElementById('pcmGroup');
      const pcmFeedback = document.getElementById('pcmFeedback');

      if (awaitingResultsCheckbox.checked) {
        pcmScoreInput.disabled = true;
        pcmScoreInput.placeholder = 'Results Awaiting (Exempt)';
        pcmScoreInput.value = '';
        pcmGroup.classList.remove('invalid');
        pcmGroup.classList.add('valid');
        pcmFeedback.textContent = '✓ Results Awaiting registered (Provisional counseling)';
        fields.pcmScore.hasError = false;
        fields.pcmScore.touched = true;
      } else {
        pcmScoreInput.disabled = false;
        pcmScoreInput.placeholder = 'e.g. 85.5';
        pcmGroup.classList.remove('valid');
        pcmFeedback.textContent = '';
        fields.pcmScore.touched = false;
        fields.pcmScore.hasError = false;
      }
    });
  }

  // Full form validation on Submit
  function validateEntireForm() {
    let allValid = true;
    let firstInvalid = null;

    Object.keys(fields).forEach(key => {
      const item = fields[key];
      if (!item.input) return;

      const value = item.input.type === 'checkbox' ? item.input.checked : item.input.value;
      const errorMsg = item.validate(value);

      item.touched = true;
      applyValidationUI(key, errorMsg);

      if (errorMsg) {
        allValid = false;
        if (!firstInvalid) {
          firstInvalid = item.input;
        }
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return allValid;
  }

  // Submit Handler
  window.handleEnquirySubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const isValid = validateEntireForm();
    if (!isValid) return;

    const submitBtn = document.getElementById('submitEnquiryBtn');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:20px; height:20px; margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#fbbf24"></path>
        </svg> Processing Application...
      `;
    }

    // Generate random Reference ID: RVITM-2025-XXXXX
    const randomRef = 'RVITM-2025-' + Math.floor(10000 + Math.random() * 90000);
    const candidateName = fields.name.input.value.trim();
    const candidateBranch = fields.branch.input.options[fields.branch.input.selectedIndex].text;

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      // Display Success Modal
      showSuccessModal(candidateName, candidateBranch, randomRef);

      // Reset form validations
      form.reset();
      if (awaitingResultsCheckbox) {
        awaitingResultsCheckbox.checked = false;
        pcmScoreInput.disabled = false;
        pcmScoreInput.placeholder = 'e.g. 85.5';
      }

      Object.keys(fields).forEach(key => {
        fields[key].touched = false;
        fields[key].hasError = false;
        if (fields[key].group) {
          fields[key].group.classList.remove('valid', 'invalid');
        }
        if (fields[key].feedback) {
          fields[key].feedback.textContent = '';
        }
      });
    }, 1200);
  };

  form.addEventListener('submit', window.handleEnquirySubmit);

  // Success Modal
  function showSuccessModal(name, branch, refId) {
    const modal = document.getElementById('successModalBackdrop');
    const nameEl = document.getElementById('modalCandidateName');
    const branchEl = document.getElementById('modalCandidateBranch');
    const refEl = document.getElementById('modalRefNumber');
    const whatsappLink = document.getElementById('modalWhatsappBtn');

    if (nameEl) nameEl.textContent = name;
    if (branchEl) branchEl.textContent = branch;
    if (refEl) refEl.textContent = refId;

    if (whatsappLink) {
      const msg = encodeURIComponent(`Hi Admissions Team, I have submitted an enquiry for ${branch} at RVITM with Reference ID: ${refId}. Could you please assist me with counseling?`);
      whatsappLink.href = `https://wa.me/918067178000?text=${msg}`;
    }

    if (modal) {
      modal.classList.add('open');
    }
  }

  // Modal Close buttons
  const closeModalBtns = document.querySelectorAll('.close-modal-trigger');
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('successModalBackdrop');
      if (modal) modal.classList.remove('open');
    });
  });

  const modal = document.getElementById('successModalBackdrop');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // Brochure Download Simulation
  const downloadBtn = document.getElementById('modalDownloadBrochureBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadBtn.innerHTML = '⬇️ Downloading Brochure...';
      setTimeout(() => {
        downloadBtn.innerHTML = '✓ Brochure Downloaded';
        alert('RVITM Official 2025-26 Information Brochure & Fee Matrix PDF has been downloaded successfully!');
      }, 1000);
    });
  }
});
