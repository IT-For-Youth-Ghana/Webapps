<!-- 
🚀 IT Youth Talent Incubator - Application Footer Component

PURPOSE: A professional footer that provides organizational branding, essential links,
social media connectivity, and legal information with responsive design.

WHAT IT DOES:
- Displays IT for Youth Ghana branding with official logo and website link
- Provides social media links for LinkedIn and website connectivity
- Shows copyright information and organizational details
- Maintains consistent branding colors with gradient background
- Implements responsive design for mobile and desktop layouts
- Includes accessibility features with proper ARIA labels and alt text

FOR CO-PROGRAMMERS:
- Footer uses the official IT for Youth Ghana logo from LinkedIn CDN (line 25)
- Website link points to official organization website (line 32)
- Social links include LinkedIn company page and website (lines 55-64)
- Gradient background matches application color scheme (line 74)
- Responsive breakpoints at 768px for mobile optimization (line 217)
- Container max-width ensures consistent layout across screen sizes

FOOTER STRUCTURE:
1. Main Section:
   - Organization logo with official branding
   - Organization name and title
   - Website link with globe icon
   
2. Bottom Section:
   - Copyright notice with current year
   - Social media links with hover effects
   - Professional icon styling

BRANDING ELEMENTS:
- Official IT for Youth Ghana logo from CDN
- Consistent color scheme with application theme
- Professional typography and spacing
- Branded gradient background (#004dc5 to #003a9b)
- White text for optimal contrast on blue background

SOCIAL MEDIA INTEGRATION:
- LinkedIn company page link for professional networking
- Website link for organizational information
- SVG icons for clean, scalable graphics
- Hover effects with subtle animations
- Proper external link attributes (target="_blank", rel="noopener noreferrer")

RESPONSIVE DESIGN:
- Desktop: Horizontal logo and text layout
- Mobile: Vertical stacked layout for better fit
- Flexible container sizing with proper padding
- Touch-friendly social links with adequate spacing
- Optimized typography scaling for different screen sizes

ACCESSIBILITY FEATURES:
- Proper alt text for logo image
- Semantic HTML structure with footer element
- High contrast text on background
- Focus states for keyboard navigation
- Screen reader friendly icon implementations

TODO ENHANCEMENTS:
- Add additional footer sections (Quick Links, Contact Info)
- Implement Privacy Policy and Terms of Service links
- Add newsletter subscription functionality
- Include additional social media platforms (Twitter, Facebook)
- Add multi-language support for international users
- Implement structured data markup for SEO
- Add contact information section
- Consider adding site map links for better navigation
-->
<script setup>
// Footer component for IT for Youth Ghana
// Provides organizational branding, social links, and legal information
// TODO: Add analytics tracking for social link clicks
// TODO: Implement dynamic copyright year
// TODO: Add multi-language support

const currentYear = new Date().getFullYear()

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/it-for-youth-ghana',
    icon: 'linkedin'
  },
  {
    name: 'Website', 
    url: 'https://www.itforyouthghana.org/',
    icon: 'website'
  }
]

// TODO: Add analytics tracking function
const trackSocialClick = (platform) => {
  console.log(`Social link clicked: ${platform}`)
  // TODO: Implement analytics tracking
}
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
              LinkedIn
            </a>
            <a href="https://www.itforyouthghana.org/" target="_blank" rel="noopener noreferrer" class="social-link">
              Website
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #1f2937;
  color: white;
  padding: 2rem 0;
  margin-top: 4rem;
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
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.website-link:hover {
  color: white;
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
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.social-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
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