// Warm Recovery — shared nav + footer
// Called by every page. Accepts a data-active attr on <body> to highlight current tab.

(function(){
  const active = document.body.dataset.active || '';
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
        </div>
        <div class="foot-col">
          <h4>Account</h4>
          <a href="login.html">Log in</a>
          <a href="login.html?mode=signup">Create account</a>
          <a href="contact.html">Get help</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 Mission Phoenix</span>
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
})();
