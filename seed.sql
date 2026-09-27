-- ============================================================
-- Prism Studio — schema + seed data
-- ============================================================
-- Demo admin credentials:
--   email:    studio@prismdesign.co
--   password: PrismStudio2024
-- (bcrypt hash below, cost 10 — change this in any real deployment)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(190) NOT NULL,
  title VARCHAR(255) NOT NULL,
  client VARCHAR(190) DEFAULT NULL,
  category VARCHAR(64) DEFAULT NULL,
  year SMALLINT DEFAULT NULL,
  summary TEXT,
  body LONGTEXT,
  palette VARCHAR(255) DEFAULT NULL,
  cover_hue SMALLINT DEFAULT 0,
  cover_hue_end SMALLINT DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_status (status),
  KEY idx_projects_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  company VARCHAR(190) DEFAULT NULL,
  budget_range VARCHAR(64) DEFAULT NULL,
  service VARCHAR(128) DEFAULT NULL,
  message TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Prism Studio Admin', 'studio@prismdesign.co', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('Mara Ellison', 'mara@prismdesign.co', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'editor')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role);

-- ------------------------------------------------------------
-- Projects
-- ------------------------------------------------------------
INSERT INTO projects
  (slug, title, client, category, year, summary, body, palette, cover_hue, cover_hue_end, featured, status, sort_order)
VALUES
  (
    'aster-botanicals-packaging-system',
    'Aster Botanicals — Packaging System',
    'Aster Botanicals',
    'Packaging',
    2024,
    'A modular packaging system for a 24-SKU skincare range, built so new formulas can launch without a redesign.',
    'Aster Botanicals had outgrown a label design made for a single hero serum. Twelve products later, the shelf read as twelve different brands.\n\nWe rebuilt the range around a fixed grid: a constant cap band, a variable ingredient field, and a typographic hierarchy that keeps the product name legible at 12mm. Each product family earns a single pigment drawn from the botanical itself — rosehip, blue tansy, sea buckthorn — while the structural elements stay unchanged across every carton and bottle.\n\nThe result is a system the in-house team can extend. We shipped an InDesign template library, a colour-matching guide for the print partner, and a one-page rule sheet that covers every decision a new SKU can raise.\n\nSince launch, Aster has released nine additional products without commissioning a single new layout, and their retail partner reduced shelf-set time by roughly a third.',
    'accent,surface,text-muted,success',
    142,
    186,
    1,
    'published',
    1
  ),
  (
    'northwind-ferry-wayfinding',
    'Northwind Ferry Wayfinding',
    'Northwind Ferry Authority',
    'Editorial',
    2024,
    'Terminal signage and a printed timetable family for a six-island ferry network carrying 2.1 million passengers a year.',
    'Northwind runs four terminals across a coastline where weather changes the schedule more often than the schedule does. Passengers were reading three conflicting sources: a printed board, a laminated sheet, and a whiteboard.\n\nWe designed one information model and expressed it three ways. Departures are always island-first, time-second. Delays use a single amber field rather than handwritten annotation. Route colours were tested at 20 metres in fog-grade contrast conditions before anything was specified.\n\nThe typographic system pairs a condensed grotesque for route names with a tabular numeral face for times, sized to a reading distance schedule rather than a fixed point size. Every sign in the network was specified on a 60mm module so panels can be swapped rather than reprinted.\n\nWe also produced the pocket timetable — 16 pages, folded to fit a jacket pocket — which the Authority now reprints seasonally from templates we handed over.',
    'text,border,accent,warning',
    206,
    232,
    1,
    'published',
    2
  ),
  (
    'cadence-music-festival-identity',
    'Cadence Music Festival Identity',
    'Cadence Festival',
    'Branding',
    2023,
    'A generative identity for a three-stage festival, where the mark is drawn by the lineup itself.',
    'Cadence books 90 artists across three stages and four days. A static logo could never carry that much programming, so we built a mark that responds to it.\n\nThe Cadence wordmark sits inside a waveform field generated from the running order: stage one draws the low band, stage two the mid, stage three the high. Every poster, screen and wristband in a given year shares the same underlying waveform, so the artwork is unique to the edition but unmistakably Cadence.\n\nWe supplied a browser-based generator so the marketing team can produce assets themselves. It outputs print-ready vectors, social crops and animated loops from a single CSV of the lineup.\n\nThe 2023 edition sold out in eleven days, and the festival reported a threefold increase in user-generated posts carrying the mark.',
    'accent,accent-hover,surface-raised,text',
    18,
    54,
    1,
    'published',
    3
  ),
  (
    'meridian-capital-report-series',
    'Meridian Capital Report Series',
    'Meridian Capital',
    'Editorial',
    2023,
    'An annual report and quarterly outlook series that makes 140 pages of financial data genuinely readable.',
    'Meridian publishes a flagship annual report plus four quarterly outlooks. Each one was being designed from scratch by a different agency, and readers could not tell them apart.\n\nWe built a single editorial grid — twelve columns, four baseline rhythms — that flexes from a full-bleed data spread to a single-column essay without breaking. Charts follow one chart-style specification: one accent colour, one neutral ramp, no gradients, no 3D, axis labels that never rotate.\n\nThe typography pairs a high-contrast serif for argument-led sections with a neutral sans for tables and footnotes, which lets a reader skim the narrative and drill into the numbers without losing their place.\n\nWe delivered the master InDesign book, a chart-building kit for the research team, and a 40-page standards document. Meridian now produces all five publications in-house.',
    'surface,border,text,accent',
    228,
    264,
    0,
    'published',
    4
  ),
  (
    'harbour-lane-digital-product',
    'Harbour Lane — Digital Product Design',
    'Harbour Lane Grocers',
    'Digital',
    2022,
    'An ordering interface and design system for an independent grocer moving 400 weekly delivery orders online.',
    'Harbour Lane serve a neighbourhood that knows them by name, and their first attempt at online ordering felt like a supermarket checkout. Orders stalled at the basket.\n\nWe designed the product around how the shop actually works: substitutions are suggested by a real person, produce is priced by weight after picking, and the delivery slot is a conversation rather than a dropdown. The interface makes each of those legible instead of hiding them behind a generic e-commerce flow.\n\nThe design system covers 38 components across four breakpoints, with a token layer that maps directly onto the developers'' CSS custom properties. Accessibility was specified, not retrofitted: every interactive control has a 44px hit area, a visible focus ring and a tested contrast ratio of at least 4.5:1.\n\nBasket abandonment fell by 27% in the first quarter after launch, and average order value rose because substitutions stopped surprising people at the door.',
    'accent,success,surface-raised,text-muted',
    276,
    312,
    1,
    'published',
    5
  ),
  (
    'ferrous-coffee-roasters-identity',
    'Ferrous Coffee Roasters Identity',
    'Ferrous Coffee Roasters',
    'Branding',
    2022,
    'A full identity and bag system for a single-origin roastery, built to survive being handled with wet hands.',
    'Ferrous roast in small batches and sell most of their volume across a counter. The brand had to work in the hand as much as on a shelf.\n\nWe drew a wordmark from the shape of a roasting drum — a compressed, slightly asymmetric letterform that reads at 8mm on a 250g bag and at three metres on a shopfront. The palette takes its cues from the roast curve: raw green through to dark-roast iron, with a single warm accent for the origin stamp.\n\nBag construction was part of the design. We specified an uncoated kraft stock with a matte varnish only where hands make contact, and an origin label printed separately so a new single origin can be introduced in a week rather than a print run.\n\nThe system now covers four bag sizes, a wholesale sticker set, cafe menu boards and the delivery van. Ferrous opened a second site eight months after launch using the same kit of parts.',
    'text,accent,border,warning',
    28,
    12,
    0,
    'published',
    6
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  client = VALUES(client),
  category = VALUES(category),
  year = VALUES(year),
  summary = VALUES(summary),
  body = VALUES(body),
  palette = VALUES(palette),
  cover_hue = VALUES(cover_hue),
  cover_hue_end = VALUES(cover_hue_end),
  featured = VALUES(featured),
  status = VALUES(status),
  sort_order = VALUES(sort_order);

-- ------------------------------------------------------------
-- Inquiries
-- ------------------------------------------------------------
INSERT INTO inquiries (name, email, company, budget_range, service, message, status)
SELECT * FROM (
  SELECT
    'Deborah Kwan' AS name,
    'deborah.kwan@tidewellfoods.com' AS email,
    'Tidewell Foods' AS company,
    '£25k–£50k' AS budget_range,
    'Packaging Design' AS service,
    'We are launching a chilled ready-meal range into three national retailers next spring — eighteen SKUs at launch, growing to about thirty within a year. Our current packaging was designed for a farm-shop audience and does not hold up on a supermarket shelf. We need a system that scales, plus artwork templates our repro house can work from. Could we book an introductory call in the next two weeks?' AS message,
    'new' AS status
) AS src
WHERE NOT EXISTS (SELECT 1 FROM inquiries i WHERE i.email = src.email);

INSERT INTO inquiries (name, email, company, budget_range, service, message, status)
SELECT * FROM (
  SELECT
    'Samuel Adeyemi' AS name,
    's.adeyemi@northgatearts.org' AS email,
    'Northgate Arts Centre' AS company,
    '£10k–£25k' AS budget_range,
    'Brand Identity' AS service,
    'Northgate reopens in October after a two-year capital redevelopment, and the identity we have been using since 2009 no longer reflects the building or the programme. We would need a core identity, signage principles for the new foyer, and a season-brochure template our in-house designer can run with. Budget is grant-funded and fixed, but the timeline is flexible up to August.' AS message,
    'in_review' AS status
) AS src
WHERE NOT EXISTS (SELECT 1 FROM inquiries i WHERE i.email = src.email);

INSERT INTO inquiries (name, email, company, budget_range, service, message, status)
SELECT * FROM (
  SELECT
    'Priya Raman' AS name,
    'priya@loomanalytics.io' AS email,
    'Loom Analytics' AS company,
    '£50k+' AS budget_range,
    'Digital Product Design' AS service,
    'We have raised a Series A and our dashboard has grown organically into something our own sales team struggles to demo. We are looking for a design partner to audit the current product, define a component library our two front-end engineers can implement, and redesign the three core reporting flows. Ideally an engagement of three to four months starting in the next quarter.' AS message,
    'replied' AS status
) AS src
WHERE NOT EXISTS (SELECT 1 FROM inquiries i WHERE i.email = src.email);
