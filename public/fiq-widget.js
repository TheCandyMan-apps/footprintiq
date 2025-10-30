/**
 * FootprintIQ Embeddable Widget Loader
 * 
 * Usage:
 * <div data-fiq-widget></div>
 * <script src="https://footprintiq.app/fiq-widget.js"></script>
 */

(function() {
  'use strict';
  
  // Find widget mount points
  const widgets = document.querySelectorAll('[data-fiq-widget]');
  
  if (widgets.length === 0) {
    console.warn('FootprintIQ Widget: No mount points found. Add data-fiq-widget attribute to a div.');
    return;
  }
  
  // Create iframe for each widget
  widgets.forEach(function(container) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://footprintiq.app/embed';
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'FootprintIQ Username Checker');
    
    // Optional: Custom height from data attribute
    const customHeight = container.getAttribute('data-height');
    if (customHeight) {
      iframe.style.height = customHeight;
    }
    
    // Optional: Theme from data attribute
    const theme = container.getAttribute('data-theme');
    if (theme) {
      iframe.src += '?theme=' + encodeURIComponent(theme);
    }
    
    container.appendChild(iframe);
  });
  
  // Listen for resize messages from iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://footprintiq.app') return;
    
    if (event.data.type === 'fiq-widget-resize') {
      const iframes = document.querySelectorAll('iframe[src^="https://footprintiq.app/embed"]');
      iframes.forEach(function(iframe) {
        iframe.style.height = event.data.height + 'px';
      });
    }
  });
  
})();
