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
  Users,
  Landmark,
  Music,
  Footprints,
  Quote,
  Share2,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import history images
import charDhamImg from "@/assets/history/char-dham.jpg";
import nandaDeviRajJatImg from "@/assets/history/nanda-devi-raj-jat.jpg";
import chholiyaDanceImg from "@/assets/history/chholiya-dance.jpg";
import rammanFestivalImg from "@/assets/history/ramman-festival.webp";
import jaunsarBawarImg from "@/assets/history/jaunsar-bawar.webp";
import garhwalKingdomImg from "@/assets/history/garhwal-kingdom.jpg";
import katyuriTemplesImg from "@/assets/history/katyuri-temples.jpg";
import kedarnathImg from "@/assets/history/kedarnath.jpg";
import badrinathImg from "@/assets/history/badrinath.jpg";
import lakhudyarImg from "@/assets/history/lakhudyar.jpeg";

type Language = "en" | "hi";

interface SubSection {
  title: { en: string; hi: string };
  content: { en: React.ReactNode; hi: React.ReactNode };
  image?: string;
  imageAlt?: string;
}

interface HistoryEra {
  id: string;
  title: { en: string; hi: string };
  period: { en: string; hi: string };
  icon: React.ReactNode;
  description: { en: React.ReactNode; hi: React.ReactNode };
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
      en: <>The history of Uttarakhand is a narrative deeply embedded in the spiritual and geological consciousness of the Indian subcontinent. Long before the region was delineated by political boundaries, it existed as a sacred geography—a transcendental landscape where the metaphysical concept of <strong className="text-primary">Svarga Loka</strong> (the abode of the heavens) intersected with the rugged physical reality of the central Himalayas. The earliest references to this land are found in the <strong className="text-primary">Rig Veda</strong>, where the <strong className="text-primary">Sapta Sindhu</strong> region, watered by rivers originating in these very mountains, formed the cradle of <strong className="text-primary">Indo-Aryan civilization</strong>.</>,
      hi: <>उत्तराखंड का इतिहास भारतीय उपमहाद्वीप की आध्यात्मिक और भौगोलिक चेतना में गहराई से समाहित एक कथा है। राजनीतिक सीमाओं से बहुत पहले, यह एक पवित्र भूगोल के रूप में विद्यमान था—एक पारलौकिक परिदृश्य जहां <strong className="text-primary">स्वर्ग लोक</strong> (स्वर्ग का निवास) की अवधारणा मध्य हिमालय की कठोर भौतिक वास्तविकता से मिलती थी। इस भूमि के सबसे पुराने संदर्भ <strong className="text-primary">ऋग्वेद</strong> में मिलते हैं, जहां इन्हीं पहाड़ों से निकलने वाली नदियों द्वारा सिंचित <strong className="text-primary">सप्त सिंधु</strong> क्षेत्र <strong className="text-primary">इंडो-आर्यन सभ्यता</strong> का पालना था।</>
    },
    subsections: [
      {
        title: { en: "Prehistoric Habitation & Rock Art", hi: "प्रागैतिहासिक बसावट और शैल चित्र" },
        content: { 
          en: <>Contrary to the colonial-era assumption that the high Himalayas were uninhabited terra incognita until the medieval period, archaeological evidence paints a picture of vibrant prehistoric activity. The rock shelters of <strong className="text-primary">Lakhudyar</strong> (literally "one lakh caves"), located on the banks of the <strong className="text-primary">Suyal River</strong> in the <strong className="text-primary">Almora district</strong>, serve as a critical archive of this era. Here, paintings dating back to the <strong className="text-primary">Mesolithic and Chalcolithic periods</strong> depict stick-like human figures, animals, and geometric patterns in ochre, black, and white. These motifs bear a striking resemblance to the rock art of <strong className="text-primary">Bhimbetka</strong> in Central India, suggesting a continuity of paleolithic culture that spanned the subcontinent.{"\n\n"}Further evidence is found in the <strong className="text-primary">megalithic cup-marks and burial cists</strong> discovered across the Kumaon and Garhwal hills. These sites indicate the presence of settled communities that practiced elaborate funerary rites and possessed a rudimentary understanding of astronomy and agriculture. Anthropologists identify these early inhabitants as the <strong className="text-primary">Kols (or Mundas)</strong>, a proto-Australoid group who were the first to clear the forests and till the varied terrain of the Himalayan slopes. The Kols were eventually supplanted or absorbed by the <strong className="text-primary">Kiratas</strong>, a Mongoloid people whose presence is attested in the <strong className="text-primary">Mahabharata</strong> and who are believed to be the ancestors of the modern-day <strong className="text-primary">Bhotiya, Raji, and Tharu</strong> communities.</>,
          hi: <>औपनिवेशिक-युग की इस धारणा के विपरीत कि मध्यकाल तक ऊंचे हिमालय निर्जन थे, पुरातात्विक साक्ष्य जीवंत प्रागैतिहासिक गतिविधि की तस्वीर पेश करते हैं। <strong className="text-primary">अल्मोड़ा जिले</strong> में <strong className="text-primary">सुयाल नदी</strong> के तट पर स्थित <strong className="text-primary">लखुड्यार</strong> (शाब्दिक अर्थ "एक लाख गुफाएं") की शैल आश्रय इस युग का महत्वपूर्ण संग्रह है। यहां <strong className="text-primary">मध्यपाषाण और ताम्रपाषाण काल</strong> के चित्र गेरू, काले और सफेद रंग में मानव आकृतियों, जानवरों और ज्यामितीय पैटर्न को दर्शाते हैं। ये रूपांकन मध्य भारत के <strong className="text-primary">भीमबेटका</strong> की शैल कला से आश्चर्यजनक समानता रखते हैं।{"\n\n"}कुमाऊं और गढ़वाल की पहाड़ियों में खोजे गए <strong className="text-primary">महापाषाणकालीन कप-चिह्न और दफन पत्थर</strong> बस्तियों की उपस्थिति का संकेत देते हैं। मानवविज्ञानी इन प्रारंभिक निवासियों को <strong className="text-primary">कोल (या मुंडा)</strong> के रूप में पहचानते हैं, एक प्रोटो-ऑस्ट्रेलॉयड समूह जिन्होंने सबसे पहले जंगलों को साफ किया। कोलों को अंततः <strong className="text-primary">किरातों</strong> ने विस्थापित या आत्मसात कर लिया, जो आधुनिक <strong className="text-primary">भोटिया, राजी और थारू</strong> समुदायों के पूर्वज माने जाते हैं।</>
        },
        image: lakhudyarImg,
        imageAlt: "Lakhudyar Rock Paintings"
      },
      {
        title: { en: "Kedarkhand & Manaskhand: The Scriptural Geography", hi: "केदारखंड और मानसखंड: शास्त्रीय भूगोल" },
        content: { 
          en: <>In the Puranic tradition, the region was not a single political entity but a dual sacred zone. The <strong className="text-primary">Skanda Purana</strong>, a massive compendium of Hindu mythology, bifurcates the central Himalayas into two distinct segments:{"\n\n"}• <strong className="text-primary">Kedarkhand</strong>: Corresponding to the modern <strong className="text-primary">Garhwal division</strong>, this region was dominated by the cult of Shiva. It derives its name from the <strong className="text-primary">Kedarnath shrine</strong> and is described as the land watered by the <strong className="text-primary">Alaknanda and Bhagirathi</strong>.{"\n\n"}• <strong className="text-primary">Manaskhand</strong>: Corresponding to the modern <strong className="text-primary">Kumaon division</strong>, this area was linked to the pilgrimage route toward <strong className="text-primary">Lake Manasarovar</strong> (Manas). It is also associated with the <strong className="text-primary">Kurma (tortoise) avatar</strong> of Vishnu, believed to have taken place at the <strong className="text-primary">Champawat hill</strong>, giving the region its alternative name, <strong className="text-primary">Kurmanchal</strong>.{"\n\n"}This era also solidified Uttarakhand&apos;s reputation as <strong className="text-primary">Devbhoomi</strong> (Land of Gods). The <strong className="text-primary">Mahabharata</strong> contains explicit references to the <strong className="text-primary">Pandavas</strong> traversing this land during their <strong className="text-primary">Mahaprasthan</strong> (final journey to heaven). The sage <strong className="text-primary">Vyasa</strong> is believed to have composed the epic in the caves of <strong className="text-primary">Mana village</strong> near Badrinath, cementing the region&apos;s status as the intellectual and spiritual fountainhead of <strong className="text-primary">Sanatan Dharma</strong>.</>,
          hi: <>पौराणिक परंपरा में, यह क्षेत्र एक राजनीतिक इकाई नहीं बल्कि एक दोहरा पवित्र क्षेत्र था। <strong className="text-primary">स्कंद पुराण</strong>, हिंदू पौराणिक कथाओं का विशाल संग्रह, मध्य हिमालय को दो अलग-अलग खंडों में विभाजित करता है:{"\n\n"}• <strong className="text-primary">केदारखंड</strong>: आधुनिक <strong className="text-primary">गढ़वाल मंडल</strong> के अनुरूप, यह क्षेत्र शिव के पंथ से प्रभुत्व रखता था। इसका नाम <strong className="text-primary">केदारनाथ मंदिर</strong> से लिया गया है और इसे <strong className="text-primary">अलकनंदा और भागीरथी</strong> द्वारा सिंचित भूमि के रूप में वर्णित किया गया है।{"\n\n"}• <strong className="text-primary">मानसखंड</strong>: आधुनिक <strong className="text-primary">कुमाऊं मंडल</strong> के अनुरूप, यह क्षेत्र <strong className="text-primary">मानसरोवर झील</strong> की तीर्थयात्रा मार्ग से जुड़ा था। यह विष्णु के <strong className="text-primary">कूर्म (कछुआ) अवतार</strong> से भी जुड़ा है।{"\n\n"}इस युग ने उत्तराखंड की <strong className="text-primary">देवभूमि</strong> (देवताओं की भूमि) के रूप में प्रतिष्ठा को भी मजबूत किया। <strong className="text-primary">महाभारत</strong> में <strong className="text-primary">पांडवों</strong> के <strong className="text-primary">महाप्रस्थान</strong> के दौरान इस भूमि को पार करने के स्पष्ट संदर्भ हैं। ऋषि <strong className="text-primary">व्यास</strong> ने बद्रीनाथ के पास <strong className="text-primary">माणा गांव</strong> की गुफाओं में महाकाव्य की रचना की।</>
        },
        image: kedarnathImg,
        imageAlt: "Kedarnath Temple"
      },
      {
        title: { en: "The Khasas: Indo-Aryan Influx", hi: "खस: इंडो-आर्यन आगमन" },
        content: { 
          en: <>A pivotal demographic shift occurred with the arrival of the <strong className="text-primary">Khasas</strong>, an <strong className="text-primary">Indo-Aryan warrior tribe</strong> from Central Asia. Unlike the Vedic Aryans of the Gangetic plains who adhered to strict Brahminical orthodoxy, the Khasas practiced a more fluid social structure. They established a dominance that would define the sociological character of the hills for millennia.{"\n\n"}<strong className="text-primary">The Khasa Contribution:</strong>{"\n"}• <strong>Origin:</strong> Indo-Aryan tribes from Central Asia; distinct from Vedic Aryans of the plains{"\n"}• <strong>Settlement:</strong> Displaced or assimilated the earlier Kol and Kirata populations{"\n"}• <strong>Religion:</strong> Practiced a nature-centric faith; worship of <strong className="text-primary">Masan, Bhuta,</strong> and later the <strong className="text-primary">Mahasu deity</strong> (in Jaunsar){"\n"}• <strong>Social Structure:</strong> Less rigid caste system; practice of bride-price and, in some areas, polyandry{"\n"}• <strong>Legacy:</strong> Ancestors of the majority of the <strong className="text-primary">Rajput and Brahmin</strong> populations in the hills today{"\n\n"}The Khasas introduced a distinct form of customary law and social organization, often centered around village republics or <strong className="text-primary">thokdars</strong>.</>,
          hi: <><strong className="text-primary">खसों</strong> के आगमन के साथ एक महत्वपूर्ण जनसांख्यिकीय परिवर्तन हुआ, जो मध्य एशिया से एक <strong className="text-primary">इंडो-आर्यन योद्धा जनजाति</strong> थी। गंगा के मैदानों के वैदिक आर्यों के विपरीत जो सख्त ब्राह्मणवादी रूढ़िवाद का पालन करते थे, खसों ने अधिक लचीली सामाजिक संरचना का अभ्यास किया।{"\n\n"}<strong className="text-primary">खस योगदान:</strong>{"\n"}• <strong>उत्पत्ति:</strong> मध्य एशिया से इंडो-आर्यन जनजातियां; मैदानों के वैदिक आर्यों से भिन्न{"\n"}• <strong>बसावट:</strong> पहले की कोल और किरात आबादी को विस्थापित या आत्मसात किया{"\n"}• <strong>धर्म:</strong> प्रकृति-केंद्रित आस्था; <strong className="text-primary">मसाण, भूत</strong> और बाद में <strong className="text-primary">महासू देवता</strong> (जौनसार में) की पूजा{"\n"}• <strong>सामाजिक संरचना:</strong> कम कठोर जाति व्यवस्था; वधू-मूल्य और कुछ क्षेत्रों में बहुपतित्व की प्रथा{"\n"}• <strong>विरासत:</strong> आज पहाड़ों में अधिकांश <strong className="text-primary">राजपूत और ब्राह्मण</strong> आबादी के पूर्वज</>
        }
      },
      {
        title: { en: "The Kuninda Dynasty: First Hill Empire", hi: "कुनिंद राजवंश: पहला पहाड़ी साम्राज्य" },
        content: { 
          en: <>The transition from tribal confederacies to organized statehood is marked by the rise of the <strong className="text-primary">Kuninda Dynasty (2nd century BCE – 3rd century CE)</strong>. The Kunindas were the first power to unite the Garhwal and Kumaon regions under a single political umbrella. Their territory extended from the <strong className="text-primary">Sutlej river</strong> in the west to the <strong className="text-primary">Kali river</strong> in the east.{"\n\n"}The most significant ruler of this dynasty was <strong className="text-primary">Amoghbhuti</strong>, whose name appears on beautiful silver and copper coins discovered across the region. These coins are invaluable historical documents; they feature a deer (representing the forest nature of the kingdom) alongside <strong className="text-primary">Buddhist symbols</strong> like the stupa and <strong className="text-primary">Hindu symbols</strong> like the swastika and Lakshmi. This numismatic evidence suggests a <strong className="text-primary">syncretic society</strong> where early Shaivism and Buddhism coexisted. The Kunindas were likely a trading power, controlling the lucrative <strong className="text-primary">salt and wool trade</strong> between Tibet and the Gangetic plains.</>,
          hi: <>जनजातीय संघों से संगठित राज्य की ओर संक्रमण <strong className="text-primary">कुनिंद राजवंश (दूसरी शताब्दी ई.पू. – तीसरी शताब्दी ई.)</strong> के उदय से चिह्नित है। कुनिंद गढ़वाल और कुमाऊं क्षेत्रों को एकीकृत करने वाली पहली शक्ति थे। उनका क्षेत्र पश्चिम में <strong className="text-primary">सतलुज नदी</strong> से पूर्व में <strong className="text-primary">काली नदी</strong> तक फैला था।{"\n\n"}इस राजवंश का सबसे महत्वपूर्ण शासक <strong className="text-primary">अमोघभूति</strong> था, जिसका नाम क्षेत्र में खोजे गए सुंदर चांदी और तांबे के सिक्कों पर दिखाई देता है। ये सिक्के अमूल्य ऐतिहासिक दस्तावेज हैं; इनमें हिरण (राज्य की वन प्रकृति का प्रतिनिधित्व) के साथ <strong className="text-primary">बौद्ध प्रतीक</strong> जैसे स्तूप और <strong className="text-primary">हिंदू प्रतीक</strong> जैसे स्वास्तिक और लक्ष्मी हैं। यह एक <strong className="text-primary">समन्वयवादी समाज</strong> का संकेत देता है।</>
        }
      }
    ],
    highlights: { 
      en: [
        "Lakhudyar rock paintings from Mesolithic period",
        "Kuninda dynasty coinage with Buddhist & Hindu symbols",
        "References in Rig Veda and Mahabharata",
        "Kedarkhand and Manaskhand in Skanda Purana"
      ],
      hi: [
        "मध्यपाषाण काल के लखुड्यार शैल चित्र",
        "बौद्ध और हिंदू प्रतीकों के साथ कुनिंद राजवंश के सिक्के",
        "ऋग्वेद और महाभारत में संदर्भ",
        "स्कंद पुराण में केदारखंड और मानसखंड"
      ]
    },
    relatedLinks: [
      { label: "Almora District", path: "/districts/almora" },
      { label: "Chamoli District", path: "/districts/chamoli" }
    ],
    accentColor: "from-amber-500/5 to-orange-500/5"
  },
  {
    id: "medieval",
    title: { 
      en: "Medieval Kingdoms", 
      hi: "मध्यकालीन राजवंश" 
    },
    period: { 
      en: "7th – 18th Century CE", 
      hi: "7वीं – 18वीं शताब्दी ई." 
    },
    icon: <Crown className="h-6 w-6" />,
    description: { 
      en: <>The medieval period (7th – 18th century CE) witnessed the consolidation of power into two powerful hill kingdoms: <strong className="text-primary">Garhwal</strong> and <strong className="text-primary">Kumaon</strong>. This era established the distinct regional identities that persist to this day, shaping the culture, language, and traditions of Uttarakhand.</>,
      hi: <>मध्यकाल (7वीं – 18वीं शताब्दी ई.) में दो शक्तिशाली पहाड़ी राज्यों में सत्ता का समेकन देखा गया: <strong className="text-primary">गढ़वाल</strong> और <strong className="text-primary">कुमाऊं</strong>। इस युग ने विशिष्ट क्षेत्रीय पहचान स्थापित की जो आज तक कायम है।</>
    },
    subsections: [
      {
        title: { en: "The Katyuri Dynasty of Kumaon (7th–11th Century CE)", hi: "कुमाऊं का कत्यूरी राजवंश (7वीं–11वीं शताब्दी ई.)" },
        content: { 
          en: <>Following the decline of the Kunindas, the region saw the rise of the <strong className="text-primary">Katyuris</strong>, a dynasty that claims descent from the Ayodhya kings and came to power around the <strong className="text-primary">7th century CE</strong>. The Katyuris were the first major dynasty of the medieval period and are credited with establishing a sophisticated state apparatus in the hills.{"\n\n"}<strong className="text-primary">The Golden Age of Temple Building:</strong>{"\n"}The Katyuri era is synonymous with a golden age of <strong className="text-primary">temple architecture</strong>. The structural temples built during this period are distinct from the later Nagara-style temples and are characterized by their intricate stone carvings and unique "Katyuri" style.{"\n\n"}<strong className="text-primary">Key Katyuri Temples:</strong>{"\n"}• <strong>Jageshwar Temples, Almora:</strong> A cluster of 124 temples dedicated to Shiva, considered one of the 12 Jyotirlingas. Dates from 7th to 14th century.{"\n"}• <strong>Baijnath Temples, Bageshwar:</strong> A complex of 18 temples with exquisite sculptures on a raised platform beside the Gomti river.{"\n"}• <strong>Katarmal Sun Temple, Almora:</strong> A 9th-century sun temple with 45 smaller shrines, second only to the Konark Sun Temple.{"\n"}• <strong>Champawat Temples:</strong> Including the Baleshwar Temple, showcase Katyuri stone carving at its finest.{"\n\n"}The Katyuris also developed a system of land grants and <strong className="text-primary">copper-plate inscriptions</strong>, which are now vital historical sources. Their decline around the 11th century was gradual, leading to fragmentation and the rise of the <strong className="text-primary">Chand dynasty</strong> in Kumaon.</>,
          hi: <>कुनिंदों के पतन के बाद, <strong className="text-primary">कत्यूरियों</strong> का उदय हुआ, एक राजवंश जो अयोध्या के राजाओं से वंश का दावा करता है और <strong className="text-primary">7वीं शताब्दी ई.</strong> के आसपास सत्ता में आया।{"\n\n"}<strong className="text-primary">मंदिर निर्माण का स्वर्ण युग:</strong>{"\n"}कत्यूरी युग <strong className="text-primary">मंदिर वास्तुकला</strong> के स्वर्ण युग का पर्याय है।{"\n\n"}<strong className="text-primary">प्रमुख कत्यूरी मंदिर:</strong>{"\n"}• <strong>जागेश्वर मंदिर, अल्मोड़ा:</strong> शिव को समर्पित 124 मंदिरों का समूह, 12 ज्योतिर्लिंगों में से एक।{"\n"}• <strong>बैजनाथ मंदिर, बागेश्वर:</strong> गोमती नदी के किनारे 18 मंदिरों का परिसर।{"\n"}• <strong>कटारमल सूर्य मंदिर, अल्मोड़ा:</strong> 45 छोटे मंदिरों के साथ 9वीं शताब्दी का सूर्य मंदिर।</>
        },
        image: katyuriTemplesImg,
        imageAlt: "Katyuri Temple Architecture"
      },
      {
        title: { en: "The Chand Dynasty of Kumaon (10th–18th Century)", hi: "कुमाऊं का चंद राजवंश (10वीं–18वीं शताब्दी)" },
        content: { 
          en: <>Emerging from the shadows of the declining Katyuris, the <strong className="text-primary">Chand dynasty</strong> rose to become the pre-eminent power in Kumaon. According to tradition, <strong className="text-primary">Som Chand</strong>, a prince from the Jhula branch of the Mewari Rajputs, founded the dynasty around the <strong className="text-primary">10th century</strong>.{"\n\n"}The Chands consolidated their power over Kumaon through a combination of military conquest, strategic marriages, and administrative acumen. Their capital shifted over centuries from <strong className="text-primary">Champawat</strong> to <strong className="text-primary">Almora</strong> (founded by Balo Kalyan Chand in 1560).{"\n\n"}<strong className="text-primary">Notable Chand Rulers:</strong>{"\n"}• <strong>Gyan Chand (1374–1419):</strong> Expanded the kingdom significantly and is credited with military reforms.{"\n"}• <strong>Balo Kalyan Chand (1560–1568):</strong> Founded the new capital at Almora, which became a major trading center.{"\n"}• <strong>Baz Bahadur Chand (1638–1678):</strong> The most powerful Chand king, expanded the kingdom's influence and patronized arts.{"\n"}• <strong>Udyot Chand (1678–1698):</strong> Built the iconic Katarmal Sun Temple.{"\n\n"}The Chands developed <strong className="text-primary">Kumaoni</strong> as a literary language, patronized the distinctive <strong className="text-primary">Pahari painting</strong> style, and established the <strong className="text-primary">Nanda Devi Raj Jat</strong> as the greatest pilgrimage of the region. Their rule came to an end with the <strong className="text-primary">Gorkha invasion in 1790</strong>.</>,
          hi: <>घटते कत्यूरियों की छाया से उभरकर, <strong className="text-primary">चंद राजवंश</strong> कुमाऊं में प्रमुख शक्ति बन गया। परंपरा के अनुसार, मेवाड़ी राजपूतों की झूला शाखा के राजकुमार <strong className="text-primary">सोम चंद</strong> ने <strong className="text-primary">10वीं शताब्दी</strong> में राजवंश की स्थापना की।{"\n\n"}चंदों ने अपनी राजधानी सदियों में <strong className="text-primary">चंपावत</strong> से <strong className="text-primary">अल्मोड़ा</strong> (1560 में बालो कल्याण चंद द्वारा स्थापित) स्थानांतरित की।{"\n\n"}<strong className="text-primary">उल्लेखनीय चंद शासक:</strong>{"\n"}• <strong>ज्ञान चंद (1374–1419):</strong> राज्य का महत्वपूर्ण विस्तार किया।{"\n"}• <strong>बालो कल्याण चंद (1560–1568):</strong> अल्मोड़ा में नई राजधानी की स्थापना की।{"\n"}• <strong>बाज बहादुर चंद (1638–1678):</strong> सबसे शक्तिशाली चंद राजा।{"\n\n"}चंदों ने <strong className="text-primary">कुमाऊंनी</strong> को एक साहित्यिक भाषा के रूप में विकसित किया और <strong className="text-primary">नंदा देवी राज जात</strong> को क्षेत्र की सबसे बड़ी तीर्थयात्रा के रूप में स्थापित किया।</>
        },
        image: nandaDeviRajJatImg,
        imageAlt: "Nanda Devi Raj Jat Pilgrimage"
      },
      {
        title: { en: "The Parmar (Panwar) Dynasty of Garhwal", hi: "गढ़वाल का परमार (पंवार) राजवंश" },
        content: { 
          en: <>While the Chands were consolidating Kumaon, a parallel history was unfolding in <strong className="text-primary">Garhwal</strong> (literally "Land of Forts"). Legend holds that <strong className="text-primary">Kanak Pal</strong>, a prince of the Parmar Rajputs from Malwa, came to Garhwal around the <strong className="text-primary">9th century</strong> after a pilgrimage to Badrinath and founded a kingdom.{"\n\n"}The early Garhwal kingdom was a loose confederation of <strong className="text-primary">52 garhs</strong> (forts), each controlled by a local thakur (lord). The Parmar dynasty's genius lay in uniting these fractious chieftains under a single banner. Key rulers who shaped Garhwal include:{"\n\n"}• <strong>Ajay Pal (1500–1519):</strong> The most transformative ruler, he conquered all 52 garhs and unified Garhwal, establishing <strong className="text-primary">Srinagar</strong> (near Pauri) as the capital.{"\n"}• <strong>Man Shah (1581–1614):</strong> Fought off Mughal incursions and maintained Garhwal's independence.{"\n"}• <strong>Fateh Shah (1684–1716):</strong> Expanded the kingdom to its greatest extent, defeating Kumaon and the Tibetans.{"\n"}• <strong>Pradyumna Shah (1785–1804):</strong> The last independent king, who died fighting the Gorkha invasion at the Battle of Khurbura.</>,
          hi: <>जब चंद कुमाऊं को मजबूत कर रहे थे, <strong className="text-primary">गढ़वाल</strong> (शाब्दिक अर्थ "किलों की भूमि") में एक समानांतर इतिहास प्रकट हो रहा था। किंवदंती है कि मालवा के परमार राजपूतों के राजकुमार <strong className="text-primary">कनक पाल</strong> बद्रीनाथ की तीर्थयात्रा के बाद <strong className="text-primary">9वीं शताब्दी</strong> में गढ़वाल आए और एक राज्य की स्थापना की।{"\n\n"}प्रारंभिक गढ़वाल राज्य <strong className="text-primary">52 गढ़ों</strong> (किलों) का एक ढीला संघ था। प्रमुख शासक:{"\n\n"}• <strong>अजय पाल (1500–1519):</strong> सबसे परिवर्तनकारी शासक, उन्होंने सभी 52 गढ़ों को जीता और <strong className="text-primary">श्रीनगर</strong> को राजधानी बनाया।{"\n"}• <strong>मान शाह (1581–1614):</strong> मुगल आक्रमणों को रोका और गढ़वाल की स्वतंत्रता बनाए रखी।{"\n"}• <strong>फतेह शाह (1684–1716):</strong> राज्य का सबसे बड़े विस्तार तक विस्तार किया।{"\n"}• <strong>प्रद्युम्न शाह (1785–1804):</strong> अंतिम स्वतंत्र राजा।</>
        },
        image: garhwalKingdomImg,
        imageAlt: "Garhwal Kingdom History"
      },
      {
        title: { en: "Cultural Flowering: Art, Architecture & Society", hi: "सांस्कृतिक उत्कर्ष: कला, वास्तुकला और समाज" },
        content: { 
          en: <>The medieval period was not just an era of political consolidation but also a time of immense <strong className="text-primary">cultural flowering</strong>. Despite, or perhaps because of, their isolation, both kingdoms developed rich and distinctive artistic traditions.{"\n\n"}<strong className="text-primary">Pahari Painting:</strong>{"\n"}Both Garhwal and Kumaon became significant centers of the <strong className="text-primary">Pahari school of miniature painting</strong>. Originating in the hill courts of Himachal, the style was adopted and transformed by artists in the Kumaoni and Garhwali courts. The paintings are characterized by their vibrant colors, lyrical depiction of nature, and themes drawn from Hindu mythology.{"\n\n"}<strong className="text-primary">Folk Traditions:</strong>{"\n"}The medieval era also saw the crystallization of major folk traditions:{"\n"}• <strong>Chholiya Dance:</strong> A martial sword dance performed at weddings, originating from Kumaon.{"\n"}• <strong>Jaunsari Barada Nati:</strong> A large group dance from the Jaunsar-Bawar region with Tibetan influences.{"\n"}• <strong>Ramman Festival:</strong> A UNESCO Intangible Cultural Heritage ritual from Chamoli.{"\n"}• <strong>Nanda Devi Raj Jat:</strong> The great 280 km pilgrimage held once every 12 years.{"\n\n"}These traditions, patronized by the courts, spread among the common people and remain vibrant to this day.</>,
          hi: <>मध्यकाल केवल राजनीतिक समेकन का युग नहीं बल्कि <strong className="text-primary">सांस्कृतिक उत्कर्ष</strong> का समय भी था।{"\n\n"}<strong className="text-primary">पहाड़ी चित्रकला:</strong>{"\n"}गढ़वाल और कुमाऊं दोनों <strong className="text-primary">पहाड़ी लघुचित्र शैली</strong> के महत्वपूर्ण केंद्र बन गए।{"\n\n"}<strong className="text-primary">लोक परंपराएं:</strong>{"\n"}मध्यकाल में प्रमुख लोक परंपराओं का समेकन हुआ:{"\n"}• <strong>छोलिया नृत्य:</strong> शादियों में प्रस्तुत एक युद्ध तलवार नृत्य।{"\n"}• <strong>जौनसारी बरदा नाटी:</strong> तिब्बती प्रभावों के साथ जौनसार-बावर क्षेत्र से एक बड़ा समूह नृत्य।{"\n"}• <strong>रम्माण उत्सव:</strong> चमोली से एक यूनेस्को अमूर्त सांस्कृतिक विरासत अनुष्ठान।{"\n"}• <strong>नंदा देवी राज जात:</strong> हर 12 साल में एक बार आयोजित 280 किमी की महान तीर्थयात्रा।</>
        },
        image: chholiyaDanceImg,
        imageAlt: "Chholiya Dance Performance"
      }
    ],
    highlights: { 
      en: [
        "Katyuri temple architecture at Jageshwar & Baijnath",
        "Chand dynasty's founding of Almora (1560)",
        "Parmar unification of 52 garhs under Ajay Pal",
        "Pahari miniature painting tradition"
      ],
      hi: [
        "जागेश्वर और बैजनाथ में कत्यूरी मंदिर वास्तुकला",
        "चंद राजवंश द्वारा अल्मोड़ा की स्थापना (1560)",
        "अजय पाल के तहत 52 गढ़ों का परमार एकीकरण",
        "पहाड़ी लघुचित्र चित्रकला परंपरा"
      ]
    },
    relatedLinks: [
      { label: "Almora District", path: "/districts/almora" },
      { label: "Pauri Garhwal", path: "/districts/pauri-garhwal" },
      { label: "Champawat District", path: "/districts/champawat" }
    ],
    accentColor: "from-purple-500/5 to-indigo-500/5"
  },
  {
    id: "colonial",
    title: { 
      en: "Colonial Era", 
      hi: "औपनिवेशिक युग" 
    },
    period: { 
      en: "1815 – 1947 CE", 
      hi: "1815 – 1947 ई." 
    },
    icon: <Building className="h-6 w-6" />,
    description: { 
      en: <>The 19th century began with a violent disruption: the <strong className="text-primary">Gorkha invasions</strong>. Between 1790 and 1815, the expanding Gorkha Empire from Nepal conquered both Kumaon and Garhwal, ending centuries of local rule. The Gorkha period was marked by heavy taxation and military conscription, which was deeply resented by the local population.</>,
      hi: <>19वीं शताब्दी एक हिंसक व्यवधान के साथ शुरू हुई: <strong className="text-primary">गोरखा आक्रमण</strong>। 1790 और 1815 के बीच, नेपाल से विस्तारित गोरखा साम्राज्य ने कुमाऊं और गढ़वाल दोनों को जीत लिया। गोरखा काल भारी कराधान और सैन्य भर्ती द्वारा चिह्नित था।</>
    },
    subsections: [
      {
        title: { en: "The Gorkha Interregnum (1790–1815)", hi: "गोरखा मध्यांतर (1790–1815)" },
        content: { 
          en: <>The <strong className="text-primary">Gorkha conquest</strong> was swift and brutal. In 1790, the Gorkhas defeated the Chand king, <strong className="text-primary">Mahendra Chand</strong>, and occupied Kumaon. By 1804, after the heroic last stand of <strong className="text-primary">Pradyumna Shah</strong> at Khurbura, Garhwal too fell.{"\n\n"}The Gorkha period (1790–1815) is often viewed negatively in local memory. The new rulers imposed harsh <strong className="text-primary">Jhara</strong> (corvée labor), heavy taxes, and forced military service. However, some scholars note that the Gorkhas also introduced certain administrative reforms and briefly unified the entire central Himalayan region.{"\n\n"}The Gorkha period ended when they came into conflict with the <strong className="text-primary">British East India Company</strong>. The <strong className="text-primary">Anglo-Gorkha War (1814–1816)</strong> led to the <strong className="text-primary">Treaty of Sugauli (1816)</strong>, by which Nepal ceded Kumaon and the eastern part of Garhwal to the British.</>,
          hi: <><strong className="text-primary">गोरखा विजय</strong> तेज और क्रूर थी। 1790 में, गोरखाओं ने चंद राजा <strong className="text-primary">महेंद्र चंद</strong> को हराया और कुमाऊं पर कब्जा कर लिया। 1804 तक, खुरबुरा में <strong className="text-primary">प्रद्युम्न शाह</strong> के वीरतापूर्ण अंतिम प्रतिरोध के बाद, गढ़वाल भी गिर गया।{"\n\n"}गोरखा काल (1790–1815) को स्थानीय स्मृति में प्रायः नकारात्मक रूप से देखा जाता है। नए शासकों ने कठोर <strong className="text-primary">झारा</strong> (बेगार), भारी कर और जबरन सैन्य सेवा लागू की।{"\n\n"}गोरखा काल समाप्त हुआ जब वे <strong className="text-primary">ब्रिटिश ईस्ट इंडिया कंपनी</strong> के साथ संघर्ष में आए। <strong className="text-primary">आंग्ल-गोरखा युद्ध (1814–1816)</strong> के परिणामस्वरूप <strong className="text-primary">सुगौली संधि (1816)</strong> हुई।</>
        }
      },
      {
        title: { en: "The British Raj in Kumaon & Garhwal", hi: "कुमाऊं और गढ़वाल में ब्रिटिश राज" },
        content: { 
          en: <>The British administration of the hills was distinctly different from that of the plains. Recognizing the difficult terrain and the unique social structure, the British implemented a <strong className="text-primary">Non-Regulation system</strong>, which gave considerable autonomy to the local Commissioner.{"\n\n"}<strong className="text-primary">Key Developments under British Rule:</strong>{"\n"}• <strong>Hill Stations:</strong> The establishment of <strong className="text-primary">Nainital (1841), Mussoorie (1823), Ranikhet (1869), and Lansdowne</strong> as summer retreats transformed the economy and demographics of the region.{"\n"}• <strong>Forest Policy:</strong> The British established <strong className="text-primary">Reserved Forests</strong>, restricting traditional lopping and grazing rights, which led to significant local resentment and later, the Chipko-precursor movements.{"\n"}• <strong>Tea Plantations:</strong> Tea cultivation was introduced in areas like <strong className="text-primary">Berinag and Kausani</strong>.{"\n"}• <strong>Modern Education:</strong> Schools and colleges were established, leading to a new educated class.{"\n"}• <strong>Infrastructure:</strong> The famous <strong className="text-primary">Corbett National Park</strong> was established in 1936 as India's first national park.{"\n\n"}The British period also saw the emergence of <strong className="text-primary">reform movements</strong>. Figures like <strong className="text-primary">Ganga Datt Upreti</strong> and <strong className="text-primary">Badri Dutt Pande</strong> campaigned against social evils like the <strong className="text-primary">Kuli Begar</strong> (forced labor) system.</>,
          hi: <>पहाड़ों का ब्रिटिश प्रशासन मैदानों से स्पष्ट रूप से भिन्न था। कठिन इलाके और अद्वितीय सामाजिक संरचना को पहचानते हुए, ब्रिटिशों ने एक <strong className="text-primary">गैर-विनियमन प्रणाली</strong> लागू की।{"\n\n"}<strong className="text-primary">ब्रिटिश शासन के तहत प्रमुख विकास:</strong>{"\n"}• <strong>हिल स्टेशन:</strong> <strong className="text-primary">नैनीताल (1841), मसूरी (1823), रानीखेत (1869), और लैंसडाउन</strong> की स्थापना।{"\n"}• <strong>वन नीति:</strong> ब्रिटिशों ने <strong className="text-primary">आरक्षित वन</strong> स्थापित किए, पारंपरिक अधिकारों को प्रतिबंधित किया।{"\n"}• <strong>चाय बागान:</strong> <strong className="text-primary">बेरीनाग और कौसानी</strong> जैसे क्षेत्रों में चाय की खेती शुरू हुई।{"\n"}• <strong>आधुनिक शिक्षा:</strong> स्कूल और कॉलेज स्थापित किए गए।{"\n"}• <strong>बुनियादी ढांचा:</strong> प्रसिद्ध <strong className="text-primary">कॉर्बेट नेशनल पार्क</strong> 1936 में स्थापित किया गया।{"\n\n"}ब्रिटिश काल में <strong className="text-primary">सुधार आंदोलनों</strong> का उदय भी हुआ। <strong className="text-primary">गंगा दत्त उप्रेती</strong> और <strong className="text-primary">बद्री दत्त पांडे</strong> जैसे व्यक्तियों ने <strong className="text-primary">कुली बेगार</strong> प्रथा के खिलाफ अभियान चलाया।</>
        }
      },
      {
        title: { en: "Freedom Struggle in Uttarakhand", hi: "उत्तराखंड में स्वतंत्रता संग्राम" },
        content: { 
          en: <>Uttarakhand played a notable, though often overlooked, role in the Indian freedom struggle. The region contributed to both the <strong className="text-primary">mainstream nationalist movement</strong> and developed its <strong className="text-primary">own local resistance movements</strong>.{"\n\n"}<strong className="text-primary">Key Events & Figures:</strong>{"\n"}• <strong>Kuli Begar Abolition (1921):</strong> Led by <strong className="text-primary">Badri Dutt Pande</strong>, this movement against forced labor was a landmark of local resistance.{"\n"}• <strong>Salt Satyagraha (1930):</strong> People from the hills participated actively. <strong className="text-primary">Kuntala Devi</strong> led a group of women to make salt in defiance.{"\n"}• <strong>Quit India Movement (1942):</strong> <strong className="text-primary">Sridev Suman</strong> was martyred after a prolonged hunger strike in Tehri jail, becoming a major symbol of resistance.{"\n"}• <strong>Tehri State:</strong> The princely state of Tehri, which remained outside British India, had its own movement against the Raja, culminating in the <strong className="text-primary">Tehri State Praja Mandal</strong> agitation.{"\n\n"}When India gained independence in 1947, the region was merged into the new state of <strong className="text-primary">Uttar Pradesh</strong>. Tehri state was integrated in 1949. This merger, while administratively convenient, sowed the seeds of a future demand for a separate hill state.</>,
          hi: <>उत्तराखंड ने भारतीय स्वतंत्रता संग्राम में एक उल्लेखनीय, हालांकि अक्सर अनदेखी, भूमिका निभाई।{"\n\n"}<strong className="text-primary">प्रमुख घटनाएं और व्यक्ति:</strong>{"\n"}• <strong>कुली बेगार उन्मूलन (1921):</strong> <strong className="text-primary">बद्री दत्त पांडे</strong> के नेतृत्व में, बेगार के खिलाफ यह आंदोलन स्थानीय प्रतिरोध की एक मील का पत्थर था।{"\n"}• <strong>नमक सत्याग्रह (1930):</strong> पहाड़ों के लोगों ने सक्रिय रूप से भाग लिया। <strong className="text-primary">कुंतला देवी</strong> ने महिलाओं के एक समूह का नेतृत्व किया।{"\n"}• <strong>भारत छोड़ो आंदोलन (1942):</strong> <strong className="text-primary">श्रीदेव सुमन</strong> टिहरी जेल में लंबी भूख हड़ताल के बाद शहीद हो गए।{"\n"}• <strong>टिहरी राज्य:</strong> टिहरी की रियासत का राजा के खिलाफ अपना आंदोलन था, जो <strong className="text-primary">टिहरी राज्य प्रजा मंडल</strong> आंदोलन में समाप्त हुआ।{"\n\n"}1947 में जब भारत को स्वतंत्रता मिली, तो क्षेत्र को नए <strong className="text-primary">उत्तर प्रदेश</strong> राज्य में मिला दिया गया।</>
        }
      }
    ],
    highlights: { 
      en: [
        "Treaty of Sugauli (1816) ended Gorkha rule",
        "Establishment of Nainital and Mussoorie hill stations",
        "Kuli Begar abolition movement (1921)",
        "Martyrdom of Sridev Suman (1944)"
      ],
      hi: [
        "सुगौली संधि (1816) ने गोरखा शासन समाप्त किया",
        "नैनीताल और मसूरी हिल स्टेशनों की स्थापना",
        "कुली बेगार उन्मूलन आंदोलन (1921)",
        "श्रीदेव सुमन की शहादत (1944)"
      ]
    },
    relatedLinks: [
      { label: "Nainital District", path: "/districts/nainital" },
      { label: "Tehri Garhwal", path: "/districts/tehri-garhwal" },
      { label: "Dehradun District", path: "/districts/dehradun" }
    ],
    accentColor: "from-emerald-500/5 to-teal-500/5"
  },
  {
    id: "statehood",
    title: { 
      en: "Formation of Uttarakhand", 
      hi: "उत्तराखंड का गठन" 
    },
    period: { 
      en: "1947 – 2000 CE", 
      hi: "1947 – 2000 ई." 
    },
    icon: <Flag className="h-6 w-6" />,
    description: { 
      en: <>The post-independence period (1947–2000) is defined by the struggle for <strong className="text-primary">Uttarakhand statehood</strong>. Being part of the large and diverse state of <strong className="text-primary">Uttar Pradesh</strong>, the hill districts consistently faced neglect. Resources were diverted to the more populous and politically influential plains, leaving the hills underdeveloped despite their immense natural wealth.</>,
      hi: <>स्वतंत्रता के बाद का काल (1947–2000) <strong className="text-primary">उत्तराखंड राज्य</strong> के संघर्ष द्वारा परिभाषित है। बड़े और विविध <strong className="text-primary">उत्तर प्रदेश</strong> राज्य का हिस्सा होने के कारण, पहाड़ी जिलों को लगातार उपेक्षा का सामना करना पड़ा।</>
    },
    subsections: [
      {
        title: { en: "Seeds of Separation (1950s–1970s)", hi: "अलगाव के बीज (1950–1970 के दशक)" },
        content: { 
          en: <>The demand for a separate hill state has roots going back to the <strong className="text-primary">1950s</strong>. Early articulations came from local leaders who felt the hills were being sidelined in the political economy of UP. The formation of <strong className="text-primary">Himachal Pradesh (1971)</strong>, carved out of Punjab, gave a powerful impetus to similar demands in Uttarakhand.{"\n\n"}<strong className="text-primary">Early Arguments for Separation:</strong>{"\n"}• <strong>Geographic Neglect:</strong> Difficult terrain meant less investment in roads, healthcare, and education.{"\n"}• <strong>Economic Drain:</strong> Resources like water, forests, and tourism revenue benefited the state at large, while local populations remained poor.{"\n"}• <strong>Cultural Distinctiveness:</strong> The Garhwali and Kumaoni languages, dialects, and traditions were distinct from the Hindi belt of UP.{"\n"}• <strong>Outmigration:</strong> Lack of opportunities led to massive outmigration, with villages becoming desolate.{"\n\n"}The <strong className="text-primary">Uttarakhand Kranti Dal</strong>, formed in 1979, became the first political party to formally demand statehood.</>,
          hi: <>एक अलग पहाड़ी राज्य की मांग की जड़ें <strong className="text-primary">1950 के दशक</strong> तक जाती हैं। प्रारंभिक अभिव्यक्तियां स्थानीय नेताओं से आईं जिन्होंने महसूस किया कि पहाड़ों को उत्तर प्रदेश की राजनीतिक अर्थव्यवस्था में किनारे किया जा रहा है। <strong className="text-primary">हिमाचल प्रदेश (1971)</strong> के गठन ने उत्तराखंड में समान मांगों को शक्तिशाली प्रोत्साहन दिया।{"\n\n"}<strong className="text-primary">अलगाव के प्रारंभिक तर्क:</strong>{"\n"}• <strong>भौगोलिक उपेक्षा:</strong> कठिन इलाके का मतलब सड़कों, स्वास्थ्य सेवा और शिक्षा में कम निवेश।{"\n"}• <strong>आर्थिक निकासी:</strong> पानी, जंगल और पर्यटन राजस्व जैसे संसाधनों ने समग्र राज्य को लाभान्वित किया।{"\n"}• <strong>सांस्कृतिक विशिष्टता:</strong> गढ़वाली और कुमाऊंनी भाषाएं और परंपराएं उत्तर प्रदेश की हिंदी पट्टी से भिन्न थीं।{"\n\n"}<strong className="text-primary">उत्तराखंड क्रांति दल</strong>, 1979 में गठित, राज्य की औपचारिक मांग करने वाला पहला राजनीतिक दल बना।</>
        }
      },
      {
        title: { en: "The Chipko Movement (1970s)", hi: "चिपको आंदोलन (1970 के दशक)" },
        content: { 
          en: <>Before the statehood movement crystallized, the hills witnessed a <strong className="text-primary">powerful environmental movement</strong> that had significant political undertones: the <strong className="text-primary">Chipko Movement</strong>.{"\n\n"}In 1973, villagers of <strong className="text-primary">Mandal village</strong> (near Gopeshwar in Chamoli district), led by <strong className="text-primary">Chandi Prasad Bhatt</strong> and later joined by <strong className="text-primary">Sunderlal Bahuguna</strong>, hugged trees to prevent them from being felled by logging contractors. The movement, which drew on the legacy of the <strong className="text-primary">Bishnoi community</strong> and echoed Gandhian non-violence, quickly spread across the hills.{"\n\n"}<strong className="text-primary">Impact of Chipko:</strong>{"\n"}• Led to a <strong className="text-primary">15-year ban on commercial green felling</strong> in Uttarakhand (1980).{"\n"}• Brought global attention to deforestation and community rights.{"\n"}• Created a cadre of socially conscious activists who later became leaders of the statehood movement.{"\n"}• Demonstrated the capacity of the hill people for organized, non-violent protest.{"\n\n"}The Chipko movement also highlighted the stark reality: the people of the hills had no control over their own resources. This grievance became central to the statehood demand.</>,
          hi: <>राज्य आंदोलन के क्रिस्टलीकरण से पहले, पहाड़ों ने एक <strong className="text-primary">शक्तिशाली पर्यावरण आंदोलन</strong> देखा: <strong className="text-primary">चिपको आंदोलन</strong>।{"\n\n"}1973 में, <strong className="text-primary">मंडल गांव</strong> (चमोली जिले में गोपेश्वर के पास) के ग्रामीणों ने, <strong className="text-primary">चंडी प्रसाद भट्ट</strong> के नेतृत्व में और बाद में <strong className="text-primary">सुंदरलाल बहुगुणा</strong> के शामिल होने से, पेड़ों को गले लगाया ताकि उन्हें ठेकेदारों द्वारा काटे जाने से रोका जा सके।{"\n\n"}<strong className="text-primary">चिपको का प्रभाव:</strong>{"\n"}• उत्तराखंड में <strong className="text-primary">वाणिज्यिक हरित कटाई पर 15 साल का प्रतिबंध</strong> (1980) लगा।{"\n"}• वनों की कटाई और सामुदायिक अधिकारों पर वैश्विक ध्यान आकर्षित किया।{"\n"}• सामाजिक रूप से जागरूक कार्यकर्ताओं का एक कैडर बनाया जो बाद में राज्य आंदोलन के नेता बने।{"\n\n"}चिपको आंदोलन ने इस कटु वास्तविकता को भी उजागर किया: पहाड़ों के लोगों का अपने संसाधनों पर कोई नियंत्रण नहीं था।</>
        }
      },
      {
        title: { en: "The Statehood Agitation (1994)", hi: "राज्य आंदोलन (1994)" },
        content: { 
          en: <>The statehood movement reached its climax in the <strong className="text-primary">1990s</strong>. In 1994, the UP government's decision to extend the <strong className="text-primary">Mandal Commission's reservation policy</strong> to the hill districts—without considering their different demographic composition—ignited massive protests.{"\n\n"}On <strong className="text-primary">October 1–2, 1994</strong>, the peaceful protest in Muzaffarnagar turned tragic. Police fired on unarmed protesters, and in the ensuing chaos, <strong className="text-primary">several people were killed</strong>. The exact death toll remains disputed, but the <strong className="text-primary">Muzaffarnagar massacre</strong> became a turning point.{"\n\n"}Following Muzaffarnagar, the movement intensified. <strong className="text-primary">Rampur Tiraha</strong> (Muzaffarnagar) and <strong className="text-primary">Khatima</strong> (Udham Singh Nagar) saw further incidents of police brutality.{"\n\n"}The martyrs of the movement—particularly women like <strong className="text-primary">Belmati Chauhan</strong> and <strong className="text-primary">Hansa Dhanai</strong>—became powerful symbols of sacrifice. The hill women, who had borne the brunt of underdevelopment and outmigration, were at the forefront of the agitation.{"\n\n"}Eventually, political pressure mounted. The <strong className="text-primary">BJP-led central government</strong>, in 2000, passed the <strong className="text-primary">Uttar Pradesh Reorganization Act</strong>, and on <strong className="text-primary">November 9, 2000</strong>, <strong className="text-primary">Uttaranchal</strong> (later renamed <strong className="text-primary">Uttarakhand</strong> in 2007) became the <strong className="text-primary">27th state of India</strong>.</>,
          hi: <>राज्य आंदोलन <strong className="text-primary">1990 के दशक</strong> में अपने चरम पर पहुंचा। 1994 में, उत्तर प्रदेश सरकार के <strong className="text-primary">मंडल आयोग की आरक्षण नीति</strong> को पहाड़ी जिलों तक बढ़ाने के फैसले ने बड़े पैमाने पर विरोध प्रदर्शन शुरू कर दिए।{"\n\n"}<strong className="text-primary">1-2 अक्टूबर, 1994</strong> को मुजफ्फरनगर में शांतिपूर्ण विरोध प्रदर्शन त्रासदी में बदल गया। पुलिस ने निहत्थे प्रदर्शनकारियों पर गोली चलाई। <strong className="text-primary">मुजफ्फरनगर नरसंहार</strong> एक महत्वपूर्ण मोड़ बन गया।{"\n\n"}मुजफ्फरनगर के बाद, आंदोलन तेज हो गया। <strong className="text-primary">रामपुर तिराहा</strong> और <strong className="text-primary">खटीमा</strong> में पुलिस क्रूरता की और घटनाएं हुईं।{"\n\n"}आंदोलन के शहीद—विशेष रूप से <strong className="text-primary">बेलमती चौहान</strong> और <strong className="text-primary">हंसा धनई</strong> जैसी महिलाएं—बलिदान के शक्तिशाली प्रतीक बन गईं।{"\n\n"}अंततः, राजनीतिक दबाव बढ़ा। <strong className="text-primary">भाजपा नेतृत्व वाली केंद्र सरकार</strong> ने 2000 में <strong className="text-primary">उत्तर प्रदेश पुनर्गठन अधिनियम</strong> पारित किया, और <strong className="text-primary">9 नवंबर, 2000</strong> को <strong className="text-primary">उत्तरांचल</strong> (बाद में 2007 में <strong className="text-primary">उत्तराखंड</strong> नाम बदला) <strong className="text-primary">भारत का 27वां राज्य</strong> बना।</>
        }
      }
    ],
    highlights: { 
      en: [
        "Chipko Movement began in 1973",
        "Uttarakhand Kranti Dal formed in 1979",
        "Muzaffarnagar tragedy (October 1994)",
        "Statehood achieved on November 9, 2000"
      ],
      hi: [
        "1973 में चिपको आंदोलन शुरू हुआ",
        "1979 में उत्तराखंड क्रांति दल का गठन",
        "मुजफ्फरनगर त्रासदी (अक्टूबर 1994)",
        "9 नवंबर, 2000 को राज्य का दर्जा प्राप्त"
      ]
    },
    relatedLinks: [
      { label: "Chamoli District", path: "/districts/chamoli" },
      { label: "Dehradun District", path: "/districts/dehradun" }
    ],
    accentColor: "from-rose-500/5 to-pink-500/5"
  },
  {
    id: "cultural-legacy",
    title: { 
      en: "Cultural Legacy", 
      hi: "सांस्कृतिक विरासत" 
    },
    period: { 
      en: "Timeless Heritage", 
      hi: "कालातीत विरासत" 
    },
    icon: <Heart className="h-6 w-6" />,
    description: { 
      en: <>Throughout its history, from the prehistoric rock paintings to the modern statehood struggle, <strong className="text-primary">Uttarakhand</strong> has developed a unique cultural identity. This section celebrates the enduring legacy of its people, their traditions, and their contributions to Indian civilization.</>,
      hi: <>प्रागैतिहासिक शैल चित्रों से आधुनिक राज्य संघर्ष तक अपने पूरे इतिहास में, <strong className="text-primary">उत्तराखंड</strong> ने एक अद्वितीय सांस्कृतिक पहचान विकसित की है। यह खंड इसके लोगों, उनकी परंपराओं और भारतीय सभ्यता में उनके योगदान की स्थायी विरासत का उत्सव मनाता है।</>
    },
    subsections: [
      {
        title: { en: "Char Dham: The Ultimate Pilgrimage", hi: "चार धाम: परम तीर्थयात्रा" },
        content: { 
          en: <>The <strong className="text-primary">Char Dham</strong> of Uttarakhand—<strong className="text-primary">Badrinath, Kedarnath, Gangotri, and Yamunotri</strong>—constitute one of the most sacred pilgrimage circuits in Hinduism. Every year, millions of pilgrims brave treacherous mountain roads to visit these shrines, seeking moksha (liberation).{"\n\n"}<strong className="text-primary">Badrinath:</strong> Dedicated to Vishnu, located at the source of the Alaknanda. Associated with the sage Vyasa and the Mahabharata.{"\n"}<strong className="text-primary">Kedarnath:</strong> Dedicated to Shiva, one of the 12 Jyotirlingas. Tragically devastated by floods in 2013 and later rebuilt.{"\n"}<strong className="text-primary">Gangotri:</strong> Source of the Ganges (Bhagirathi), associated with King Bhagirath's penance.{"\n"}<strong className="text-primary">Yamunotri:</strong> Source of the Yamuna, dedicated to the goddess Yamuna.{"\n\n"}These shrines were likely established in their present form during the <strong className="text-primary">9th century by Adi Shankaracharya</strong>, who is credited with reviving Hindu pilgrimage across India.</>,
          hi: <>उत्तराखंड के <strong className="text-primary">चार धाम</strong>—<strong className="text-primary">बद्रीनाथ, केदारनाथ, गंगोत्री, और यमुनोत्री</strong>—हिंदू धर्म में सबसे पवित्र तीर्थ मार्गों में से एक हैं। हर साल, लाखों तीर्थयात्री मोक्ष की तलाश में इन मंदिरों के दर्शन के लिए खतरनाक पहाड़ी सड़कों का सामना करते हैं।{"\n\n"}<strong className="text-primary">बद्रीनाथ:</strong> विष्णु को समर्पित, अलकनंदा के स्रोत पर स्थित।{"\n"}<strong className="text-primary">केदारनाथ:</strong> शिव को समर्पित, 12 ज्योतिर्लिंगों में से एक। 2013 में बाढ़ से दुखद रूप से तबाह हुआ।{"\n"}<strong className="text-primary">गंगोत्री:</strong> गंगा (भागीरथी) का स्रोत, राजा भगीरथ की तपस्या से जुड़ा।{"\n"}<strong className="text-primary">यमुनोत्री:</strong> यमुना का स्रोत, देवी यमुना को समर्पित।{"\n\n"}ये मंदिर संभवतः <strong className="text-primary">9वीं शताब्दी में आदि शंकराचार्य</strong> द्वारा अपने वर्तमान रूप में स्थापित किए गए थे।</>
        },
        image: charDhamImg,
        imageAlt: "Char Dham Pilgrimage Sites"
      },
      {
        title: { en: "Living Traditions: Dance, Music & Festivals", hi: "जीवित परंपराएं: नृत्य, संगीत और त्यौहार" },
        content: { 
          en: <>Uttarakhand's cultural life is a vibrant tapestry woven from its diverse communities and histories. The region has preserved ancient traditions that are still practiced with fervor.{"\n\n"}<strong className="text-primary">Key Folk Dances:</strong>{"\n"}• <strong>Chholiya:</strong> A martial sword dance from Kumaon, performed at weddings.{"\n"}• <strong>Langvir Nritya:</strong> A devotional acrobatic dance performed during Dussehra.{"\n"}• <strong>Pandav Nritya:</strong> A ritual enactment of the Mahabharata, lasting several nights.{"\n"}• <strong>Jhoda/Jhora:</strong> A community chain dance performed in circles.{"\n\n"}<strong className="text-primary">Key Festivals:</strong>{"\n"}• <strong>Harela:</strong> A festival celebrating the onset of monsoon and sowing.{"\n"}• <strong>Ghughutia (Makar Sankranti):</strong> Children wear garlands of fried dough and sing to crows.{"\n"}• <strong>Phool Dei:</strong> Young girls decorate thresholds with flowers and rice paste in spring.{"\n"}• <strong>Nanda Devi Raj Jat:</strong> The great 12-yearly pilgrimage from Nauti to Roopkund.{"\n\n"}The <strong className="text-primary">Ramman Festival</strong> of Saloor-Dungra village in Chamoli, which involves mask performances and ritualistic enactments, was inscribed on UNESCO's <strong className="text-primary">Intangible Cultural Heritage</strong> list in 2009.</>,
          hi: <>उत्तराखंड का सांस्कृतिक जीवन इसके विविध समुदायों और इतिहासों से बुना गया एक जीवंत चित्रपट है।{"\n\n"}<strong className="text-primary">प्रमुख लोक नृत्य:</strong>{"\n"}• <strong>छोलिया:</strong> कुमाऊं से एक युद्ध तलवार नृत्य, शादियों में प्रस्तुत।{"\n"}• <strong>लांगवीर नृत्य:</strong> दशहरे के दौरान प्रस्तुत एक भक्ति कलाबाजी नृत्य।{"\n"}• <strong>पांडव नृत्य:</strong> महाभारत का अनुष्ठानिक अभिनय।{"\n"}• <strong>झोड़ा/झोरा:</strong> वृत्तों में प्रस्तुत एक सामुदायिक श्रृंखला नृत्य।{"\n\n"}<strong className="text-primary">प्रमुख त्यौहार:</strong>{"\n"}• <strong>हरेला:</strong> मानसून और बुवाई की शुरुआत का उत्सव।{"\n"}• <strong>घुघुतिया (मकर संक्रांति):</strong> बच्चे तले हुए आटे की माला पहनते हैं।{"\n"}• <strong>फूल देई:</strong> युवा लड़कियां वसंत में दहलीज को फूलों से सजाती हैं।{"\n"}• <strong>नंदा देवी राज जात:</strong> नौटी से रूपकुंड तक 12-वर्षीय तीर्थयात्रा।{"\n\n"}चमोली में सलूर-डूंगरा गांव का <strong className="text-primary">रम्माण उत्सव</strong> 2009 में यूनेस्को की <strong className="text-primary">अमूर्त सांस्कृतिक विरासत</strong> सूची में अंकित किया गया था।</>
        },
        image: rammanFestivalImg,
        imageAlt: "Ramman Festival UNESCO Heritage"
      },
      {
        title: { en: "Jaunsari-Bawar: A Distinct Cultural Zone", hi: "जौनसारी-बावर: एक विशिष्ट सांस्कृतिक क्षेत्र" },
        content: { 
          en: <>The <strong className="text-primary">Jaunsari-Bawar</strong> region (in present-day Dehradun and Uttarkashi districts) represents a unique cultural pocket within Uttarakhand. The Jaunsari people claim descent from the <strong className="text-primary">Pandavas</strong> and their culture has preserved elements that suggest ancient connections.{"\n\n"}<strong className="text-primary">Distinctive Features:</strong>{"\n"}• <strong>Mahasu Devta:</strong> Worship of the Mahasu deity, a form of Shiva, unique to this region.{"\n"}• <strong>Polyandry:</strong> Historically practiced fraternal polyandry, similar to Himalayan Tibetan cultures.{"\n"}• <strong>Barada Nati:</strong> A large group dance involving entire villages, distinct from other Garhwali dances.{"\n"}• <strong>Architecture:</strong> Traditional houses with wooden balconies and slate roofs, influenced by Tibetan styles.{"\n"}• <strong>Language:</strong> The Jaunsari dialect has elements that distinguish it from mainstream Garhwali.{"\n\n"}The Jaunsari-Bawar region is a fascinating case study in how micro-cultures can preserve distinct identities within a larger region.</>,
          hi: <><strong className="text-primary">जौनसारी-बावर</strong> क्षेत्र (वर्तमान देहरादून और उत्तरकाशी जिलों में) उत्तराखंड के भीतर एक अद्वितीय सांस्कृतिक क्षेत्र का प्रतिनिधित्व करता है। जौनसारी लोग <strong className="text-primary">पांडवों</strong> से वंश का दावा करते हैं।{"\n\n"}<strong className="text-primary">विशिष्ट विशेषताएं:</strong>{"\n"}• <strong>महासू देवता:</strong> महासू देवता की पूजा, शिव का एक रूप, इस क्षेत्र के लिए अद्वितीय।{"\n"}• <strong>बहुपतित्व:</strong> ऐतिहासिक रूप से भ्रातृ बहुपतित्व का अभ्यास।{"\n"}• <strong>बरदा नाटी:</strong> पूरे गांवों को शामिल करने वाला एक बड़ा समूह नृत्य।{"\n"}• <strong>वास्तुकला:</strong> लकड़ी की बालकनियों और स्लेट छतों वाले पारंपरिक घर।{"\n"}• <strong>भाषा:</strong> जौनसारी बोली में ऐसे तत्व हैं जो इसे मुख्यधारा गढ़वाली से अलग करते हैं।{"\n\n"}जौनसारी-बावर क्षेत्र इस बात का एक आकर्षक केस स्टडी है कि कैसे सूक्ष्म-संस्कृतियां एक बड़े क्षेत्र के भीतर विशिष्ट पहचान बनाए रख सकती हैं।</>
        },
        image: jaunsarBawarImg,
        imageAlt: "Jaunsari Bawar Culture"
      }
    ],
    highlights: { 
      en: [
        "Char Dham pilgrimage circuit",
        "Ramman Festival (UNESCO Intangible Heritage)",
        "Chholiya and Langvir traditional dances",
        "Unique Jaunsari-Bawar cultural zone"
      ],
      hi: [
        "चार धाम तीर्थयात्रा मार्ग",
        "रम्माण उत्सव (यूनेस्को अमूर्त विरासत)",
        "छोलिया और लांगवीर पारंपरिक नृत्य",
        "अद्वितीय जौनसारी-बावर सांस्कृतिक क्षेत्र"
      ]
    },
    relatedLinks: [
      { label: "Explore Culture", path: "/culture" },
      { label: "View Gallery", path: "/gallery" },
      { label: "Uttarkashi District", path: "/districts/uttarkashi" }
    ],
    accentColor: "from-cyan-500/5 to-blue-500/5"
  }
];

// Helper function for translations
const t = (obj: { en: React.ReactNode; hi: React.ReactNode }, language: Language): React.ReactNode => obj[language];
const tArray = (obj: { en: string[]; hi: string[] }, language: Language): string[] => obj[language];

// Era Section Component - Archival styling with timeline
function EraSection({
  era,
  language,
  isFirst,
}: {
  era: HistoryEra;
  language: Language;
  isFirst?: boolean;
}) {
  const t = (obj: { en: React.ReactNode; hi: React.ReactNode }): React.ReactNode => obj[language];
  const tArr = (obj: { en: string[]; hi: string[] }): string[] => obj[language];

  // Get insight text from first subsection
  const getInsight = () => {
    if (era.subsections.length > 0) {
      const firstContent = era.subsections[0].content[language];
      if (typeof firstContent === 'object' && 'props' in firstContent) {
        // Extract text content from JSX
        const extractText = (node: React.ReactNode): string => {
          if (typeof node === 'string') return node;
          if (Array.isArray(node)) return node.map(extractText).join('');
          if (node && typeof node === 'object' && 'props' in node) {
            return extractText((node as React.ReactElement).props.children);
          }
          return '';
        };
        const text = extractText(firstContent);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 60);
        return sentences[0]?.trim() || null;
      }
    }
    return null;
  };

  const insight = getInsight();

  return (
    <section 
      id={era.id}
      className="scroll-mt-24 relative"
    >
      {/* Timeline marker */}
      <div className="hidden lg:flex absolute -left-8 top-8 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />
      
      {/* Era Block - Archival Card */}
      <div className="relative bg-muted/20 border border-border/30 rounded-xl overflow-hidden">
        {/* Subtle gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${era.accentColor} opacity-50`} />
        
        {/* Left accent line */}
        <div className="absolute left-0 top-8 bottom-8 w-1 bg-primary/40 rounded-full" />
        
        <div className="relative p-6 md:p-8 lg:p-10">
          {/* Era Header */}
          <header className="mb-8 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary shrink-0">
                {era.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                    {t(era.title)}
                  </h2>
                  <Badge variant="secondary" className="font-normal text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {t(era.period)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-foreground/80 leading-[1.85] text-base md:text-lg max-w-prose">
              {t(era.description)}
            </p>
          </header>

          {/* Historical Insight Callout - Only for first era */}
          {isFirst && insight && (
            <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/60 rounded-r-xl p-6 md:p-8 mb-8 ml-4">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed italic font-serif">
                "{insight}"
              </p>
              <p className="text-sm text-muted-foreground mt-4 font-medium">
                — {language === "en" ? "Historical Insight" : "ऐतिहासिक अंतर्दृष्टि"}
              </p>
            </div>
          )}

          {/* Subsections as Accordion */}
          <div className="pl-4 mb-8">
            <Accordion type="single" collapsible className="space-y-3">
              {era.subsections.map((sub, i) => (
                <AccordionItem 
                  key={i} 
                  value={`${era.id}-${i}`} 
                  className="bg-background/50 border border-border/30 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-3 text-left">
                      <Scroll className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground text-sm md:text-base">
                        {t(sub.title)}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    {sub.image && (
                      <div className="mb-5 rounded-lg overflow-hidden border border-border/20">
                        <img 
                          src={sub.image} 
                          alt={sub.imageAlt || ""} 
                          className="w-full h-48 md:h-56 object-cover"
                          loading="lazy"
                        />
                        {sub.imageAlt && (
                          <p className="text-xs text-muted-foreground py-2 px-3 bg-muted/30 italic">
                            {sub.imageAlt}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="text-foreground/80 leading-[1.85] whitespace-pre-line text-sm md:text-base">
                      {t(sub.content)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Key Highlights */}
          <div className="pl-4 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              {language === "en" ? "Key Highlights" : "मुख्य विशेषताएं"}
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {tArr(era.highlights).map((highlight, i) => (
                <li 
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-foreground/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Related Links - Editorial Style */}
          {era.relatedLinks && era.relatedLinks.length > 0 && (
            <div className="pl-4 pt-6 border-t border-border/30">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {language === "en" ? "Explore Further" : "आगे जानें"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {era.relatedLinks.map((link, i) => (
                  <Link
                    key={i}
                    to={link.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 border border-border/30 text-foreground text-sm font-medium hover:bg-muted hover:border-border/50 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const HistoryPage = () => {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <>
      <Helmet>
        <title>History of Uttarakhand | Devbhoomi Heritage | Hum Pahadi</title>
        <meta 
          name="description" 
          content="Explore the rich history of Uttarakhand from ancient Vedic era to modern statehood. Discover the cultural heritage, royal dynasties, and freedom struggle of Devbhoomi." 
        />
        <meta name="keywords" content="Uttarakhand history, Devbhoomi, Garhwal history, Kumaon history, Katyuri dynasty, Chand dynasty, Char Dham" />
        <link rel="canonical" href="https://humpahadi.com/history" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Archival Hero Section */}
        <header className="relative bg-muted/30 overflow-hidden">
          {/* Background with subtle pattern */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${kedarnathImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
          
          {/* Content */}
          <div className="relative container mx-auto px-4 py-16 md:py-20 lg:py-28">
            {/* Back Link */}
            <nav className="mb-8">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </nav>

            {/* Meta Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Mountain className="h-4 w-4" />
              <span className="text-sm font-medium">
                {language === "en" ? "Devbhoomi Heritage" : "देवभूमि विरासत"}
              </span>
            </div>
            
            {/* Title - Authoritative Serif */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-5 max-w-4xl leading-[1.1] tracking-tight">
              {language === "en" ? "History of Uttarakhand" : "उत्तराखंड का इतिहास"}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              {language === "en" 
                ? <>From ancient roots to the identity of Devbhoomi — <span className="text-foreground font-medium">a journey through time</span></>
                : <>प्राचीन जड़ों से देवभूमि की पहचान तक — <span className="text-foreground font-medium">समय की यात्रा</span></>
              }
            </p>

            {/* Language Toggle */}
            <div className="flex items-center gap-3">
              <Button 
                variant={language === "en" ? "default" : "outline"} 
                size="sm"
                onClick={() => setLanguage("en")}
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                English
              </Button>
              <Button 
                variant={language === "hi" ? "default" : "outline"} 
                size="sm"
                onClick={() => setLanguage("hi")}
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                हिंदी
              </Button>
            </div>
          </div>
        </header>

        {/* Introduction Block - Cultural Insight */}
        <section className="py-12 md:py-16 bg-muted/20 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/60 rounded-r-xl p-6 md:p-8">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                <p className="text-foreground/90 leading-[1.85] text-base md:text-lg">
                  {language === "en" 
                    ? <>Nestled in the lap of the Himalayas, Uttarakhand's history is as majestic as its mountains. Known as <strong className="text-primary">Devbhoomi</strong> (Land of Gods), this sacred land has been a center of spirituality, culture, and resilience for millennia. From prehistoric Lakhudyar rock paintings to the 2000 statehood movement, discover the remarkable journey of a land where the metaphysical concept of Svarga Loka intersects with the rugged physical reality of the central Himalayas.</>
                    : <>हिमालय की गोद में बसा उत्तराखंड का इतिहास उसके पहाड़ों जितना ही भव्य है। <strong className="text-primary">देवभूमि</strong> (देवताओं की भूमि) के रूप में जाना जाने वाला यह पवित्र भूमि सहस्राब्दियों से आध्यात्मिकता, संस्कृति और लचीलेपन का केंद्र रही है। प्रागैतिहासिक लखुड्यार शैल चित्रों से 2000 के राज्य आंदोलन तक, एक ऐसी भूमि की उल्लेखनीय यात्रा की खोज करें जहां स्वर्ग लोक की अवधारणा मध्य हिमालय की कठोर भौतिक वास्तविकता से मिलती है।</>
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - Timeline Layout */}
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              
              {/* Main Timeline Content */}
              <div className="lg:col-span-8">
                <div className="relative">
                  {/* Timeline vertical line - visible on lg */}
                  <div className="hidden lg:block absolute -left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10" />
                  
                  {/* Era Sections */}
                  <div className="space-y-12 lg:space-y-16">
                    {historyEras.map((era, index) => (
                      <EraSection
                        key={era.id}
                        era={era}
                        language={language}
                        isFirst={index === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Quick Reference */}
              <aside className="lg:col-span-4 order-first lg:order-last">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Quick Jump Navigation */}
                  <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <Scroll className="h-4 w-4" />
                        {language === "en" ? "Jump to Era" : "युग पर जाएं"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <nav className="flex flex-col gap-1">
                        {historyEras.map((era) => (
                          <a
                            key={era.id}
                            href={`#${era.id}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <span className="text-muted-foreground group-hover:text-primary transition-colors">
                              {era.icon}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {t(era.title, language)}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {t(era.period, language)}
                              </p>
                            </div>
                          </a>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>

                  {/* Related Content Links */}
                  <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {language === "en" ? "Related Content" : "संबंधित सामग्री"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <Link
                        to="/culture"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {language === "en" ? "Explore Culture" : "संस्कृति देखें"}
                        </span>
                      </Link>
                      <Link
                        to="/districts"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {language === "en" ? "Explore Districts" : "जिले देखें"}
                        </span>
                      </Link>
                      <Link
                        to="/gallery"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <Mountain className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          {language === "en" ? "Photo Gallery" : "फोटो गैलरी"}
                        </span>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Call to Action - Editorial Style */}
        <section className="py-16 md:py-20 bg-muted/20 border-t border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                {language === "en" ? "Explore Uttarakhand's Living Heritage" : "उत्तराखंड की जीवंत विरासत का अन्वेषण करें"}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {language === "en" 
                  ? "Discover the culture, traditions, and beauty that make Uttarakhand truly special."
                  : "उस संस्कृति, परंपराओं और सुंदरता की खोज करें जो उत्तराखंड को वास्तव में विशेष बनाती है।"
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/culture" className="gap-2">
                    <Heart className="h-4 w-4" />
                    {language === "en" ? "Explore Culture" : "संस्कृति देखें"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/districts" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    {language === "en" ? "Explore Districts" : "जिले देखें"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HistoryPage;
