import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { emergencyAudio } from '../utils/emergencyAudio';
import {
  coastalVoiceBroadcast,
  localizeCoastalLocation,
  getFiveLanguageHighRiskBroadcasts,
} from '../utils/coastalVoiceBroadcast';

export interface PASpeakerTower {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  decibelOutput: number;
  status: 'ONLINE' | 'BROADCASTING' | 'MAINTENANCE' | 'OFFLINE';
  powerSource: string;
  batteryPct: number;
  linkType: 'VHF Emergency Link' | 'Marine Radio Relay' | 'Satellite Direct' | 'Cellular / LoRa Mesh';
  lastPing: string;
}

export interface MarineRadioTransmitter {
  id: string;
  name: string;
  frequency: string;
  channel: string;
  rangeNauticalMiles: number;
  powerWatts: number;
  status: 'ONLINE' | 'TRANSMITTING' | 'STANDBY';
  targetAudience: string;
}

export interface BroadcastTemplate {
  id: string;
  title: string;
  hazardType: 'HIGH_WAVE' | 'TSUNAMI' | 'CYCLONE_SURGE' | 'FISHERMEN_RECALL';
  defaultLanguage: 'ta' | 'en' | 'hi' | 'te' | 'ml';
  translations: {
    ta: string; // Tamil
    en: string; // English
    hi: string; // Hindi
    te: string; // Telugu
    ml: string; // Malayalam
  };
}

export interface ActiveBroadcastSession {
  id: string;
  startedAt: string;
  hazardType: string;
  location: string;
  language: 'ta' | 'en' | 'hi' | 'te' | 'ml';
  messageText: string;
  isTransmitting: boolean;
  selectedTowersCount: number;
  radioTransmittersCount: number;
}

export interface BroadcastLanguageStep {
  id: 'ta' | 'en' | 'hi' | 'te' | 'ml';
  code: string;
  name: string;
  nativeLabel: string;
  flag: string;
  text: string;
  phoneticText: string;
}

export interface ActiveLineByLineStatus {
  isActive: boolean;
  currentIndex: number;
  totalLanguages: number;
  currentLang: 'ta' | 'en' | 'hi' | 'te' | 'ml';
  currentLangName: string;
  currentLangFlag: string;
  currentText: string;
  hazardType: string;
  location: string;
}

interface PublicAnnouncerContextType {
  towers: PASpeakerTower[];
  radioTransmitters: MarineRadioTransmitter[];
  templates: BroadcastTemplate[];
  activeSession: ActiveBroadcastSession | null;
  isBroadcasting: boolean;
  isSpeaking: boolean;
  selectedLanguage: 'ta' | 'en' | 'hi' | 'te' | 'ml';
  customMessage: string;
  autoBroadcastOnExtreme: boolean;
  totalPopulationReach: number;
  lineByLineStatus: ActiveLineByLineStatus | null;
  isLineByLineActive: boolean;
  setSelectedLanguage: (lang: 'ta' | 'en' | 'hi' | 'te' | 'ml') => void;
  setCustomMessage: (msg: string) => void;
  setAutoBroadcastOnExtreme: (enabled: boolean) => void;
  startBroadcast: (options?: {
    location?: string;
    hazardType?: string;
    lang?: 'ta' | 'en' | 'hi' | 'te' | 'ml';
    customText?: string;
    playAudioOutLoud?: boolean;
    allLanguages?: boolean;
  }) => Promise<void>;
  startAllLanguagesBroadcast: (options?: {
    location?: string;
    hazardType?: string;
    playAudioOutLoud?: boolean;
  }) => Promise<void>;
  skipToNextLanguage: () => void;
  stopBroadcast: () => void;
  testSingleTowerChime: (towerId: string) => Promise<void>;
  testRadioBeep: (radioId: string) => Promise<void>;
}

const INITIAL_TOWERS: PASpeakerTower[] = [
  {
    id: 'pa-tower-1',
    name: 'Tower #1 - Marina Promenade Acoustic Mast',
    location: 'Chennai Coast, Tamil Nadu',
    lat: 13.0533,
    lng: 80.2833,
    coverageRadiusKm: 3.2,
    decibelOutput: 135,
    status: 'ONLINE',
    powerSource: 'Solar + 48V LiFePO4 Bank',
    batteryPct: 98,
    linkType: 'VHF Emergency Link',
    lastPing: '10s ago',
  },
  {
    id: 'pa-tower-2',
    name: 'Tower #2 - Mahabalipuram Shore Horn',
    location: 'Chengalpattu Shore, Tamil Nadu',
    lat: 12.6196,
    lng: 80.1936,
    coverageRadiusKm: 2.8,
    decibelOutput: 130,
    status: 'ONLINE',
    powerSource: 'Solar Microgrid',
    batteryPct: 95,
    linkType: 'Marine Radio Relay',
    lastPing: '25s ago',
  },
  {
    id: 'pa-tower-3',
    name: 'Tower #3 - Kovalam Fishing Hamlet Acoustic Horn Tower',
    location: 'Thiruvananthapuram Coast, Kerala',
    lat: 8.4021,
    lng: 76.9787,
    coverageRadiusKm: 2.5,
    decibelOutput: 132,
    status: 'ONLINE',
    powerSource: 'Coastal Grid + Heavy UPS',
    batteryPct: 100,
    linkType: 'Satellite Direct',
    lastPing: '15s ago',
  },
  {
    id: 'pa-tower-4',
    name: 'Tower #4 - Dhanushkodi Pamban Straits Mast',
    location: 'Rameswaram Island, Tamil Nadu',
    lat: 9.2876,
    lng: 79.3129,
    coverageRadiusKm: 4.0,
    decibelOutput: 140,
    status: 'ONLINE',
    powerSource: 'Wind + Solar Hybrid',
    batteryPct: 92,
    linkType: 'VHF Emergency Link',
    lastPing: '5s ago',
  },
  {
    id: 'pa-tower-5',
    name: 'Tower #5 - Juhu Beach & Versova Megaphone Tower',
    location: 'West Coast, Mumbai',
    lat: 19.0988,
    lng: 72.8264,
    coverageRadiusKm: 3.5,
    decibelOutput: 135,
    status: 'ONLINE',
    powerSource: 'Port Authority Dedicated Power',
    batteryPct: 99,
    linkType: 'Cellular / LoRa Mesh',
    lastPing: '8s ago',
  },
];

const INITIAL_RADIO_TRANSMITTERS: MarineRadioTransmitter[] = [
  {
    id: 'radio-vhf-16',
    name: 'Marine VHF Channel 16 Coastal Transmitter',
    frequency: '156.800 MHz',
    channel: 'VHF CH 16 (International Distress & Safety)',
    rangeNauticalMiles: 45,
    powerWatts: 25,
    status: 'ONLINE',
    targetAudience: 'All fishing trawlers, country boats & catamarans at sea without cell phones',
  },
  {
    id: 'radio-am-emergency',
    name: 'Coastal Disaster AM Radio Transmitter',
    frequency: '720 kHz (Medium Wave)',
    channel: 'AIR Disaster Net',
    rangeNauticalMiles: 80,
    powerWatts: 10000,
    status: 'ONLINE',
    targetAudience: 'Handheld transistor radios in coastal villages, tea stalls & fishermen huts',
  },
  {
    id: 'radio-fm-community',
    name: 'Coastal Community FM Emergency Subcarrier',
    frequency: '104.8 MHz FM',
    channel: 'Kadal Osai Coastal Radio',
    rangeNauticalMiles: 30,
    powerWatts: 500,
    status: 'ONLINE',
    targetAudience: 'Villagers, children, elders & merchants on coastal beaches',
  },
];

const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'tpl-high-wave',
    title: 'High Wave & Coastal Changes 1-km Exclusion Alert',
    hazardType: 'HIGH_WAVE',
    defaultLanguage: 'ta',
    translations: {
      ta: 'முக்கிய கடற்கரை எச்சரிக்கை: இன்று கடற்கரைப் பகுதியில் அதிக அலைகள் மற்றும் சில மாற்றங்கள் ஏற்படுவதற்கான சாத்தியக்கூறுகள் உள்ளன. எனவே, மீனவர்கள் மற்றும் சுற்றுலாப் பயணிகள் கடற்கரைப் பகுதிக்குச் செல்ல தடை விதிக்கப்பட்டுள்ளது. கடலுக்குள் செல்ல வேண்டாம் மற்றும் கடற்கரைப் பகுதியிலிருந்து ஒரு கிலோமீட்டர் தொலைவில் விலகி இருங்கள்.',
      en: 'Emergency Coastal Broadcast: Today there is uncertainly having chances to high waves and some changes in coastal region. So, the fishermen and tourist peoples are prohibited to go the coastal region. Not to go into the ocean and stay away one kilometer from the coastal region.',
      te: 'ముఖ్య తీరప్రాంత హెచ్చరిక: ఈరోజు తీరప్రాంతంలో అధిక అలలు మరియు కొన్ని మార్పులు జరిగే అవకాశాలు ఉన్నాయి. కాబట్టి, మత్స్యకారులు మరియు పర్యాటకులు తీరప్రాంతానికి వెళ్లడం నిషేధించబడింది. సముద్రంలోకి వెళ్లవద్దు మరియు తీరప్రాంతం నుండి ఒక కిలోమీటరు దూరంగా ఉండండి.',
      hi: 'महत्वपूर्ण तटीय चेतावनी: आज तटीय क्षेत्र में ऊंची लहरें और कुछ बदलाव होने की संभावना है। इसलिए, मछुआरों और पर्यटकों का तटीय क्षेत्र में जाना प्रतिबंधित है। समुद्र में न जाएं और तटीय क्षेत्र से एक किलोमीटर दूर रहें।',
      ml: 'പ്രധാന തീരദേശ മുന്നറിയിപ്പ്: ഇന്ന് തീരപ്രദേശത്ത് ഉയർന്ന തിരമാലകൾക്കും ചില മാറ്റങ്ങൾക്കും സാധ്യതയുണ്ട്. അതിനാൽ, മത്സ്യത്തൊഴിലാളികളും വിനോദസഞ്ചാരികളും തീരപ്രദേശത്തേക്ക് പോകുന്നത് നിരോധിച്ചിരിക്കുന്നു. കടലിൽ പോകരുത്, തീരപ്രദേശത്തുനിന്ന് ഒരു കിലോമീറ്റർ അകലെ മാറിനിൽക്കുക.',
    },
  },
  {
    id: 'tpl-tsunami',
    title: 'Urgent Tsunami / Coastal Inundation Evacuation',
    hazardType: 'TSUNAMI',
    defaultLanguage: 'ta',
    translations: {
      ta: 'அவசர சுனாமி மற்றும் கடல் வெள்ள அபாய எச்சரிக்கை! அனைத்து மக்களும் உடனடியாக கடலோர பகுதிகளை விட்டு குறைந்தது ஒரு கிலோமீட்டர் தூரத்திற்கு உயரமான இடங்களுக்கு செல்லவும்!',
      en: 'Urgent Tsunami Evacuation Order! Tsunami surge detected. All beachgoers, tourists, and residents must immediately evacuate coastal zones and seek elevated structures inland!',
      hi: 'अति आवश्यक सुनामी चेतावनी! समुद्र का जलस्तर तेजी से बढ़ रहा है। तटवर्ती क्षेत्रों के सभी लोग तुरंत तटीय क्षेत्र खाली कर ऊंचे स्थानों की ओर प्रस्थान करें!',
      te: 'సునామీ అత్యవసర హెచ్చరిక! సముద్రపు నీరు ముందుకు వస్తోంది. తీరప్రాంత ప్రజలందరూ వెంటనే ఎత్తైన ప్రదేశాలకు తరలిపోవాలి!',
      ml: 'സുനാമി മുന്നറിയിപ്പ്! കടൽ ഉൾവലിയുകയോ അസാധാരണമായി കരയിലേക്ക് അടിച്ചു കയറുകയോ ചെയ്യാം. തീരപ്രദേശങ്ങളിൽ നിന്നും ഉടൻതന്നെ ഉയർന്ന സ്ഥലങ്ങളിലേക്ക് മാറുക!',
    },
  },
  {
    id: 'tpl-fishermen',
    title: 'Fishermen Emergency Recall to Harbor (VHF Ch 16)',
    hazardType: 'FISHERMEN_RECALL',
    defaultLanguage: 'ta',
    translations: {
      ta: 'அனைத்து மீன்பிடி படகுகளுக்கும் வி.எச்.எப் சேனல் 16 மூலமான அவசர செய்தி! ஆழ்கடலில் புயல் மற்றும் ராட்சத அலைகள் ஏற்படுவதால், உடனே அருகில் உள்ள மீன்பிடி துறைமுகத்திற்கு திரும்புங்கள்!',
      en: 'Securite, Securite, Securite! This is Coastal Maritime Rescue over VHF Channel 16. Severe sea condition warning. All mechanized trawlers and artisanal craft return to nearest harbor immediately.',
      hi: 'सभी नावों और मछुआरों के लिए वीएचएफ चैनल 16 पर आपातकालीन संदेश! गहरे समुद्र में विकराल तूफान के कारण तुरंत नजदीकी बंदरगाह पर वापस लौटें!',
      te: 'సముద్రంలో ఉన్న మత్స్యకారులకు విహెచ్ఎఫ్ ఛానల్ 16 ద్వారా అత్యవసర పిలుపు! వెంటనే సురక్షిత నౌకాశ్రయానికి చేరుకోండి!',
      ml: 'കടലിൽ പോയിട്ടുള്ള എല്ലാ മത്സ്യത്തൊഴിലാളികളും ഉടൻതന്നെ അടുത്തുള്ള തുറമുഖങ്ങളിലേക്ക് മടങ്ങിയെത്തുക. കടൽ അതീവ പ്രക്ഷുബ്ധമാണ്.',
    },
  },
];

const PublicAnnouncerContext = createContext<PublicAnnouncerContextType | undefined>(undefined);

export const PublicAnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [towers, setTowers] = useState<PASpeakerTower[]>(INITIAL_TOWERS);
  const [radioTransmitters, setRadioTransmitters] = useState<MarineRadioTransmitter[]>(INITIAL_RADIO_TRANSMITTERS);
  const [templates] = useState<BroadcastTemplate[]>(BROADCAST_TEMPLATES);
  const [activeSession, setActiveSession] = useState<ActiveBroadcastSession | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'ta' | 'en' | 'hi' | 'te' | 'ml'>('en');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [autoBroadcastOnExtreme, setAutoBroadcastOnExtreme] = useState<boolean>(false);
  const [lineByLineStatus, setLineByLineStatus] = useState<ActiveLineByLineStatus | null>(null);

  const broadcastCancelRef = useRef<boolean>(false);
  const skipNextLangRef = useRef<(() => void) | null>(null);

  // Sync state in real time with coastalVoiceBroadcast engine
  useEffect(() => {
    const unsubscribe = coastalVoiceBroadcast.subscribe((vState) => {
      setIsSpeaking(vState.isSpeaking);
      if (vState.isBroadcasting && vState.isAllLanguagesActive && vState.currentLanguageIndex >= 0) {
        setIsBroadcasting(true);
        const steps = vState.fiveLanguageSteps;
        const currentStep = steps[vState.currentLanguageIndex];
        if (currentStep) {
          setSelectedLanguage(currentStep.lang as any);
          setLineByLineStatus({
            isActive: true,
            currentIndex: vState.currentLanguageIndex,
            totalLanguages: steps.length,
            currentLang: currentStep.lang as any,
            currentLangName: currentStep.name,
            currentLangFlag: currentStep.flag,
            currentText: vState.currentBroadcastText || currentStep.text,
            hazardType: 'HIGH_WAVE',
            location: vState.currentRegionName,
          });
        }
      } else if (!vState.isBroadcasting && !vState.announcementInProgress) {
        // If broadcast completed naturally
        if (lineByLineStatus?.isActive) {
          setIsBroadcasting(false);
          setLineByLineStatus(null);
        }
      }
    });
    return unsubscribe;
  }, [lineByLineStatus?.isActive]);

  // Total estimated population covered by acoustic horn towers and community radio
  const totalPopulationReach = 185000;

  // Build the 5 distinct regional language lines for coastal hazard warnings
  const get5LanguageSteps = useCallback(
    (hazardType: string, location: string): BroadcastLanguageStep[] => {
      const isTsunami = hazardType === 'TSUNAMI';
      const isRecall = hazardType === 'FISHERMEN_RECALL';

      const taLoc = localizeCoastalLocation(location, 'ta');
      const enLoc = localizeCoastalLocation(location, 'en');
      const hiLoc = localizeCoastalLocation(location, 'hi');
      const teLoc = localizeCoastalLocation(location, 'te');
      const mlLoc = localizeCoastalLocation(location, 'ml');

      if (isTsunami) {
        return [
          {
            id: 'ta',
            code: 'ta-IN',
            name: 'Tamil',
            nativeLabel: 'தமிழ்',
            flag: '🇮🇳',
            text: `அவசர சுனாமி எச்சரிக்கை! ${taLoc.native} கடற்கரையில் ராட்சத சுனாமி அலைகள் தாக்கக்கூடும். பொதுமக்கள், சுற்றுலாப் பயணிகள் அனைவரும் உடனே கடற்கரையை விட்டு குறைந்தது ஒரு கிலோமீட்டர் தூரத்திற்கு உயரமான இடங்களுக்கு செல்லவும்! நன்றி. அனைவரும் பாதுகாப்பாக இருங்கள்.`,
            phoneticText: `Avasara Tsunami Echarikkai! ${taLoc.phonetic} kadarkaraiyil raatchatha tsunami alaigal thaakkakkoodum. Ellorum udanadiyaaga kadarkaraiyai vittu uyaramaana idangalukku sellavum! Nandri. Paadhukaappaaga irungal.`,
          },
          {
            id: 'en',
            code: 'en-IN',
            name: 'English',
            nativeLabel: 'English',
            flag: '🌐',
            text: `Urgent Tsunami Evacuation Order for ${enLoc.native}! Destructive ocean surge detected. All beachgoers, fishermen, and residents must immediately evacuate coastal zones to elevated ground inland! Thank you. Please remain safe.`,
            phoneticText: `Urgent Tsunami Evacuation Order for ${enLoc.phonetic}! Destructive ocean surge detected. All beachgoers, fishermen, and residents must immediately evacuate coastal zones to elevated ground inland! Thank you. Please remain safe.`,
          },
          {
            id: 'hi',
            code: 'hi-IN',
            name: 'Hindi',
            nativeLabel: 'हिन्दी',
            flag: '🇮🇳',
            text: `अति आवश्यक सुनामी चेतावनी! ${hiLoc.native} में समुद्र का जलस्तर तेजी से बढ़ रहा है। सभी लोग तुरंत समुद्र तट खाली कर सुरक्षित ऊंचे स्थानों पर जाएं! धन्यवाद। सभी लोग सुरक्षित रहें।`,
            phoneticText: `Ati aavashyak tsunami chetaavni! ${hiLoc.phonetic} mein samudra tat khali kar surakshit oonche sthaano par jayein! Dhanyavaad. Surakshit rahein.`,
          },
          {
            id: 'te',
            code: 'te-IN',
            name: 'Telugu',
            nativeLabel: 'తెలుగు',
            flag: '🇮🇳',
            text: `సునామీ అత్యవసర హెచ్చరిక! ${teLoc.native} తీరానికి భారీ సునామీ అలల ముప్పు పొంచి ఉంది. ప్రజలందరూ వెంటనే తీర ప్రాంతం ఖాళీ చేసి ఎత్తైన ప్రదేశాలకు వెళ్లండి! ధన్యవాదాలు. అందరూ సురక్షితంగా ఉండండి.`,
            phoneticText: `Tsunami atyavasara hecharika! ${teLoc.phonetic} theeraaniki bhaaree tsunami alalu vastunnaayi. Ventane theeram khaalee chesi etthaina pradeshalaku vellandi! Dhanyavaadaalu. Surakshithamgaa undandi.`,
          },
          {
            id: 'ml',
            code: 'ml-IN',
            name: 'Malayalam',
            nativeLabel: 'മലയാളം',
            flag: '🇮🇳',
            text: `സുനാമി അടിയന്തര മുന്നറിയിപ്പ്! ${mlLoc.native} തീരത്ത് കടൽ അസാധാരണമായി കരയിലേക്ക് അടിച്ചു കയറാം. തീരപ്രദേശങ്ങളിൽ നിന്നും ഉടൻതന്നെ ഉയർന്ന സുരക്ഷിത കേന്ദ്രങ്ങളിലേക്ക് മാറുക! നന്ദി. എല്ലാവരും സുരക്ഷിതരായിരിക്കുക.`,
            phoneticText: `Tsunami adiyanthara munnariyippu! ${mlLoc.phonetic} theerathu ninnum udanthannae uyarnna surakshitha kendrangalilekku maaruka! Nandi. Surakshitharaayi irikkuka.`,
          },
        ];
      }

      if (isRecall) {
        return [
          {
            id: 'ta',
            code: 'ta-IN',
            name: 'Tamil',
            nativeLabel: 'தமிழ்',
            flag: '🇮🇳',
            text: `அனைத்து நாட்டுப் படகுகள் மற்றும் விசைப்படகுகளுக்கு வி.எச்.எப் சேனல் 16 மூலமான அவசர செய்தி! ${taLoc.native} கடலில் புயல் மற்றும் கொந்தளிப்பு ஏற்படுவதால் உடனே அருகிலுள்ள துறைமுகத்திற்கு திரும்புங்கள்! நன்றி. பாதுகாப்பாக இருங்கள்.`,
            phoneticText: `Anaithu meenpidi padagugalukkum VHF channel 16 moolamaana avasara seithi! ${taLoc.phonetic} kadalil puyal yerpaduvathaal udanae thuraimukathirku thirumbungal! Nandri. Paadhukaappaaga irungal.`,
          },
          {
            id: 'en',
            code: 'en-IN',
            name: 'English',
            nativeLabel: 'English',
            flag: '🌐',
            text: `Securite, Securite! This is Coastal Marine Rescue on VHF Channel 16 for ${enLoc.native}. Dangerous squall and sea surge warning. All fishing trawlers and catamarans return to harbor immediately! Thank you. Stay safe.`,
            phoneticText: `Securite, Securite! This is Coastal Marine Rescue on VHF Channel 16 for ${enLoc.phonetic}. Dangerous squall and sea surge warning. All fishing trawlers and catamarans return to harbor immediately! Thank you. Stay safe.`,
          },
          {
            id: 'hi',
            code: 'hi-IN',
            name: 'Hindi',
            nativeLabel: 'हिन्दी',
            flag: '🇮🇳',
            text: `सभी मछुआरों और नौकाओं के लिए वीएचएफ चैनल 16 पर आपात संदेश! ${hiLoc.native} समुद्र में प्रचंड तूफान के कारण तुरंत नजदीकी बंदरगाह पर लौटें! धन्यवाद। सुरक्षित रहें।`,
            phoneticText: `Sabhi machhuaaron ke liye VHF channel 16 par sandesh! ${hiLoc.phonetic} samudra mein toofan ke kaaran turant bandargah par lautein! Dhanyavaad. Surakshit rahein.`,
          },
          {
            id: 'te',
            code: 'te-IN',
            name: 'Telugu',
            nativeLabel: 'తెలుగు',
            flag: '🇮🇳',
            text: `సముద్రంలో ఉన్న మత్స్యకారులకు విహెచ్ఎఫ్ ఛానల్ 16 ద్వారా అత్యవసర పిలుపు! ${teLoc.native} లో బలమైన తుఫాను హెచ్చరిక. వెంటనే సురక్షిత నౌకాశ్రయానికి రండి! ధన్యవాదాలు. సురక్షితంగా ఉండండి.`,
            phoneticText: `Samudramlo unna matsyakaarulaku VHF channel 16 dwaara pilupu! ${teLoc.phonetic} lo balamaina thufaanu hecharika. Ventane noukaashrayaaniki randi! Dhanyavaadaalu. Surakshithamgaa undandi.`,
          },
          {
            id: 'ml',
            code: 'ml-IN',
            name: 'Malayalam',
            nativeLabel: 'മലയാളം',
            flag: '🇮🇳',
            text: `കടലിൽ പോയിട്ടുള്ള എല്ലാ മത്സ്യത്തൊഴിലാളികളും ഉടൻതന്നെ അടുത്തുള്ള തുറമുഖങ്ങളിലേക്ക് മടങ്ങിയെത്തുക. ${mlLoc.native} കടൽ അതീവ പ്രക്ഷുബ്ധമാണ്. നന്ദി. സുരക്ഷിതരായിരിക്കുക.`,
            phoneticText: `Kadalil poyittulla ella matsya thozhilaaligalum udanthannae thuramukhangalilekku madangiyethuka. ${mlLoc.phonetic} kadal atheeva prakshubhdhamaanu. Nandi. Surakshitharaayi irikkuka.`,
          },
        ];
      }

      // Default: Coastal Risk / HIGH_WAVE hazard (Tamil, English, Telugu, Hindi, Malayalam)
      // Uses the centralized getFiveLanguageHighRiskBroadcasts engine
      const steps = getFiveLanguageHighRiskBroadcasts(location);
      return steps.map((s) => ({
        id: s.lang,
        code: s.code,
        name: s.name,
        nativeLabel: s.nativeName,
        flag: s.lang === 'en' ? '🌐' : '🇮🇳',
        text: s.text,
        phoneticText: s.phoneticText,
      }));
    },
    []
  );

  /**
   * Stop Broadcast and return speaker masts & radio transmitters to standby
   */
  const stopBroadcast = useCallback(() => {
    broadcastCancelRef.current = true;
    if (skipNextLangRef.current) {
      try {
        skipNextLangRef.current();
      } catch {}
      skipNextLangRef.current = null;
    }

    coastalVoiceBroadcast.stopAnnouncement();
    emergencyAudio.stopTone();
    setIsBroadcasting(false);
    setIsSpeaking(false);
    setLineByLineStatus(null);
    setActiveSession(null);

    setTowers((prev) =>
      prev.map((t) => (t.status === 'BROADCASTING' ? { ...t, status: 'ONLINE' } : t))
    );
    setRadioTransmitters((prev) =>
      prev.map((r) => (r.status === 'TRANSMITTING' ? { ...r, status: 'ONLINE' } : r))
    );
  }, []);

  /**
   * Skip current language line and immediately advance to next language
   */
  const skipToNextLanguage = useCallback(() => {
    coastalVoiceBroadcast.stopAnnouncement();
    if (skipNextLangRef.current) {
      try {
        skipNextLangRef.current();
      } catch {}
      skipNextLangRef.current = null;
    }
  }, []);

  /**
   * Deliver the emergency voice message across ALL languages line-by-line
   * (Tamil -> English -> Malayalam -> Telugu -> Hindi)
   */
  const startAllLanguagesBroadcast = useCallback(
    async (options?: {
      location?: string;
      hazardType?: string;
      playAudioOutLoud?: boolean;
    }) => {
      // Ensure audio context and speech engine are unlocked immediately
      await emergencyAudio.unlock();
      await coastalVoiceBroadcast.unlockUserGesture();

      broadcastCancelRef.current = false;
      const hazard = options?.hazardType || 'HIGH_WAVE';
      const loc = options?.location || 'Marina Beach & Coastal Sector';
      const steps = get5LanguageSteps(hazard, loc);

      const sessionId = `pa-session-${Date.now()}`;
      const session: ActiveBroadcastSession = {
        id: sessionId,
        startedAt: new Date().toLocaleTimeString(),
        hazardType: hazard,
        location: loc,
        language: 'en',
        messageText: steps[1]?.text || steps[0].text,
        isTransmitting: true,
        selectedTowersCount: towers.filter((t) => t.status !== 'OFFLINE').length,
        radioTransmittersCount: radioTransmitters.length,
      };

      setActiveSession(session);
      setIsBroadcasting(true);

      // Put towers and transmitters on-air
      setTowers((prev) =>
        prev.map((t) => (t.status === 'ONLINE' ? { ...t, status: 'BROADCASTING' } : t))
      );
      setRadioTransmitters((prev) =>
        prev.map((r) => (r.status === 'ONLINE' ? { ...r, status: 'TRANSMITTING' } : r))
      );

      // Play initial high-power beach speaker attention chime & VHF distress tone
      if (options?.playAudioOutLoud !== false) {
        try {
          await emergencyAudio.playPADingDongChime();
          await emergencyAudio.playRadioTransmissionBeep();
        } catch {}
      }

      if (options?.playAudioOutLoud !== false) {
        setIsSpeaking(true);
        await coastalVoiceBroadcast.broadcastAll5Languages(loc);
        setIsSpeaking(false);
      } else {
        // Visual-only simulation through steps
        for (let i = 0; i < steps.length; i++) {
          if (broadcastCancelRef.current) break;
          const currentStep = steps[i];
          setSelectedLanguage(currentStep.id);
          setLineByLineStatus({
            isActive: true,
            currentIndex: i,
            totalLanguages: steps.length,
            currentLang: currentStep.id,
            currentLangName: currentStep.name,
            currentLangFlag: currentStep.flag,
            currentText: currentStep.text,
            hazardType: hazard,
            location: loc,
          });
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      setIsSpeaking(false);
      setLineByLineStatus(null);
    },
    [towers, radioTransmitters, get5LanguageSteps]
  );

  /**
   * Start broadcast (defaults to all languages line-by-line unless single-language requested)
   */
  const startBroadcast = useCallback(
    async (options?: {
      location?: string;
      hazardType?: string;
      lang?: 'ta' | 'en' | 'hi' | 'te' | 'ml';
      customText?: string;
      playAudioOutLoud?: boolean;
      allLanguages?: boolean;
    }) => {
      // If allLanguages is true or not explicitly custom single-language, broadcast all languages line by line!
      if (options?.allLanguages !== false && !options?.customText) {
        await startAllLanguagesBroadcast({
          location: options?.location,
          hazardType: options?.hazardType,
          playAudioOutLoud: options?.playAudioOutLoud,
        });
        return;
      }

      // Single custom message broadcast
      await emergencyAudio.unlock();
      await coastalVoiceBroadcast.unlockUserGesture();
      const lang = options?.lang || selectedLanguage;
      const hazard = options?.hazardType || 'HIGH_WAVE';
      const loc = options?.location || 'Marina Beach Sector';

      let textToBroadcast = options?.customText || customMessage;
      if (!textToBroadcast) {
        const matchingTemplate =
          templates.find((t) => t.hazardType === hazard) || templates[0];
        textToBroadcast = matchingTemplate.translations[lang] || matchingTemplate.translations.en;
      }

      const sessionId = `pa-session-${Date.now()}`;
      const session: ActiveBroadcastSession = {
        id: sessionId,
        startedAt: new Date().toLocaleTimeString(),
        hazardType: hazard,
        location: loc,
        language: lang,
        messageText: textToBroadcast,
        isTransmitting: true,
        selectedTowersCount: towers.filter((t) => t.status !== 'OFFLINE').length,
        radioTransmittersCount: radioTransmitters.length,
      };

      setActiveSession(session);
      setIsBroadcasting(true);

      setTowers((prev) =>
        prev.map((t) => (t.status === 'ONLINE' ? { ...t, status: 'BROADCASTING' } : t))
      );
      setRadioTransmitters((prev) =>
        prev.map((r) => (r.status === 'ONLINE' ? { ...r, status: 'TRANSMITTING' } : r))
      );

      if (options?.playAudioOutLoud !== false) {
        try {
          await emergencyAudio.playPADingDongChime();
          await emergencyAudio.playRadioTransmissionBeep();

          setIsSpeaking(true);
          await coastalVoiceBroadcast.playEmergencyAnnouncement(lang);
          setIsSpeaking(false);
        } catch (e) {
          console.warn('Audio playback error during PA broadcast:', e);
          setIsSpeaking(false);
        }
      }
    },
    [selectedLanguage, customMessage, templates, towers, radioTransmitters, startAllLanguagesBroadcast]
  );

  /**
   * Test a single beach speaker tower with acoustic horn chime
   */
  const testSingleTowerChime = useCallback(async (towerId: string) => {
    setTowers((prev) =>
      prev.map((t) => (t.id === towerId ? { ...t, status: 'BROADCASTING' } : t))
    );
    await emergencyAudio.playPADingDongChime();
    setTimeout(() => {
      setTowers((prev) =>
        prev.map((t) => (t.id === towerId ? { ...t, status: 'ONLINE' } : t))
      );
    }, 1500);
  }, []);

  /**
   * Test marine radio transmitter beep
   */
  const testRadioBeep = useCallback(async (radioId: string) => {
    setRadioTransmitters((prev) =>
      prev.map((r) => (r.id === radioId ? { ...r, status: 'TRANSMITTING' } : r))
    );
    await emergencyAudio.playRadioTransmissionBeep();
    setTimeout(() => {
      setRadioTransmitters((prev) =>
        prev.map((r) => (r.id === radioId ? { ...r, status: 'ONLINE' } : r))
      );
    }, 1000);
  }, []);

  return (
    <PublicAnnouncerContext.Provider
      value={{
        towers,
        radioTransmitters,
        templates,
        activeSession,
        isBroadcasting,
        isSpeaking,
        selectedLanguage,
        customMessage,
        autoBroadcastOnExtreme,
        totalPopulationReach,
        lineByLineStatus,
        isLineByLineActive: !!lineByLineStatus,
        setSelectedLanguage,
        setCustomMessage,
        setAutoBroadcastOnExtreme,
        startBroadcast,
        startAllLanguagesBroadcast,
        skipToNextLanguage,
        stopBroadcast,
        testSingleTowerChime,
        testRadioBeep,
      }}
    >
      {children}
    </PublicAnnouncerContext.Provider>
  );
};

export const usePublicAnnouncer = (): PublicAnnouncerContextType => {
  const context = useContext(PublicAnnouncerContext);
  if (!context) {
    throw new Error('usePublicAnnouncer must be used within a PublicAnnouncerProvider');
  }
  return context;
};
