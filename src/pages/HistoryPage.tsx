import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { 
  Mountain, 
  Crown, 
  Building, 
  Flag, 
  Heart,
  ChevronRight,
  BookOpen,
  MapPin,
  Calendar,
  Languages,
  Scroll,
  Swords,
  TreePine,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Language = "en" | "hi";

interface SubSection {
  title: { en: string; hi: string };
  content: { en: string; hi: string };
}

interface HistoryEra {
  id: string;
  title: { en: string; hi: string };
  period: { en: string; hi: string };
  icon: React.ReactNode;
  description: { en: string; hi: string };
  subsections: SubSection[];
  highlights: { en: string[]; hi: string[] };
  relatedLinks?: { label: string; path: string }[];
  accentColor: string;
}

const historyEras: HistoryEra[] = [
  {
    id: "ancient",
    title: { 
      en: "Ancient Uttarakhand", 
      hi: "प्राचीन उत्तराखंड" 
    },
    period: { 
      en: "Vedic Era – 7th Century CE", 
      hi: "वैदिक युग – 7वीं शताब्दी ई." 
    },
    icon: <BookOpen className="h-6 w-6" />,
    description: { 
      en: "The history of Uttarakhand is deeply embedded in the spiritual and geological consciousness of the Indian subcontinent. Long before political boundaries, it existed as a sacred geography—where the concept of Svarga Loka (abode of heavens) intersected with the central Himalayas. The earliest references are found in the Rig Veda, where the Sapta Sindhu region formed the cradle of Indo-Aryan civilization.",
      hi: "उत्तराखंड का इतिहास भारतीय उपमहाद्वीप की आध्यात्मिक और भौगोलिक चेतना में गहराई से समाहित है। राजनीतिक सीमाओं से बहुत पहले, यह एक पवित्र भूगोल के रूप में विद्यमान था—जहां स्वर्ग लोक की अवधारणा मध्य हिमालय से मिलती थी। सबसे पुराने संदर्भ ऋग्वेद में मिलते हैं, जहां सप्त सिंधु क्षेत्र इंडो-आर्यन सभ्यता का पालना था।"
    },
    subsections: [
      {
        title: { en: "Prehistoric Habitation & Rock Art", hi: "प्रागैतिहासिक बसावट और शैल चित्र" },
        content: { 
          en: "The rock shelters of Lakhudyar (meaning 'one lakh caves'), located on the banks of the Suyal River in Almora district, serve as a critical archive of prehistoric activity. Paintings dating back to the Mesolithic and Chalcolithic periods depict human figures, animals, and geometric patterns in ochre, black, and white. The earliest inhabitants were the Kols (or Mundas), proto-Australoid groups who first cleared forests and tilled the Himalayan slopes, later followed by the Kiratas—ancestors of modern Bhotiya, Raji, and Tharu communities.",
          hi: "अल्मोड़ा जिले में सुयाल नदी के किनारे स्थित लखुड्यार (जिसका अर्थ है 'एक लाख गुफाएं') की शैल आश्रय प्रागैतिहासिक गतिविधियों का महत्वपूर्ण संग्रह है। मध्यपाषाण और ताम्रपाषाण काल के चित्र मानव आकृतियों, जानवरों और ज्यामितीय पैटर्न को गेरू, काले और सफेद रंग में दर्शाते हैं। सबसे पहले निवासी कोल (या मुंडा) थे, जो प्रोटो-ऑस्ट्रेलॉयड समूह थे जिन्होंने पहले जंगलों को साफ किया और हिमालयी ढलानों पर खेती की।"
        }
      },
      {
        title: { en: "Kedarkhand & Manaskhand", hi: "केदारखंड और मानसखंड" },
        content: { 
          en: "In the Puranic tradition, the Skanda Purana bifurcates the central Himalayas into two sacred zones: Kedarkhand (modern Garhwal), dominated by Shiva's cult and named after Kedarnath shrine; and Manaskhand (modern Kumaon), linked to Lake Manasarovar pilgrimage route. The Mahabharata references the Pandavas traversing this land during their Mahaprasthan (final journey to heaven). Sage Vyasa composed the epic in caves near Badrinath, cementing the region as Devbhoomi—the Land of Gods.",
          hi: "पौराणिक परंपरा में, स्कंद पुराण मध्य हिमालय को दो पवित्र क्षेत्रों में विभाजित करता है: केदारखंड (आधुनिक गढ़वाल), जो शिव के पंथ से प्रभुत्व रखता है और केदारनाथ मंदिर के नाम पर है; और मानसखंड (आधुनिक कुमाऊं), जो मानसरोवर झील की तीर्थयात्रा मार्ग से जुड़ा है। महाभारत में पांडवों के महाप्रस्थान (स्वर्ग की अंतिम यात्रा) के दौरान इस भूमि को पार करने का उल्लेख है।"
        }
      },
      {
        title: { en: "The Khasas & Kuninda Dynasty", hi: "खस और कुनिंद वंश" },
        content: { 
          en: "The Khasas, an Indo-Aryan warrior tribe from Central Asia, established dominance that defined the sociological character of the hills. The Kuninda Dynasty (2nd century BCE – 3rd century CE) was the first to unite Garhwal and Kumaon. King Amoghbhuti's coins feature Buddhist stupas alongside Hindu symbols, suggesting a syncretic society. The Ashokan Rock Edict at Kalsi (near Dehradun), discovered in 1860, proves the region was within Mauryan influence as early as 3rd century BCE.",
          hi: "खस, मध्य एशिया से एक इंडो-आर्यन योद्धा जनजाति, ने प्रभुत्व स्थापित किया जिसने पहाड़ियों के समाजशास्त्रीय चरित्र को परिभाषित किया। कुनिंद राजवंश (दूसरी शताब्दी ई.पू. – तीसरी शताब्दी ई.) पहला था जिसने गढ़वाल और कुमाऊं को एकीकृत किया। राजा अमोघभूति के सिक्कों पर बौद्ध स्तूप हिंदू प्रतीकों के साथ हैं। कालसी (देहरादून के पास) में अशोक शिलालेख साबित करता है कि यह क्षेत्र तीसरी शताब्दी ई.पू. में मौर्य प्रभाव में था।"
        }
      }
    ],
    highlights: { 
      en: [
        "Lakhudyar rock paintings – Mesolithic & Chalcolithic art",
        "Kedarkhand (Garhwal) & Manaskhand (Kumaon) in Skanda Purana",
        "Kuninda Dynasty – first unified hill kingdom",
        "Ashokan Rock Edict at Kalsi (3rd century BCE)"
      ],
      hi: [
        "लखुड्यार शैल चित्र – मध्यपाषाण और ताम्रपाषाण कला",
        "स्कंद पुराण में केदारखंड (गढ़वाल) और मानसखंड (कुमाऊं)",
        "कुनिंद राजवंश – पहला एकीकृत पहाड़ी राज्य",
        "कालसी में अशोक शिलालेख (तीसरी शताब्दी ई.पू.)"
      ]
    },
    relatedLinks: [
      { label: "Explore Char Dham", path: "/culture" },
      { label: "Sacred Temples", path: "/cultural/temples-shrines" }
    ],
    accentColor: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: "medieval",
    title: { 
      en: "Medieval Period", 
      hi: "मध्यकालीन युग" 
    },
    period: { 
      en: "7th Century – 18th Century CE", 
      hi: "7वीं शताब्दी – 18वीं शताब्दी ई." 
    },
    icon: <Crown className="h-6 w-6" />,
    description: { 
      en: "The medieval period in Uttarakhand is characterized by the consolidation of power into localized empires that constructed the architectural and administrative foundations of the region. Three great dynasties shaped this era: the Katyuris, the Chands, and the Panwars (Parmars).",
      hi: "उत्तराखंड में मध्यकालीन काल स्थानीय साम्राज्यों में शक्ति के समेकन द्वारा चिह्नित है जिन्होंने क्षेत्र की स्थापत्य और प्रशासनिक नींव का निर्माण किया। तीन महान राजवंशों ने इस युग को आकार दिया: कत्यूरी, चंद और पंवार (परमार)।"
    },
    subsections: [
      {
        title: { en: "Katyuri Dynasty (700-1200 CE)", hi: "कत्यूरी राजवंश (700-1200 ई.)" },
        content: { 
          en: "Often called the 'Golden Era' of Uttarakhand, the Katyuri Dynasty ruled from Joshimath and later Kartikeyapura (modern Baijnath). Founded by Vasu Dev, they unified Kumaon and Garhwal. At their peak, the empire extended from Nepal to Kabul. They built the majestic Jageshwar temple complex (one of 12 Jyotirlingas with 100+ temples) and the Katarmal Sun Temple (9th century)—second only to Konark in significance. The dynasty declined due to tyrannical rule of later kings like Vir Dev, leading to fragmentation into small principalities.",
          hi: "अक्सर उत्तराखंड का 'स्वर्ण युग' कहा जाता है, कत्यूरी राजवंश ने जोशीमठ और बाद में कार्तिकेयपुर (आधुनिक बैजनाथ) से शासन किया। वासुदेव द्वारा स्थापित, उन्होंने कुमाऊं और गढ़वाल को एकीकृत किया। अपने चरम पर, साम्राज्य नेपाल से काबुल तक फैला था। उन्होंने भव्य जागेश्वर मंदिर परिसर (12 ज्योतिर्लिंगों में से एक, 100+ मंदिर) और कटारमल सूर्य मंदिर (9वीं सदी) बनाया।"
        }
      },
      {
        title: { en: "Chand Dynasty of Kumaon", hi: "कुमाऊं का चंद राजवंश" },
        content: { 
          en: "Founded by Som Chand (from Kanauj) around the 10th century in Champawat, the Chands systematically subjugated local Khasa chieftains. In 1568, King Kalyan Chand moved the capital to Almora—a strategic ridge offering better defense. The Chands transformed Almora into a cultural hub, patronizing the famous 'Pahari School' of painting. The dynasty reached its apex under Baz Bahadur Chand (1638-1678), who visited the Mughal court and led campaigns into Tibet for the salt trade.",
          hi: "10वीं शताब्दी के आसपास चंपावत में सोम चंद (कन्नौज से) द्वारा स्थापित, चंदों ने व्यवस्थित रूप से स्थानीय खस सरदारों को अधीन किया। 1568 में, राजा कल्याण चंद ने राजधानी अल्मोड़ा स्थानांतरित की। चंदों ने अल्मोड़ा को सांस्कृतिक केंद्र में बदल दिया, प्रसिद्ध 'पहाड़ी स्कूल' चित्रकला को संरक्षण दिया। बाज बहादुर चंद (1638-1678) के तहत राजवंश अपने शिखर पर पहुंचा।"
        }
      },
      {
        title: { en: "Garhwal Kingdom & Panwar Dynasty", hi: "गढ़वाल राज्य और पंवार राजवंश" },
        content: { 
          en: "While the Chands consolidated Kumaon, Garhwal remained divided into 52 independent chieftaincies (Garhs—hence 'Garhwal' meaning Land of Forts). Kanak Pal founded the Panwar dynasty in the 9th century, but it was Ajay Pal (14th/15th century) who unified all 52 Garhs. He moved the capital from Chandpur Garhi to Devalgarh and finally to Srinagar (on the Alaknanda). The Garhwal kings maintained fierce independence—King Prithvi Pat Shah famously granted asylum to Suleiman Shikoh, defying Emperor Aurangzeb.",
          hi: "जबकि चंदों ने कुमाऊं को समेकित किया, गढ़वाल 52 स्वतंत्र सरदारी (गढ़—इसलिए 'गढ़वाल' जिसका अर्थ है किलों की भूमि) में विभाजित रहा। कनक पाल ने 9वीं शताब्दी में पंवार राजवंश की स्थापना की, लेकिन अजय पाल (14वीं/15वीं सदी) ने सभी 52 गढ़ों को एकीकृत किया। उन्होंने राजधानी चांदपुर गढ़ी से देवलगढ़ और अंत में श्रीनगर (अलकनंदा पर) स्थानांतरित की।"
        }
      },
      {
        title: { en: "The Gorkha Invasion (Gorkhyani)", hi: "गोरखा आक्रमण (गोरख्यानी)" },
        content: { 
          en: "In 1790, the expansionist Gorkha Kingdom of Nepal invaded Kumaon and annexed it, then turned to Garhwal. In 1804, Garhwal King Pradyumna Shah died fighting the Gorkhas at the Battle of Khurbura near Dehradun. This began the era of Gorkhyani—remembered for brutality, excessive taxation, and suppression of local freedoms. For over a decade, the hills groaned under military occupation that dismantled traditional structures.",
          hi: "1790 में, विस्तारवादी नेपाल के गोरखा साम्राज्य ने कुमाऊं पर आक्रमण किया और इसे मिला लिया, फिर गढ़वाल की ओर मुड़े। 1804 में, गढ़वाल के राजा प्रद्युम्न शाह देहरादून के पास खुरबुरा की लड़ाई में गोरखाओं से लड़ते हुए शहीद हुए। इसने गोरख्यानी युग की शुरुआत की—जिसे क्रूरता, अत्यधिक कराधान और स्थानीय स्वतंत्रता के दमन के लिए याद किया जाता है।"
        }
      }
    ],
    highlights: { 
      en: [
        "Katyuri Dynasty – Temple builders (Jageshwar, Katarmal)",
        "Chand Dynasty – Patrons of Pahari painting (Almora)",
        "Ajay Pal – Unified 52 Garhs of Garhwal",
        "Gorkha invasion (1790) – End of local dynasties"
      ],
      hi: [
        "कत्यूरी राजवंश – मंदिर निर्माता (जागेश्वर, कटारमल)",
        "चंद राजवंश – पहाड़ी चित्रकला के संरक्षक (अल्मोड़ा)",
        "अजय पाल – गढ़वाल के 52 गढ़ों का एकीकरण",
        "गोरखा आक्रमण (1790) – स्थानीय राजवंशों का अंत"
      ]
    },
    relatedLinks: [
      { label: "Kumaon Region", path: "/districts" },
      { label: "Garhwal Heritage", path: "/districts" }
    ],
    accentColor: "from-purple-500/20 to-indigo-500/20"
  },
  {
    id: "colonial",
    title: { 
      en: "Colonial Era", 
      hi: "औपनिवेशिक काल" 
    },
    period: { 
      en: "1815 – 1947", 
      hi: "1815 – 1947" 
    },
    icon: <Building className="h-6 w-6" />,
    description: { 
      en: "The arrival of the British fundamentally altered Uttarakhand's trajectory. Initially welcomed as liberators from Gorkha rule, the British established a colonial administration that integrated the hills into the global imperial economy while alienating locals from their natural resources.",
      hi: "अंग्रेजों के आगमन ने उत्तराखंड की दिशा को मौलिक रूप से बदल दिया। शुरू में गोरखा शासन से मुक्तिदाता के रूप में स्वागत किया गया, अंग्रेजों ने एक औपनिवेशिक प्रशासन स्थापित किया जिसने पहाड़ियों को वैश्विक साम्राज्यिक अर्थव्यवस्था में एकीकृत किया।"
    },
    subsections: [
      {
        title: { en: "Treaty of Sugauli (1816)", hi: "सुगौली की संधि (1816)" },
        content: { 
          en: "The Anglo-Nepalese War (1814-1816) concluded with the Treaty of Sugauli, which redrew the map: Gorkhas ceded Kumaon and Garhwal to the British. The British retained direct control over Kumaon and eastern Garhwal (Pauri), forming British Garhwal. Western Garhwal (Tehri) was restored to Sudarshan Shah (son of fallen Pradyumna Shah), creating the Princely State of Tehri Garhwal that remained semi-independent until 1949.",
          hi: "एंग्लो-नेपाली युद्ध (1814-1816) सुगौली की संधि के साथ समाप्त हुआ, जिसने नक्शे को फिर से बनाया: गोरखाओं ने कुमाऊं और गढ़वाल अंग्रेजों को सौंप दिए। पश्चिमी गढ़वाल (टिहरी) प्रद्युम्न शाह के पुत्र सुदर्शन शाह को बहाल किया गया, जिससे टिहरी गढ़वाल रियासत बनी जो 1949 तक अर्ध-स्वतंत्र रही।"
        }
      },
      {
        title: { en: "British Administration & Infrastructure", hi: "ब्रिटिश प्रशासन और बुनियादी ढांचा" },
        content: { 
          en: "British rule designated the region as a 'Non-Regulation' province with immense Commissioner power. Sir Henry Ramsay (1856-1884), known as the 'King of Kumaon,' introduced potato cultivation and built canals. Railways reached Haridwar (1886) and Dehradun (1900), transforming Dehradun into a timber depot. Hill stations like Mussoorie, Nainital, and Ranikhet were developed as summer retreats with European architecture and convent education.",
          hi: "ब्रिटिश शासन ने क्षेत्र को 'गैर-विनियमन' प्रांत के रूप में नामित किया। सर हेनरी रामसे (1856-1884), जिन्हें 'कुमाऊं का राजा' कहा जाता था, ने आलू की खेती शुरू की और नहरें बनाईं। रेलवे हरिद्वार (1886) और देहरादून (1900) पहुंची। मसूरी, नैनीताल और रानीखेत जैसे हिल स्टेशन ग्रीष्मकालीन विश्राम स्थलों के रूप में विकसित किए गए।"
        }
      },
      {
        title: { en: "Forest Rights & Resistance", hi: "वन अधिकार और प्रतिरोध" },
        content: { 
          en: "British forest policy brought impoverishment. The Indian Forest Acts (1865, 1878, 1927) stripped villagers of grazing, fuel, and fodder rights, turning locals into trespassers on ancestral lands. The Coolie Begar Movement (1921) was a turning point: on January 14 at Bageshwar's Uttarayani fair, thousands led by Badri Datt Pandey threw forced labor registers into the river, ending the practice. Mahatma Gandhi called it a 'bloodless revolution.' Pandey earned the title 'Kumaon Kesari.'",
          hi: "ब्रिटिश वन नीति ने गरीबी लाई। भारतीय वन अधिनियमों (1865, 1878, 1927) ने ग्रामीणों से चराई, ईंधन और चारे के अधिकार छीन लिए। कुली बेगार आंदोलन (1921) एक महत्वपूर्ण मोड़ था: 14 जनवरी को बागेश्वर के उत्तरायणी मेले में, बद्री दत्त पांडे के नेतृत्व में हजारों लोगों ने बेगार रजिस्टरों को नदी में फेंक दिया। महात्मा गांधी ने इसे 'रक्तहीन क्रांति' कहा।"
        }
      }
    ],
    highlights: { 
      en: [
        "Treaty of Sugauli (1816) – End of Gorkha rule",
        "Sir Henry Ramsay – 'King of Kumaon' (1856-1884)",
        "Hill stations: Mussoorie, Nainital, Ranikhet",
        "Coolie Begar Movement (1921) – Bloodless revolution"
      ],
      hi: [
        "सुगौली की संधि (1816) – गोरखा शासन का अंत",
        "सर हेनरी रामसे – 'कुमाऊं के राजा' (1856-1884)",
        "हिल स्टेशन: मसूरी, नैनीताल, रानीखेत",
        "कुली बेगार आंदोलन (1921) – रक्तहीन क्रांति"
      ]
    },
    relatedLinks: [
      { label: "Mussoorie", path: "/districts" },
      { label: "Nainital", path: "/districts" }
    ],
    accentColor: "from-slate-500/20 to-gray-500/20"
  },
  {
    id: "statehood",
    title: { 
      en: "Formation of Uttarakhand", 
      hi: "उत्तराखंड का गठन" 
    },
    period: { 
      en: "1938 – 2000", 
      hi: "1938 – 2000" 
    },
    icon: <Flag className="h-6 w-6" />,
    description: { 
      en: "The creation of Uttarakhand on November 9, 2000, was not merely administrative reorganization; it was the culmination of a century-long struggle for identity, dignity, and self-governance driven by the realization that the development model of the plains failed the unique needs of the hills.",
      hi: "9 नवंबर 2000 को उत्तराखंड का निर्माण केवल प्रशासनिक पुनर्गठन नहीं था; यह पहचान, सम्मान और स्व-शासन के लिए एक शताब्दी लंबे संघर्ष की परिणति थी, जो इस एहसास से प्रेरित थी कि मैदानों का विकास मॉडल पहाड़ों की अनूठी जरूरतों को पूरा करने में विफल रहा।"
    },
    subsections: [
      {
        title: { en: "Roots of the Demand (1938-1990)", hi: "मांग की जड़ें (1938-1990)" },
        content: { 
          en: "The articulation of a separate hill identity began in 1938 at a special session of the Indian National Congress in Srinagar (Garhwal). Pandit Jawaharlal Nehru acknowledged the region's unique culture, and Sridev Suman advocated for Himalayan needs. After independence, the hills suffered from 'internal colonization'—resources extracted for plains while hill districts remained underdeveloped, leading to mass migration ('money-order economy'). The Uttarakhand Kranti Dal (UKD) formed in 1979 in Mussoorie, led by Indramani Badoni ('Gandhi of Uttarakhand').",
          hi: "एक अलग पहाड़ी पहचान की अभिव्यक्ति 1938 में श्रीनगर (गढ़वाल) में भारतीय राष्ट्रीय कांग्रेस के विशेष सत्र में शुरू हुई। पंडित जवाहरलाल नेहरू ने क्षेत्र की अनूठी संस्कृति को स्वीकार किया। स्वतंत्रता के बाद, पहाड़ियों को 'आंतरिक उपनिवेशवाद' का सामना करना पड़ा। उत्तराखंड क्रांति दल (यूकेडी) 1979 में मसूरी में गठित हुआ, इंद्रमणि बडोनी ('उत्तराखंड के गांधी') के नेतृत्व में।"
        }
      },
      {
        title: { en: "The 1994 Tragedy", hi: "1994 की त्रासदी" },
        content: { 
          en: "The movement remained largely peaceful until 1994, when UP government's implementation of 27% OBC reservation sparked outrage in hills (OBC population under 2%). The slogan 'Koda-Jhangora Khayenge, Uttarakhand Banayenge' echoed across valleys. Tragic events followed: Khatima Firing (September 1) killed 7 protestors; Mussoorie Firing (September 2) killed 6 including women Hansa Dhanai and Belmati Chauhan; Rampur Tiraha Incident (October 2) was the darkest night—police killed 6 activists and committed violence against women protestors, shocking the nation.",
          hi: "आंदोलन 1994 तक काफी हद तक शांतिपूर्ण रहा, जब यूपी सरकार के 27% ओबीसी आरक्षण के कार्यान्वयन ने पहाड़ियों में आक्रोश पैदा किया। नारा 'कोड़ा-झंगोरा खाएंगे, उत्तराखंड बनाएंगे' घाटियों में गूंजा। दुखद घटनाएं हुईं: खटीमा गोलीकांड (1 सितंबर) में 7 प्रदर्शनकारी मारे गए; मसूरी गोलीकांड (2 सितंबर) में हंसा धनाई और बेलमती चौहान सहित 6 मारे गए; रामपुर तिराहा कांड (2 अक्टूबर) सबसे काली रात थी।"
        }
      },
      {
        title: { en: "Birth of the State (2000)", hi: "राज्य का जन्म (2000)" },
        content: { 
          en: "The sustained agitation forced action. The Uttar Pradesh Reorganization Bill was passed, and on November 9, 2000, India's 27th state was formed. Initially named 'Uttaranchal' (viewed as diluting regional history), it was officially renamed 'Uttarakhand' in January 2007—a symbolic victory reclaiming the ancient Puranic identity. The state capital was established at Dehradun, with Gairsain as summer capital.",
          hi: "निरंतर आंदोलन ने कार्रवाई के लिए मजबूर किया। उत्तर प्रदेश पुनर्गठन विधेयक पारित हुआ, और 9 नवंबर 2000 को भारत का 27वां राज्य बना। शुरू में 'उत्तरांचल' नाम दिया गया (जिसे क्षेत्रीय इतिहास को कमजोर करने के रूप में देखा गया), जनवरी 2007 में इसे आधिकारिक रूप से 'उत्तराखंड' नाम दिया गया—प्राचीन पौराणिक पहचान को पुनः प्राप्त करने वाली प्रतीकात्मक जीत।"
        }
      }
    ],
    highlights: { 
      en: [
        "Uttarakhand Kranti Dal formed (1979, Mussoorie)",
        "Khatima, Mussoorie, Rampur Tiraha tragedies (1994)",
        "State formation – November 9, 2000",
        "Renamed from Uttaranchal to Uttarakhand (2007)"
      ],
      hi: [
        "उत्तराखंड क्रांति दल गठित (1979, मसूरी)",
        "खटीमा, मसूरी, रामपुर तिराहा त्रासदी (1994)",
        "राज्य गठन – 9 नवंबर 2000",
        "उत्तरांचल से उत्तराखंड नाम बदला (2007)"
      ]
    },
    relatedLinks: [
      { label: "Explore Districts", path: "/districts" }
    ],
    accentColor: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: "legacy",
    title: { 
      en: "Cultural Legacy", 
      hi: "सांस्कृतिक विरासत" 
    },
    period: { 
      en: "Living Heritage", 
      hi: "जीवंत विरासत" 
    },
    icon: <Heart className="h-6 w-6" />,
    description: { 
      en: "The history of Uttarakhand is not confined to textbooks; it lives in languages, festivals, and spiritual practices. The geographical isolation of deep valleys has preserved ancient traditions that have vanished elsewhere in the subcontinent.",
      hi: "उत्तराखंड का इतिहास पाठ्यपुस्तकों तक सीमित नहीं है; यह भाषाओं, त्योहारों और आध्यात्मिक प्रथाओं में जीवित है। गहरी घाटियों के भौगोलिक अलगाव ने प्राचीन परंपराओं को संरक्षित किया है जो उपमहाद्वीप में कहीं और गायब हो गई हैं।"
    },
    subsections: [
      {
        title: { en: "Languages of the Hills", hi: "पहाड़ों की भाषाएं" },
        content: { 
          en: "The linguistic landscape is dominated by Garhwali (western division) and Kumaoni (eastern division), both Central Pahari languages evolved from Khasa-Prakrit and Sanskrit. Kumaoni has dialects like Khasparjia, Johari, and Danpuriya with rich oral traditions. Jaunsari, spoken in Jaunsar-Bawar (Dehradun), retains ties to Western Pahari and Mahasu deity worship. While these languages carry the region's folklore (Jagars), they face challenges from Hindi dominance in education.",
          hi: "भाषाई परिदृश्य पर गढ़वाली (पश्चिमी) और कुमाऊनी (पूर्वी) का प्रभुत्व है, दोनों मध्य पहाड़ी भाषाएं खस-प्राकृत और संस्कृत से विकसित हुई हैं। कुमाऊनी में खसपरजिया, जोहारी और दानपुरिया जैसी बोलियां हैं। जौनसारी, जौनसार-बावर (देहरादून) में बोली जाती है। ये भाषाएं क्षेत्र की लोककथाओं (जागर) की वाहक हैं।"
        }
      },
      {
        title: { en: "Living Heritage: Festivals & Arts", hi: "जीवंत विरासत: त्योहार और कलाएं" },
        content: { 
          en: "Ramman (UNESCO Intangible Heritage since 2009) is ritual theater in Saloor-Dungra villages of Chamoli, with masked dances enacting Ramayana episodes. Chholiya Dance, a thousand-year-old Kumaoni martial sword dance from Khasa and Chand eras, accompanies weddings with warriors in traditional attire. The Nanda Devi Raj Jaat, the 'Himalayan Mahakumbh,' occurs every 12 years—a 280km barefoot pilgrimage celebrating Goddess Nanda Devi's journey to Lord Shiva, unifying Garhwal and Kumaon.",
          hi: "रम्माण (2009 से यूनेस्को अमूर्त विरासत) चमोली के सलूर-डुंगरा गांवों में अनुष्ठानिक नाटक है, जिसमें रामायण प्रसंगों का मुखौटा नृत्य होता है। छोलिया नृत्य, खस और चंद युग से हजार साल पुराना कुमाऊनी तलवार नृत्य है। नंदा देवी राज जात, 'हिमालयी महाकुंभ,' हर 12 साल में होता है—280 किमी की नंगे पैर तीर्थयात्रा।"
        }
      },
      {
        title: { en: "Temple Architecture & Char Dham", hi: "मंदिर स्थापत्य और चार धाम" },
        content: { 
          en: "History is etched in stone—from classical Nagara style of Katyuris to indigenous Koti Banal style (wood and stone), earthquake-resistant and adapted to Himalayan conditions. The Char Dham (Yamunotri, Gangotri, Kedarnath, Badrinath) are not merely religious sites; they are historical economic hubs sustaining a 'yatra economy' for millennia, linking remote villages to the wealth and devotion of the Indian plains.",
          hi: "इतिहास पत्थर में उकेरा गया है—कत्यूरी की शास्त्रीय नागर शैली से लेकर देशी कोटी बनाल शैली (लकड़ी और पत्थर), भूकंप-रोधी और हिमालयी परिस्थितियों के अनुकूल। चार धाम (यमुनोत्री, गंगोत्री, केदारनाथ, बद्रीनाथ) केवल धार्मिक स्थल नहीं हैं; वे सहस्राब्दियों से 'यात्रा अर्थव्यवस्था' को बनाए रखने वाले ऐतिहासिक आर्थिक केंद्र हैं।"
        }
      }
    ],
    highlights: { 
      en: [
        "Languages: Garhwali, Kumaoni, Jaunsari",
        "Ramman – UNESCO Intangible Heritage (2009)",
        "Chholiya Dance – 1000-year martial tradition",
        "Nanda Devi Raj Jaat – 12-year pilgrimage"
      ],
      hi: [
        "भाषाएं: गढ़वाली, कुमाऊनी, जौनसारी",
        "रम्माण – यूनेस्को अमूर्त विरासत (2009)",
        "छोलिया नृत्य – 1000 वर्षीय युद्ध परंपरा",
        "नंदा देवी राज जात – 12 वर्षीय तीर्थयात्रा"
      ]
    },
    relatedLinks: [
      { label: "Culture & Traditions", path: "/culture" },
      { label: "Pahadi Food", path: "/food" },
      { label: "Folk Traditions", path: "/cultural/folk-traditions" }
    ],
    accentColor: "from-rose-500/20 to-pink-500/20"
  }
];

const HistoryPage = () => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (text: { en: string; hi: string }) => text[language];
  const tArray = (arr: { en: string[]; hi: string[] }) => arr[language];

  return (
    <>
      <Helmet>
        <title>{language === "en" ? "History of Uttarakhand | From Ancient Roots to Devbhoomi | Hum Pahadi Haii" : "उत्तराखंड का इतिहास | प्राचीन जड़ों से देवभूमि तक | हम पहाड़ी हैं"}</title>
        <meta 
          name="description" 
          content={language === "en" 
            ? "Explore the rich history of Uttarakhand from Vedic times to modern statehood. Discover the journey of Devbhoomi through ancient kingdoms, colonial era, and the statehood movement."
            : "वैदिक काल से आधुनिक राज्य तक उत्तराखंड के समृद्ध इतिहास का अन्वेषण करें। प्राचीन राज्यों, औपनिवेशिक युग और राज्य आंदोलन के माध्यम से देवभूमि की यात्रा की खोज करें।"
          }
        />
        <meta name="keywords" content="Uttarakhand history, Devbhoomi, Kedarkhand, Manaskhand, Katyuri dynasty, Chand dynasty, Garhwal kingdom, Uttarakhand statehood, उत्तराखंड इतिहास, देवभूमि" />
        <link rel="canonical" href="https://humpahadihaii.in/history" />
      </Helmet>

      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb + Language Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-primary transition-colors">
                  {language === "en" ? "Home" : "होम"}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">
                  {language === "en" ? "History" : "इतिहास"}
                </span>
              </nav>

              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={language === "en" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="rounded-none px-4"
                  >
                    English
                  </Button>
                  <Button
                    variant={language === "hi" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage("hi")}
                    className="rounded-none px-4"
                  >
                    हिंदी
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Mountain className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === "en" ? "Devbhoomi Heritage" : "देवभूमि विरासत"}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                {language === "en" ? "History of Uttarakhand" : "उत्तराखंड का इतिहास"}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {language === "en" 
                  ? <>From ancient roots to the identity of Devbhoomi — <span className="text-primary font-medium">a journey through time</span></>
                  : <>प्राचीन जड़ों से देवभूमि की पहचान तक — <span className="text-primary font-medium">समय की यात्रा</span></>
                }
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-foreground/80 leading-relaxed">
                {language === "en" 
                  ? <>Nestled in the lap of the Himalayas, Uttarakhand's history is as majestic as its mountains. Known as <strong className="text-primary">Devbhoomi</strong> (Land of Gods), this sacred land has been a center of spirituality, culture, and resilience for millennia. From ancient Vedic references to the formation of a modern state, discover the remarkable journey of Uttarakhand.</>
                  : <>हिमालय की गोद में बसा उत्तराखंड का इतिहास उसके पहाड़ों जितना ही भव्य है। <strong className="text-primary">देवभूमि</strong> (देवताओं की भूमि) के रूप में जाना जाने वाला यह पवित्र भूमि सहस्राब्दियों से आध्यात्मिकता, संस्कृति और लचीलेपन का केंद्र रही है। प्राचीन वैदिक संदर्भों से आधुनिक राज्य के गठन तक, उत्तराखंड की उल्लेखनीय यात्रा की खोज करें।</>
                }
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line - hidden on mobile */}
                <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10" />
                
                <div className="space-y-8 md:space-y-12">
                  {historyEras.map((era) => (
                    <article 
                      key={era.id}
                      className="relative"
                      id={era.id}
                    >
                      {/* Timeline dot - hidden on mobile */}
                      <div className="hidden md:flex absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />
                      
                      <Card className={`md:ml-16 overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary/50`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${era.accentColor} opacity-50`} />
                        
                        <CardContent className="relative p-6 md:p-8">
                          {/* Era Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                              {era.icon}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                                  {t(era.title)}
                                </h2>
                                <Badge variant="secondary" className="font-normal">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {t(era.period)}
                                </Badge>
                              </div>
                              
                              <p className="text-foreground/80 leading-relaxed">
                                {t(era.description)}
                              </p>
                            </div>
                          </div>

                          {/* Detailed Subsections Accordion */}
                          <Accordion type="single" collapsible className="mb-6">
                            {era.subsections.map((sub, i) => (
                              <AccordionItem key={i} value={`${era.id}-${i}`} className="border-border/50">
                                <AccordionTrigger className="text-left hover:no-underline py-3">
                                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Scroll className="h-4 w-4 text-primary" />
                                    {t(sub.title)}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-foreground/80 leading-relaxed pl-6">
                                  {t(sub.content)}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                          
                          {/* Key Highlights */}
                          <div className="mb-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              {language === "en" ? "Key Highlights" : "मुख्य विशेषताएं"}
                            </h3>
                            <ul className="grid sm:grid-cols-2 gap-2">
                              {tArray(era.highlights).map((highlight, i) => (
                                <li 
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-foreground/80"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Related Links */}
                          {era.relatedLinks && era.relatedLinks.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                              {era.relatedLinks.map((link, i) => (
                                <Link
                                  key={i}
                                  to={link.path}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                {language === "en" ? "Explore Uttarakhand's Living Heritage" : "उत्तराखंड की जीवंत विरासत का अन्वेषण करें"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === "en" 
                  ? "Discover the culture, traditions, and beauty that make Uttarakhand truly special."
                  : "उस संस्कृति, परंपराओं और सुंदरता की खोज करें जो उत्तराखंड को वास्तव में विशेष बनाती है।"
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/culture"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  {language === "en" ? "Explore Culture" : "संस्कृति देखें"}
                </Link>
                <Link
                  to="/districts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {language === "en" ? "Explore Districts" : "जिले देखें"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
                {language === "en" ? "Jump to Era" : "युग पर जाएं"}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {historyEras.map((era) => (
                  <a
                    key={era.id}
                    href={`#${era.id}`}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
                  >
                    {t(era.title)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HistoryPage;
