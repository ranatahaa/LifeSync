// LifeSync Checkout — PayPal Integration

let selectedTheme = 'dark';

const DOWNLOAD_LINKS = {
  dark: 'https://www.icloud.com/shortcuts/397d7a86ce1947ca9201bf18d2ed4bee',
  light: 'https://www.icloud.com/shortcuts/af637c2810c240bfac643ee4ed93d733'
};

function selectWallpaper(theme) {
  selectedTheme = theme;
  document.querySelectorAll('.wp-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.theme === theme);
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

// PayPal Smart Buttons
if (typeof paypal !== 'undefined') {
  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'pill',
      label: 'pay',
      height: 50
    },

    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: 'LifeSync Habit Wallpaper (' + selectedTheme + ' mode)',
          amount: {
            currency_code: 'USD',
            value: '9.99'
          }
        }]
      });
    },

    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        const name = details.payer.name.given_name;
        const theme = selectedTheme;
        const downloadLink = DOWNLOAD_LINKS[theme];

        // Show success message with download link
        const container = document.getElementById('paypal-button-container');
        container.innerHTML = `
          <div class="payment-success">
            <div class="success-icon">&#10003;</div>
            <h3>Thank you, ${name}!</h3>
            <p>Your <strong>${theme} mode</strong> LifeSync is ready.</p>
            <a href="${downloadLink}" target="_blank" class="btn-download-wp">
              Click to Install
            </a>
            <p class="success-note">Open the link on your iPhone to install. A copy has also been sent to your PayPal email.</p>
          </div>
        `;
      });
    },

    onError: function(err) {
      console.error('PayPal error:', err);
      const container = document.getElementById('paypal-button-container');
      container.insertAdjacentHTML('beforeend',
        '<p class="pay-error">Something went wrong. Please try again or contact support.</p>'
      );
    }
  }).render('#paypal-button-container');
} else {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = `
    <div class="paypal-placeholder">
      <p>PayPal checkout will appear here once configured.</p>
      <p class="setup-note">To activate: replace <code>YOUR_CLIENT_ID</code> in index.html with your PayPal client ID.</p>
    </div>
  `;
}
