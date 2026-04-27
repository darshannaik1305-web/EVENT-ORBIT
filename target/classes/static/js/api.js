const API_BASE_URL = '/api';

/**
 * Common API fetcher with error handling and JSON parsing
 */
async function apiJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data.error || data.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

/**
 * Returns headers with Authorization token if available
 */
function authHeaders(token) {
    const t = token || localStorage.getItem('cem_token') || localStorage.getItem('cem_admin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': t ? `Bearer ${t}` : ''
    };
}

/**
 * Format ISO date string to human-readable format
 */
function fmtDate(iso, options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) {
    if (!iso) return 'TBA';
    try {
        return new Date(iso).toLocaleString([], options);
    } catch (e) {
        return 'Invalid Date';
    }
}

/**
 * Sanitize strings to prevent XSS
 */
function sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Show a simple toast/notification (can be expanded later)
 */
function showToast(msg, type = 'info') {
    alert(msg); // Placeholder for a real toast UI
}
