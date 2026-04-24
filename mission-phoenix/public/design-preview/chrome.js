// Warm Recovery — shared nav + footer
// Called by every page. Accepts a data-active attr on <body> to highlight current tab.

(function(){
  const active = document.body.dataset.active || '';
  const backHTML = `
    <a href="demo.html" id="back-to-demo" style="position:fixed;top:14px;left:14px;z-index:200;display:inline-flex;align-items:center;gap:8px;padding:9px 14px;background:#a34620;color:#fbf5e8;border-radius:999px;font-family:'Manrope',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.3px;text-decoration:none;box-shadow:0 6px 18px -6px rgba(163,70,32,0.6);transition:transform .15s;">
      ← Back to demo
    </a>`;
  const navHTML = `
    <nav class="site">
      <div class="nav-inner">
        <a class="brand" href="index.html">
          <img src="/phoenix.png" alt="">
          <span>Mission Phoenix</span>
        </a>
        <div class="links">
          <a href="assessment.html" class="${active==='assessment'?'active':''}">Assessment</a>
          <a href="tracker.html" class="${active==='tracker'?'active':''}">Tracker</a>
          <a href="community.html" class="${active==='community'?'active':''}">Community</a>
          <a href="archive.html" class="${active==='archive'?'active':''}">Archive</a>
          <a href="about.html" class="${active==='about'?'active':''}">About</a>
          <a href="contact.html" class="${active==='contact'?'active':''}">Contact</a>
          <a href="login.html" class="${active==='login'?'active':''}">Log in</a>
          <a href="donate.html" class="donate-btn ${active==='donate'?'active':''}">Donate</a>
        </div>
      </div>
    </nav>`;

  const footHTML = `
    <footer class="site">
      <div class="foot-inner">
        <div class="foot-col">
          <div class="foot-brand">
            <img src="/phoenix.png" alt="">
            <span>Mission Phoenix</span>
          </div>
          <p>A community and life mission to spread awareness of the real cost of pornography. Built by someone who lived it.</p>
        </div>
        <div class="foot-col">
          <h4>The work</h4>
          <a href="assessment.html">Self-assessment</a>
          <a href="tracker.html">Recovery tracker</a>
          <a href="community.html">Discord community</a>
          <a href="archive.html">Newsletter archive</a>
        </div>
        <div class="foot-col">
          <h4>The mission</h4>
          <a href="about.html">About Michael</a>
          <a href="contact.html">Contact</a>
          <a href="donate.html">Donate</a>
          <a href="archive.html">Writings</a>
        </div>
        <div class="foot-col">
          <h4>Account</h4>
          <a href="login.html">Log in</a>
          <a href="login.html?mode=signup">Create account</a>
          <a href="contact.html">Get help</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 Mission Phoenix · v0.2-alpha · Built by someone who lived it</span>
        <span>No ads. No tracking. No upsells.</span>
      </div>
    </footer>`;

  // Insert before/after <main>
  const main = document.querySelector('main');
  if (main) {
    main.insertAdjacentHTML('beforebegin', navHTML);
    main.insertAdjacentHTML('afterend', footHTML);
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', footHTML);
  }
  // Floating "back to demo" button — only when we arrived from the demo page
  if (!document.body.dataset.hideBack) {
    document.body.insertAdjacentHTML('afterbegin', backHTML);
  }
})();
