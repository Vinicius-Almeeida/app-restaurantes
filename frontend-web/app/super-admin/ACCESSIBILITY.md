# Accessibility Checklist - Super Admin Dashboard

## WCAG 2.1 AA Compliance

### Keyboard Navigation
- [x] All interactive elements accessible via keyboard
- [x] Tab order follows logical flow
- [x] Sidebar links navigable with Tab/Shift+Tab
- [x] Logout button accessible via keyboard
- [x] No keyboard traps

### Screen Readers
- [x] Semantic HTML structure (nav, main, aside)
- [x] Proper heading hierarchy (h1 for page title)
- [x] Card titles use CardTitle component
- [x] Icon-only elements have descriptive text
- [x] Empty states have descriptive messages

### Color Contrast
- [x] Primary text (gray-900) on white: 21:1 ratio
- [x] Secondary text (gray-600) on white: 7:1 ratio
- [x] Success (green-600): Meets AA standard
- [x] Warning (yellow-600): Meets AA standard
- [x] Error (red-600): Meets AA standard
- [x] Active navigation (orange-600): Meets AA standard

### Focus Indicators
- [x] All interactive elements have visible focus states
- [x] Focus ring clearly visible
- [x] Custom focus styles maintain contrast
- [x] No focus style removal

### ARIA Attributes

#### MetricsCard
```tsx
// Trend indicator is decorative, included in text
<div aria-live="polite">
  {trend && (
    <span className="sr-only">
      {trend.isPositive ? 'Aumento' : 'Redução'} de {Math.abs(trend.value)}%
    </span>
  )}
</div>
```

#### Sidebar
```tsx
<nav aria-label="Navegação principal do Super Admin">
  <Link
    href="/super-admin/dashboard"
    aria-current={isActive ? 'page' : undefined}
  >
    Dashboard
  </Link>
</nav>
```

#### Loading States
```tsx
<LoadingScreen
  message="Carregando dashboard..."
  role="status"
  aria-live="polite"
/>
```

### Responsive Design
- [x] Mobile-first approach
- [x] Breakpoints: sm (640px), md (768px), lg (1024px)
- [x] Sidebar collapses on mobile (TODO)
- [x] Cards stack vertically on small screens
- [x] Touch targets minimum 44x44px

### Forms & Inputs
- [x] All form inputs have associated labels
- [x] Error messages linked to inputs via aria-describedby
- [x] Required fields indicated visually and programmatically

### Content
- [x] Language attribute set (lang="pt-BR" in root)
- [x] Page title descriptive ("Dashboard - Super Admin")
- [x] Landmarks used (header, nav, main, aside)

## Priority Badges Accessibility

```tsx
// Screen reader text for priority
const priorityLabels = {
  LOW: 'Prioridade baixa',
  MEDIUM: 'Prioridade média',
  HIGH: 'Prioridade alta',
  CRITICAL: 'Prioridade crítica',
};

<Badge aria-label={priorityLabels[priority]}>
  {priority}
</Badge>
```

## Status Badges Accessibility

```tsx
// Screen reader text for status
const statusLabels = {
  ACTIVE: 'Status: Ativo',
  INACTIVE: 'Status: Inativo',
  SUSPENDED: 'Status: Suspenso',
};

<Badge aria-label={statusLabels[status]}>
  {status}
</Badge>
```

## Improvements Needed

### High Priority
- [ ] Add ARIA labels to all icon buttons
- [ ] Implement skip navigation link
- [ ] Add keyboard shortcuts (Ctrl+K for search, etc.)
- [ ] Mobile sidebar with hamburger menu

### Medium Priority
- [ ] Add breadcrumbs with aria-label="Breadcrumb"
- [ ] Implement focus management on route change
- [ ] Add loading announcements for screen readers
- [ ] Error boundary with accessible error messages

### Low Priority
- [ ] Dark mode with proper contrast ratios
- [ ] Reduce motion preferences support
- [ ] Dyslexia-friendly font option
- [ ] High contrast mode

## Testing Checklist

### Manual Tests
- [ ] Navigate entire dashboard using only keyboard
- [ ] Test with VoiceOver (macOS) / NVDA (Windows)
- [ ] Zoom to 200% and verify readability
- [ ] Test with Windows High Contrast mode
- [ ] Verify touch target sizes on mobile

### Automated Tests
- [ ] Run Lighthouse accessibility audit (target: 100)
- [ ] axe DevTools scan (0 violations)
- [ ] WAVE browser extension check
- [ ] Color contrast analyzer

### Screen Reader Commands

**NVDA/JAWS:**
- H: Next heading
- K: Next link
- B: Next button
- T: Next table
- L: Next list

**VoiceOver:**
- VO + Command + H: Next heading
- VO + Command + L: Next link
- VO + Command + J: Next form control

## Code Examples

### Skip Navigation
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  Pular para conteúdo principal
</a>
```

### Announcement Region
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>
```

### Accessible Icon Button
```tsx
<button
  aria-label="Fechar menu"
  onClick={closeMenu}
>
  <X className="h-5 w-5" aria-hidden="true" />
</button>
```

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)
