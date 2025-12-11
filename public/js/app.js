// Portrait Intelligence Lab - Main JavaScript

// API Base URL
const API_BASE = '/api';

// Fetch user data
async function fetchUserData() {
  try {
    const response = await fetch(`${API_BASE}/user`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Update micro-action
async function updateMicroAction(index, completed) {
  try {
    const response = await fetch(`${API_BASE}/micro-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ index, completed })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating micro-action:', error);
    return null;
  }
}

// Register for battle
async function registerBattle(name, division) {
  try {
    const response = await fetch(`${API_BASE}/battle/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, division })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering for battle:', error);
    return null;
  }
}

// Assign to pod
async function assignPod() {
  try {
    const response = await fetch(`${API_BASE}/circle/pod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error assigning pod:', error);
    return null;
  }
}

// Unlock tier
async function unlockTier(tier) {
  try {
    const response = await fetch(`${API_BASE}/tier/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tier })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unlocking tier:', error);
    return null;
  }
}

// Confirm payment
async function confirmPayment(tier, paymentId) {
  try {
    const response = await fetch(`${API_BASE}/payment/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tier, paymentId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    return null;
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Format tier name
function formatTierName(tier) {
  const tierMap = {
    'free': 'Free Tier',
    '9.99': '$9.99 Tier',
    '19.99': '$19.99 Tier',
    '199': 'Access Pass',
    '999': 'Elite Challenge',
    '9999': 'Circle',
    'circle': 'Circle',
    'resource-unlocked': 'Resource Unlocked'
  };
  return tierMap[tier] || tier;
}

// Get highest tier
function getHighestTier(tiers) {
  const tierOrder = ['free', '9.99', '19.99', '199', '999', '9999', 'circle'];
  let highest = 'free';
  for (const tier of tierOrder) {
    if (tiers.includes(tier)) {
      highest = tier;
    }
  }
  return highest;
}

// Calculate progress percentage
function calculateProgress(actions) {
  const completed = actions.filter(a => a === true).length;
  return Math.round((completed / actions.length) * 100);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
});

