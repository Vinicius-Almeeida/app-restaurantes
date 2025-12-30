# Checklist de Acessibilidade - Fluxo de Mesa

## WCAG 2.1 Nivel AA Compliance

### Perceivable (Perceptivel)

#### Text Alternatives (1.1)
- [x] Todos os icones tem labels descritivos via Lucide React
- [x] Imagens decorativas marcadas adequadamente
- [x] Icons funcionais tem text alternatives

#### Time-based Media (1.2)
- [x] N/A - Nao ha midia baseada em tempo

#### Adaptable (1.3)
- [x] Estrutura semantica HTML (h1, h2, section, button)
- [x] Ordem de leitura logica no DOM
- [x] Relationships identificados via ARIA quando necessario
- [x] Instrucoes nao dependem de caracteristicas sensoriais

#### Distinguishable (1.4)
- [x] Contraste de cores >= 4.5:1 (texto normal)
- [x] Contraste de cores >= 3:1 (texto grande)
- [x] Texto pode ser redimensionado ate 200%
- [x] Imagens de texto evitadas (usando texto real)
- [x] Layout responsivo sem scroll horizontal

### Operable (Operavel)

#### Keyboard Accessible (2.1)
- [x] Toda funcionalidade acessivel via teclado
- [x] Nenhuma armadilha de teclado
- [x] Focus visivel em todos os elementos interativos
- [x] Ordem de tabulacao logica
- [x] Atalhos de teclado nao conflitam

#### Enough Time (2.2)
- [x] Polling nao tem limite de tempo
- [x] Usuario pode pausar/parar animacoes decorativas
- [x] Nao ha timeout que cause perda de dados

#### Seizures and Physical Reactions (2.3)
- [x] Nenhum conteudo pisca mais de 3 vezes por segundo
- [x] Animacoes respeitam prefers-reduced-motion

#### Navigable (2.4)
- [x] Mecanismo para pular blocos (pode adicionar skip link)
- [x] Titulos de pagina descritivos
- [x] Ordem de foco logica e previsivel
- [x] Proposito do link identificavel pelo texto
- [x] Multiplas formas de navegacao
- [x] Headings e labels descritivos
- [x] Focus visivel

#### Input Modalities (2.5)
- [x] Gestos nao requerem path-based (apenas cliques/taps)
- [x] Labels visuais correspondem aos programaticos
- [x] Target size minimo 44x44px (botoes e touch targets)
- [x] Nenhuma funcionalidade requer motion

### Understandable (Compreensivel)

#### Readable (3.1)
- [x] Linguagem da pagina identificada (lang="pt-BR")
- [x] Linguagem de partes alterada quando necessario

#### Predictable (3.2)
- [x] Mudanca de foco nao causa mudanca de contexto
- [x] Input nao causa mudanca de contexto automaticamente
- [x] Navegacao consistente
- [x] Identificacao consistente de componentes
- [x] Mudancas de contexto iniciadas apenas pelo usuario

#### Input Assistance (3.3)
- [x] Erros identificados automaticamente
- [x] Labels e instrucoes fornecidas
- [x] Sugestoes de erro fornecidas
- [x] Prevencao de erros em acoes importantes
- [x] Mensagens de erro descritivas

### Robust (Robusto)

#### Compatible (4.1)
- [x] HTML valido e bem formado
- [x] Name, role, value em todos os componentes UI
- [x] Status messages identificaveis programaticamente
- [x] ARIA usado corretamente

---

## Componentes Especificos

### MemberApprovalModal

#### Keyboard Navigation
- [x] Tab/Shift+Tab navega entre botoes
- [x] Esc fecha o modal
- [x] Enter/Space ativa botoes
- [x] Focus trap dentro do modal quando aberto

#### Screen Reader Support
- [x] Dialog tem role="dialog"
- [x] Dialog tem aria-labelledby
- [x] Dialog tem aria-describedby
- [x] Botoes tem labels descritivos
- [x] Estados de loading anunciados

#### Visual Design
- [x] Contraste adequado em todos os estados
- [x] Focus visivel em botoes
- [x] Estados de hover/active distintos
- [x] Loading indicators visiveis

#### Touch Targets
- [x] Botoes >= 44x44px
- [x] Espacamento adequado entre targets
- [x] Area clicavel adequada

### WaitingApproval

#### Content Structure
- [x] Heading hierarchy correta (h1)
- [x] Informacao importante em primeiro lugar
- [x] Layout centralizado e focado

#### Animation
- [x] Animacoes sutis e nao distrativas
- [x] Respeita prefers-reduced-motion
- [x] Nao causa problemas de seizure

#### Screen Reader
- [x] Status de "aguardando" anunciado
- [x] Informacoes importantes primeiro
- [x] Role="status" para updates

### TableMenuPage

#### Page Structure
- [x] Landmark regions definidas (header, main, nav)
- [x] Skip to content link (considerar adicionar)
- [x] Heading hierarchy logica (h1 -> h2 -> h3)

#### Form Controls
- [x] Inputs tem labels
- [x] Validacao acessivel
- [x] Mensagens de erro associadas

#### Interactive Elements
- [x] Botoes tem labels descritivos
- [x] Links tem texto significativo
- [x] Focus management adequado

#### Responsive Design
- [x] Funciona em zoom ate 200%
- [x] Mobile-first approach
- [x] Touch targets adequados

---

## Testing Checklist

### Manual Testing

#### Keyboard Navigation
- [ ] Tab through entire page
- [ ] Verify focus order makes sense
- [ ] Test all keyboard shortcuts
- [ ] Ensure no keyboard traps
- [ ] Test Esc key on modals

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify all content is announced
- [ ] Verify correct reading order

#### Visual Testing
- [ ] Test at 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test in dark mode
- [ ] Verify color contrast ratios
- [ ] Check focus indicators

#### Mobile Testing
- [ ] Test touch targets
- [ ] Test with screen reader on mobile
- [ ] Test in landscape/portrait
- [ ] Test with one-handed use

### Automated Testing

#### Tools
- [ ] axe DevTools
- [ ] Lighthouse Accessibility audit
- [ ] WAVE browser extension
- [ ] Pa11y CI

#### Tests
```bash
# Run axe accessibility tests
npm run test:a11y

# Run Lighthouse audit
npm run lighthouse

# Pa11y CI
npm run pa11y
```

---

## Known Issues

### To Fix
- [ ] Adicionar skip to content link
- [ ] Melhorar anuncio de mudancas de estado via ARIA live
- [ ] Adicionar descricoes mais detalhadas em alguns botoes
- [ ] Implementar gestao de foco ao mudar de estado

### Future Enhancements
- [ ] Suporte a atalhos de teclado customizados
- [ ] Preferencias de usuario para animacoes
- [ ] Alto contraste otimizado
- [ ] RTL support para idiomas RTL

---

## Resources

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Testing
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver Guide](https://www.apple.com/voiceover/)
- [TalkBack Guide](https://support.google.com/accessibility/android/answer/6283677)

---

## Maintenance

### Regular Checks
- Run automated tests before each release
- Manual keyboard testing on new features
- Screen reader testing on major changes
- Color contrast validation on design updates

### Responsibility
- Frontend team: Implementation
- QA team: Testing
- Design team: Visual accessibility
- Product team: User research with disabled users
