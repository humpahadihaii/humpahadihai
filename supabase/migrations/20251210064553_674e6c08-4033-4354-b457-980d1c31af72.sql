
-- Seed Tourism Providers
INSERT INTO tourism_providers (name, type, district_id, description, phone, email, is_sample, is_active, source)
VALUES
  ('Kafligair Mountain Homestay', 'homestay', 
   (SELECT id FROM districts WHERE LOWER(name) = 'bageshwar' LIMIT 1),
   'Family-run homestay surrounded by terraced fields in Kafligair, Bageshwar. Perfect for slow travellers who want silence, stars, and authentic Pahadi food cooked on chulha.',
   '+91-9999900001', 'kafligairhomestay@example.com', true, true, 'ai_seed'),
  
  ('Pindari Valley Trek Guides', 'guide',
   (SELECT id FROM districts WHERE LOWER(name) = 'bageshwar' LIMIT 1),
   'Local guide collective from Khati village, specialized in Pindari, Kafni, and nearby valley treks with safe routes, porters, and camping support.',
   '+91-9999900002', 'pindariguides@example.com', true, true, 'ai_seed'),
  
  ('Auli Himalayan Stay & Ski', 'homestay',
   (SELECT id FROM districts WHERE LOWER(name) = 'chamoli' LIMIT 1),
   'Warm wooden rooms with views of Nanda Devi, plus local instructors for basic skiing and cable car guidance in Auli.',
   '+91-9999900003', 'aulihimalayanstay@example.com', true, true, 'ai_seed'),
  
  ('Joshimath Pilgrim & Trek Taxi Services', 'taxi',
   (SELECT id FROM districts WHERE LOWER(name) = 'chamoli' LIMIT 1),
   'Trusted taxi service for Auli, Badrinath, Valley of Flowers, and nearby treks with experienced mountain drivers and clean cabs.',
   '+91-9999900004', 'joshimathtaxis@example.com', true, true, 'ai_seed'),
  
  ('Naini Lake View Guesthouse', 'guesthouse',
   (SELECT id FROM districts WHERE LOWER(name) = 'nainital' LIMIT 1),
   'Budget-friendly guesthouse 5 minutes from Naini Lake with balcony views, homely food, and easy access to Mall Road.',
   '+91-9999900005', 'nainilakeview@example.com', true, true, 'ai_seed'),
  
  ('Mussoorie Heritage Walks', 'experience',
   (SELECT id FROM districts WHERE LOWER(name) = 'dehradun' LIMIT 1),
   'Story-led heritage walks covering old Mussoorie churches, bazaars, colonial buildings, and hidden viewpoints, guided by local storytellers.',
   '+91-9999900006', 'mussooriewalks@example.com', true, true, 'ai_seed'),
  
  ('Munsiyari Panchachuli Homestay', 'homestay',
   (SELECT id FROM districts WHERE LOWER(name) = 'pithoragarh' LIMIT 1),
   'Cosy rooms facing the Panchachuli peaks, organic meals, and help arranging short hikes to nearby waterfalls and meadows.',
   '+91-9999900007', 'panchachulihomestay@example.com', true, true, 'ai_seed'),
  
  ('Guptkashi Kedarnath Shuttle & Stay', 'homestay',
   (SELECT id FROM districts WHERE LOWER(name) = 'rudraprayag' LIMIT 1),
   'Simple rooms for pilgrims with early morning tea, packed breakfast, and shuttle arrangements up to Sonprayag for the Kedarnath yatra.',
   '+91-9999900008', 'guptkashistay@example.com', true, true, 'ai_seed');

-- Seed Tourism Listings
INSERT INTO tourism_listings (provider_id, title, category, district_id, short_description, full_description, base_price, price_unit, is_featured, is_sample, is_active)
VALUES
  -- Kafligair Mountain Homestay listings
  ((SELECT id FROM tourism_providers WHERE email = 'kafligairhomestay@example.com' LIMIT 1),
   '2N/3D Village Homestay in Kafligair', 'stay',
   (SELECT id FROM districts WHERE LOWER(name) = 'bageshwar' LIMIT 1),
   'Live with a local family, join them in the fields, and enjoy homemade Pahadi meals.',
   'Experience authentic Pahadi village life in Kafligair. Stay in a private room with a local family, share meals cooked on a traditional chulha, and wake up to stunning mountain views.\n\nYour days can include morning walks through terraced fields, helping with daily chores if you wish, and learning about local herbs and crops. Evenings feature home-cooked dinners and seasonal bonfires under the stars.\n\nThis is slow travel at its best – no WiFi rush, just pure mountain silence and genuine hospitality.',
   1800, 'per night (per person, with meals)', true, true, true),
  
  ((SELECT id FROM tourism_providers WHERE email = 'kafligairhomestay@example.com' LIMIT 1),
   'Kafligair Sunset Walk & Village Tour', 'local_experience',
   (SELECT id FROM districts WHERE LOWER(name) = 'bageshwar' LIMIT 1),
   'Guided evening walk to terraced fields and ridge viewpoint with tea and snacks.',
   NULL, 700, 'per person', false, true, true),
  
  -- Pindari Valley Trek Guides listing
  ((SELECT id FROM tourism_providers WHERE email = 'pindariguides@example.com' LIMIT 1),
   'Pindari Glacier Trek – 5D/4N Ex-Khati', 'trek',
   (SELECT id FROM districts WHERE LOWER(name) = 'bageshwar' LIMIT 1),
   'Classic Pindari trek with local guides, campsite setup, and safe routes.',
   'Join experienced local guides from Khati village on the iconic Pindari Glacier trek. This 5-day journey takes you through rhododendron forests, high-altitude meadows, and stunning glacier views.\n\nAll camping equipment, meals during the trek, and porter support included. Our guides know every turn of this trail and ensure your safety throughout.',
   9500, 'per person', true, true, true),
  
  -- Auli Himalayan Stay listing
  ((SELECT id FROM tourism_providers WHERE email = 'aulihimalayanstay@example.com' LIMIT 1),
   'Auli Snow Stay with Basic Ski Lessons – 3D/2N', 'stay',
   (SELECT id FROM districts WHERE LOWER(name) = 'chamoli' LIMIT 1),
   'Stay in Auli with one day of basic ski training and cable car guidance.',
   'Experience the magic of Auli with comfortable wooden room accommodation and panoramic Nanda Devi views. Package includes one day of basic skiing instruction with local trainers and guidance on using the famous Auli cable car.',
   8500, 'per person (3D/2N)', false, true, true),
  
  -- Joshimath Taxi listings
  ((SELECT id FROM tourism_providers WHERE email = 'joshimathtaxis@example.com' LIMIT 1),
   'Joshimath to Badrinath / Mana Taxi', 'taxi_service',
   (SELECT id FROM districts WHERE LOWER(name) = 'chamoli' LIMIT 1),
   'Point-to-point taxi for Badrinath and Mana village with experienced mountain driver.',
   NULL, 2800, 'per trip (up to 4 people)', false, true, true),
  
  ((SELECT id FROM tourism_providers WHERE email = 'joshimathtaxis@example.com' LIMIT 1),
   'Joshimath to Valley of Flowers / Govindghat Taxi', 'taxi_service',
   (SELECT id FROM districts WHERE LOWER(name) = 'chamoli' LIMIT 1),
   'Safe and reliable taxi service from Joshimath to Govindghat, the starting point for Valley of Flowers and Hemkund Sahib.',
   NULL, 2600, 'per trip', false, true, true),
  
  -- Naini Lake View Guesthouse listings
  ((SELECT id FROM tourism_providers WHERE email = 'nainilakeview@example.com' LIMIT 1),
   'Lake View Room – Nainital (Tallital)', 'stay',
   (SELECT id FROM districts WHERE LOWER(name) = 'nainital' LIMIT 1),
   'Clean double room with partial lake view balcony and homely meals.',
   'Comfortable budget accommodation just 5 minutes walk from Naini Lake. Rooms feature attached bathrooms, partial lake views from the balcony, and optional home-cooked meals. Perfect base for exploring Nainital.',
   2200, 'per night (room only)', false, true, true),
  
  ((SELECT id FROM tourism_providers WHERE email = 'nainilakeview@example.com' LIMIT 1),
   'Nainital Evening Food & Market Walk', 'local_experience',
   (SELECT id FROM districts WHERE LOWER(name) = 'nainital' LIMIT 1),
   'Guided walk through local markets, street snacks, and iconic viewpoints.',
   NULL, 900, 'per person', false, true, true),
  
  -- Mussoorie Heritage Walks listing
  ((SELECT id FROM tourism_providers WHERE email = 'mussooriewalks@example.com' LIMIT 1),
   'Mussoorie Heritage & Stories Walk', 'local_experience',
   (SELECT id FROM districts WHERE LOWER(name) = 'dehradun' LIMIT 1),
   '2.5 hour guided walk through old Mussoorie lanes, churches, and viewpoints.',
   'Discover the hidden stories of Mussoorie with our local storyteller guides. This 2.5-hour walk covers historic churches, colonial-era buildings, secret lanes, and stunning viewpoints that most tourists miss.',
   750, 'per person', false, true, true),
  
  -- Munsiyari Panchachuli Homestay listing
  ((SELECT id FROM tourism_providers WHERE email = 'panchachulihomestay@example.com' LIMIT 1),
   'Panchachuli View Homestay – 3D/2N Package', 'stay',
   (SELECT id FROM districts WHERE LOWER(name) = 'pithoragarh' LIMIT 1),
   'Quiet homestay with direct Panchachuli views, village walk, and local meals.',
   'Wake up to the majestic Panchachuli peaks from your room window. This 3-day package includes comfortable accommodation, all home-cooked organic meals, a guided village walk, and help arranging short hikes to nearby waterfalls and meadows.',
   5400, 'per person (3D/2N with meals)', false, true, true),
  
  -- Guptkashi Kedarnath Shuttle listing
  ((SELECT id FROM tourism_providers WHERE email = 'guptkashistay@example.com' LIMIT 1),
   'Guptkashi Stay + Kedarnath Shuttle Support', 'stay',
   (SELECT id FROM districts WHERE LOWER(name) = 'rudraprayag' LIMIT 1),
   'Budget rooms in Guptkashi plus shuttle coordination till Sonprayag for Kedarnath.',
   'Simple, clean rooms for pilgrims visiting Kedarnath. We provide early morning tea, packed breakfast, and help coordinate your shuttle to Sonprayag. Perfect stopover before or after the Kedarnath yatra.',
   1900, 'per night (per room)', false, true, true);
