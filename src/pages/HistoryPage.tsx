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
  Footprints
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Language = "en" | "hi";

interface SubSection {
  title: { en: string; hi: string };
  content: { en: React.ReactNode; hi: React.ReactNode };
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
        }
      },
      {
        title: { en: "Kedarkhand & Manaskhand: The Scriptural Geography", hi: "केदारखंड और मानसखंड: शास्त्रीय भूगोल" },
        content: { 
          en: <>In the Puranic tradition, the region was not a single political entity but a dual sacred zone. The <strong className="text-primary">Skanda Purana</strong>, a massive compendium of Hindu mythology, bifurcates the central Himalayas into two distinct segments:{"\n\n"}• <strong className="text-primary">Kedarkhand</strong>: Corresponding to the modern <strong className="text-primary">Garhwal division</strong>, this region was dominated by the cult of Shiva. It derives its name from the <strong className="text-primary">Kedarnath shrine</strong> and is described as the land watered by the <strong className="text-primary">Alaknanda and Bhagirathi</strong>.{"\n\n"}• <strong className="text-primary">Manaskhand</strong>: Corresponding to the modern <strong className="text-primary">Kumaon division</strong>, this area was linked to the pilgrimage route toward <strong className="text-primary">Lake Manasarovar</strong> (Manas). It is also associated with the <strong className="text-primary">Kurma (tortoise) avatar</strong> of Vishnu, believed to have taken place at the <strong className="text-primary">Champawat hill</strong>, giving the region its alternative name, <strong className="text-primary">Kurmanchal</strong>.{"\n\n"}This era also solidified Uttarakhand&apos;s reputation as <strong className="text-primary">Devbhoomi</strong> (Land of Gods). The <strong className="text-primary">Mahabharata</strong> contains explicit references to the <strong className="text-primary">Pandavas</strong> traversing this land during their <strong className="text-primary">Mahaprasthan</strong> (final journey to heaven). The sage <strong className="text-primary">Vyasa</strong> is believed to have composed the epic in the caves of <strong className="text-primary">Mana village</strong> near Badrinath, cementing the region&apos;s status as the intellectual and spiritual fountainhead of <strong className="text-primary">Sanatan Dharma</strong>.</>,
          hi: <>पौराणिक परंपरा में, यह क्षेत्र एक राजनीतिक इकाई नहीं बल्कि एक दोहरा पवित्र क्षेत्र था। <strong className="text-primary">स्कंद पुराण</strong>, हिंदू पौराणिक कथाओं का विशाल संग्रह, मध्य हिमालय को दो अलग-अलग खंडों में विभाजित करता है:{"\n\n"}• <strong className="text-primary">केदारखंड</strong>: आधुनिक <strong className="text-primary">गढ़वाल मंडल</strong> के अनुरूप, यह क्षेत्र शिव के पंथ से प्रभुत्व रखता था। इसका नाम <strong className="text-primary">केदारनाथ मंदिर</strong> से लिया गया है और इसे <strong className="text-primary">अलकनंदा और भागीरथी</strong> द्वारा सिंचित भूमि के रूप में वर्णित किया गया है।{"\n\n"}• <strong className="text-primary">मानसखंड</strong>: आधुनिक <strong className="text-primary">कुमाऊं मंडल</strong> के अनुरूप, यह क्षेत्र <strong className="text-primary">मानसरोवर झील</strong> की तीर्थयात्रा मार्ग से जुड़ा था। यह विष्णु के <strong className="text-primary">कूर्म (कछुआ) अवतार</strong> से भी जुड़ा है।{"\n\n"}इस युग ने उत्तराखंड की <strong className="text-primary">देवभूमि</strong> (देवताओं की भूमि) के रूप में प्रतिष्ठा को भी मजबूत किया। <strong className="text-primary">महाभारत</strong> में <strong className="text-primary">पांडवों</strong> के <strong className="text-primary">महाप्रस्थान</strong> के दौरान इस भूमि को पार करने के स्पष्ट संदर्भ हैं। ऋषि <strong className="text-primary">व्यास</strong> ने बद्रीनाथ के पास <strong className="text-primary">माणा गांव</strong> की गुफाओं में महाकाव्य की रचना की।</>
        }
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
          hi: <>जनजातीय संघों से संगठित राज्य की ओर संक्रमण <strong className="text-primary">कुनिंद राजवंश (दूसरी शताब्दी ई.पू. – तीसरी शताब्दी ई.)</strong> के उदय से चिह्नित है। कुनिंद पहली शक्ति थे जिन्होंने गढ़वाल और कुमाऊं क्षेत्रों को एक राजनीतिक छत्र के तहत एकीकृत किया। उनका क्षेत्र पश्चिम में <strong className="text-primary">सतलुज नदी</strong> से पूर्व में <strong className="text-primary">काली नदी</strong> तक फैला था।{"\n\n"}इस राजवंश के सबसे महत्वपूर्ण शासक <strong className="text-primary">अमोघभूति</strong> थे, जिनका नाम क्षेत्र भर में खोजे गए सुंदर चांदी और तांबे के सिक्कों पर दिखाई देता है। ये सिक्के अमूल्य ऐतिहासिक दस्तावेज हैं; इनमें एक हिरण के साथ <strong className="text-primary">बौद्ध प्रतीक</strong> जैसे स्तूप और <strong className="text-primary">हिंदू प्रतीक</strong> जैसे स्वास्तिक और लक्ष्मी दर्शाए गए हैं। यह एक <strong className="text-primary">समन्वयवादी समाज</strong> का संकेत देता है जहां प्रारंभिक शैव धर्म और बौद्ध धर्म सह-अस्तित्व में थे।</>
        }
      },
      {
        title: { en: "The Ashokan Connection", hi: "अशोक से संबंध" },
        content: { 
          en: <>The discovery of an <strong className="text-primary">Ashokan Rock Edict at Kalsi</strong> (near Dehradun) in <strong className="text-primary">1860</strong> provides definitive proof that the region was within the <strong className="text-primary">Mauryan sphere of influence</strong> as early as the <strong className="text-primary">3rd century BCE</strong>. The edict, inscribed on a massive quartz rock, proclaims <strong className="text-primary">Ashoka&apos;s policy of non-violence and Dhamma</strong>. The location of the edict at the confluence of the <strong className="text-primary">Yamuna and Tons rivers</strong> indicates that this was a strategic gateway to the hills, likely serving as a trade depot and a center for Buddhist missionary activity.{"\n\n"}Following the decline of the Kunindas, the region saw a period of fragmentation. The <strong className="text-primary">Kushanas</strong> and later the <strong className="text-primary">Guptas</strong> exercised nominal suzerainty. The <strong className="text-primary">Allahabad Pillar inscription of Samudragupta</strong> mentions <strong className="text-primary">Kartripura</strong> (identified with the Katyur valley), suggesting that the hill kingdoms paid tribute to the Gupta empire while retaining internal autonomy.</>,
          hi: <><strong className="text-primary">1860</strong> में <strong className="text-primary">कालसी</strong> (देहरादून के पास) में <strong className="text-primary">अशोक शिलालेख</strong> की खोज इस बात का निश्चित प्रमाण देती है कि यह क्षेत्र <strong className="text-primary">तीसरी शताब्दी ई.पू.</strong> में <strong className="text-primary">मौर्य प्रभाव क्षेत्र</strong> में था। एक विशाल क्वार्ट्ज चट्टान पर उत्कीर्ण यह शिलालेख <strong className="text-primary">अशोक की अहिंसा और धम्म की नीति</strong> की घोषणा करता है। <strong className="text-primary">यमुना और टोंस नदियों</strong> के संगम पर शिलालेख का स्थान इंगित करता है कि यह पहाड़ियों का एक रणनीतिक प्रवेश द्वार था।{"\n\n"}कुनिंदों के पतन के बाद, क्षेत्र में विखंडन का दौर आया। <strong className="text-primary">कुषाणों</strong> और बाद में <strong className="text-primary">गुप्तों</strong> ने नाममात्र की अधीनता का प्रयोग किया। <strong className="text-primary">समुद्रगुप्त के इलाहाबाद स्तंभ शिलालेख</strong> में <strong className="text-primary">कार्त्रिपुर</strong> (कत्यूर घाटी से पहचाना गया) का उल्लेख है।</>
        }
      }
    ],
    highlights: { 
      en: [
        "Lakhudyar rock paintings – Mesolithic & Chalcolithic art (Almora)",
        "Kols & Kiratas – Earliest inhabitants of the hills",
        "Kedarkhand (Garhwal) & Manaskhand (Kumaon) – Skanda Purana",
        "Kuninda Dynasty (2nd c. BCE – 3rd c. CE) – First unified kingdom",
        "King Amoghbhuti's coins – Buddhist-Hindu syncretism",
        "Ashokan Rock Edict at Kalsi (3rd century BCE)"
      ],
      hi: [
        "लखुड्यार शैल चित्र – मध्यपाषाण और ताम्रपाषाण कला (अल्मोड़ा)",
        "कोल और किरात – पहाड़ों के सबसे पुराने निवासी",
        "केदारखंड (गढ़वाल) और मानसखंड (कुमाऊं) – स्कंद पुराण",
        "कुनिंद राजवंश (दूसरी सदी ई.पू. – तीसरी सदी ई.) – पहला एकीकृत राज्य",
        "राजा अमोघभूति के सिक्के – बौद्ध-हिंदू समन्वय",
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
      en: "The medieval period in Uttarakhand is characterized by the consolidation of power into localized empires that constructed the architectural and administrative foundations of the region. Three great dynasties shaped this era: the Katyuris, the Chands, and the Panwars (Parmars). This period witnessed the construction of magnificent temples, the flowering of art and culture, and the eventual invasion by the Gorkhas.",
      hi: "उत्तराखंड में मध्यकालीन काल स्थानीय साम्राज्यों में शक्ति के समेकन द्वारा चिह्नित है जिन्होंने क्षेत्र की स्थापत्य और प्रशासनिक नींव का निर्माण किया। तीन महान राजवंशों ने इस युग को आकार दिया: कत्यूरी, चंद और पंवार (परमार)। इस अवधि में भव्य मंदिरों का निर्माण, कला और संस्कृति का विकास, और अंततः गोरखाओं द्वारा आक्रमण देखा गया।"
    },
    subsections: [
      {
        title: { en: "Katyuri Dynasty: The Golden Age (700-1200 CE)", hi: "कत्यूरी राजवंश: स्वर्ण युग (700-1200 ई.)" },
        content: { 
          en: "Often heralded as the 'Golden Era' of Uttarakhand history, the Katyuri Dynasty represents the zenith of early medieval hill civilization. Ruling initially from Joshimath and later shifting their capital to Kartikeyapura (modern-day Baijnath in the Gomti valley), the Katyuris unified Kumaon and Garhwal under a centralized administration.\n\nOrigins and Expansion:\nThe origins of the Katyuris are shrouded in debate. Historian E.T. Atkinson traces them to the Khasas, while others link them to the Kunindas or even migrants from Ayodhya. The dynasty was founded by Vasu Dev (also known as Basdeo), who is credited with initiating the transition from wooden to stone architecture in temple construction. At its peak, the Katyuri empire extended from Nepal in the east to Kabul in the west, a claim supported by the widespread distribution of their architectural style.\n\nArchitectural Legacy:\nThe Katyuris were prolific builders. They are responsible for:\n• The majestic Jageshwar temple complex (near Almora) – one of the twelve Jyotirlingas, featuring over 100 temples built in the Nagara style\n• The Katarmal Sun Temple (9th century) – a rare shrine dedicated to the Sun God, second only to Konark in significance\n\nThe intricate stone carvings and the strategic placement of these temples reveal a society with advanced engineering skills and deep aesthetic sensibilities.\n\nDecline and Fragmentation:\nThe dynasty's decline began in the 11th century, accelerated by the tyrannical rule of later kings like Vir Dev (or Bira Dev). Vir Dev is remembered in folklore as a despot who imposed heavy taxes and forced his subjects into labor (begar). His death triggered a civil war, leading to the fragmentation of the empire into numerous small principalities or thokdaris.",
          hi: "अक्सर उत्तराखंड इतिहास के 'स्वर्ण युग' के रूप में प्रशंसित, कत्यूरी राजवंश प्रारंभिक मध्यकालीन पहाड़ी सभ्यता के शिखर का प्रतिनिधित्व करता है। शुरू में जोशीमठ से और बाद में कार्तिकेयपुर (आधुनिक बैजनाथ, गोमती घाटी में) में राजधानी स्थानांतरित करके, कत्यूरियों ने कुमाऊं और गढ़वाल को केंद्रीकृत प्रशासन के तहत एकीकृत किया।\n\nउत्पत्ति और विस्तार:\nकत्यूरियों की उत्पत्ति बहस में घिरी है। इतिहासकार ई.टी. एटकिंसन उन्हें खसों से जोड़ते हैं। राजवंश की स्थापना वासुदेव (बासदेव) ने की, जिन्हें मंदिर निर्माण में लकड़ी से पत्थर की वास्तुकला में संक्रमण का श्रेय दिया जाता है। अपने चरम पर, कत्यूरी साम्राज्य पूर्व में नेपाल से पश्चिम में काबुल तक फैला था।\n\nस्थापत्य विरासत:\nकत्यूरी विपुल निर्माता थे:\n• भव्य जागेश्वर मंदिर परिसर (अल्मोड़ा के पास) – बारह ज्योतिर्लिंगों में से एक, नागर शैली में निर्मित 100+ मंदिर\n• कटारमल सूर्य मंदिर (9वीं सदी) – सूर्य देव को समर्पित दुर्लभ मंदिर, कोणार्क के बाद दूसरा\n\nपतन और विखंडन:\nराजवंश का पतन 11वीं सदी में शुरू हुआ, वीर देव जैसे बाद के राजाओं के अत्याचारी शासन से त्वरित। वीर देव को लोककथाओं में एक तानाशाह के रूप में याद किया जाता है जिसने भारी कर लगाए और प्रजा को बेगार में मजबूर किया।"
        }
      },
      {
        title: { en: "The Chand Dynasty: Unifiers of Kumaon", hi: "चंद राजवंश: कुमाऊं के एकीकरणकर्ता" },
        content: { 
          en: "Into the power vacuum left by the Katyuris stepped the Chand Dynasty. Founded by Som Chand (reputedly a prince from Kanauj) around the 10th century, the Chands initially established their stronghold in Champawat. Over the next few centuries, they systematically subjugated the local Khasa chieftains and expanded their domain.\n\nStrategic Shift to Almora (1568):\nA defining moment in Kumaoni history occurred in 1568 when King Kalyan Chand moved the capital from Champawat to Almora. This new capital, situated on a ridge, offered better strategic defense and centralized control over the trade routes. The Chands transformed Almora into a cultural and political hub, patronizing the arts and creating the famous 'Pahari School' of painting.\n\nThe Height of Power – Baz Bahadur Chand (1638-1678):\nThe dynasty reached its apogee under Baz Bahadur Chand. A contemporary of the Mughal Emperor Shah Jahan, Baz Bahadur visited the Mughal court and secured recognition for his sovereignty. He led military campaigns into Tibet to secure the salt trade and expanded his kingdom into the fertile Terai region, which became the granary of Kumaon.",
          hi: "कत्यूरियों द्वारा छोड़ी गई शक्ति शून्यता में चंद राजवंश ने कदम रखा। 10वीं शताब्दी के आसपास सोम चंद (कथित रूप से कन्नौज के राजकुमार) द्वारा स्थापित, चंदों ने शुरू में चंपावत में अपना गढ़ स्थापित किया। अगली कुछ शताब्दियों में, उन्होंने व्यवस्थित रूप से स्थानीय खस सरदारों को अधीन किया।\n\nअल्मोड़ा में रणनीतिक स्थानांतरण (1568):\nकुमाऊंनी इतिहास में एक निर्णायक क्षण 1568 में आया जब राजा कल्याण चंद ने राजधानी चंपावत से अल्मोड़ा स्थानांतरित की। एक रिज पर स्थित इस नई राजधानी ने बेहतर रणनीतिक रक्षा और व्यापार मार्गों पर केंद्रीकृत नियंत्रण प्रदान किया। चंदों ने अल्मोड़ा को सांस्कृतिक और राजनीतिक केंद्र में बदल दिया, प्रसिद्ध 'पहाड़ी स्कूल' चित्रकला को संरक्षण दिया।\n\nशक्ति का शिखर – बाज बहादुर चंद (1638-1678):\nराजवंश बाज बहादुर चंद के तहत अपने शिखर पर पहुंचा। मुगल सम्राट शाहजहां के समकालीन, बाज बहादुर ने मुगल दरबार का दौरा किया और अपनी संप्रभुता की मान्यता प्राप्त की। उन्होंने नमक व्यापार सुनिश्चित करने के लिए तिब्बत में सैन्य अभियान चलाए।"
        }
      },
      {
        title: { en: "The Garhwal Kingdom: 52 Garhs & Ajay Pal", hi: "गढ़वाल राज्य: 52 गढ़ और अजय पाल" },
        content: { 
          en: "While the Chands consolidated Kumaon, the Garhwal region remained divided into 52 independent chieftaincies, each ruled from a hilltop fort or Garh (hence the name Garhwal—Land of Forts). The unification of these garhs was the achievement of the Panwar (Parmar) Dynasty.\n\nAjay Pal: The Unifier:\nThe Panwar dynasty was founded by Kanak Pal in the 9th century, but it was the 37th ruler, Ajay Pal (14th/15th century), who transformed it into an empire. Through a combination of military conquest and diplomatic alliances, Ajay Pal subjugated the 52 garhs. He moved his capital from Chandpur Garhi to Devalgarh and finally to Srinagar (on the banks of the Alaknanda), creating a centralized state that mirrored the Chands in Kumaon.\n\nMughal Relations and Independence:\nThe Garhwal kings maintained a fierce independence. In the 17th century, King Prithvi Pat Shah famously granted asylum to Suleiman Shikoh, the fugitive son of Dara Shikoh, defying the wrath of Emperor Aurangzeb. This act of defiance underscored the Garhwal kingdom's sovereignty and its adherence to the code of sharanagat (protecting the refugee).",
          hi: "जबकि चंदों ने कुमाऊं को समेकित किया, गढ़वाल क्षेत्र 52 स्वतंत्र सरदारियों में विभाजित रहा, प्रत्येक पहाड़ी किले या गढ़ से शासित (इसलिए नाम गढ़वाल—किलों की भूमि)। इन गढ़ों का एकीकरण पंवार (परमार) राजवंश की उपलब्धि थी।\n\nअजय पाल: एकीकरणकर्ता:\nपंवार राजवंश की स्थापना 9वीं शताब्दी में कनक पाल ने की, लेकिन 37वें शासक अजय पाल (14वीं/15वीं सदी) ने इसे साम्राज्य में बदल दिया। सैन्य विजय और कूटनीतिक गठबंधनों के संयोजन से, अजय पाल ने 52 गढ़ों को अधीन किया। उन्होंने राजधानी चांदपुर गढ़ी से देवलगढ़ और अंत में श्रीनगर (अलकनंदा के तट पर) स्थानांतरित की।\n\nमुगल संबंध और स्वतंत्रता:\nगढ़वाल के राजाओं ने उग्र स्वतंत्रता बनाए रखी। 17वीं सदी में, राजा पृथ्वी पत शाह ने दारा शिकोह के भगोड़े पुत्र सुलेमान शिकोह को शरण दी, सम्राट औरंगजेब के क्रोध की अवहेलना करते हुए। इसने शरणागत (शरणार्थी की रक्षा) की संहिता के प्रति गढ़वाल राज्य की प्रतिबद्धता को रेखांकित किया।"
        }
      },
      {
        title: { en: "The Gorkha Invasion: Period of Gorkhyani", hi: "गोरखा आक्रमण: गोरख्यानी का काल" },
        content: { 
          en: "The late 18th century brought a cataclysmic shift. The expansionist Gorkha Kingdom of Nepal, seeking to extend its empire, invaded Kumaon in 1790 and annexed it. They then turned their eyes to Garhwal.\n\nIn 1804, the Garhwal King Pradyumna Shah died fighting the Gorkhas at the Battle of Khurbura near Dehradun. This ushered in the era of Gorkhyani—a period of Gorkha rule remembered in local folklore for its brutality, excessive taxation, and the suppression of local freedoms.\n\nFor over a decade, the hills groaned under a military occupation that dismantled the traditional administrative structures of the Chand and Panwar dynasties. The Gorkhyani period represents a dark chapter that would only end with the arrival of the British.",
          hi: "18वीं सदी के अंत में एक विनाशकारी बदलाव आया। विस्तारवादी नेपाल का गोरखा राज्य, अपने साम्राज्य का विस्तार करने की कोशिश में, 1790 में कुमाऊं पर आक्रमण किया और इसे मिला लिया। फिर उन्होंने गढ़वाल की ओर नजर डाली।\n\n1804 में, गढ़वाल के राजा प्रद्युम्न शाह देहरादून के पास खुरबुरा की लड़ाई में गोरखाओं से लड़ते हुए वीरगति को प्राप्त हुए। इसने गोरख्यानी युग की शुरुआत की—गोरखा शासन का एक काल जिसे स्थानीय लोककथाओं में इसकी क्रूरता, अत्यधिक कराधान और स्थानीय स्वतंत्रता के दमन के लिए याद किया जाता है।\n\nएक दशक से अधिक समय तक, पहाड़ियां एक सैन्य कब्जे के तहत कराहती रहीं जिसने चंद और पंवार राजवंशों की पारंपरिक प्रशासनिक संरचनाओं को नष्ट कर दिया। गोरख्यानी काल एक अंधेरे अध्याय का प्रतिनिधित्व करता है।"
        }
      }
    ],
    highlights: { 
      en: [
        "Katyuri Dynasty (700-1200 CE) – Golden Age of temple building",
        "Jageshwar Temple Complex – 100+ temples, one of 12 Jyotirlingas",
        "Katarmal Sun Temple (9th c.) – Second to Konark",
        "Chand Dynasty – Pahari School of painting (Almora)",
        "Baz Bahadur Chand (1638-1678) – Peak of Kumaoni power",
        "Ajay Pal – United 52 Garhs of Garhwal",
        "Gorkha Invasion (1790) – Battle of Khurbura (1804)"
      ],
      hi: [
        "कत्यूरी राजवंश (700-1200 ई.) – मंदिर निर्माण का स्वर्ण युग",
        "जागेश्वर मंदिर परिसर – 100+ मंदिर, 12 ज्योतिर्लिंगों में से एक",
        "कटारमल सूर्य मंदिर (9वीं सदी) – कोणार्क के बाद दूसरा",
        "चंद राजवंश – पहाड़ी चित्रकला स्कूल (अल्मोड़ा)",
        "बाज बहादुर चंद (1638-1678) – कुमाऊंनी शक्ति का शिखर",
        "अजय पाल – गढ़वाल के 52 गढ़ों का एकीकरण",
        "गोरखा आक्रमण (1790) – खुरबुरा की लड़ाई (1804)"
      ]
    },
    relatedLinks: [
      { label: "Almora District", path: "/districts" },
      { label: "Garhwal Region", path: "/districts" }
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
      en: "The arrival of the British in the early 19th century fundamentally altered the trajectory of Uttarakhand's history. Initially welcomed as liberators from Gorkha rule, the British soon established a colonial administration that integrated the hills into the global imperial economy while simultaneously alienating the local population from their natural resources.",
      hi: "19वीं सदी की शुरुआत में अंग्रेजों के आगमन ने उत्तराखंड के इतिहास की दिशा को मौलिक रूप से बदल दिया। शुरू में गोरखा शासन से मुक्तिदाता के रूप में स्वागत किए गए, अंग्रेजों ने जल्द ही एक औपनिवेशिक प्रशासन स्थापित किया जिसने पहाड़ियों को वैश्विक साम्राज्यिक अर्थव्यवस्था में एकीकृत किया जबकि स्थानीय आबादी को उनके प्राकृतिक संसाधनों से अलग कर दिया।"
    },
    subsections: [
      {
        title: { en: "Anglo-Nepalese War & Treaty of Sugauli (1816)", hi: "एंग्लो-नेपाली युद्ध और सुगौली संधि (1816)" },
        content: { 
          en: "The British East India Company, eyeing the lucrative trans-Himalayan trade routes to Tibet and the vast timber resources of the lower Himalayas, found themselves in conflict with the expanding Gorkha empire. The Anglo-Nepalese War (1814–1816) was a fierce conflict fought across the Himalayan frontier.\n\nThe Treaty of Sugauli (1816):\nThe war concluded with the signing of the Treaty of Sugauli in 1816, which redrew the map of the region:\n• The Gorkhas ceded the territories of Kumaon and Garhwal to the British\n• The British retained direct control over Kumaon and the eastern part of Garhwal (Pauri), forming the administrative unit of British Garhwal\n• The western part of Garhwal (Tehri) was restored to Sudarshan Shah (son of the fallen Pradyumna Shah), creating the Princely State of Tehri Garhwal that remained semi-independent until 1949",
          hi: "ब्रिटिश ईस्ट इंडिया कंपनी, तिब्बत के लाभदायक ट्रांस-हिमालयी व्यापार मार्गों और निचले हिमालय के विशाल लकड़ी संसाधनों पर नजर रखते हुए, विस्तारवादी गोरखा साम्राज्य के साथ संघर्ष में पड़ गई। एंग्लो-नेपाली युद्ध (1814-1816) हिमालयी सीमा पर लड़ा गया एक भयंकर संघर्ष था।\n\nसुगौली की संधि (1816):\nयुद्ध 1816 में सुगौली की संधि पर हस्ताक्षर के साथ समाप्त हुआ, जिसने क्षेत्र का नक्शा फिर से बनाया:\n• गोरखाओं ने कुमाऊं और गढ़वाल के क्षेत्र अंग्रेजों को सौंप दिए\n• अंग्रेजों ने कुमाऊं और गढ़वाल के पूर्वी भाग (पौड़ी) पर सीधा नियंत्रण बनाए रखा, ब्रिटिश गढ़वाल की प्रशासनिक इकाई बनाई\n• गढ़वाल का पश्चिमी भाग (टिहरी) सुदर्शन शाह (प्रद्युम्न शाह के पुत्र) को बहाल किया गया, टिहरी गढ़वाल रियासत बनाई जो 1949 तक अर्ध-स्वतंत्र रही"
        }
      },
      {
        title: { en: "British Administration & Infrastructure", hi: "ब्रिटिश प्रशासन और बुनियादी ढांचा" },
        content: { 
          en: "British rule in Uttarakhand was distinct from the plains; it was designated as a 'Non-Regulation' province, meaning the standard laws of the Bengal Presidency did not apply, giving the local Commissioners immense discretionary power.\n\nThe Era of Commissioners:\nAdministrators like G.W. Traill and J.H. Batten focused on land settlements, attempting to codify the complex land tenure systems of the hills. The most legendary figure was Sir Henry Ramsay (Commissioner from 1856–1884), known as the 'King of Kumaon.' Ramsay was a benevolent despot who introduced potato cultivation, built canals, and managed the region with a deep understanding of local customs.\n\nRailways and Urbanization:\nThe British integrated the hills into the imperial infrastructure:\n• Railway reached Haridwar (1886) and Dehradun (1900)\n• Dehradun transformed into a major timber depot and urban center\n• Hill stations of Mussoorie, Nainital, and Ranikhet were developed as summer retreats\n• European architecture and convent education introduced",
          hi: "उत्तराखंड में ब्रिटिश शासन मैदानों से अलग था; इसे 'गैर-विनियमन' प्रांत के रूप में नामित किया गया, जिसका अर्थ था बंगाल प्रेसीडेंसी के मानक कानून लागू नहीं होते थे, जिससे स्थानीय आयुक्तों को अत्यधिक विवेकाधीन शक्ति मिली।\n\nआयुक्तों का युग:\nजी.डब्ल्यू. ट्रेल और जे.एच. बैटन जैसे प्रशासकों ने भूमि बंदोबस्त पर ध्यान केंद्रित किया। सबसे प्रसिद्ध व्यक्ति सर हेनरी रामसे (1856-1884 तक आयुक्त) थे, जिन्हें 'कुमाऊं का राजा' कहा जाता था। रामसे एक परोपकारी तानाशाह थे जिन्होंने आलू की खेती शुरू की, नहरें बनाईं।\n\nरेलवे और शहरीकरण:\n• रेलवे हरिद्वार (1886) और देहरादून (1900) पहुंची\n• देहरादून एक प्रमुख लकड़ी डिपो और शहरी केंद्र में बदल गया\n• मसूरी, नैनीताल और रानीखेत के हिल स्टेशन ग्रीष्मकालीन विश्राम स्थलों के रूप में विकसित\n• यूरोपीय वास्तुकला और कॉन्वेंट शिक्षा की शुरुआत"
        }
      },
      {
        title: { en: "Forest Rights & Resistance", hi: "वन अधिकार और प्रतिरोध" },
        content: { 
          en: "While infrastructure brought modernization, British forest policy brought impoverishment. The colonial state viewed the Himalayan forests as a commercial resource for railway sleepers and revenue, rather than a community asset.\n\nDraconian Forest Laws:\nThe Indian Forest Acts of 1865, 1878, and 1927 systematically stripped villagers of their traditional rights to grazing, fuel, and fodder. The forests were demarcated into 'Reserved' and 'Protected,' turning the local inhabitants into trespassers on their own ancestral lands.\n\nThe Coolie Begar Movement (1921):\nThe resentment against colonial exploitation culminated in the movement against Coolie Begar—a system of forced labor where locals were compelled to carry loads for British officials without payment.\n\nOn January 14, 1921, at the Uttarayani fair in Bageshwar, thousands of villagers led by Badri Datt Pandey took a solemn oath at the confluence of the Saryu and Gomti rivers. They threw the official registers of forced labor into the river, effectively ending the practice.\n\nBadri Datt Pandey earned the title 'Kumaon Kesari' (Lion of Kumaon) for this non-violent victory, which Mahatma Gandhi famously described as a 'bloodless revolution.'\n\nThis period also sowed the seeds of environmental activism. The resistance to British forest management was the precursor to the post-independence Chipko Movement of the 1970s, establishing a century-long tradition of grassroots environmentalism in Uttarakhand.",
          hi: "जबकि बुनियादी ढांचे ने आधुनिकीकरण लाया, ब्रिटिश वन नीति ने गरीबी लाई। औपनिवेशिक राज्य ने हिमालयी जंगलों को समुदाय की संपत्ति के बजाय रेलवे स्लीपरों और राजस्व के लिए वाणिज्यिक संसाधन के रूप में देखा।\n\nकठोर वन कानून:\n1865, 1878 और 1927 के भारतीय वन अधिनियमों ने व्यवस्थित रूप से ग्रामीणों से चराई, ईंधन और चारे के पारंपरिक अधिकार छीन लिए। जंगलों को 'आरक्षित' और 'संरक्षित' में विभाजित किया गया, स्थानीय निवासियों को उनकी पैतृक भूमि पर अतिचारी बना दिया।\n\nकुली बेगार आंदोलन (1921):\nऔपनिवेशिक शोषण के खिलाफ आक्रोश कुली बेगार के खिलाफ आंदोलन में परिणत हुआ—जबरन मजदूरी की एक प्रणाली जहां स्थानीय लोगों को बिना भुगतान के ब्रिटिश अधिकारियों के लिए बोझ ढोने के लिए मजबूर किया जाता था।\n\n14 जनवरी 1921 को, बागेश्वर के उत्तरायणी मेले में, बद्री दत्त पांडे के नेतृत्व में हजारों ग्रामीणों ने सरयू और गोमती नदियों के संगम पर गंभीर शपथ ली। उन्होंने बेगार के सरकारी रजिस्टरों को नदी में फेंक दिया।\n\nबद्री दत्त पांडे ने इस अहिंसक जीत के लिए 'कुमाऊं केसरी' की उपाधि अर्जित की, जिसे महात्मा गांधी ने 'रक्तहीन क्रांति' बताया।\n\nयह अवधि पर्यावरण सक्रियता के बीज भी बोई। ब्रिटिश वन प्रबंधन के खिलाफ प्रतिरोध स्वतंत्रता के बाद 1970 के दशक के चिपको आंदोलन का अग्रदूत था।"
        }
      }
    ],
    highlights: { 
      en: [
        "Treaty of Sugauli (1816) – End of Gorkha rule",
        "British Garhwal & Tehri Garhwal (Princely State) formed",
        "Sir Henry Ramsay – 'King of Kumaon' (1856-1884)",
        "Railways: Haridwar (1886), Dehradun (1900)",
        "Hill stations: Mussoorie, Nainital, Ranikhet developed",
        "Indian Forest Acts (1865, 1878, 1927) – Loss of forest rights",
        "Coolie Begar Movement (Jan 14, 1921) – 'Bloodless Revolution'",
        "Badri Datt Pandey – 'Kumaon Kesari'"
      ],
      hi: [
        "सुगौली की संधि (1816) – गोरखा शासन का अंत",
        "ब्रिटिश गढ़वाल और टिहरी गढ़वाल (रियासत) का गठन",
        "सर हेनरी रामसे – 'कुमाऊं के राजा' (1856-1884)",
        "रेलवे: हरिद्वार (1886), देहरादून (1900)",
        "हिल स्टेशन: मसूरी, नैनीताल, रानीखेत विकसित",
        "भारतीय वन अधिनियम (1865, 1878, 1927) – वन अधिकारों की हानि",
        "कुली बेगार आंदोलन (14 जनवरी 1921) – 'रक्तहीन क्रांति'",
        "बद्री दत्त पांडे – 'कुमाऊं केसरी'"
      ]
    },
    relatedLinks: [
      { label: "Mussoorie", path: "/districts" },
      { label: "Nainital", path: "/districts" },
      { label: "Dehradun", path: "/districts" }
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
      en: "The creation of Uttarakhand on November 9, 2000, was not merely an administrative reorganization; it was the culmination of a century-long struggle for identity, dignity, and self-governance. The movement was driven by the realization that the development model of the plains failed the unique needs of the hills.",
      hi: "9 नवंबर 2000 को उत्तराखंड का निर्माण केवल प्रशासनिक पुनर्गठन नहीं था; यह पहचान, सम्मान और स्व-शासन के लिए एक शताब्दी लंबे संघर्ष की परिणति थी। यह आंदोलन इस एहसास से प्रेरित था कि मैदानों का विकास मॉडल पहाड़ों की अनूठी जरूरतों को पूरा करने में विफल रहा।"
    },
    subsections: [
      {
        title: { en: "Roots of the Demand (1938-1990)", hi: "मांग की जड़ें (1938-1990)" },
        content: { 
          en: "The articulation of a separate hill identity began as early as 1938, at a special session of the Indian National Congress in Srinagar (Garhwal). Pandit Jawaharlal Nehru acknowledged the unique culture of the region, and local leader Sridev Suman advocated for the distinct needs of the Himalayan people. However, after independence, the region remained merged with Uttar Pradesh.\n\nFor decades, the hills suffered from 'internal colonization.' Resources like water, timber, and electricity were extracted to feed the plains, while the hill districts remained underdeveloped, leading to mass migration—the so-called 'money-order economy' where men worked in the plains and sent money home.\n\nUttarakhand Kranti Dal (UKD) – 1979:\nThe formation of the Uttarakhand Kranti Dal (UKD) in 1979 in Mussoorie marked the institutionalization of the statehood demand. Led by Indramani Badoni (often called the 'Gandhi of Uttarakhand'), the UKD began to mobilize the masses through peaceful protests and awareness campaigns.",
          hi: "एक अलग पहाड़ी पहचान की अभिव्यक्ति 1938 में श्रीनगर (गढ़वाल) में भारतीय राष्ट्रीय कांग्रेस के विशेष सत्र में शुरू हुई। पंडित जवाहरलाल नेहरू ने क्षेत्र की अनूठी संस्कृति को स्वीकार किया, और स्थानीय नेता श्रीदेव सुमन ने हिमालयी लोगों की विशेष जरूरतों की वकालत की। हालांकि, स्वतंत्रता के बाद, यह क्षेत्र उत्तर प्रदेश में विलय रहा।\n\nदशकों तक, पहाड़ियों ने 'आंतरिक उपनिवेशवाद' झेला। पानी, लकड़ी और बिजली जैसे संसाधन मैदानों को खिलाने के लिए निकाले गए, जबकि पहाड़ी जिले अविकसित रहे, जिससे बड़े पैमाने पर पलायन हुआ—'मनी-ऑर्डर अर्थव्यवस्था' जहां पुरुष मैदानों में काम करते और घर पैसे भेजते।\n\nउत्तराखंड क्रांति दल (यूकेडी) – 1979:\n1979 में मसूरी में उत्तराखंड क्रांति दल (यूकेडी) का गठन राज्य की मांग के संस्थागतकरण को चिह्नित करता है। इंद्रमणि बडोनी (अक्सर 'उत्तराखंड के गांधी' कहे जाते हैं) के नेतृत्व में, यूकेडी ने शांतिपूर्ण विरोध प्रदर्शनों के माध्यम से जनता को एकजुट करना शुरू किया।"
        }
      },
      {
        title: { en: "The Turning Point: 1994 Tragedy", hi: "निर्णायक मोड़: 1994 की त्रासदी" },
        content: { 
          en: "The movement remained largely peaceful until 1994, when the Uttar Pradesh government's decision to implement the Mandal Commission's 27% reservation for OBCs sparked outrage in the hills. With an OBC population of less than 2%, the hill people feared that such quotas would deny them access to government jobs and education—their only avenues for social mobility.\n\nWhat began as an anti-reservation protest quickly morphed into a struggle for statehood. The slogan 'Koda-Jhangora Khayenge, Uttarakhand Banayenge' (We will eat coarse grains, but we will create Uttarakhand) echoed across the valleys.\n\nKey Events of the 1994 Agitation:\n\n• Khatima Firing (September 1, 1994): Police opened fire on peaceful protestors in Khatima, killing seven people. This event ignited the entire region.\n\n• Mussoorie Firing (September 2, 1994): In protest against the Khatima killings, a gathering in Mussoorie was fired upon. Six people, including a police officer and two women (Hansa Dhanai and Belmati Chauhan), were killed.\n\n• Rampur Tiraha Incident (October 2, 1994): The darkest night of the movement. Thousands of agitators traveling to Delhi to stage a sit-in at Raj Ghat were stopped at the Rampur Tiraha check post in Muzaffarnagar. The police opened fire, killing six activists, and committed mass sexual violence against women protestors. This atrocity shocked the conscience of the nation and made the formation of the state inevitable.",
          hi: "आंदोलन 1994 तक काफी हद तक शांतिपूर्ण रहा, जब उत्तर प्रदेश सरकार द्वारा मंडल आयोग के 27% ओबीसी आरक्षण को लागू करने के फैसले ने पहाड़ियों में आक्रोश पैदा किया। 2% से कम ओबीसी आबादी के साथ, पहाड़ी लोगों को डर था कि ऐसे कोटा उन्हें सरकारी नौकरियों और शिक्षा—सामाजिक गतिशीलता के उनके एकमात्र रास्ते—से वंचित कर देंगे।\n\nजो आरक्षण-विरोधी विरोध प्रदर्शन के रूप में शुरू हुआ, वह जल्दी ही राज्य के लिए संघर्ष में बदल गया। नारा 'कोड़ा-झंगोरा खाएंगे, उत्तराखंड बनाएंगे' घाटियों में गूंज उठा।\n\n1994 आंदोलन की प्रमुख घटनाएं:\n\n• खटीमा गोलीकांड (1 सितंबर 1994): पुलिस ने खटीमा में शांतिपूर्ण प्रदर्शनकारियों पर गोलियां चलाईं, जिसमें सात लोग मारे गए।\n\n• मसूरी गोलीकांड (2 सितंबर 1994): खटीमा हत्याओं के विरोध में मसूरी में एक जमावड़े पर गोलियां चलाई गईं। एक पुलिस अधिकारी और दो महिलाओं (हंसा धनाई और बेलमती चौहान) सहित छह लोग मारे गए।\n\n• रामपुर तिराहा कांड (2 अक्टूबर 1994): आंदोलन की सबसे काली रात। राजघाट पर धरना देने दिल्ली जा रहे हजारों आंदोलनकारियों को मुजफ्फरनगर में रामपुर तिराहा चेक पोस्ट पर रोक दिया गया। पुलिस ने गोलियां चलाईं, छह कार्यकर्ताओं को मार डाला, और महिला प्रदर्शनकारियों के खिलाफ सामूहिक यौन हिंसा की। इस अत्याचार ने राष्ट्र की अंतरात्मा को झकझोर दिया।"
        }
      },
      {
        title: { en: "Birth of the State (November 9, 2000)", hi: "राज्य का जन्म (9 नवंबर 2000)" },
        content: { 
          en: "The sustained agitation and the undeniable distinctness of the region forced the central government to act. The Uttar Pradesh Reorganization Bill was passed, and on November 9, 2000, the state was officially formed as the 27th state of the Indian Union.\n\nInitially named 'Uttaranchal' by the central government (a name viewed by many as a political imposition that diluted the region's history), the state was officially renamed 'Uttarakhand' in January 2007. This change was a symbolic victory, reclaiming the ancient Puranic identity of the land as mentioned in the Skanda Purana.\n\nThe state capital was established at Dehradun, with Gairsain later declared as the summer capital, fulfilling a long-standing demand for a capital within the hill region.",
          hi: "निरंतर आंदोलन और क्षेत्र की निर्विवाद विशिष्टता ने केंद्र सरकार को कार्रवाई करने के लिए मजबूर किया। उत्तर प्रदेश पुनर्गठन विधेयक पारित हुआ, और 9 नवंबर 2000 को भारतीय संघ के 27वें राज्य के रूप में आधिकारिक रूप से राज्य का गठन हुआ।\n\nकेंद्र सरकार द्वारा शुरू में 'उत्तरांचल' नाम दिया गया (एक नाम जिसे कई लोगों ने राजनीतिक थोपा हुआ माना जो क्षेत्र के इतिहास को कमजोर करता है), राज्य का जनवरी 2007 में आधिकारिक रूप से 'उत्तराखंड' नाम बदल दिया गया। यह परिवर्तन स्कंद पुराण में उल्लिखित भूमि की प्राचीन पौराणिक पहचान को पुनः प्राप्त करने वाली प्रतीकात्मक जीत थी।\n\nराज्य की राजधानी देहरादून में स्थापित की गई, बाद में गैरसैंण को ग्रीष्मकालीन राजधानी घोषित किया गया, जो पहाड़ी क्षेत्र के भीतर राजधानी की लंबे समय से चली आ रही मांग को पूरा करता है।"
        }
      }
    ],
    highlights: { 
      en: [
        "1938 – First articulation of separate hill identity (Srinagar Congress)",
        "Sridev Suman – Early advocate for hill autonomy",
        "1979 – Uttarakhand Kranti Dal formed (Mussoorie)",
        "Indramani Badoni – 'Gandhi of Uttarakhand'",
        "'Koda-Jhangora Khayenge, Uttarakhand Banayenge' – Movement slogan",
        "Khatima Firing (Sept 1, 1994) – 7 killed",
        "Mussoorie Firing (Sept 2, 1994) – 6 killed",
        "Rampur Tiraha (Oct 2, 1994) – Darkest night of the movement",
        "November 9, 2000 – 27th State of India formed",
        "January 2007 – Renamed from Uttaranchal to Uttarakhand"
      ],
      hi: [
        "1938 – अलग पहाड़ी पहचान की पहली अभिव्यक्ति (श्रीनगर कांग्रेस)",
        "श्रीदेव सुमन – पहाड़ी स्वायत्तता के प्रारंभिक समर्थक",
        "1979 – उत्तराखंड क्रांति दल गठित (मसूरी)",
        "इंद्रमणि बडोनी – 'उत्तराखंड के गांधी'",
        "'कोड़ा-झंगोरा खाएंगे, उत्तराखंड बनाएंगे' – आंदोलन का नारा",
        "खटीमा गोलीकांड (1 सितंबर 1994) – 7 शहीद",
        "मसूरी गोलीकांड (2 सितंबर 1994) – 6 शहीद",
        "रामपुर तिराहा (2 अक्टूबर 1994) – आंदोलन की सबसे काली रात",
        "9 नवंबर 2000 – भारत का 27वां राज्य गठित",
        "जनवरी 2007 – उत्तरांचल से उत्तराखंड नाम बदला"
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
      en: "The history of Uttarakhand is not confined to textbooks; it lives on in the languages, festivals, and spiritual practices of its people. The geographical isolation of the deep valleys has allowed for the preservation of ancient traditions that have vanished elsewhere in the subcontinent.",
      hi: "उत्तराखंड का इतिहास पाठ्यपुस्तकों तक सीमित नहीं है; यह भाषाओं, त्योहारों और आध्यात्मिक प्रथाओं में जीवित है। गहरी घाटियों के भौगोलिक अलगाव ने प्राचीन परंपराओं के संरक्षण की अनुमति दी है जो उपमहाद्वीप में कहीं और गायब हो गई हैं।"
    },
    subsections: [
      {
        title: { en: "Languages of the Hills", hi: "पहाड़ों की भाषाएं" },
        content: { 
          en: "The linguistic landscape of Uttarakhand is dominated by two major languages: Garhwali and Kumaoni. Both belong to the Central Pahari group of Indo-Aryan languages and evolved from Khasa-Prakrit and Sanskrit.\n\n• Kumaoni: Spoken in the eastern division, it has several dialects including Khasparjia, Johari, and Danpuriya. It has a rich oral tradition of ballads and folk tales.\n\n• Garhwali: Spoken in the western division, it too has numerous regional variations reflecting the diverse geography of the region.\n\n• Jaunsari: Spoken in the Jaunsar-Bawar region of Dehradun, Jaunsari is distinct from the other two, retaining strong ties to Western Pahari dialects and the specific cultural context of the Mahasu deity worship.\n\nStatus: While these languages are the carriers of the region's folklore (Jagars—ritualistic songs invoking deities), they face challenges from the increasing dominance of Hindi in education and media.",
          hi: "उत्तराखंड का भाषाई परिदृश्य दो प्रमुख भाषाओं से प्रभुत्व रखता है: गढ़वाली और कुमाऊनी। दोनों इंडो-आर्यन भाषाओं के मध्य पहाड़ी समूह से संबंधित हैं और खस-प्राकृत और संस्कृत से विकसित हुई हैं।\n\n• कुमाऊनी: पूर्वी मंडल में बोली जाती है, इसमें खसपरजिया, जोहारी और दानपुरिया सहित कई बोलियां हैं। इसमें गाथाओं और लोककथाओं की समृद्ध मौखिक परंपरा है।\n\n• गढ़वाली: पश्चिमी मंडल में बोली जाती है, इसमें भी क्षेत्र की विविध भूगोल को दर्शाती कई क्षेत्रीय विविधताएं हैं।\n\n• जौनसारी: देहरादून के जौनसार-बावर क्षेत्र में बोली जाती है, जौनसारी अन्य दो से अलग है, पश्चिमी पहाड़ी बोलियों और महासू देवता पूजा के विशिष्ट सांस्कृतिक संदर्भ से मजबूत संबंध बनाए रखती है।\n\nस्थिति: जबकि ये भाषाएं क्षेत्र की लोककथाओं (जागर—देवताओं का आह्वान करने वाले अनुष्ठानिक गीत) की वाहक हैं, वे शिक्षा और मीडिया में हिंदी के बढ़ते प्रभुत्व से चुनौतियों का सामना करती हैं।"
        }
      },
      {
        title: { en: "Jaunsar-Bawar: A Unique Cultural Pocket", hi: "जौनसार-बावर: एक अनूठी सांस्कृतिक पहचान" },
        content: { 
          en: "The Jaunsar-Bawar region offers a fascinating glimpse into a distinct cultural pocket that claims lineage from the Mahabharata.\n\nMahasu Devta:\nThe supreme deity of the Jaunsaris is Mahasu (a collective of four brother deities: Bashik, Pavasi, Boothia, and Chalda). Mahasu acts not just as a god but as a living judicial authority—disputes in the community are brought before his oracle (mali), who delivers verdicts believed to be divinely inspired.\n\nThe region maintains unique traditions:\n• Practice of polyandry (fraternal) in some areas, linked to the Pandava legend\n• Distinct architectural style with intricately carved wooden houses\n• Annual Mahasu temple fairs that unite the community\n• Nature worship and ancestral deity veneration\n\nThis region represents a living anthropological treasure, preserving social customs that provide insight into ancient Indo-Aryan practices.",
          hi: "जौनसार-बावर क्षेत्र एक अलग सांस्कृतिक पहचान की आकर्षक झलक प्रदान करता है जो महाभारत से वंश का दावा करती है।\n\nमहासू देवता:\nजौनसारियों के सर्वोच्च देवता महासू हैं (चार भाई देवताओं का सामूहिक: बाशिक, पावासी, बूठिया और चल्दा)। महासू न केवल एक देवता के रूप में बल्कि एक जीवित न्यायिक प्राधिकरण के रूप में कार्य करते हैं—समुदाय में विवाद उनके ओरेकल (माली) के सामने लाए जाते हैं, जो दैवीय रूप से प्रेरित माने जाने वाले फैसले देता है।\n\nक्षेत्र अद्वितीय परंपराएं बनाए रखता है:\n• कुछ क्षेत्रों में बहुपतित्व (भ्रातृ) की प्रथा, पांडव किंवदंती से जुड़ी\n• जटिल नक्काशीदार लकड़ी के घरों के साथ विशिष्ट वास्तुकला शैली\n• वार्षिक महासू मंदिर मेले जो समुदाय को एकजुट करते हैं\n• प्रकृति पूजा और पूर्वज देवता आराधना\n\nयह क्षेत्र एक जीवित मानवशास्त्रीय खजाने का प्रतिनिधित्व करता है।"
        }
      },
      {
        title: { en: "Living Heritage: Performance Arts", hi: "जीवंत विरासत: प्रदर्शन कलाएं" },
        content: { 
          en: "The history of Uttarakhand is encoded in its performance arts, which blend martial traditions with agricultural gratitude.\n\nRamman (UNESCO Intangible Heritage – 2009):\nCelebrated in the twin villages of Saloor-Dungra in Chamoli, Ramman is a ritual theater dedicated to Bhumiyal Devta. Held annually in late April, it involves masked dances that enact episodes from the Ramayana and local legends. It is a unique community event where social roles, history, and spirituality are reenacted, and it was inscribed on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity in 2009.\n\nChholiya Dance:\nOriginating in the Kumaon region, Chholiya is a martial sword dance with a history of over a thousand years. It dates back to the Khasa and Chand eras when marriages were often performed at sword-point (bride capture). Today, it is an auspicious part of wedding processions, where male dancers in traditional warrior attire (with swords and shields) perform acrobatic feats to the beat of dhol and turri. It symbolizes protection from evil spirits and preserves the martial history of the Kumaoni Rajput clans.\n\nNanda Devi Raj Jaat:\nThis is one of the most significant pilgrimages in the state, often called the 'Himalayan Mahakumbh.' Taking place once every 12 years, it celebrates the journey of Goddess Nanda Devi (the patron deity of Uttarakhand) from her maternal home to her husband Shiva's abode in Kailash. The three-week barefoot journey covers 280 kilometers across difficult terrain, unifying the entire Garhwal and Kumaon regions in a single spiritual bond. The next Raj Jaat is a major cultural event that draws pilgrims from across India.",
          hi: "उत्तराखंड का इतिहास इसकी प्रदर्शन कलाओं में एन्कोड है, जो युद्ध परंपराओं को कृषि कृतज्ञता के साथ मिलाती हैं।\n\nरम्माण (यूनेस्को अमूर्त विरासत – 2009):\nचमोली के जुड़वां गांवों सलूर-डुंगरा में मनाया जाने वाला, रम्माण भूमियाल देवता को समर्पित एक अनुष्ठानिक नाटक है। अप्रैल के अंत में प्रतिवर्ष आयोजित, इसमें मुखौटा नृत्य शामिल हैं जो रामायण और स्थानीय किंवदंतियों के प्रसंगों का अभिनय करते हैं। 2009 में इसे यूनेस्को की मानवता की अमूर्त सांस्कृतिक विरासत की प्रतिनिधि सूची में अंकित किया गया।\n\nछोलिया नृत्य:\nकुमाऊं क्षेत्र में उत्पन्न, छोलिया एक हजार वर्षों से अधिक के इतिहास वाला युद्ध तलवार नृत्य है। यह खस और चंद युगों से है जब विवाह अक्सर तलवार की नोक पर (दुल्हन का अपहरण) किए जाते थे। आज, यह विवाह जुलूसों का शुभ हिस्सा है, जहां पारंपरिक योद्धा पोशाक (तलवार और ढाल के साथ) में पुरुष नर्तक ढोल और तुर्री की ताल पर कलाबाजी करते हैं।\n\nनंदा देवी राज जात:\nयह राज्य की सबसे महत्वपूर्ण तीर्थयात्राओं में से एक है, जिसे अक्सर 'हिमालयी महाकुंभ' कहा जाता है। हर 12 साल में एक बार होने वाली, यह देवी नंदा देवी (उत्तराखंड की आराध्य देवी) की उनके मायके से उनके पति शिव के कैलाश निवास तक की यात्रा का उत्सव है। तीन सप्ताह की नंगे पैर यात्रा कठिन इलाके में 280 किलोमीटर की दूरी तय करती है।"
        }
      },
      {
        title: { en: "Temple Architecture & Char Dham Economy", hi: "मंदिर स्थापत्य और चार धाम अर्थव्यवस्था" },
        content: { 
          en: "History in Uttarakhand is etched in stone. The evolution of temple architecture tells a story of adaptation to the seismic and climatic reality of the Himalayas:\n\n• Nagara Style: Classical temple architecture used by the Katyuris (Jageshwar, Baijnath)\n• Koti Banal Style: Indigenous, earthquake-resistant construction using wood and stone layers, developed in response to the Himalayan seismic activity\n\nThe Char Dham Economy:\nThe Char Dham (Yamunotri, Gangotri, Kedarnath, Badrinath) are not merely religious sites; they are historical economic hubs that have sustained a 'yatra economy' for millennia. This pilgrimage circuit links the remote Himalayan villages to the wealth and devotion of the Indian plains.\n\nThe temples have been destroyed and rebuilt multiple times—Kedarnath most recently devastated by the 2013 floods—yet they continue to draw millions of pilgrims annually. The yatra season (May-November) remains the economic lifeline of thousands of families involved in hospitality, porterage, and religious services.\n\nThis living heritage demonstrates how spirituality, economics, and history are inextricably woven in Uttarakhand's identity as Devbhoomi—the Land of Gods.",
          hi: "उत्तराखंड में इतिहास पत्थर में उकेरा गया है। मंदिर स्थापत्य का विकास हिमालय की भूकंपीय और जलवायु वास्तविकता के अनुकूलन की कहानी बताता है:\n\n• नागर शैली: कत्यूरियों द्वारा उपयोग की जाने वाली शास्त्रीय मंदिर वास्तुकला (जागेश्वर, बैजनाथ)\n• कोटी बनाल शैली: लकड़ी और पत्थर की परतों का उपयोग करके स्वदेशी, भूकंप-रोधी निर्माण, हिमालयी भूकंपीय गतिविधि के जवाब में विकसित\n\nचार धाम अर्थव्यवस्था:\nचार धाम (यमुनोत्री, गंगोत्री, केदारनाथ, बद्रीनाथ) केवल धार्मिक स्थल नहीं हैं; वे ऐतिहासिक आर्थिक केंद्र हैं जिन्होंने सहस्राब्दियों से 'यात्रा अर्थव्यवस्था' को बनाए रखा है। यह तीर्थयात्रा सर्किट दूरस्थ हिमालयी गांवों को भारतीय मैदानों की संपदा और भक्ति से जोड़ता है।\n\nमंदिरों को कई बार नष्ट और पुनर्निर्मित किया गया है—केदारनाथ हाल ही में 2013 की बाढ़ से तबाह हुआ—फिर भी वे सालाना लाखों तीर्थयात्रियों को आकर्षित करते रहते हैं। यात्रा सीजन (मई-नवंबर) आतिथ्य, कुली और धार्मिक सेवाओं में शामिल हजारों परिवारों की आर्थिक जीवन रेखा बना हुआ है।\n\nयह जीवंत विरासत प्रदर्शित करती है कि कैसे आध्यात्मिकता, अर्थशास्त्र और इतिहास देवभूमि—देवताओं की भूमि—के रूप में उत्तराखंड की पहचान में अविभाज्य रूप से बुने हुए हैं।"
        }
      }
    ],
    highlights: { 
      en: [
        "Languages: Garhwali, Kumaoni, Jaunsari (Central Pahari group)",
        "Jagars – Ritualistic songs invoking deities",
        "Jaunsar-Bawar – Mahasu Devta worship, unique traditions",
        "Ramman (UNESCO 2009) – Masked ritual theater (Chamoli)",
        "Chholiya Dance – 1000-year martial sword dance tradition",
        "Nanda Devi Raj Jaat – 12-year, 280 km barefoot pilgrimage",
        "Nagara & Koti Banal – Temple architecture styles",
        "Char Dham – Millennial 'yatra economy'"
      ],
      hi: [
        "भाषाएं: गढ़वाली, कुमाऊनी, जौनसारी (मध्य पहाड़ी समूह)",
        "जागर – देवताओं का आह्वान करने वाले अनुष्ठानिक गीत",
        "जौनसार-बावर – महासू देवता पूजा, अनूठी परंपराएं",
        "रम्माण (यूनेस्को 2009) – मुखौटा अनुष्ठानिक नाटक (चमोली)",
        "छोलिया नृत्य – 1000 वर्षीय युद्ध तलवार नृत्य परंपरा",
        "नंदा देवी राज जात – 12 वर्षीय, 280 किमी नंगे पैर तीर्थयात्रा",
        "नागर और कोटी बनाल – मंदिर स्थापत्य शैलियां",
        "चार धाम – सहस्राब्दी 'यात्रा अर्थव्यवस्था'"
      ]
    },
    relatedLinks: [
      { label: "Culture & Traditions", path: "/culture" },
      { label: "Pahadi Food", path: "/food" },
      { label: "Char Dham", path: "/culture" }
    ],
    accentColor: "from-rose-500/20 to-pink-500/20"
  }
];

const HistoryPage = () => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (text: { en: React.ReactNode; hi: React.ReactNode }) => text[language];
  const tArray = (arr: { en: string[]; hi: string[] }) => arr[language];

  return (
    <>
      <Helmet>
        <title>{language === "en" ? "History of Uttarakhand | From Ancient Roots to Devbhoomi | Hum Pahadi Haii" : "उत्तराखंड का इतिहास | प्राचीन जड़ों से देवभूमि तक | हम पहाड़ी हैं"}</title>
        <meta 
          name="description" 
          content={language === "en" 
            ? "Comprehensive history of Uttarakhand from Vedic times to modern statehood. Explore Lakhudyar rock art, Katyuri dynasty, Chand rulers, British era, 1994 statehood movement, and living cultural heritage."
            : "वैदिक काल से आधुनिक राज्य तक उत्तराखंड का व्यापक इतिहास। लखुड्यार शैल चित्र, कत्यूरी राजवंश, चंद शासक, ब्रिटिश युग, 1994 राज्य आंदोलन और जीवंत सांस्कृतिक विरासत का अन्वेषण करें।"
          }
        />
        <meta name="keywords" content="Uttarakhand history, Devbhoomi, Kedarkhand, Manaskhand, Katyuri dynasty, Chand dynasty, Garhwal kingdom, Uttarakhand statehood, Lakhudyar, Kuninda, Coolie Begar, Ramman UNESCO, उत्तराखंड इतिहास, देवभूमि" />
        <link rel="canonical" href="https://humpahadihaii.in/history" />
      </Helmet>

      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
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
                  ? <>Nestled in the lap of the Himalayas, Uttarakhand's history is as majestic as its mountains. Known as <strong className="text-primary">Devbhoomi</strong> (Land of Gods), this sacred land has been a center of spirituality, culture, and resilience for millennia. From prehistoric Lakhudyar rock paintings to the 2000 statehood movement, discover the remarkable journey of a land where the metaphysical concept of Svarga Loka intersects with the rugged physical reality of the central Himalayas.</>
                  : <>हिमालय की गोद में बसा उत्तराखंड का इतिहास उसके पहाड़ों जितना ही भव्य है। <strong className="text-primary">देवभूमि</strong> (देवताओं की भूमि) के रूप में जाना जाने वाला यह पवित्र भूमि सहस्राब्दियों से आध्यात्मिकता, संस्कृति और लचीलेपन का केंद्र रही है। प्रागैतिहासिक लखुड्यार शैल चित्रों से 2000 के राज्य आंदोलन तक, एक ऐसी भूमि की उल्लेखनीय यात्रा की खोज करें जहां स्वर्ग लोक की अवधारणा मध्य हिमालय की कठोर भौतिक वास्तविकता से मिलती है।</>
                }
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10" />
                
                <div className="space-y-8 md:space-y-12">
                  {historyEras.map((era) => (
                    <article 
                      key={era.id}
                      className="relative"
                      id={era.id}
                    >
                      <div className="hidden md:flex absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />
                      
                      <Card className={`md:ml-16 overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary/50`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${era.accentColor} opacity-50`} />
                        
                        <CardContent className="relative p-6 md:p-8">
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

                          <Accordion type="single" collapsible className="mb-6">
                            {era.subsections.map((sub, i) => (
                              <AccordionItem key={i} value={`${era.id}-${i}`} className="border-border/50">
                                <AccordionTrigger className="text-left hover:no-underline py-3">
                                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Scroll className="h-4 w-4 text-primary" />
                                    {t(sub.title)}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-foreground/80 leading-relaxed pl-6 whitespace-pre-line">
                                  {t(sub.content)}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                          
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
