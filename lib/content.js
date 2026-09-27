// Static studio copy used by marketing pages so they render instantly,
// plus offline fallback content when the API cannot be reached.

export const SERVICES = [
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    description:
      'Positioning, naming support and a complete visual system — marks, type, colour and voice — documented so every team can apply it without guesswork.',
    deliverables: [
      'Brand strategy and positioning workshop',
      'Primary logo, monogram and lockup set',
      'Typographic and colour system',
      'Brand guidelines (digital and print-ready)',
      'Rollout templates for social, deck and stationery'
    ]
  },
  {
    id: 'packaging-design',
    title: 'Packaging Design',
    description:
      'Structural thinking and surface design for shelf and doorstep. We prototype in real materials, check legibility at arm’s length and prepare dielines your printer will thank you for.',
    deliverables: [
      'Structural concepts and dieline engineering',
      'Label and carton artwork across the range',
      'Material, finish and substrate specification',
      'Print-ready mechanicals with colour separations',
      'Press-check support and retouching'
    ]
  },
  {
    id: 'editorial-print',
    title: 'Editorial & Print',
    description:
      'Books, reports, catalogues and campaign print built on a disciplined grid. We care about the widow on page 47 as much as the cover.',
    deliverables: [
      'Grid, typographic hierarchy and master pages',
      'Art direction for photography and illustration',
      'Full layout and typesetting',
      'Pre-press preparation and paper specification',
      'Digital companion PDF and web version'
    ]
  },
  {
    id: 'digital-product',
    title: 'Digital Product Design',
    description:
      'Interfaces that carry the brand without slowing anyone down. Component libraries, accessible colour pairings and design files engineers can actually build from.',
    deliverables: [
      'Information architecture and user flows',
      'Wireframes and interactive prototypes',
      'Design system with tokens and components',
      'Responsive UI across mobile, tablet and desktop',
      'Accessibility review to WCAG 2.2 AA'
    ]
  },
  {
    id: 'motion-art-direction',
    title: 'Motion & Art Direction',
    description:
      'The rules for how a brand moves and is photographed. Title systems, loops, transitions and shot lists that keep campaigns consistent across every channel.',
    deliverables: [
      'Motion principles and easing language',
      'Animated logo and title sequence',
      'Campaign art direction and shot lists',
      'Social cut-downs and aspect-ratio variants',
      'Handover kit with source files and tokens'
    ]
  }
];

export const PROCESS_STEPS = [
  {
    id: 'discovery',
    number: '01',
    title: 'Discovery',
    description:
      'Two weeks of interviews, audits and market mapping. We meet your team, read the sales deck, talk to customers and come back with a written point of view on what the brand should stand for.'
  },
  {
    id: 'concept',
    number: '02',
    title: 'Concept',
    description:
      'Three distinct territories, each shown in context rather than on a white page. You pick a direction; we argue the case for the one we believe in and then commit fully to your decision.'
  },
  {
    id: 'craft',
    number: '03',
    title: 'Craft',
    description:
      'The long middle. Drawing marks at four sizes, spacing type by eye, proofing on real stock and testing colour on screen and press until the system holds up everywhere it will live.'
  },
  {
    id: 'launch',
    number: '04',
    title: 'Launch',
    description:
      'Guidelines, templates and a working session with the teams who will use them. We stay on retainer for the first quarter so the system grows with you instead of drifting.'
  }
];

export const TEAM = [
  {
    id: 'maya-okonkwo',
    name: 'Maya Okonkwo',
    initials: 'MO',
    role: 'Founder & Creative Director',
    bio: 'Founded Prism in 2014 after eight years leading identity work in London and Lagos. Maya sets the creative direction on every engagement and still draws the first sketches herself.'
  },
  {
    id: 'tomas-lindqvist',
    name: 'Tomas Lindqvist',
    initials: 'TL',
    role: 'Design Director, Brand',
    bio: 'Type-obsessed and press-trained. Tomas leads identity and editorial projects, and has a standing rule that no logo leaves the studio until it has been tested at 12 pixels.'
  },
  {
    id: 'priya-raman',
    name: 'Priya Raman',
    initials: 'PR',
    role: 'Design Director, Digital',
    bio: 'Builds the design systems behind our product work. Priya writes the tokens, reviews the accessibility contrast pairs and speaks fluent enough React to argue with engineers politely.'
  },
  {
    id: 'daniel-moreau',
    name: 'Daniel Moreau',
    initials: 'DM',
    role: 'Studio Manager & Producer',
    bio: 'Keeps schedules honest and printers on side. Daniel scopes every project, runs the press checks and is the reason our estimates rarely move more than a week.'
  }
];

export const STUDIO_FACTS = [
  { id: 'founded', label: 'Founded', value: '2014' },
  { id: 'cities', label: 'Cities', value: 'Lisbon & Toronto' },
  { id: 'clients', label: 'Clients served', value: '140+' },
  { id: 'projects', label: 'Projects shipped', value: '310' }
];

export const CATEGORIES = ['Branding', 'Packaging', 'Editorial', 'Digital', 'Motion'];

export const FALLBACK_PROJECTS = [
  {
    id: 1,
    slug: 'aster-botanicals-packaging-system',
    title: 'Aster Botanicals — Packaging System',
    client: 'Aster Botanicals',
    category: 'Packaging',
    year: 2024,
    summary:
      'A refillable skincare range with a colour-coded cap system that reads clearly from two metres away on a crowded shelf.',
    body:
      'Aster came to us with eleven products and eleven different bottle shapes. We reduced the range to three vessel sizes, then built a colour-coded cap system so customers could identify a product by silhouette alone.\n\nThe surface design uses a single condensed grotesque set at two sizes, with ingredient details printed in soy ink directly onto uncoated glass. Refill pouches share the same palette but drop the varnish, which cut the unit cost by eleven percent.\n\nSix months after launch, Aster reported a measurable drop in the number of customer service queries about which product was which.',
    palette: 'accent,surface,text-muted,success',
    coverHue: 18,
    coverHueEnd: 46,
    featured: 1,
    status: 'published',
    sortOrder: 1
  },
  {
    id: 2,
    slug: 'northwind-ferry-wayfinding',
    title: 'Northwind Ferry Wayfinding',
    client: 'Northwind Ferries',
    category: 'Branding',
    year: 2023,
    summary:
      'Terminal signage and a full identity refresh for a coastal ferry network carrying 1.2 million passengers a year.',
    body:
      'Northwind operates nine terminals across a stretch of coast where the weather changes the schedule daily. The old signage was printed, laminated and out of date within a week.\n\nWe designed a modular sign system with fixed enamel panels for permanent information and slot-in cards for the parts that change. The identity sits on a maritime blue with a high-visibility amber used only for live departure changes, so the colour itself carries meaning.\n\nThe type is set in a humanist sans at a minimum of 60mm cap height on platform signage, tested in rain and at dusk before the first panel was fabricated.',
    palette: 'accent,border,text,warning',
    coverHue: 205,
    coverHueEnd: 232,
    featured: 1,
    status: 'published',
    sortOrder: 2
  },
  {
    id: 3,
    slug: 'cadence-music-festival-identity',
    title: 'Cadence Music Festival Identity',
    client: 'Cadence Festival',
    category: 'Motion',
    year: 2024,
    summary:
      'A generative identity where the wordmark stretches and compresses in time with each headline act’s tempo.',
    body:
      'Cadence runs across four stages and three days, and the previous identity flattened that variety into one poster. We built a system instead of an artwork.\n\nThe wordmark is drawn from a variable typeface whose width axis is driven by BPM data supplied by the programming team. Slow sets render wide and heavy; faster sets compress and sharpen. Every stage inherits its own hue from the same base ramp.\n\nWe delivered the motion rules as a token set plus a small tool the festival’s in-house team uses to generate new assets without opening a design file.',
    palette: 'accent,accent-hover,surface-raised,text',
    coverHue: 286,
    coverHueEnd: 320,
    featured: 1,
    status: 'published',
    sortOrder: 3
  },
  {
    id: 4,
    slug: 'meridian-quarterly-editorial',
    title: 'Meridian Quarterly — Editorial Redesign',
    client: 'Meridian Institute',
    category: 'Editorial',
    year: 2023,
    summary:
      'A 132-page research quarterly rebuilt on a six-column grid, with a data-visualisation language that survives black-and-white reprinting.',
    body:
      'Meridian publishes dense economic research read mostly on paper and photocopied often. The previous layout used thin hairlines and pale tints that vanished on a second-generation copy.\n\nWe moved to a six-column grid with a generous outer margin for marginalia, set the body in a serif at 9.5/14 and rebuilt every chart type around pattern fills rather than colour alone. Section openers use a full-bleed gradient plate that is the only colour in the issue.\n\nProduction time per issue dropped from five weeks to three once the master pages and paragraph styles were in place.',
    palette: 'text,text-muted,border,surface',
    coverHue: 152,
    coverHueEnd: 178,
    featured: 0,
    status: 'published',
    sortOrder: 4
  },
  {
    id: 5,
    slug: 'linden-health-product-system',
    title: 'Linden Health Design System',
    client: 'Linden Health',
    category: 'Digital',
    year: 2025,
    summary:
      'A component library and accessible colour system for a patient portal used by clinicians on ten-year-old hardware.',
    body:
      'Linden’s portal had grown to 140 screens with no shared components. Buttons existed in nine sizes and four blues, none of which passed contrast requirements against the sidebar.\n\nWe rebuilt the foundations as tokens — spacing on a 4px scale, a type ramp of seven steps, and a colour set where every foreground and background pairing clears WCAG 2.2 AA. On top of that sit 38 components with documented states, including the loading and error cases that had previously been improvised per screen.\n\nEngineering adoption ran alongside design: each component shipped with the React implementation, so the library was never a picture of a product that did not exist.',
    palette: 'accent,success,border,surface-raised',
    coverHue: 196,
    coverHueEnd: 168,
    featured: 1,
    status: 'published',
    sortOrder: 5
  },
  {
    id: 6,
    slug: 'harrow-lane-coffee-brand',
    title: 'Harrow Lane Coffee — Brand & Cups',
    client: 'Harrow Lane Coffee',
    category: 'Branding',
    year: 2022,
    summary:
      'An identity for a three-site roastery, built around a hand-drawn lane marker and a cup system that works unprinted.',
    body:
      'Harrow Lane roast on site and wanted the brand to feel made rather than manufactured. The mark is a drawn lane marker, redrawn four times at different weights so it holds from a 14mm stamp to a 3-metre window vinyl.\n\nThe cup system uses only two printed colours plus the natural kraft board, with the size indicated by the height of a single printed band rather than a separate SKU design. That decision took three cup designs down to one plate change.\n\nSignage, aprons, bags and the wholesale price list all draw from the same restricted palette, which makes new-site openings a matter of ordering rather than designing.',
    palette: 'accent,text,surface,border',
    coverHue: 28,
    coverHueEnd: 8,
    featured: 0,
    status: 'published',
    sortOrder: 6
  }
];

export const BUDGET_RANGES = [
  'Under $10k',
  '$10k – $25k',
  '$25k – $50k',
  '$50k – $100k',
  '$100k+',
  'Not sure yet'
];

export const STUDIO_CONTACT = {
  email: 'studio@prismdesign.co',
  phone: '+1 (416) 555-0148',
  hours: 'Monday to Friday, 09:00 – 18:00 (WET / EST)',
  addresses: [
    'Rua da Boavista 84, 1200-069 Lisbon, Portugal',
    '219 Dufferin Street, Suite 305, Toronto, ON M6K 3J1'
  ],
  responseNote:
    'We reply to every inquiry within two working days. Most engagements start four to six weeks after the first call.'
};

export default {
  SERVICES,
  PROCESS_STEPS,
  TEAM,
  STUDIO_FACTS,
  CATEGORIES,
  FALLBACK_PROJECTS,
  BUDGET_RANGES,
  STUDIO_CONTACT
};