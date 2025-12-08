-- Add region and sort_order columns to districts table
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Update districts with their regions (Kumaon vs Garhwal)
UPDATE public.districts SET region = 'Kumaon', sort_order = 1 WHERE slug = 'almora';
UPDATE public.districts SET region = 'Kumaon', sort_order = 2 WHERE slug = 'bageshwar';
UPDATE public.districts SET region = 'Garhwal', sort_order = 3 WHERE slug = 'chamoli';
UPDATE public.districts SET region = 'Kumaon', sort_order = 4 WHERE slug = 'champawat';
UPDATE public.districts SET region = 'Garhwal', sort_order = 5 WHERE slug = 'dehradun';
UPDATE public.districts SET region = 'Garhwal', sort_order = 6 WHERE slug = 'haridwar';
UPDATE public.districts SET region = 'Kumaon', sort_order = 7 WHERE slug = 'nainital';
UPDATE public.districts SET region = 'Garhwal', sort_order = 8 WHERE slug = 'pauri-garhwal';
UPDATE public.districts SET region = 'Kumaon', sort_order = 9 WHERE slug = 'pithoragarh';
UPDATE public.districts SET region = 'Garhwal', sort_order = 10 WHERE slug = 'rudraprayag';
UPDATE public.districts SET region = 'Garhwal', sort_order = 11 WHERE slug = 'tehri-garhwal';
UPDATE public.districts SET region = 'Kumaon', sort_order = 12 WHERE slug = 'udham-singh-nagar';
UPDATE public.districts SET region = 'Garhwal', sort_order = 13 WHERE slug = 'uttarkashi';

-- Add short descriptions where overview is minimal
UPDATE public.districts SET overview = 'Almora is a picturesque hill station known for its rich cultural heritage, ancient temples, and stunning views of the Himalayan peaks. It was once the seat of the Chand kings of Kumaon.' WHERE slug = 'almora' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Bageshwar, nestled at the confluence of Saryu and Gomti rivers, is famous for the ancient Bagnath Temple and serves as the gateway to some of the most beautiful treks in the Kumaon Himalayas.' WHERE slug = 'bageshwar' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Chamoli is home to the Valley of Flowers, Badrinath Temple, and Hemkund Sahib. It boasts some of the most spectacular alpine meadows and sacred pilgrimage sites in the Himalayas.' WHERE slug = 'chamoli' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Champawat, the erstwhile capital of the Chand dynasty, is known for its historical temples, including the famous Baleshwar Temple and the sacred Purnagiri Devi shrine.' WHERE slug = 'champawat' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Dehradun, the capital of Uttarakhand, is a vibrant city nestled in the Doon Valley. Known for its premier educational institutions, pleasant climate, and proximity to Mussoorie.' WHERE slug = 'dehradun' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Haridwar, one of the seven holiest places in Hinduism, is where the Ganges emerges from the mountains onto the plains. Famous for the Ganga Aarti at Har Ki Pauri and the Kumbh Mela.' WHERE slug = 'haridwar' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Nainital, the Lake District of India, is centered around the beautiful Naini Lake surrounded by mountains. A popular hill station known for its colonial heritage and natural beauty.' WHERE slug = 'nainital' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Pauri Garhwal offers panoramic views of the Himalayan ranges and is known for its apple orchards, ancient temples, and the historic town of Srinagar on the banks of Alaknanda.' WHERE slug = 'pauri-garhwal' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Pithoragarh, known as "Little Kashmir," features stunning meadows, glaciers, and ancient temples. It borders Tibet and Nepal, offering unique cultural experiences.' WHERE slug = 'pithoragarh' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Rudraprayag is named after Lord Shiva (Rudra) and marks the sacred confluence of Alaknanda and Mandakini rivers. Gateway to Kedarnath Temple and the Char Dham pilgrimage.' WHERE slug = 'rudraprayag' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Tehri Garhwal is home to Asia''s highest dam - Tehri Dam - creating a beautiful reservoir. The old Tehri town now lies submerged, while New Tehri offers adventure tourism.' WHERE slug = 'tehri-garhwal' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Udham Singh Nagar, in the Terai region, is the agricultural heartland of Uttarakhand. Named after freedom fighter Udham Singh, it includes the industrial hub of Rudrapur.' WHERE slug = 'udham-singh-nagar' AND (overview IS NULL OR overview = '');

UPDATE public.districts SET overview = 'Uttarkashi, meaning "Kashi of the North," is a major pilgrimage center with the Gangotri and Yamunotri shrines. Home to the Nehru Institute of Mountaineering.' WHERE slug = 'uttarkashi' AND (overview IS NULL OR overview = '');