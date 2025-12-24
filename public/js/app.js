// public/js/app.js - Essential Client-Side API Helpers

// Global error/alert function
function showAlert(message, type = 'info') {
    // Simple console log for alerts since we don't have an alert DOM element defined
    console.warn(`[ALERT/${type.toUpperCase()}] ${message}`);

    // In a full implementation, you'd show a visible toast or banner here.
    const container = document.querySelector('.container');
    if (container) {
        let alert = document.querySelector('#global-alert');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'global-alert';
            alert.style.cssText = 'position: fixed; top: 1rem; right: 1rem; padding: 1rem; border-radius: 0.5rem; z-index: 5000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: opacity 0.3s; opacity: 0;';
            document.body.appendChild(alert);
        }
        alert.textContent = message;
        alert.style.backgroundColor = type === 'success' ? '#d1fae5' : type === 'warning' ? '#fef3c7' : '#dbeafe';
        alert.style.color = type === 'success' ? '#065f46' : type === 'warning' ? '#92400e' : '#1e40af';
        alert.style.opacity = '1';

        setTimeout(() => {
            alert.style.opacity = '0';
        }, 3000);
    }
}

// Fetch user data from the server
async function fetchUserData() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('Could not load user data.', 'danger');
        return null;
    }
}

// Update a micro-action status
async function updateMicroAction(index, completed) {
    try {
        const response = await fetch('/api/micro-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index, completed })
        });
        if (!response.ok) throw new Error('Failed to update micro action');
        return await response.json();
    } catch (error) {
        console.error('Error updating micro action:', error);
        showAlert('Failed to save progress.', 'danger');
        return null;
    }
}

// Register for a battle
async function registerBattle(name, division) {
    try {
        const response = await fetch('/api/battle/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
             credentials: "include",
            body: JSON.stringify({ name, division })
        });
        if (!response.ok) throw new Error('Battle registration failed');
        return await response.json();
    } catch (error) {
        console.error('Error registering for battle:', error);
        showAlert('Battle registration failed. Check eligibility.', 'danger');
        return null;
    }
}

// Assign to a Circle pod
async function assignPod() {
    try {
        const response = await fetch('/api/circle/pod', {
            method: 'POST',
             credentials: "include",
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Pod assignment failed');
        return await response.json();
    } catch (error) {
        console.error('Error assigning pod:', error);
        showAlert('Failed to assign pod. Check membership.', 'danger');
        return null;
    }
}

// Finalize payment confirmation (Simulates Stripe Webhook trigger)
async function confirmPayment(tier, paymentId) {
    try {
        const response = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
             credentials: "include",
            body: JSON.stringify({ tier, paymentId })
        });
        if (!response.ok) throw new Error('Payment confirmation failed');
        return await response.json();
    } catch (error) {
        console.error('Error confirming payment:', error);
        showAlert('Payment confirmation failed. Please contact support.', 'danger');
        return null;
    }
}

// Utility function to calculate micro-action progress
function calculateProgress(microActions) {
    if (!microActions || microActions.length === 0) return 0;
    const completedCount = microActions.filter(a => a === true).length;
    return Math.floor((completedCount / microActions.length) * 100);
}
function updateOverallProgress(microActions) {
  const completedCount = microActions.filter(Boolean).length;
  const percent = Math.round((completedCount / microActions.length) * 100);

  document.querySelector(".progress-text").textContent = `${percent}%`;
  document.querySelector(".progress-bar").style.width = `${percent}%`;
}


// Utility function to determine highest unlocked tier (for dashboard)
function getHighestTier(tiers) {
    const tierOrder = ['free', 'resource-unlocked', '9.99', '19.99', '199', '999', 'circle', '9999'];
    let highest = 'free';
    
    for (const tier of tiers) {
        if (tierOrder.indexOf(tier) > tierOrder.indexOf(highest)) {
            highest = tier;
        }
    }
    return highest;
}

// Utility function to format tier names (for dashboard)
function formatTierName(tierKey) {
    const map = {
        'free': 'Free Tier',
        'resource-unlocked': 'Resource Unlocked',
        '9.99': 'Starter ($9.99)',
        '19.99': 'Professional ($19.99)',
        '199': 'Access Pass ($199)',
        '999': 'Elite Challenge ($999)',
        '9999': 'The Circle ($9,999)',
        'circle': 'The Circle Member'
    };
    return map[tierKey] || tierKey;
}


/* ===============================
   TIER PURCHASE UI HANDLER
   =============================== */
async function handleTierPurchaseState(tierKey, buttonId = "purchase-btn") {
  const user = await fetchUserData();
  if (!user || !Array.isArray(user.tiers)) return;

  const btn = document.getElementById(buttonId);
  if (!btn) return;

  if (user.tiers.includes(tierKey)) {
    btn.textContent = "Already Purchased";

    // Remove all CTA color classes safely
    btn.classList.remove("btn-primary", "btn-success");

    // Apply disabled style
    btn.classList.add("btn-secondary");
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "none";
    btn.removeAttribute("href");
  }
}
