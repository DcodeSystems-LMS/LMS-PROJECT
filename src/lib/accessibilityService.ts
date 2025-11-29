// Accessibility Service for WCAG Compliance
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  extendedTime: boolean;
  altTextEnabled: boolean;
  audioTranscripts: boolean;
}

export interface AccessibilityFeatures {
  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  colorBlindFriendly: boolean;
  
  // Motor
  keyboardOnly: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  
  // Cognitive
  simplifiedUI: boolean;
  clearInstructions: boolean;
  progressIndicators: boolean;
  
  // Hearing
  visualAlerts: boolean;
  captions: boolean;
  transcripts: boolean;
}

export class AccessibilityService {
  private static instance: AccessibilityService;
  private settings: AccessibilitySettings;
  private features: AccessibilityFeatures;

  constructor() {
    this.settings = this.loadSettings();
    this.features = this.loadFeatures();
    this.initializeAccessibility();
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  // Initialize accessibility features
  private initializeAccessibility(): void {
    this.applySettings();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupHighContrast();
    this.setupReducedMotion();
  }

  // Load user accessibility settings
  private loadSettings(): AccessibilitySettings {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      reducedMotion: false,
      extendedTime: false,
      altTextEnabled: true,
      audioTranscripts: true
    };

    try {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  // Load accessibility features
  private loadFeatures(): AccessibilityFeatures {
    return {
      fontSize: 'medium',
      contrast: 'normal',
      colorBlindFriendly: false,
      keyboardOnly: false,
      voiceControl: false,
      switchControl: false,
      simplifiedUI: false,
      clearInstructions: true,
      progressIndicators: true,
      visualAlerts: false,
      captions: false,
      transcripts: false
    };
  }

  // Apply accessibility settings
  private applySettings(): void {
    const root = document.documentElement;
    
    // High contrast
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (this.settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (this.settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader support
    if (this.settings.screenReader) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation(): void {
    if (!this.settings.keyboardNavigation) return;

    document.addEventListener('keydown', (e) => {
      // Skip links for keyboard navigation
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }

      // Escape key to close modals
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }

      // Arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }
    });
  }

  // Handle tab navigation
  private handleTabNavigation(e: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (e.shiftKey) {
      // Shift + Tab (backward)
      if (currentIndex <= 0) {
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
    } else {
      // Tab (forward)
      if (currentIndex >= focusableElements.length - 1) {
        e.preventDefault();
        focusableElements[0]?.focus();
      }
    }
  }

  // Handle escape key
  private handleEscapeKey(): void {
    // Close any open modals
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label="Close"]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
    });
  }

  // Handle arrow navigation
  private handleArrowNavigation(e: KeyboardEvent): void {
    const currentElement = document.activeElement as HTMLElement;
    const parent = currentElement.closest('[role="menu"], [role="tablist"], [role="grid"]');
    
    if (!parent) return;

    const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="tab"], [role="gridcell"]'));
    const currentIndex = items.indexOf(currentElement);
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(items.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        nextIndex = Math.min(items.length - 1, currentIndex + 1);
        break;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      (items[nextIndex] as HTMLElement).focus();
    }
  }

  // Get focusable elements
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ];
    
    return Array.from(document.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  // Setup screen reader support
  private setupScreenReaderSupport(): void {
    if (!this.settings.screenReader) return;

    // Add ARIA labels to interactive elements
    this.addAriaLabels();
    
    // Setup live regions for dynamic content
    this.setupLiveRegions();
    
    // Add skip links
    this.addSkipLinks();
  }

  // Add ARIA labels
  private addAriaLabels(): void {
    // Add labels to buttons without text
    const iconButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    iconButtons.forEach(button => {
      const icon = button.querySelector('i[class*="ri-"]');
      if (icon) {
        const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('ri-'));
        if (iconClass) {
          const label = this.getIconLabel(iconClass);
          button.setAttribute('aria-label', label);
        }
      }
    });

    // Add labels to form inputs
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const label = input.closest('label');
      if (label) {
        const labelText = label.textContent?.trim();
        if (labelText) {
          input.setAttribute('aria-label', labelText);
        }
      }
    });
  }

  // Get icon label from class name
  private getIconLabel(iconClass: string): string {
    const iconLabels: Record<string, string> = {
      'ri-add-line': 'Add',
      'ri-edit-line': 'Edit',
      'ri-delete-bin-line': 'Delete',
      'ri-save-line': 'Save',
      'ri-close-line': 'Close',
      'ri-magic-line': 'AI Generate',
      'ri-question-line': 'Question',
      'ri-settings-3-line': 'Settings',
      'ri-database-line': 'Question Bank',
      'ri-user-line': 'User',
      'ri-check-line': 'Check',
      'ri-time-line': 'Time',
      'ri-bar-chart-line': 'Analytics'
    };
    
    return iconLabels[iconClass] || 'Icon';
  }

  // Setup live regions
  private setupLiveRegions(): void {
    // Add live region for announcements
    if (!document.getElementById('live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  }

  // Add skip links
  private addSkipLinks(): void {
    if (document.getElementById('skip-links')) return;

    const skipLinks = document.createElement('div');
    skipLinks.id = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  // Setup high contrast
  private setupHighContrast(): void {
    if (!this.settings.highContrast) return;

    // Add high contrast styles
    const style = document.createElement('style');
    style.textContent = `
      .high-contrast {
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --border-color: #ffffff;
        --accent-color: #ffff00;
      }
      
      .high-contrast * {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
      }
      
      .high-contrast button,
      .high-contrast input,
      .high-contrast select,
      .high-contrast textarea {
        border: 2px solid var(--border-color) !important;
      }
      
      .high-contrast button:hover,
      .high-contrast button:focus {
        background-color: var(--accent-color) !important;
        color: var(--bg-primary) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup reduced motion
  private setupReducedMotion(): void {
    if (!this.settings.reducedMotion) return;

    const style = document.createElement('style');
    style.textContent = `
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Update accessibility settings
  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.applySettings();
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }

  // Announce to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
    }
  }

  // Get current settings
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  // Get current features
  getFeatures(): AccessibilityFeatures {
    return { ...this.features };
  }

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Check if user prefers high contrast
  prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Get extended time multiplier
  getExtendedTimeMultiplier(): number {
    return this.settings.extendedTime ? 1.5 : 1;
  }
}

export const accessibilityService = AccessibilityService.getInstance();
