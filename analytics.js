(function() {
  // Don't track if Do Not Track is enabled — respect the user
  if (navigator.doNotTrack === '1') return;
  
  // Don't track localhost / development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  var SUPABASE_URL = 'https://tpltyfchkpsmtdzzvxeh.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbHR5ZmNoa3BzbXRkenp2eGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjE5MDQsImV4cCI6MjA4NjUzNzkwNH0.EMpQlpO0Sx2QuiSwJ2hEcu2zT04GB8ciDq6jWiuJMII';

  // Send a single POST on page load — no cookies, no fingerprinting, no session tracking
  fetch(SUPABASE_URL + '/rest/v1/page_views', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      page: location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language || null
    })
  }).catch(function() {});  // Fail silently — never break the page
})();