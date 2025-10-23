<!-- 
🚀 IT Youth Talent Incubator - Main Layout Wrapper Component

PURPOSE: The primary layout container that provides consistent structure across all
application pages with header, main content area, and footer arrangement.

WHAT IT DOES:
- Provides consistent layout structure for all application pages
- Includes Footer component for organizational branding and links
- Contains main content slot for dynamic page content insertion
- Offers optional Header component integration (currently commented out)
- Maintains responsive design with proper spacing and containers
- Serves as the foundation for page composition and navigation

FOR CO-PROGRAMMERS:
- Currently imports Header and Footer components (lines 14-15)
- Header component is commented out but available for activation (line 21)
- Uses Vue slots for flexible content insertion (line 25)
- Footer is always visible across all pages (line 29)
- Layout structure is minimal and flexible for different page types

LAYOUT STRUCTURE:
1. Layout Container (.layout)
   - Root wrapper with full viewport handling
   
2. Optional Header Section
   - Currently commented out but importable
   - Can be conditionally displayed based on authentication
   
3. Main Content Area
   - Slot-based content insertion
   - Flexible container for all page content
   
4. Footer Section
   - Always visible organizational footer
   - Consistent branding across application

USAGE PATTERN:
- Wrap page components with <Layout> to get consistent structure
- Content is inserted via slot system
- Header can be activated by uncommenting import and template usage
- Footer appears automatically on all pages

TODO IMPLEMENTATION PRIORITIES:
1. Implement conditional header display based on user authentication status
2. Add sidebar navigation for admin dashboard and complex page layouts
3. Include loading states and skeleton screens during page transitions
4. Add error boundary handling for graceful error display
5. Implement responsive layout adjustments for different screen sizes
6. Add smooth page transition animations between routes
7. Include scroll-to-top functionality for long pages
8. Add breadcrumb navigation integration
9. Implement layout variants for different user roles (student/admin)
10. Add accessibility improvements and keyboard navigation support
-->\n<script setup>
import Footer from './Footer.vue'
import Header from './Header.vue'

// TODO: Add layout state management
// TODO: Implement authentication-based header display
// TODO: Add sidebar toggle functionality
// TODO: Include page transition handling
// TODO: Add scroll position management
// TODO: Implement loading states
</script>

<template>
  <div class="layout">
    <!-- Optional: Header für alle Seiten -->
    <!-- <Header /> -->
    
    <!-- Main Content Area -->
    <main class="main-content">
      <slot />  <!-- Hier wird der Seiteninhalt eingefügt -->
    </main>
    
    <!-- Footer auf jeder Seite -->
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1; /* Nimmt verfügbaren Platz ein */
  padding: 20px;
}
</style>