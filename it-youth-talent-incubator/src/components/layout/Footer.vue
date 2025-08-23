<script setup>
// Footer component for IT for Youth Ghana
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Logo and Organization Info -->
      <div class="footer-section">
        <div class="logo-section">
          <img 
            src="https://media.licdn.com/dms/image/v2/D4E0BAQGJWO-KEQU9zw/company-logo_100_100/company-logo_100_100/0/1709845778830?e=1758758400&v=beta&t=41nO8MpL3Nf0BcsarJB4BsZxxUCJwF_73c3o2bmpVIE" 
            alt="IT for Youth Ghana Logo" 
            class="footer-logo"
          />
          <div class="org-info">
            <h3 class="org-name">IT for Youth Ghana</h3>
            <a 
              href="https://www.itforyouthghana.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="website-link"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              www.itforyouthghana.org
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="bottom-content">
          <p class="copyright">
            © 2025 IT for Youth Ghana. All rights reserved.
          </p>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/it-for-youth-ghana" target="_blank" rel="noopener noreferrer" class="social-link">
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.itforyouthghana.org/" target="_blank" rel="noopener noreferrer" class="social-link">
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #004dc5 0%, #003a9b 100%);
  color: white;
  padding: 32px 0 0 0;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
}

.footer-section {
  margin-bottom: 40px;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.footer-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: white;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.org-info {
  text-align: center;
}

.org-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.website-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  transition: all 0.2s ease;
}

.website-link:hover {
  color: white;
  text-decoration: underline;
}

.website-link .icon {
  width: 20px;
  height: 20px;
}

/* Footer Bottom */
.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
  margin-top: 40px;
}

.bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.copyright {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.social-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Desktop Layout - Horizontal zentriert */
@media (min-width: 768px) {
  .footer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 40px;
  }

  .footer-section {
    margin-bottom: 0;
    text-align: center;
  }

  .logo-section {
    flex-direction: row;
    gap: 16px;
    margin-bottom: 0;
    align-items: center;
    justify-content: center;
  }

  .org-info {
    text-align: left;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .footer {
    padding: 32px 0 0 0;
  }

  .footer-container {
    padding: 0 20px;
  }

  .logo-section {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .org-name {
    font-size: 20px;
  }

  .bottom-content {
    flex-direction: column;
    text-align: center;
    padding: 0 20px;
  }

  .social-links {
    justify-content: center;
  }
}
</style>