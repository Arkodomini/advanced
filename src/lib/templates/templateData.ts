import type { Template, TemplateCard } from '../../types'
import { v4 as uuid } from 'uuid'

// ── Card builders ───────────────────────────────────────────────────────────
const n = (x: number, y: number, html: string, w = 280, h = 160, bg = '#FFFFFF'): TemplateCard =>
  ({ type: 'note', x, y, width: w, height: h, content: { html }, bg_color: bg })

const ch = (x: number, y: number, text: string, color = '#111827', w = 280): TemplateCard =>
  ({ type: 'column', x, y, width: w, height: 48, content: { text, text_color: color }, bg_color: 'transparent' })

const td = (x: number, y: number, title: string, items: string[], w = 280, h = 200): TemplateCard =>
  ({ type: 'todo', x, y, width: w, height: h, content: { title, items: items.map(t => ({ id: uuid(), text: t, checked: false })) }, bg_color: '#FFFFFF' })

const sw = (x: number, y: number, hex: string, label: string): TemplateCard =>
  ({ type: 'color_swatch', x, y, width: 80, height: 80, content: { hex, label }, bg_color: hex })

const img = (x: number, y: number, url: string, name: string, w = 280, h = 200): TemplateCard =>
  ({ type: 'image', x, y, width: w, height: h, content: { storage_path: url, original_name: name, width: w, height: h }, bg_color: '#F3F4F6' })

const cm = (x: number, y: number, text: string, author = 'Template', w = 240, h = 120): TemplateCard =>
  ({ type: 'comment', x, y, width: w, height: h, content: { html: text, author, timestamp: new Date().toISOString() }, bg_color: '#FFFBEB' })

// ── Templates ───────────────────────────────────────────────────────────────
export const TEMPLATES: Template[] = [

  // ── GAME DESIGN ────────────────────────────────────────────────────────────
  {
    id: 'game-design-doc',
    name: 'Game Design Document',
    description: 'Full GDD with concept, characters, mechanics, art direction, and milestones',
    category: 'Game Design',
    color: '#7C3AED',
    cards: [
      // Header
      ch(0, 0, '🎮  Game Design Document', '#4C1D95', 940),

      // Concept
      ch(0, 60, 'Concept', '#6D28D9', 940),
      n(0, 116, '<p><strong>Game Title</strong></p><p><em>Your game title here</em></p><hr/><p><strong>Genre:</strong> Action / RPG / Puzzle</p><p><strong>Platform:</strong> PC · Console · Mobile</p><p><strong>Target audience:</strong> </p>', 280, 220, '#F5F3FF'),
      n(300, 116, '<p><strong>✨ Elevator Pitch</strong></p><p>In 2–3 sentences, explain what makes this game unique and who it\'s for.</p><p><em>"A game where…"</em></p>', 300, 160, '#EDE9FE'),
      n(620, 116, '<p><strong>🎯 Core Fantasy</strong></p><p>What power fantasy does the player experience?</p><p>What emotion should they feel?</p>', 300, 160, '#DDD6FE'),

      // Characters
      ch(0, 360, '👥  Characters', '#6D28D9', 940),
      n(0, 416, '<p><strong>Protagonist</strong></p><p><strong>Name:</strong> </p><p><strong>Age / Background:</strong> </p><p><strong>Motivation:</strong> </p><p><strong>Special ability:</strong> </p><p><strong>Arc:</strong> starts as X, becomes Y</p>', 280, 220),
      n(300, 416, '<p><strong>Antagonist</strong></p><p><strong>Name:</strong> </p><p><strong>Goal:</strong> </p><p><strong>Backstory:</strong> </p><p><strong>Why compelling:</strong> </p><p><strong>Relationship to hero:</strong> </p>', 300, 220),
      n(620, 416, '<p><strong>Supporting Cast</strong></p><ul><li><strong>Mentor</strong> – guides the hero</li><li><strong>Ally</strong> – comic relief / muscle</li><li><strong>Love interest</strong> – emotional anchor</li><li><strong>Wild card</strong> – unpredictable</li></ul>', 300, 180, '#F9FAFB'),
      cm(0, 656, 'Tip: Give each character a clear want vs. need — what they think they want, and what they actually need.', 'Design Note', 940, 80),

      // Mechanics
      ch(0, 760, '⚙️  Core Mechanics', '#6D28D9', 940),
      td(0, 816, 'Mechanics Checklist', [
        'Core game loop defined',
        'Movement & controls',
        'Combat / interaction system',
        'Progression & rewards',
        'Win / lose conditions',
        'Save system',
        'Accessibility options',
      ], 280, 260),
      n(300, 816, '<p><strong>🔄 The Game Loop</strong></p><p><strong>1.</strong> Player does <em>X</em></p><p><strong>2.</strong> World responds with <em>Y</em></p><p><strong>3.</strong> Player grows through <em>Z</em></p><p><strong>4.</strong> Repeat with added complexity</p>', 300, 200, '#F0FDF4'),
      n(620, 816, '<p><strong>🎮 Inspiration Games</strong></p><ul><li><em>Game A</em> – borrowed mechanic</li><li><em>Game B</em> – tone / feel</li><li><em>Game C</em> – narrative approach</li><li><em>Game D</em> – UI reference</li></ul><p><strong>We differ by:</strong> </p>', 300, 200, '#FFFBEB'),

      // Art Direction
      ch(0, 1040, '🎨  Art Direction', '#6D28D9', 940),
      n(0, 1096, '<p><strong>Visual Style</strong></p><p>☐ Pixel art &nbsp; ☐ Stylized 3D<br/>☐ Realistic &nbsp; ☐ Low poly<br/>☐ Watercolor &nbsp; ☐ Cel-shaded</p><p><strong>Reference:</strong> </p><p><strong>Mood:</strong> dark / vibrant / whimsical</p>', 280, 180, '#FFF7ED'),
      sw(300, 1096, '#1E1B4B', 'Primary'),
      sw(400, 1096, '#7C3AED', 'Accent'),
      sw(500, 1096, '#DDD6FE', 'UI Light'),
      sw(600, 1096, '#F59E0B', 'Highlight'),
      sw(700, 1096, '#111827', 'Text'),
      n(300, 1196, '<p><strong>Music & Sound</strong></p><p><strong>Genre:</strong> </p><p><strong>Tempo / mood:</strong> </p><p><strong>Key references:</strong> </p>', 420, 120, '#FDF4FF'),

      // Milestones
      ch(0, 1300, '🏁  Development Milestones', '#6D28D9', 940),
      td(0, 1356, 'Milestones', [
        '📐 Prototype – core loop playable',
        '🎮 Pre-Alpha – all systems in',
        '🧪 Alpha – full playthrough possible',
        '🔬 Beta – bug-fixing & balance',
        '✨ Gold – ready for release',
        '🚀 Launch day!',
        '📦 Post-launch patch v1.1',
      ], 450, 260),
      n(470, 1356, '<p><strong>Scope Guard</strong></p><p>Features we are NOT building v1.0:</p><ul><li>Feature creep item 1</li><li>Feature creep item 2</li><li>Feature creep item 3</li></ul><p><em>Cut ruthlessly – ship first.</em></p>', 460, 200, '#FEF2F2'),
    ],
  },

  // ── EDUCATION ──────────────────────────────────────────────────────────────
  {
    id: 'study-schedule',
    name: 'Student Study Schedule',
    description: 'Weekly study plan with subjects, rest times, and task tracking per day',
    category: 'Education',
    color: '#059669',
    cards: [
      ch(0, 0, '📚  Weekly Study Schedule', '#065F46', 1240),
      n(0, 60, '<p><strong>🎯 Goals This Week</strong></p><p>Write your 3 most important learning objectives here.</p><ol><li></li><li></li><li></li></ol>', 580, 120, '#ECFDF5'),
      n(640, 60, '<p><strong>⏱ Pomodoro Technique</strong></p><ul><li>Study <strong>25 min</strong> focused</li><li>Break <strong>5 min</strong> (stand, stretch)</li><li>After 4 rounds → long break <strong>20 min</strong></li><li>No phone during study blocks!</li></ul>', 580, 120, '#F0FDF4'),

      // Monday
      ch(0, 220, 'Monday', '#374151', 1240),
      n(0, 276, '<p><strong>📐 Math</strong></p><p>Topic: </p><p>Pages / problems: </p><p>Due: </p>', 280, 130, '#DBEAFE'),
      n(300, 276, '<p><strong>🔬 Science</strong></p><p>Topic: </p><p>Lab / reading: </p><p>Due: </p>', 280, 130, '#D1FAE5'),
      n(600, 276, '<p><strong>📖 English / Lit</strong></p><p>Reading: </p><p>Assignment: </p><p>Due: </p>', 280, 130, '#FDE68A'),
      n(900, 276, '<p>☕ <strong>Break</strong></p><p>15 min walk / snack<br/>No screens</p>', 220, 80, '#FEF9C3'),
      td(0, 420, 'Monday Tasks', [
        'Review class notes',
        'Complete math homework',
        'Read assigned pages',
        'Prep for tomorrow',
      ], 580, 180),

      // Tuesday
      ch(0, 640, 'Tuesday', '#374151', 1240),
      n(0, 696, '<p><strong>🌐 History / Social</strong></p><p>Topic: </p><p>Essay / outline: </p><p>Due: </p>', 280, 130, '#E9D5FF'),
      n(300, 696, '<p><strong>🗣 Language / ESL</strong></p><p>Vocab to study: </p><p>Grammar: </p><p>Practice: </p>', 280, 130, '#FBCFE8'),
      n(600, 696, '<p><strong>💻 CS / Elective</strong></p><p>Project: </p><p>Progress: </p><p>Stuck on: </p>', 280, 130, '#BAE6FD'),
      n(900, 696, '<p>☕ <strong>Break</strong></p><p>15 min walk / snack<br/>No screens</p>', 220, 80, '#FEF9C3'),
      td(0, 840, 'Tuesday Tasks', [
        'Flashcards – history dates',
        'Finish reading chapters',
        'Work on project 30 min',
        'Email teacher if stuck',
      ], 580, 180),

      // Wednesday rest
      ch(0, 1060, 'Wednesday  —  Active Recovery', '#374151', 1240),
      n(0, 1116, '<p><strong>🧘 Recovery Day</strong></p><p>Light review only — no new material today. Your brain consolidates memories during rest.</p><p>Max study: <strong>45 min total</strong></p>', 400, 140, '#FEF9C3'),
      td(430, 1116, 'Light Review', [
        'Flip through notes (20 min)',
        'Tidy study space',
        'Prep materials for Thu–Fri',
        'Get 8h sleep tonight 😴',
      ], 400, 160),

      // Thursday
      ch(0, 1300, 'Thursday', '#374151', 1240),
      n(0, 1356, '<p><strong>📐 Math</strong></p><p>Practice test / quiz prep</p><p>Time limit yourself: 45 min</p><p>Check answers after!</p>', 280, 140, '#DBEAFE'),
      n(300, 1356, '<p><strong>✍️ Writing</strong></p><p>Essay draft due today</p><p>Outline → draft → proofread</p>', 280, 130, '#FCE7F3'),
      n(600, 1356, '<p><strong>🔬 Science</strong></p><p>Review for test</p><p>Diagrams / formulas</p>', 280, 130, '#D1FAE5'),
      td(0, 1510, 'Thursday Tasks', [
        'Complete practice test (timed)',
        'Submit essay draft',
        'Make formula cheat-sheet',
        'Reach out to study partner',
      ], 580, 180),

      // Friday
      ch(0, 1740, 'Friday  —  Review & Reflect', '#374151', 1240),
      n(0, 1796, '<p><strong>📋 Weekly Review</strong></p><p><strong>What I learned well:</strong> </p><p><strong>What needs more work:</strong> </p><p><strong>Questions for teacher:</strong> </p>', 380, 160, '#F0FDF4'),
      td(400, 1796, 'End-of-Week Checklist', [
        'Self-test on all subjects',
        'Check grades & assignments',
        'Return library books',
        'Plan next week outline',
        'Reward yourself! 🎉',
      ], 420, 200),

      // Subjects sidebar
      ch(1140, 220, 'Subject Notes', '#6B7280', 380),
      td(1140, 276, 'Important Dates', [
        'Add test / exam dates here',
        'Assignment deadlines',
        'School events',
      ], 380, 180),
      n(1140, 476, '<p><strong>📞 Contacts</strong></p><p>Math teacher: </p><p>Science teacher: </p><p>Tutor: </p><p>Study buddy: </p>', 380, 160, '#F8FAFC'),
    ],
  },

  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    id: 'product-launch',
    name: 'Product Launch Plan',
    description: 'End-to-end launch plan: positioning, channels, tasks, and go-live checklist',
    category: 'Marketing',
    color: '#EF4444',
    cards: [
      ch(0, 0, '🚀  Product Launch Plan', '#991B1B', 920),

      // Overview
      ch(0, 60, 'Product Overview', '#B91C1C', 920),
      n(0, 116, '<p><strong>Product Name:</strong> </p><p><strong>Launch Date:</strong> </p><p><strong>Target Audience:</strong> </p><p><strong>Price / Tier:</strong> </p>', 280, 160, '#FEF2F2'),
      n(300, 116, '<p><strong>💡 Value Proposition</strong></p><p>We help <em>[audience]</em> to <em>[goal]</em> by <em>[key differentiator]</em>.</p><p><strong>Top 3 benefits:</strong></p><ol><li></li><li></li><li></li></ol>', 300, 180, '#FFF1F2'),
      n(620, 116, '<p><strong>📊 Success Metrics</strong></p><ul><li>Day-1 sign-ups: 500+</li><li>Week-1 revenue: $5k</li><li>Press mentions: 5+</li><li>NPS score: &gt; 40</li><li>Churn week-1: &lt; 5%</li></ul>', 280, 160),

      // Phases
      ch(0, 320, 'Launch Phases', '#B91C1C', 920),
      td(0, 376, '⏪ Pre-Launch (T-14)', [
        'Finalize landing page copy',
        'Set up analytics & tracking',
        'Brief beta testers',
        'Prepare press kit & screenshots',
        'Schedule social media posts',
        'Email teaser to waitlist',
        'Test payment flow end-to-end',
      ], 280, 260),
      td(310, 376, '🟢 Launch Week', [
        'Send launch email to list',
        'Post on Product Hunt',
        'Pitch 10 journalists',
        'Go live on social channels',
        'Monitor metrics dashboard',
        'Reply to every comment',
        'Fix P0 bugs same day',
      ], 280, 260),
      td(620, 376, '⏩ Post-Launch (T+7)', [
        'Publish customer story',
        'Send feedback survey',
        'Fix top-5 user complaints',
        'Plan v1.1 scope',
        'Review all metrics vs. goals',
        'Brief investors / stakeholders',
        'Celebrate with the team! 🎉',
      ], 280, 240),

      // Messaging
      ch(0, 680, 'Messaging & Channels', '#B91C1C', 920),
      n(0, 736, '<p><strong>🔑 Key Message</strong></p><p>The ONE thing every person should remember after seeing this launch.</p><p><em>Write it in ≤10 words:</em></p><p></p>', 280, 160, '#FFF7ED'),
      n(300, 736, '<p><strong>📣 Channel Mix</strong></p><ul><li>📧 Email – warm audience</li><li>🐦 Twitter/X – viral potential</li><li>💼 LinkedIn – B2B/professional</li><li>🏆 Product Hunt – early adopters</li><li>📰 Press – credibility</li><li>🎥 Video demo – conversions</li></ul>', 300, 200),
      n(620, 736, '<p><strong>📅 Content Calendar</strong></p><p>T-14: Teaser post</p><p>T-7: Feature deep-dive</p><p>T-3: Countdown begins</p><p>T-1: "Tomorrow it\'s happening"</p><p>T-0: 🚀 Launch post</p><p>T+1: First user stories</p><p>T+3: Behind the scenes</p>', 280, 200, '#F0FDF4'),

      // Team
      ch(0, 960, 'Team & Responsibilities', '#B91C1C', 920),
      n(0, 1016, '<p><strong>👥 Launch Team</strong></p><p><strong>Launch DRI:</strong> </p><p><strong>Engineering:</strong> </p><p><strong>Design:</strong> </p><p><strong>Marketing:</strong> </p><p><strong>Support:</strong> </p><p><strong>On-call:</strong> </p>', 440, 180, '#F8FAFC'),
      cm(460, 1016, 'Keep a launch war room (Slack channel or Zoom) open all of launch day. Set up alerts for errors, traffic spikes, and payment failures.', 'Pro Tip', 460, 100),
    ],
  },

  // ── PRODUCTIVITY ───────────────────────────────────────────────────────────
  {
    id: 'weekly-planner',
    name: 'Weekly Planner',
    description: 'Plan your entire week day by day with tasks and notes',
    category: 'Productivity',
    color: '#3B82F6',
    cards: [
      ch(0, 0, 'Weekly Planner', '#1D4ED8', 1520),
      n(0, 60, '<p><strong>🎯 This week\'s priority:</strong> </p><p><strong>Energy level:</strong> ⚡⚡⚡⚡⚡</p>', 460, 80, '#EFF6FF'),
      n(480, 60, '<p>💭 <strong>Weekly intention:</strong> </p>', 460, 80, '#F0F9FF'),
      ch(0, 180, 'Monday', '#6B7280', 280),
      td(0, 236, 'Monday', ['Morning standup', 'Deep work block', 'Review PRs']),
      ch(300, 180, 'Tuesday', '#6B7280', 280),
      td(300, 236, 'Tuesday', ['Design review', 'Write docs', '1:1 with manager']),
      ch(600, 180, 'Wednesday', '#6B7280', 280),
      td(600, 236, 'Wednesday', ['Sprint planning', 'Demos', 'Team lunch']),
      ch(900, 180, 'Thursday', '#6B7280', 280),
      td(900, 236, 'Thursday', ['Code review', 'Fix bug #42', 'Prep for Friday']),
      ch(1200, 180, 'Friday', '#6B7280', 280),
      td(1200, 236, 'Friday', ['Retro', 'Ship weekly update', 'Plan next week']),
    ],
  },

  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Capture agenda, discussion, decisions, and action items',
    category: 'Productivity',
    color: '#F59E0B',
    cards: [
      ch(0, 0, 'Meeting Notes', '#B45309', 620),
      n(0, 60, '<p><strong>📅 Date:</strong> </p><p><strong>👥 Attendees:</strong> </p><p><strong>🎯 Goal:</strong> </p><p><strong>⏰ Duration:</strong> </p>', 300, 160),
      n(320, 60, '<p><strong>📋 Agenda</strong></p><ol><li>Item 1 — 10 min</li><li>Item 2 — 15 min</li><li>Item 3 — 10 min</li><li>Questions — 5 min</li></ol>', 280, 160, '#FEF9C3'),
      n(0, 240, '<p><strong>📝 Notes & Decisions</strong></p><p>Key points discussed...</p><p><strong>Decision 1:</strong> </p><p><strong>Decision 2:</strong> </p>', 620, 180, '#F8FAFC'),
      td(0, 440, 'Action Items', [
        'Owner: Task – Due date',
        'Follow up with team',
        'Send recap email',
        'Schedule next meeting',
      ], 620, 180),
    ],
  },

  // ── DESIGN ─────────────────────────────────────────────────────────────────
  {
    id: 'mood-board',
    name: 'Mood Board',
    description: 'Collect visual inspiration, color palettes, and design direction',
    category: 'Design',
    color: '#EC4899',
    cards: [
      ch(0, 0, '🎨  Mood Board', '#9D174D', 900),
      n(0, 60, '<p><strong>Project:</strong> </p><p><strong>Vibe / feeling:</strong> </p><p><strong>Audience:</strong> </p><p><strong>Keywords:</strong> minimal / bold / playful / elegant</p>', 280, 160, '#FDF2F8'),
      img(0, 240, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80', 'Inspiration 1', 280, 200),
      img(300, 240, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', 'Inspiration 2', 280, 200),
      img(600, 240, 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80', 'Inspiration 3', 280, 200),
      ch(0, 460, '🎨  Colour Palette', '#9D174D', 880),
      sw(0, 516, '#1A1A2E', 'Base Dark'),
      sw(100, 516, '#16213E', 'Deep Blue'),
      sw(200, 516, '#0F3460', 'Navy'),
      sw(300, 516, '#E94560', 'Accent Red'),
      sw(400, 516, '#F5F5F5', 'Light BG'),
      n(500, 516, '<p><strong>Typography</strong></p><p><strong>Headings:</strong> </p><p><strong>Body:</strong> </p><p><strong>Accent:</strong> </p>', 380, 120, '#FFF'),
      n(0, 620, '<p><strong>💡 Design Principles</strong></p><ul><li>Principle 1</li><li>Principle 2</li><li>Principle 3</li></ul>', 440, 140, '#FDF2F8'),
    ],
  },

  {
    id: 'design-system',
    name: 'Design System Starter',
    description: 'Document your color palette, typography, components, and brand voice',
    category: 'Design',
    color: '#8B5CF6',
    cards: [
      ch(0, 0, '🎨  Design System', '#5B21B6', 920),
      ch(0, 60, 'Brand Colors', '#7C3AED', 920),
      sw(0, 116, '#3B82F6', 'Primary'),
      sw(100, 116, '#8B5CF6', 'Secondary'),
      sw(200, 116, '#10B981', 'Success'),
      sw(300, 116, '#EF4444', 'Danger'),
      sw(400, 116, '#F59E0B', 'Warning'),
      sw(500, 116, '#6B7280', 'Neutral'),
      sw(600, 116, '#F3F4F6', 'Surface'),
      sw(700, 116, '#111827', 'Text'),
      ch(0, 220, 'Typography', '#7C3AED', 920),
      n(0, 276, '<p><strong>Type Scale</strong></p><p>H1 – 48px / 700 weight</p><p>H2 – 36px / 600 weight</p><p>H3 – 24px / 600 weight</p><p>Body – 16px / 400 weight</p><p>Caption – 12px / 400 weight</p>', 280, 200, '#F5F3FF'),
      n(300, 276, '<p><strong>Font Stack</strong></p><p>Display: <strong>DM Sans</strong></p><p>Body: Inter / System-ui</p><p>Mono: Fira Code</p><p><strong>Line height:</strong> 1.5</p><p><strong>Letter spacing:</strong> -0.01em</p>', 280, 160, '#EDE9FE'),
      ch(0, 500, 'Spacing & Radius', '#7C3AED', 920),
      n(0, 556, '<p><strong>Spacing Scale (4px base)</strong></p><p>xs: 4px · sm: 8px · md: 16px</p><p>lg: 24px · xl: 40px · 2xl: 64px</p><p><strong>Border radius:</strong> 4 / 8 / 12 / 16 / 9999</p><p><strong>Shadow levels:</strong> sm / md / lg / xl</p>', 440, 160, '#F5F3FF'),
    ],
  },

  // ── BUSINESS ───────────────────────────────────────────────────────────────
  {
    id: 'project-board',
    name: 'Project Board',
    description: 'Kanban-style board: backlog, in-progress, review, done',
    category: 'Business',
    color: '#EF4444',
    cards: [
      ch(0, 0, 'Project Board', '#991B1B', 1220),
      n(0, 60, '<p><strong>Project:</strong> </p><p><strong>Team:</strong> </p><p><strong>Sprint end:</strong> </p><p><strong>Goal:</strong> </p>', 580, 100, '#FFF5F5'),
      ch(0, 200, '📦 Backlog', '#6B7280', 280),
      td(0, 256, 'Backlog', ['Feature A — high priority', 'Bug fix B', 'Refactor C', 'Add tests for module X', 'Documentation update']),
      ch(310, 200, '🔨 In Progress', '#2563EB', 280),
      td(310, 256, 'In Progress', ['Feature D (Alice)', 'Design E (Bob)'], 280, 180),
      ch(620, 200, '👀 Review', '#7C3AED', 280),
      td(620, 256, 'Review', ['PR #42 — auth flow', 'Docs update v2'], 280, 160),
      ch(930, 200, '✅ Done', '#059669', 280),
      td(930, 256, 'Done', ['Feature F shipped 🚀', 'Performance fix', 'Security patch'], 280, 180),
    ],
  },

  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Strengths, weaknesses, opportunities, and threats for your strategy',
    category: 'Business',
    color: '#10B981',
    cards: [
      ch(0, 0, 'SWOT Analysis', '#047857', 620),
      n(0, 60, '<p><strong>Company / Project:</strong> </p><p><strong>Date:</strong> </p><p><strong>Author:</strong> </p>', 620, 80, '#ECFDF5'),
      n(0, 160, '<p><strong>💪 Strengths</strong></p><ul><li>Strong brand recognition</li><li>Experienced team</li><li>Proprietary technology</li><li>Add yours…</li></ul>', 280, 220, '#DCFCE7'),
      n(320, 160, '<p><strong>⚠️ Weaknesses</strong></p><ul><li>Limited marketing budget</li><li>Small customer base</li><li>Technical debt</li><li>Add yours…</li></ul>', 280, 220, '#FEF9C3'),
      n(0, 400, '<p><strong>🌱 Opportunities</strong></p><ul><li>Growing market segment</li><li>New regulation benefits us</li><li>Partner integrations</li><li>Add yours…</li></ul>', 280, 220, '#DBEAFE'),
      n(320, 400, '<p><strong>🔥 Threats</strong></p><ul><li>Established competitor</li><li>Economic slowdown</li><li>Data privacy changes</li><li>Add yours…</li></ul>', 280, 220, '#FEE2E2'),
    ],
  },

  // ── PERSONAL ───────────────────────────────────────────────────────────────
  {
    id: 'vision-board',
    name: 'Vision Board',
    description: 'Visualize your goals, dreams, and the life you want to create',
    category: 'Personal',
    color: '#F59E0B',
    cards: [
      ch(0, 0, '✨  My Vision Board', '#92400E', 900),
      n(0, 60, '<p><strong>🌟 My North Star</strong></p><p>In 5 years, I want to be…</p><p></p><p><em>Write your big vision here, no limits.</em></p>', 280, 200, '#FFFBEB'),
      img(300, 60, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', 'Dream Life', 580, 200),
      ch(0, 280, 'Life Areas', '#92400E', 900),
      n(0, 336, '<p><strong>💼 Career</strong></p><p>Role I want: </p><p>Skills to master: </p><p>Income goal: </p>', 280, 180, '#FEF3C7'),
      n(300, 336, '<p><strong>❤️ Relationships</strong></p><p>How I want to show up: </p><p>Who to invest in: </p><p>Community: </p>', 280, 180, '#FCE7F3'),
      n(600, 336, '<p><strong>🏋️ Health</strong></p><p>Fitness goal: </p><p>Habits to build: </p><p>Mental wellness: </p>', 280, 180, '#D1FAE5'),
      td(0, 540, '3 Goals This Year', [
        '🥇 Goal 1 (most important)',
        '🥈 Goal 2',
        '🥉 Goal 3',
        'Monthly review date',
      ], 440, 180),
      n(460, 540, '<p><strong>💬 Affirmation</strong></p><p><em>"Write your personal mantra or affirmation here."</em></p>', 420, 120, '#FFFBEB'),
    ],
  },

  // ── CREATIVE ────────────────────────────────────────────────────────────────
  {
    id: 'creative-brief',
    name: 'Creative Brief',
    description: 'Define the project objective, audience, tone, deliverables, and timeline',
    category: 'Design',
    color: '#EC4899',
    cards: [
      ch(0, 0, '✏️  Creative Brief', '#9D174D', 880),

      // Overview
      ch(0, 60, 'Project Overview', '#BE185D', 880),
      n(0, 116, '<p><strong>Project Name:</strong> </p><p><strong>Client / Brand:</strong> </p><p><strong>Date:</strong> </p><p><strong>Owner:</strong> </p><p><strong>Budget:</strong> </p>', 280, 180, '#FDF2F8'),
      n(300, 116, '<p><strong>🎯 Objective</strong></p><p>What problem are we solving? What should the audience feel, think, or do after experiencing this?</p><p></p>', 280, 180, '#FFF0F6'),
      n(600, 116, '<p><strong>📣 The Single Message</strong></p><p>If the audience remembers ONE thing, it should be:</p><p></p><p><em>Write it in one sentence.</em></p>', 260, 180, '#FCE7F3'),

      // Audience
      ch(0, 320, 'Target Audience', '#BE185D', 880),
      n(0, 376, '<p><strong>Primary Audience</strong></p><p><strong>Age / Demo:</strong> </p><p><strong>Values:</strong> </p><p><strong>Pain points:</strong> </p><p><strong>Where they hang out:</strong> </p>', 280, 200, '#FDF2F8'),
      n(300, 376, '<p><strong>Insight</strong></p><p>What truth about this audience makes our message land?</p><p></p><p><em>"They believe that…"</em></p>', 280, 160, '#FFF0F6'),
      n(600, 376, '<p><strong>Tone of Voice</strong></p><p>☐ Bold &nbsp; ☐ Warm &nbsp; ☐ Witty<br/>☐ Expert &nbsp; ☐ Minimal &nbsp; ☐ Playful<br/>☐ Premium &nbsp; ☐ Approachable</p><p><strong>NOT:</strong> </p>', 260, 160),

      // Deliverables
      ch(0, 600, 'Deliverables & References', '#BE185D', 880),
      td(0, 656, 'Deliverables', [
        'Define each format & size',
        'Primary hero asset',
        'Social media variants (3:2, 1:1, 9:16)',
        'Copy / headlines',
        'Brand guidelines applied',
        'Accessibility review',
        'Final file export (PNG, PDF, MP4)',
      ], 280, 260),
      n(300, 656, '<p><strong>🎨 Visual References</strong></p><p>Add image URLs or Unsplash links here. Describe what you like about each.</p><ol><li>Ref 1 — why it works</li><li>Ref 2 — what to borrow</li><li>Ref 3 — the vibe</li></ol>', 280, 200, '#FDF2F8'),
      n(600, 656, '<p><strong>🚫 What to Avoid</strong></p><ul><li>Do not use competitor colors</li><li>Avoid stock photo clichés</li><li>No jargon in copy</li><li>Add more…</li></ul><p><strong>Legal / trademark notes:</strong> </p>', 260, 200, '#FEF2F2'),

      // Timeline
      ch(0, 940, 'Timeline', '#BE185D', 880),
      td(0, 996, 'Milestones', [
        '📋 Brief approved',
        '🧠 Concepts presented (3 directions)',
        '🔁 First round of revisions',
        '✅ Final approval',
        '🚀 Delivery / Go live',
      ], 440, 200),
      cm(460, 996, 'Limit revision rounds to 2. Scope creep beyond that should trigger a change order conversation.', 'Process Note', 400, 80),
    ],
  },

  {
    id: 'storyboard',
    name: 'Storyboard',
    description: 'Plan a video, animation, or pitch scene-by-scene with notes and dialogue',
    category: 'Design',
    color: '#0EA5E9',
    cards: [
      ch(0, 0, '🎬  Storyboard', '#0369A1', 1200),

      // Project info
      n(0, 60, '<p><strong>Project:</strong> </p><p><strong>Format:</strong> Video / Animation / Pitch</p><p><strong>Duration:</strong> </p><p><strong>Aspect ratio:</strong> 16:9 / 9:16 / 1:1</p><p><strong>Audience:</strong> </p>', 360, 180, '#F0F9FF'),
      n(380, 60, '<p><strong>🎯 Story Goal</strong></p><p>What should the viewer feel at the end?</p><p><strong>Hook (first 3 sec):</strong> </p><p><strong>CTA:</strong> </p>', 360, 180, '#E0F2FE'),
      n(760, 60, '<p><strong>🎨 Visual Style</strong></p><p>☐ Live action &nbsp; ☐ Animation<br/>☐ Screencast &nbsp; ☐ Slides<br/><strong>Color grade:</strong> </p><p><strong>Music / SFX:</strong> </p>', 420, 180),

      // Scenes row 1
      ch(0, 270, 'Act 1 — Setup', '#0369A1', 1200),
      n(0, 326, '<p><strong>Scene 1</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:00 – 0:05</p>', 280, 220, '#F0F9FF'),
      n(300, 326, '<p><strong>Scene 2</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:05 – 0:12</p>', 280, 220, '#F0F9FF'),
      n(600, 326, '<p><strong>Scene 3</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:12 – 0:20</p>', 280, 220, '#F0F9FF'),
      n(900, 326, '<p><strong>Scene 4</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:20 – 0:30</p>', 280, 220, '#F0F9FF'),

      // Scenes row 2
      ch(0, 570, 'Act 2 — Conflict / Feature', '#0369A1', 1200),
      n(0, 626, '<p><strong>Scene 5</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:30 – 0:42</p>', 280, 220, '#E0F2FE'),
      n(300, 626, '<p><strong>Scene 6</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:42 – 0:55</p>', 280, 220, '#E0F2FE'),
      n(600, 626, '<p><strong>Scene 7</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 0:55 – 1:08</p>', 280, 220, '#E0F2FE'),
      n(900, 626, '<p><strong>Scene 8</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 1:08 – 1:20</p>', 280, 220, '#E0F2FE'),

      // Scenes row 3
      ch(0, 870, 'Act 3 — Resolution / CTA', '#0369A1', 1200),
      n(0, 926, '<p><strong>Scene 9</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 1:20 – 1:35</p>', 280, 220, '#BAE6FD'),
      n(300, 926, '<p><strong>Scene 10</strong></p><p><strong>Visual:</strong> </p><hr/><p><strong>VO / Dialogue:</strong> </p><p><em>"…"</em></p><hr/><p><strong>Duration:</strong> 1:35 – 1:50</p>', 280, 220, '#BAE6FD'),
      n(600, 926, '<p><strong>End Card / CTA</strong></p><p><strong>Visual:</strong> Logo lock-up</p><hr/><p><strong>CTA text:</strong> </p><p><strong>URL / QR:</strong> </p><hr/><p><strong>Duration:</strong> 1:50 – 2:00</p>', 280, 220, '#7DD3FC'),
      td(900, 926, 'Post-Production', [
        'Edit rough cut',
        'Add music & SFX',
        'Color grade',
        'Add captions / subtitles',
        'Export final master',
        'Create platform variants',
      ], 280, 220),
    ],
  },

  {
    id: 'travel-planner',
    name: 'Travel Planner',
    description: 'Plan your trip: dates, packing list, itinerary, and budget',
    category: 'Personal',
    color: '#06B6D4',
    cards: [
      ch(0, 0, '✈️  Trip Planner', '#0E7490', 900),
      n(0, 60, '<p><strong>Destination:</strong> </p><p><strong>Dates:</strong> </p><p><strong>Travelers:</strong> </p><p><strong>Budget:</strong> $</p><p><strong>Purpose:</strong> Adventure / Relax / Culture</p>', 280, 200, '#ECFEFF'),
      img(300, 60, 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80', 'Destination', 580, 200),
      ch(0, 280, 'Itinerary', '#0E7490', 580),
      n(0, 336, '<p><strong>Day 1</strong></p><p>Morning: </p><p>Afternoon: </p><p>Evening: </p><p>Restaurant: </p>', 280, 180),
      n(300, 336, '<p><strong>Day 2</strong></p><p>Morning: </p><p>Afternoon: </p><p>Evening: </p><p>Restaurant: </p>', 280, 180),
      ch(620, 280, 'Lists', '#0E7490', 260),
      td(620, 336, '🧳 Packing', ['Passport / ID', 'Adapters & chargers', 'Medications', 'Clothes (×7)', 'Toiletries bag', 'Camera / phone mount'], 260, 240),
      td(0, 540, '📋 Before You Go', ['Book flights & hotel', 'Travel insurance', 'Download offline maps', 'Notify bank', 'Pet / house sitter'], 580, 200),
    ],
  },
]
