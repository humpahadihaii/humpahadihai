import { useMemo } from 'react';

// Uttarakhand seasonal definitions
type Season = 'spring' | 'summer' | 'monsoon' | 'winter';

interface SeasonInfo {
  name: string;
  months: string;
  monthRange: [number, number]; // 1-12
  tone: string;
  travelSuitability: string;
  culturalRhythm: string;
  icon: string;
}

const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    name: 'Spring',
    months: 'March – April',
    monthRange: [3, 4],
    tone: 'renewal and bloom',
    travelSuitability: 'Pleasant weather with blooming rhododendrons. Ideal for treks and temple visits before the summer rush.',
    culturalRhythm: 'Spring marks the season of renewal — villages celebrate with Phool Dei, welcoming flowers and new beginnings. Agricultural rhythms shift as fields are prepared for monsoon crops.',
    icon: '🌸',
  },
  summer: {
    name: 'Summer',
    months: 'May – June',
    monthRange: [5, 6],
    tone: 'escape and activity',
    travelSuitability: 'Perfect for escaping plains heat. Higher altitudes remain cool. Peak season for Char Dham yatra and mountain treks.',
    culturalRhythm: 'Summer brings migration to higher pastures. Bugyal meadows come alive, and communities gather for seasonal fairs. Traditional food shifts to lighter, cooling preparations.',
    icon: '☀️',
  },
  monsoon: {
    name: 'Monsoon',
    months: 'July – September',
    monthRange: [7, 9],
    tone: 'greenery and introspection',
    travelSuitability: 'Lush green landscapes but travel with caution. Landslides possible. Best for experiencing rain-washed beauty and fewer crowds.',
    culturalRhythm: 'Monsoon is a time of introspection and indoor gatherings. Rainy season festivals celebrate water and fertility. Traditional weaving and handicraft work intensifies in villages.',
    icon: '🌧️',
  },
  winter: {
    name: 'Winter',
    months: 'October – February',
    monthRange: [10, 2],
    tone: 'spirituality and quiet beauty',
    travelSuitability: 'Clear skies offer spectacular mountain views. Snowfall in higher regions. Perfect for spiritual journeys and photography.',
    culturalRhythm: 'Winter is the season of devotion and community warmth. Villages celebrate harvest festivals, prepare traditional winter foods, and gather around fires sharing folk tales and songs.',
    icon: '❄️',
  },
};

// Get current season based on month
function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 4) return 'spring';
  if (month >= 5 && month <= 6) return 'summer';
  if (month >= 7 && month <= 9) return 'monsoon';
  // Winter: Oct-Feb (10, 11, 12, 1, 2)
  return 'winter';
}

interface SeasonalDistrictContent {
  title: string;
  description: string;
}

// Generate district-specific seasonal content
function getDistrictSeasonalContent(districtName: string, season: Season): SeasonalDistrictContent {
  const info = SEASONS[season];
  
  const descriptions: Record<Season, string> = {
    spring: `Spring in ${districtName} brings pleasant weather and blooming flowers. The hills awaken with rhododendrons, making it ideal for exploring trails and temples.`,
    summer: `${districtName} offers cool respite from the summer heat of the plains. Clear skies and accessible trails make this the peak season for visitors and pilgrims.`,
    monsoon: `The monsoon transforms ${districtName} into lush green landscapes. Travel mindfully during this season — the rains bring dramatic beauty but also require careful planning.`,
    winter: `Winter in ${districtName} reveals snow-capped vistas and peaceful solitude. This is a season for contemplation, warm pahadi food, and experiencing the quiet rhythm of mountain life.`,
  };
  
  return {
    title: `Best Time to Experience ${districtName}`,
    description: descriptions[season],
  };
}

// Get seasonal travel note
function getSeasonalTravelNote(season: Season): string {
  const notes: Record<Season, string> = {
    spring: 'Spring travel in Uttarakhand offers mild weather and flowering landscapes. Plan your journey as the mountains emerge from winter into gentle warmth.',
    summer: 'Summer is the traditional travel season here — pilgrims walk ancient paths while the mountains remain cool. Book ahead and carry layers for evening chills.',
    monsoon: 'Travelling during monsoon requires flexibility and patience. Roads may be affected, but the rewarded views of mist-wrapped valleys and rain-washed temples are unforgettable.',
    winter: 'Winter travel brings crisp mornings and starlit nights. Some high-altitude routes may close, but the clarity of mountain views and warmth of local hospitality make it worthwhile.',
  };
  return notes[season];
}

// Get homepage seasonal line
function getHomepageSeasonalLine(season: Season): string {
  const lines: Record<Season, string> = {
    spring: 'The hills are in bloom — a season of renewal across Uttarakhand.',
    summer: 'Summer brings pilgrims and travellers seeking mountain coolness.',
    monsoon: 'Monsoon mists cloak the valleys in quiet, green beauty.',
    winter: 'Winter settles over the mountains with snow, stillness, and starlit nights.',
  };
  return lines[season];
}

export function useSeasonalContent() {
  const season = useMemo(() => getCurrentSeason(), []);
  const seasonInfo = useMemo(() => SEASONS[season], [season]);
  
  return {
    season,
    seasonInfo,
    currentSeasonName: seasonInfo.name,
    currentSeasonMonths: seasonInfo.months,
    travelSuitability: seasonInfo.travelSuitability,
    culturalRhythm: seasonInfo.culturalRhythm,
    seasonIcon: seasonInfo.icon,
    
    // Helper functions
    getDistrictContent: (districtName: string) => getDistrictSeasonalContent(districtName, season),
    getTravelNote: () => getSeasonalTravelNote(season),
    getHomepageLine: () => getHomepageSeasonalLine(season),
    
    // All seasons for reference
    allSeasons: SEASONS,
  };
}

export type { Season, SeasonInfo };
