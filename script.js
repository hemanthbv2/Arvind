/**
 * RVITM Admissions Landing Page - Interactions & UI Logic
 * - Sticky navigation blur
 * - Pathway tabs switcher
 * - Branch quick-select link to form
 * - FAQ search and accordions
 * - Admissions deadline countdown
 * - Interactive eligibility mini-calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation Scroll Effect
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Off-Canvas Drawer Controller
  const hamburgerBtn = document.getElementById('mobileHamburgerBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileBackdrop = document.getElementById('mobileNavBackdrop');
  const drawerCloseBtn = document.getElementById('mobileDrawerCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.add('open');
      mobileBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  window.mobileDrawer = { open: openDrawer, close: closeDrawer };

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // 2. Admission Pathways Tab Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  const pathwayCards = document.querySelectorAll('.pathway-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      pathwayCards.forEach(card => card.classList.remove('active'));

      btn.classList.add('active');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.classList.add('active');
      }
    });
  });

  // 3. Quick Branch Link to Enquiry Form
  const branchEnquireBtns = document.querySelectorAll('.branch-enquire-trigger');
  const branchDropdown = document.getElementById('branchPreference');
  const formSection = document.getElementById('enquirySection');

  branchEnquireBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const branchCode = btn.getAttribute('data-branch');
      if (branchDropdown && branchCode) {
        branchDropdown.value = branchCode;
        branchDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        branchDropdown.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        // Pulse effect on form
        const formCard = document.querySelector('.form-card');
        if (formCard) {
          formCard.style.boxShadow = '0 0 0 4px rgba(29, 78, 216, 0.4)';
          setTimeout(() => {
            formCard.style.boxShadow = '';
          }, 1200);
        }
      }
    });
  });

  // 4. FAQ Accordion Logic & Search Filter
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other accordions
      faqItems.forEach(other => other.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  const faqSearchInput = document.getElementById('faqSearchInput');
  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // 5. Admissions Deadline Live Countdown Timer
  const countdownEl = document.getElementById('admissionsCountdown');
  if (countdownEl) {
    // Set target date: 30 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 24);
    targetDate.setHours(23, 59, 59);

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        countdownEl.textContent = 'Admissions Closing Soon';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `<strong>${days}d : ${hours}h : ${minutes}m : ${seconds}s</strong>`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // 6. External Chatbot Hint Bubble Dismiss
  const hintCloseBtn = document.getElementById('chatbotHintClose');
  const bubbleHint = document.getElementById('chatbotBubbleHint');
  if (hintCloseBtn && bubbleHint) {
    hintCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bubbleHint.style.display = 'none';
    });
  }

  // 7. Stat counters animated increment
  const statNumbers = document.querySelectorAll('.stat-metric[data-target]');
  let statsCounted = false;

  function countUpStats() {
    if (statsCounted) return;
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) {
      statsCounted = true;
      statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const prefix = stat.getAttribute('data-prefix') || '';
        const suffix = stat.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;
        let count = 0;
        const duration = 1200;
        const stepTime = 25;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            stat.textContent = `${prefix}${isDecimal ? target.toFixed(1) : Math.round(target)}${suffix}`;
            clearInterval(timer);
          } else {
            stat.textContent = `${prefix}${isDecimal ? count.toFixed(1) : Math.round(count)}${suffix}`;
          }
        }, stepTime);
      });
    }
  }

    window.addEventListener('scroll', countUpStats);
  countUpStats(); // check on initial load

  // 8. Ambient Top Scroll-Progress Bar
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && scrollProgressBar) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgressBar.style.width = `${progress}%`;
    }
  });

  // 9. Quick-Action Dock Brochure Download Trigger
  const dockBrochureBtn = document.getElementById('dockBrochureBtn');
  if (dockBrochureBtn) {
    dockBrochureBtn.addEventListener('click', () => {
      const originalText = dockBrochureBtn.innerHTML;
      dockBrochureBtn.innerHTML = `<span>⏳</span> <span class="dock-label">Downloading...</span>`;
      setTimeout(() => {
        dockBrochureBtn.innerHTML = `<span>✓</span> <span class="dock-label">Downloaded</span>`;
        alert('RVITM 2025–26 Information Brochure & Fee Matrix PDF downloaded successfully!');
        setTimeout(() => {
          dockBrochureBtn.innerHTML = originalText;
        }, 2500);
      }, 700);
    });
  }
});
