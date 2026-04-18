// LifeSync Checkout — Paddle Integration

let selectedTheme = 'dark';

const DOWNLOAD_LINKS = {
  dark: 'https://www.icloud.com/shortcuts/397d7a86ce1947ca9201bf18d2ed4bee',
  light: 'https://www.icloud.com/shortcuts/af637c2810c240bfac643ee4ed93d733'
};

const PRICE_IDS = {
  dark: 'pri_01kpgxnw6y5q5357mc9vw12amv',
  light: 'pri_01kpgxsjn5jxfh0d6zb5tsh0a6'
};

// Initialize Paddle
Paddle.Initialize({
  token: 'live_6b6dc7de7e35624bf9244f9d340',
  eventCallback: function(data) {
    if (data.name === 'checkout.completed') {
      const email = data.data && data.data.customer ? data.data.customer.email : '';
      showSuccessScreen('', selectedTheme);
    }
  }
});

function selectWallpaper(theme) {
  selectedTheme = theme;
  document.querySelectorAll('.wp-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.theme === theme);
  });
}

function openPaddleCheckout() {
  Paddle.Checkout.open({
    items: [{ priceId: PRICE_IDS[selectedTheme], quantity: 1 }]
  });
}

// Render mini preview dots in the purchase cards
function renderPreviewDots(containerId, isDark) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const months = [31,28,31,30,31,30,31,31,30,31,30,31];
  const showMonths = [0,1,2];
  showMonths.forEach(mi => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px;margin-bottom:3px;';
    for (let d = 0; d < months[mi]; d++) {
      const dot = document.createElement('div');
      const done = Math.random() < 0.78;
      let color;
      if (done) {
        color = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
      } else {
        color = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
      }
      dot.style.cssText = `width:4px;height:4px;border-radius:50%;background:${color};`;
      row.appendChild(dot);
    }
    container.appendChild(row);
  });
}

renderPreviewDots('wp-dots-dark', true);
renderPreviewDots('wp-dots-light', false);

// Show the post-purchase success experience
function showSuccessScreen(name, theme) {
  const downloadLink = DOWNLOAD_LINKS[theme];
  const themeLabel = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  const shortcutName = theme === 'dark' ? 'LifeSync (Dark)' : 'LifeSync (Light)';

  // Replace the entire purchase section content
  const downloadSection = document.querySelector('.download-inner');
  downloadSection.innerHTML = `
    <div class="success-page">

      <!-- Success Header -->
      <div class="success-header">
        <div class="success-check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2>You're all set${name ? ', ' + name : ''}.</h2>
        <p class="success-sub">Your <strong>${themeLabel}</strong> LifeSync wallpaper is ready to install.</p>
      </div>

      <!-- Install Card -->
      <div class="install-card">
        <div class="install-card-header">
          <div class="install-step-badge">Step 1</div>
          <h3>Install ${shortcutName}</h3>
          <p>Tap the button below on your iPhone to add ${shortcutName}.</p>
        </div>
        <a href="${downloadLink}" target="_blank" class="btn-install">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Tap to Install
        </a>
        <p class="install-note">Opens in the Shortcuts app on your iPhone</p>
      </div>

      <!-- Setup Guide -->
      <div class="setup-guide">
        <div class="setup-guide-header">
          <div class="install-step-badge">Step 2</div>
          <h3>Quick Setup</h3>
          <p>Choose how you want to trigger ${shortcutName} each day.</p>
        </div>

        <div class="setup-methods">

          <!-- Method 1 -->
          <div class="method-card">
            <div class="method-number">Option A</div>
            <h4>Add to Home Screen</h4>
            <ol>
              <li>Open the <strong>Shortcuts</strong> app</li>
              <li>Find and long-press <strong>"${shortcutName}"</strong></li>
              <li>Select <strong>"Share"</strong> from the menu</li>
              <li>Tap <strong>"Add to Home Screen"</strong></li>
              <li>Customize the icon color and design</li>
              <li>Click <strong>"Add"</strong> in the top-right corner</li>
            </ol>
            <p class="method-result">You'll have a dedicated app icon on your home screen.</p>
          </div>

          <!-- Method 2 -->
          <div class="method-card">
            <div class="method-number">Option B</div>
            <h4>Back Tap</h4>
            <ol>
              <li>Open <strong>Settings</strong></li>
              <li>Go to <strong>Accessibility &rarr; Touch</strong></li>
              <li>Find and tap <strong>"Back Tap"</strong></li>
              <li>Select <strong>"Double Tap"</strong></li>
              <li>Scroll to the <strong>Shortcuts</strong> section</li>
              <li>Find and select <strong>"${shortcutName}"</strong></li>
            </ol>
            <p class="method-result">Double-tap the back of your iPhone to log your day.</p>
          </div>

          <!-- Method 3 -->
          <div class="method-card">
            <div class="method-number">Option C</div>
            <h4>Action Button</h4>
            <p class="method-note">iPhone 15 Pro and later only</p>
            <ol>
              <li>Open <strong>Settings</strong></li>
              <li>Find and tap <strong>"Action Button"</strong></li>
              <li>Swipe through options until you see <strong>Shortcut</strong></li>
              <li>Tap <strong>"Choose a Shortcut"</strong></li>
              <li>Select <strong>"${shortcutName}"</strong></li>
            </ol>
            <p class="method-result">Press the Action Button to log your day instantly.</p>
          </div>

        </div>
      </div>

      <!-- Footer note -->
      <div class="success-footer-note">
        <p>A confirmation has been sent to your email. If you need to reinstall, use the same link above &mdash; it never expires.</p>
      </div>

    </div>
  `;

  // Smooth scroll to top of success screen
  downloadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
