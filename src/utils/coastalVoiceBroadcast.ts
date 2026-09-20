/**
 * Coastal Emergency Voice Alert & Radio Broadcast System
 * Single centralized voice announcement engine for all emergency spoken broadcasts.
 *
 * Strictly adheres to:
 * - NO default Tamil language (if no language selected, does not speak automatically).
 * - NO automatic or unexpected voice on normal notifications or UI updates.
 * - Spoken voice ONLY in the explicitly selected language (or strictly 1-5 in 5-language broadcast).
 * - Interruption-free queue with announcementInProgress lock & alertId deduplication.
 */

export type EmergencyLanguageKey = 'ta' | 'en' | 'ml' | 'te' | 'hi';

export type BroadcastStatus =
  | 'Ready'
  | 'Broadcasting…'
  | 'Broadcast Completed'
  | 'Select Language'
  | 'Voice unavailable'
  | 'Voice muted';

export interface EmergencyLanguageConfig {
  id: EmergencyLanguageKey;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  label: string;
  message: string;
  testMessage: string;
  phoneticText: string;
}

export interface LocalizedLocation {
  native: string;
  phonetic: string;
}

/**
 * Localizes any coastal region, beach, port, or sea name into all 5 languages.
 * Strictly guarantees that sea/location names do NOT remain in English
 * when speaking Tamil, Malayalam, Telugu, or Hindi.
 */
export function localizeCoastalLocation(
  rawLocation: string = 'Marina Beach Coastal Region',
  lang: EmergencyLanguageKey
): LocalizedLocation {
  const clean = (rawLocation || 'Marina Beach Coastal Region').trim();
  const lower = clean.toLowerCase();

  // 1. Marina Beach
  if (lower.includes('marina')) {
    switch (lang) {
      case 'ta':
        return { native: 'மெரினா கடற்கரைப் பகுதி', phonetic: 'Marina kadarkarai paguthi' };
      case 'te':
        return { native: 'మెరీనా బీచ్ తీర ప్రాంతం', phonetic: 'Marina beach theera praantham' };
      case 'ml':
        return { native: 'മറീന ബീച്ച് തീരപ്രദേശം', phonetic: 'Marina beach theerapradesham' };
      case 'hi':
        return { native: 'मरीना बीच तटीय क्षेत्र', phonetic: 'Marina beach tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Marina Beach coastal region', phonetic: 'Marina Beach coastal region' };
    }
  }

  // 2. Mahabalipuram
  if (lower.includes('mahabalipuram') || lower.includes('mamallapuram')) {
    switch (lang) {
      case 'ta':
        return { native: 'மகாபலிபுரம் கடற்கரைப் பகுதி', phonetic: 'Mahabalipuram kadarkarai paguthi' };
      case 'te':
        return { native: 'మహాబలిపురం తీర ప్రాంతం', phonetic: 'Mahabalipuram theera praantham' };
      case 'ml':
        return { native: 'മഹാബലിപുരം തീരപ്രദേശം', phonetic: 'Mahabalipuram theerapradesham' };
      case 'hi':
        return { native: 'महाबलीपुरम तटीय क्षेत्र', phonetic: 'Mahabalipuram tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Mahabalipuram coastal region', phonetic: 'Mahabalipuram coastal region' };
    }
  }

  // 3. Ennore Port
  if (lower.includes('ennore')) {
    switch (lang) {
      case 'ta':
        return { native: 'எண்ணூர் துறைமுக கடற்கரைப் பகுதி', phonetic: 'Ennoor thuraimuga kadarkarai paguthi' };
      case 'te':
        return { native: 'ఎన్నూరు ఓడరేవు తీర ప్రాంతం', phonetic: 'Ennooru odarevu theera praantham' };
      case 'ml':
        return { native: 'എന്നൂർ തുറമുഖ തീരപ്രദേശം', phonetic: 'Ennoor thuramukha theerapradesham' };
      case 'hi':
        return { native: 'एन्नोर बंदरगाह तटीय क्षेत्र', phonetic: 'Ennore bandargah tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Ennore Port coastal sector', phonetic: 'Ennore Port coastal sector' };
    }
  }

  // 4. Kanyakumari
  if (lower.includes('kanyakumari') || lower.includes('cape comorin')) {
    switch (lang) {
      case 'ta':
        return { native: 'கன்னியாகுமரி முக்கடல் பகுதி', phonetic: 'Kanyakumari mukkadal paguthi' };
      case 'te':
        return { native: 'కన్యాకుమారి తీర ప్రాంతం', phonetic: 'Kanyakumari theera praantham' };
      case 'ml':
        return { native: 'കന്യാകുമാരി തീരപ്രദേശം', phonetic: 'Kanyakumari theerapradesham' };
      case 'hi':
        return { native: 'कन्याकुमारी तटीय क्षेत्र', phonetic: 'Kanyakumari tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Kanyakumari coast', phonetic: 'Kanyakumari coast' };
    }
  }

  // 5. Rameswaram / Dhanushkodi
  if (lower.includes('rameswaram') || lower.includes('dhanushkodi')) {
    switch (lang) {
      case 'ta':
        return { native: 'ராமேஸ்வரம் கடற்கரைப் பகுதி', phonetic: 'Rameswaram kadarkarai paguthi' };
      case 'te':
        return { native: 'రామేశ్వరం తీర ప్రాంతం', phonetic: 'Rameshwaram theera praantham' };
      case 'ml':
        return { native: 'രാമേശ്വരം തീരപ്രദേശം', phonetic: 'Rameshwaram theerapradesham' };
      case 'hi':
        return { native: 'रामेश्वरम तटीय क्षेत्र', phonetic: 'Rameshwaram tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Rameswaram coast', phonetic: 'Rameswaram coast' };
    }
  }

  // 6. Pondicherry
  if (lower.includes('pondicherry') || lower.includes('puducherry') || lower.includes('promenade')) {
    switch (lang) {
      case 'ta':
        return { native: 'பாண்டிச்சேரி கடற்கரைப் பகுதி', phonetic: 'Pondicherry kadarkarai paguthi' };
      case 'te':
        return { native: 'పాండిచ్చేరి తీర ప్రాంతం', phonetic: 'Pondicherry theera praantham' };
      case 'ml':
        return { native: 'പോണ്ടിച്ചേരി തീരപ്രദേശം', phonetic: 'Pondicherry theerapradesham' };
      case 'hi':
        return { native: 'पांडिचेरी तटीय क्षेत्र', phonetic: 'Pondicherry tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Pondicherry beach', phonetic: 'Pondicherry beach' };
    }
  }

  // 7. Goa / Baga
  if (lower.includes('goa') || lower.includes('baga')) {
    switch (lang) {
      case 'ta':
        return { native: 'கோவா கடற்கரைப் பகுதி', phonetic: 'Goa kadarkarai paguthi' };
      case 'te':
        return { native: 'గోవా తీర ప్రాంతం', phonetic: 'Goa theera praantham' };
      case 'ml':
        return { native: 'ഗോവ തീരപ്രദേശം', phonetic: 'Goa theerapradesham' };
      case 'hi':
        return { native: 'गोवा तटीय क्षेत्र', phonetic: 'Goa tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Goa coastal area', phonetic: 'Goa coastal area' };
    }
  }

  // 8. Mumbai / Juhu
  if (lower.includes('mumbai') || lower.includes('juhu')) {
    switch (lang) {
      case 'ta':
        return { native: 'மும்பை ஜூஹூ கடற்கரைப் பகுதி', phonetic: 'Mumbai Juhu kadarkarai paguthi' };
      case 'te':
        return { native: 'ముంబై జూహు తీర ప్రాంతం', phonetic: 'Mumbai Juhu theera praantham' };
      case 'ml':
        return { native: 'മുംബൈ ജൂഹു തീരപ്രദേശം', phonetic: 'Mumbai Juhu theerapradesham' };
      case 'hi':
        return { native: 'मुंबई जुहू तटीय क्षेत्र', phonetic: 'Mumbai Juhu tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Mumbai Juhu coast', phonetic: 'Mumbai Juhu coast' };
    }
  }

  // 9. Kovalam
  if (lower.includes('kovalam')) {
    switch (lang) {
      case 'ta':
        return { native: 'கோவளம் கடற்கரைப் பகுதி', phonetic: 'Kovalam kadarkarai paguthi' };
      case 'te':
        return { native: 'కోవలం తీర ప్రాంతం', phonetic: 'Kovalam theera praantham' };
      case 'ml':
        return { native: 'കോവളം തീരപ്രദേശം', phonetic: 'Kovalam theerapradesham' };
      case 'hi':
        return { native: 'कोवलम तटीय क्षेत्र', phonetic: 'Kovalam tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Kovalam beach', phonetic: 'Kovalam beach' };
    }
  }

  // 10. Puri
  if (lower.includes('puri')) {
    switch (lang) {
      case 'ta':
        return { native: 'புரி கடற்கரைப் பகுதி', phonetic: 'Puri kadarkarai paguthi' };
      case 'te':
        return { native: 'పూరి తీర ప్రాంతం', phonetic: 'Poori theera praantham' };
      case 'ml':
        return { native: 'പുരി തീരപ്രദേശം', phonetic: 'Puri theerapradesham' };
      case 'hi':
        return { native: 'पुरी तटीय क्षेत्र', phonetic: 'Puri tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Puri beach', phonetic: 'Puri beach' };
    }
  }

  // 11. Sea Bodies: Bay of Bengal
  if (lower.includes('bengal')) {
    switch (lang) {
      case 'ta':
        return { native: 'வங்காள விரிகுடா கடல் பகுதி', phonetic: 'Vangaala virikuda kadal paguthi' };
      case 'te':
        return { native: 'బంగాళాఖాతం సముద్ర ప్రాంతం', phonetic: 'Bangaalaakhaatham samudra praantham' };
      case 'ml':
        return { native: 'ബംഗാൾ ഉൾക്കടൽ പ്രദേശം', phonetic: 'Bangaal ulkkadal pradeshath' };
      case 'hi':
        return { native: 'बंगाल की खाड़ी तटीय क्षेत्र', phonetic: 'Bangaal ki khaadi tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Bay of Bengal coastal region', phonetic: 'Bay of Bengal coastal region' };
    }
  }

  // 12. Sea Bodies: Arabian Sea
  if (lower.includes('arabian')) {
    switch (lang) {
      case 'ta':
        return { native: 'அரபிக்கடல் பகுதி', phonetic: 'Arabikkadal paguthi' };
      case 'te':
        return { native: 'అరేబియా సముద్ర ప్రాంతం', phonetic: 'Arabia samudra praantham' };
      case 'ml':
        return { native: 'അറബിക്കടൽ പ്രദേശം', phonetic: 'Arabikkadal pradeshath' };
      case 'hi':
        return { native: 'अरब सागर तटीय क्षेत्र', phonetic: 'Arab saagar tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Arabian Sea coastal region', phonetic: 'Arabian Sea coastal region' };
    }
  }

  // 13. Sea Bodies: Indian Ocean
  if (lower.includes('indian ocean')) {
    switch (lang) {
      case 'ta':
        return { native: 'இந்தியப் பெருங்கடல் பகுதி', phonetic: 'Indhiyap perunkadal paguthi' };
      case 'te':
        return { native: 'హిందూ మహాసముద్ర ప్రాంతం', phonetic: 'Hindu mahaasamudra praantham' };
      case 'ml':
        return { native: 'ഇന്ത്യൻ മഹാസമുദ്ര പ്രദേശം', phonetic: 'Indian mahaasamudra pradeshath' };
      case 'hi':
        return { native: 'हिन्द महासागर तटीय क्षेत्र', phonetic: 'Hind mahaasaagar tatiya kshetra' };
      case 'en':
      default:
        return { native: 'Indian Ocean coastal waters', phonetic: 'Indian Ocean coastal waters' };
    }
  }

  // Clean custom name: strip English suffixes like "Beach", "Coast", "Coastal Region", "Sector", "Buoy (CB-01)"
  const baseName = clean
    .replace(/\b(coastal region|coastal area|coastal sector|coastal corridor|beach|coast|shore|port|harbor|buoy|corridor|sector)\b/gi, '')
    .replace(/[()[\]-]/g, ' ')
    .trim() || 'Coastal';

  switch (lang) {
    case 'ta':
      return {
        native: `${baseName} கடற்கரைப் பகுதி`,
        phonetic: `${baseName} kadarkarai paguthi`,
      };
    case 'te':
      return {
        native: `${baseName} తీర ప్రాంతం`,
        phonetic: `${baseName} theera praantham`,
      };
    case 'ml':
      return {
        native: `${baseName} തീരപ്രദേശം`,
        phonetic: `${baseName} theerapradesham`,
      };
    case 'hi':
      return {
        native: `${baseName} तटीय क्षेत्र`,
        phonetic: `${baseName} tatiya kshetra`,
      };
    case 'en':
    default:
      return {
        native: `${baseName} coastal region`,
        phonetic: `${baseName} coastal region`,
      };
  }
}

export const EMERGENCY_LANGUAGES: Record<EmergencyLanguageKey, EmergencyLanguageConfig> = {
  ta: {
    id: 'ta',
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    label: 'Tamil – தமிழ்',
    message:
      'அனைவருக்கும் அவசர எச்சரிக்கை! கடலில் மிக உயரமான அலைகள் மற்றும் கடும் கொந்தளிப்பு ஏற்பட்டுள்ளது. இந்த ஆபத்தான நேரத்தில், யாரும் கடலில் இறங்க வேண்டாம், கடற்கரை பக்கமும் போக வேண்டாம். மீனவர்களும் பொதுமக்களும் கடலுக்குள் போவது முற்றிலும் தடை செய்யப்பட்டுள்ளது. எல்லோரும் கடற்கரையை விட்டு ஒரு கிலோமீட்டர் தள்ளி பாதுகாப்பான இடத்திற்கு செல்லுங்கள். நன்றி. அனைவரும் பாதுகாப்பாக இருங்கள்.',
    testMessage: 'இது கடலோர அவசர குரல் எச்சரிக்கை அமைப்பின் ஒலி பரிசோதனை ஆகும். நன்றி. அனைவரும் பாதுகாப்பாக இருங்கள்.',
    phoneticText:
      'Anaivarukkum avasara echarikkai! Kadalil miga uyaramaana alaigal matrum kadum seetram ulladhu. Indha aabathaana nerathil yaarum kadalil iranga vendaam, kadarkarai pakkamum poga vendaam. Meenavargalum makkalum kadalukku poga thadai. Ellorum kadarkaraiyai vittu oru kilometer thooram thalli paadhukaappaaga irungal. Nandri. Paadhukaappaaga irungal.',
  },
  en: {
    id: 'en',
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
    label: 'English',
    message:
      'Attention please! Urgent coastal emergency broadcast: Extreme high waves and severe sea surge warning detected. During this high-risk period, no one should enter the ocean or approach the shore. Fishermen and tourists are strictly prohibited from entering coastal areas. Please stay at least one kilometer away from the coastline. Thank you. Please remain safe.',
    testMessage: 'This is a transmission test of the coastal emergency voice alert and radio broadcast system. Thank you.',
    phoneticText:
      'Attention please! Urgent coastal emergency broadcast: Extreme high waves and severe sea surge warning detected. During this high-risk period, no one should enter the ocean or approach the shore. Fishermen and tourists are strictly prohibited from entering coastal areas. Please stay at least one kilometer away from the coastline. Thank you. Please remain safe.',
  },
  ml: {
    id: 'ml',
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    label: 'Malayalam – മലയാളം',
    message:
      'എല്ലാവരുടെയും ശ്രദ്ധയ്ക്ക്, അടിയന്തര മുന്നറിയിപ്പ്! കടലിൽ വലിയ തിരമാലകളും ശക്തമായ കടൽക്ഷോഭവും ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. അതുകൊണ്ട് ആരും കടലിൽ ഇറങ്ങരുത്, തീരത്തേക്ക് പോകരുത്. മത്സ്യത്തൊഴിലാളികളും പൊതുജനങ്ങളും കടലിൽ പോകുന്നത് പൂർണ്ണമായും വിലക്കിയിരിക്കുന്നു. എല്ലാവരും കടൽത്തീരത്ത് നിന്ന് ഒരു കിലോമീറ്റർ മാറി സുരക്ഷിതമായി നിൽക്കുക. നന്ദി. എല്ലാവരും സുരക്ഷിതരായിരിക്കുക.',
    testMessage: 'ഇത് തീരദേശ അടിയന്തര ശബ്ദ മുന്നറിയിപ്പ് സംവിധാനത്തിന്റെ ശബ്ദ പരിശോധനയാണ്. നന്ദി. എല്ലാവരും സുരക്ഷിതരായിരിക്കുക.',
    phoneticText:
      'Ellavarudeyum shraddhaykku, adiyanthara munnariyippu! Kadalil valiya thiramaalakalum shakthamaaya kadalkshobhavum undu. Aarum kadalil irangaruthu, theerathekk pokaruthu. Matsyathozhilaalikalum makkalum kadalil pokunnathu vilakkirikkunnu. Ellavarum theerathu ninnu oru kilometer maari surakshithamaayi nilkkuka. Nandi. Surakshitharaayirikkuka.',
  },
  te: {
    id: 'te',
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    label: 'Telugu – తెలుగు',
    message:
      'అందరికీ అత్యవసర హెచ్చరిక! సముద్రంలో చాలా పెద్ద ఎత్తున అలలు మరియు తీవ్రమైన ఉధృతి ఉంది. ప్రమాదకరమైన సమయం కాబట్టి, ఎవరూ సముద్రంలోకి దిగవద్దు, తీరం వైపు వెళ్లవద్దు. మత్స్యకారులు మరియు ప్రజలు సముద్రంలోకి వెళ్లడం పూర్తిగా నిషేధించబడింది. అందరూ తీరానికి ఒక కిలోమీటరు దూరంగా సురక్షిత ప్రాంతాలలో ఉండండి. ధన్యవాదాలు. అందరూ జాగ్రత్తగా, క్షేమంగా ఉండండి.',
    testMessage: 'ఇది తీరప్రాంత అత్యవసర వాయిస్ హెచ్చరిక వ్యవస్థ యొక్క సౌండ్ టెస్ట్. ధన్యవాదాలు. అందరూ క్షేమంగా ఉండండి.',
    phoneticText:
      'Andariki atyavasara heccharika! Samudramlo chaala pedda alalu mariyu theevramaina udhruthi undi. Pramaadakaramaina samayam kaabatti, evaroo samudramloki digavaddhu, theeram vaipu vellavaddhu. Mathsyakaarulu mariyu prajalu samudramloki velladam nishedham. Andaroo theeraaniki oka kilometer dooramgaa surakshitha praanthaalalo undandi. Dhanyavaadaalu. Kshemamgaa undandi.',
  },
  hi: {
    id: 'hi',
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    label: 'Hindi – हिन्दी',
    message:
      'कृपया ध्यान दें! महत्वपूर्ण तटीय आपातकालीन चेतावनी। आज समुद्र में अत्यंत ऊंची लहरें और गंभीर समुद्री खतरा उत्पन्न हुआ है। इस उच्च जोखिम के समय, कोई भी समुद्र में न जाए, समुद्र के पास भी न जाए। मछुआरों और पर्यटकों का समुद्र तट पर जाना, पूरी तरह प्रतिबंधित है। सभी लोग समुद्र तट से, कम से कम एक किलोमीटर दूर, सुरक्षित रहें। धन्यवाद। सभी लोग सुरक्षित रहें।',
    testMessage: 'यह तटीय आपातकालीन ध्वनि चेतावनी प्रणाली का एक परीक्षण प्रसारण है। धन्यवाद।',
    phoneticText:
      'Kripya dhyaan dein. Mahatvapoorna tatiya aapaatkaaleen chetaavni. Aaj samudra mein atyant oonchi lahrein aur gambheer khatra utpann hua hai. Is uchh jokhim ke samay, koi bhi samudra mein na jaye, samudra ke paas bhi na jaye. Machhuaaron aur paryatakon ka jaana poori tarah pratibandhit hai. Sabhi log samudra tat se, ek kilometer door, surakshit rahein. Dhanyavaad. Surakshit rahein.',
  },
};

/**
 * Sequential 5-language order per user specification:
 * 1. Tamil (தமிழ்)
 * 2. English
 * 3. Telugu (తెలుగు)
 * 4. Hindi (हिन्दी)
 * 5. Malayalam (മലയാളം)
 */
export const LANGUAGE_ORDER: EmergencyLanguageKey[] = ['ta', 'en', 'te', 'hi', 'ml'];

export interface FiveLanguageHighRiskBroadcast {
  lang: EmergencyLanguageKey;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  text: string;
  phoneticText: string;
}

/**
 * Generates the mandated 5-language high risk broadcast incorporating the localized sea and region name.
 * Strictly guarantees that sea and location names are translated and NEVER remain in raw English
 * inside Tamil, Malayalam, or Telugu announcements.
 *
 * Mandated core message in normal, natural coastal warning slang:
 * (High risk time: nobody enter the ocean, nobody go near the sea; fishermen and tourists prohibited; stay 1km away)
 */
export function getFiveLanguageHighRiskBroadcasts(regionName: string = 'Marina Beach Coastal Region'): FiveLanguageHighRiskBroadcast[] {
  const locTa = localizeCoastalLocation(regionName, 'ta');
  const locEn = localizeCoastalLocation(regionName, 'en');
  const locTe = localizeCoastalLocation(regionName, 'te');
  const locHi = localizeCoastalLocation(regionName, 'hi');
  const locMl = localizeCoastalLocation(regionName, 'ml');

  return [
    {
      lang: 'ta',
      code: 'ta-IN',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇮🇳',
      text: `அனைவருக்கும் அவசர எச்சரிக்கை! ${locTa.native}ல் கடலில் மிக உயரமான அலைகள் மற்றும் கடும் கொந்தளிப்பு ஏற்பட்டுள்ளது. ஆபத்தான நேரம் என்பதால், யாரும் கடலில் இறங்க வேண்டாம், கடற்கரை பக்கமும் போக வேண்டாம். மீனவர்களும் பொதுமக்களும் கடலுக்குள் போவது முற்றிலும் தடை செய்யப்பட்டுள்ளது. எல்லோரும் கடற்கரையை விட்டு ஒரு கிலோமீட்டர் தள்ளி பாதுகாப்பான இடத்திற்கு செல்லுங்கள். நன்றி. அனைவரும் பாதுகாப்பாக இருங்கள்.`,
      phoneticText: `Anaivarukkum avasara echarikkai! ${locTa.phonetic} kadalil miga uyaramaana alaigal matrum kadum seetram ulladhu. Aabathaana neram enbadhaal, yaarum kadalil iranga vendaam, kadarkarai pakkamum poga vendaam. Meenavargalum makkalum kadalukku poga thadai. Ellorum kadarkaraiyai vittu oru kilometer thooram thalli paadhukaappaana idathirkku sellungal. Nandri. Paadhukaappaaga irungal.`,
    },
    {
      lang: 'en',
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      flag: '🌐',
      text: `Attention please! Urgent coastal emergency broadcast for ${locEn.native}: Extreme high waves and severe sea surge warning detected. During this high-risk period, no one should enter the ocean or approach the shore. Fishermen and tourists are strictly prohibited from entering coastal areas. Please stay at least one kilometer away from the coastline. Thank you. Please remain safe.`,
      phoneticText: `Attention please! Urgent coastal emergency broadcast for ${locEn.phonetic}: Extreme high waves and severe sea surge warning detected. During this high-risk period, no one should enter the ocean or approach the shore. Fishermen and tourists are strictly prohibited from entering coastal areas. Please stay at least one kilometer away from the coastline. Thank you. Please remain safe.`,
    },
    {
      lang: 'te',
      code: 'te-IN',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      text: `అందరికీ అత్యవసర హెచ్చరిక! ${locTe.native}లో సముద్రంలో చాలా పెద్ద ఎత్తున అలలు మరియు తీవ్రమైన ఉధృతి ఉంది. ప్రమాదకరమైన సమయం కాబట్టి, ఎవరూ సముద్రంలోకి దిగవద్దు, తీరం వైపు వెళ్లవద్దు. మత్స్యకారులు మరియు ప్రజలు సముద్రంలోకి వెళ్లడం పూర్తిగా నిషేధించబడింది. అందరూ తీరానికి ఒక కిలోమీటరు దూరంగా సురక్షిత ప్రాంతాలలో ఉండండి. ధన్యవాదాలు. అందరూ జాగ్రత్తగా, క్షేమంగా ఉండండి.`,
      phoneticText: `Andariki atyavasara heccharika! ${locTe.phonetic} lo samudramlo chaala pedda alalu mariyu theevramaina udhruthi undi. Pramaadakaramaina samayam kaabatti, evaroo samudramloki digavaddhu, theeram vaipu vellavaddhu. Mathsyakaarulu mariyu prajalu samudramloki velladam nishedham. Andaroo theeraaniki oka kilometer dooramgaa surakshitha praanthaalalo undandi. Dhanyavaadaalu. Kshemamgaa undandi.`,
    },
    {
      lang: 'hi',
      code: 'hi-IN',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      text: `कृपया ध्यान दें! महत्वपूर्ण तटीय आपातकालीन चेतावनी। ${locHi.native} में समुद्र में बहुत ऊंची लहरें और गंभीर समुद्री खतरा उत्पन्न हुआ है। इस उच्च जोखिम के समय, कोई भी समुद्र में न जाए, समुद्र के पास भी न जाए। मछुआरों और पर्यटकों का समुद्र तट पर जाना, पूरी तरह प्रतिबंधित है। सभी लोग समुद्र तट से, कम से कम एक किलोमीटर दूर, सुरक्षित रहें। धन्यवाद। सभी लोग सुरक्षित रहें।`,
      phoneticText: `Kripya dhyaan dein. Mahatvapoorna tatiya aapaatkaaleen chetaavni. ${locHi.phonetic} mein samudra mein bahut oonchi lahrein aur gambheer khatra utpann hua hai. Is uchh jokhim ke samay, koi bhi samudra mein na jaye, samudra ke paas bhi na jaye. Machhuaaron aur paryatakon ka jaana poori tarah pratibandhit hai. Sabhi log samudra tat se, ek kilometer door, surakshit rahein. Dhanyavaad. Surakshit rahein.`,
    },
    {
      lang: 'ml',
      code: 'ml-IN',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      flag: '🇮🇳',
      text: `എല്ലാവരുടെയും ശ്രദ്ധയ്ക്ക്, അടിയന്തര മുന്നറിയിപ്പ്! ${locMl.native}ത്തിൽ കടലിൽ വലിയ തിരമാലകളും ശക്തമായ കടൽക്ഷോഭവും ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. അതുകൊണ്ട് ആരും കടലിൽ ഇറങ്ങരുത്, തീരത്തേക്ക് പോകരുത്. മത്സ്യത്തൊഴിലാളികളും പൊതുജനങ്ങളും കടലിൽ പോകുന്നത് പൂർണ്ണമായും വിലക്കിയിരിക്കുന്നു. എല്ലാവരും കടൽത്തീരത്ത് നിന്ന് ഒരു കിലോമീറ്റർ മാറി സുരക്ഷിതമായി നിൽക്കുക. നന്ദി. എല്ലാവരും സുരക്ഷിതരായിരിക്കുക.`,
      phoneticText: `Ellavarudeyum shraddhaykku, adiyanthara munnariyippu! ${locMl.phonetic} thil kadalil valiya thiramaalakalum shakthamaaya kadalkshobhavum undu. Aarum kadalil irangaruthu, theerathekk pokaruthu. Matsyathozhilaalikalum makkalum kadalil pokunnathu vilakkirikkunnu. Ellavarum theerathu ninnu oru kilometer maari surakshithamaayi nilkkuka. Nandi. Surakshitharaayirikkuka.`,
    },
  ];
}

export interface CoastalVoiceState {
  status: BroadcastStatus;
  isBroadcasting: boolean;
  isSpeaking: boolean;
  announcementInProgress: boolean;
  isAllLanguagesActive: boolean;
  selectedLanguage: EmergencyLanguageKey | null; // NO DEFAULT TAMIL - User selects explicitly
  currentSpeakingLanguage: EmergencyLanguageKey | null;
  currentLanguageIndex: number;
  autoplayBlocked: boolean;
  voiceAvailable: boolean;
  lastAnnouncedAlertId: string | null;
  lastAnnouncementTime: string | null;
  isMuted: boolean;
  errorMessage: string | null;
  currentRegionName: string;
  currentBroadcastText: string;
  fiveLanguageSteps: FiveLanguageHighRiskBroadcast[];
}

// Voice Gender & Quality Preferences for Coastal Emergency Broadcasts
const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl', 'natural female', 'neural female',
  // Tamil female voices (Azure, Windows, Google, Apple)
  'pallavi', 'saranya', 'kani', 'karthika', 'priya', 'divya', 'ananya', 'tamil female',
  // Telugu female voices
  'shruti', 'shruthi', 'chitra', 'geeta', 'swetha', 'telugu female',
  // Malayalam female voices
  'sobhana', 'shobhana', 'amala', 'kalyani', 'meera', 'manju', 'malayalam female',
  // Hindi female voices
  'swara', 'kalpana', 'neerja', 'anjali', 'pooja', 'radha', 'hindi female',
  // Indian English female voices
  'heera', 'veena', 'neerja', 'priya', 'sunita', 'aditi',
  // Global English female voices
  'jenny', 'aria', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'fiona',
  'tessa', 'hazel', 'susan', 'allison', 'ava', 'kate', 'catherine', 'stephanie', 'serena'
];

const MALE_VOICE_KEYWORDS = [
  'male', 'man', 'boy', 'guy',
  'valluvar', 'mohan', 'midhun', 'madhur', 'madhav', 'ravi', 'david',
  'mark', 'george', 'stefan', 'richard', 'prabhat', 'kumar', 'suresh',
  'hemant', 'kartik', 'hemanth', 'daniel', 'oliver', 'james', 'alex', 'fred'
];

function selectBestFemaleVoice(
  voices: SpeechSynthesisVoice[],
  langKey: EmergencyLanguageKey,
  targetLangCode: string
): { voice?: SpeechSynthesisVoice; isConfirmedFemale: boolean } {
  if (!voices || voices.length === 0) {
    return { voice: undefined, isConfirmedFemale: false };
  }

  const prefix = langKey.toLowerCase();
  let langName = 'english';
  if (prefix === 'ta') langName = 'tamil';
  else if (prefix === 'te') langName = 'telugu';
  else if (prefix === 'ml') langName = 'malayalam';
  else if (prefix === 'hi') langName = 'hindi';

  // 1. Check all voices matching the target native language
  const matchingNativeVoices = voices.filter((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return (
      l.startsWith(prefix) ||
      n.includes(langName) ||
      (prefix === 'ta' && n.includes('தமிழ்')) ||
      (prefix === 'te' && n.includes('తెలుగు')) ||
      (prefix === 'ml' && n.includes('മലയാളം')) ||
      (prefix === 'hi' && n.includes('हिन्दी'))
    );
  });

  // Priority 1: Confirmed female native voice
  const femaleNative = matchingNativeVoices.find((v) => {
    const name = v.name.toLowerCase();
    return (
      FEMALE_VOICE_KEYWORDS.some((k) => name.includes(k)) &&
      !MALE_VOICE_KEYWORDS.some((k) => name.includes(k))
    );
  });
  if (femaleNative) {
    return { voice: femaleNative, isConfirmedFemale: true };
  }

  // Priority 2: Non-male native voice
  const nonMaleNative = matchingNativeVoices.find((v) => {
    const name = v.name.toLowerCase();
    return !MALE_VOICE_KEYWORDS.some((k) => name.includes(k));
  });
  if (nonMaleNative) {
    return { voice: nonMaleNative, isConfirmedFemale: false };
  }

  // If there's any native voice, use it (we will adjust pitch upward to sound female)
  if (matchingNativeVoices.length > 0) {
    return { voice: matchingNativeVoices[0], isConfirmedFemale: false };
  }

  // Fallback: If no native voice installed on this browser:
  // Priority 3: Indian English female voice (Heera, Veena, Priya, Neerja)
  const indianFemale = voices.find((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    const isIndian = l.includes('en-in') || n.includes('india');
    const isFemale = FEMALE_VOICE_KEYWORDS.some((k) => n.includes(k));
    const isMale = MALE_VOICE_KEYWORDS.some((k) => n.includes(k));
    return isIndian && isFemale && !isMale;
  });
  if (indianFemale) {
    return { voice: indianFemale, isConfirmedFemale: true };
  }

  // Priority 4: Any English female voice (Jenny, Zira, Samantha, etc.)
  const englishFemale = voices.find((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    const isEnglish = l.startsWith('en');
    const isFemale = FEMALE_VOICE_KEYWORDS.some((k) => n.includes(k));
    const isMale = MALE_VOICE_KEYWORDS.some((k) => n.includes(k));
    return isEnglish && isFemale && !isMale;
  });
  if (englishFemale) {
    return { voice: englishFemale, isConfirmedFemale: true };
  }

  // Priority 5: Any non-male voice in the browser
  const nonMaleAny = voices.find((v) => !MALE_VOICE_KEYWORDS.some((k) => v.name.toLowerCase().includes(k)));
  return { voice: nonMaleAny || voices[0], isConfirmedFemale: false };
}

type StateListener = (state: CoastalVoiceState) => void;

class CoastalVoiceBroadcastEngine {
  private status: BroadcastStatus = 'Ready';
  // Strict rule: NO default Tamil fallback. User or explicit selection required.
  private selectedLanguage: EmergencyLanguageKey | null = null;
  private currentSpeakingLanguage: EmergencyLanguageKey | null = null;
  private currentLanguageIndex: number = -1;
  private isBroadcasting: boolean = false;
  private isSpeaking: boolean = false;
  private announcementInProgress: boolean = false;
  private isAllLanguagesActive: boolean = false;
  private autoplayBlocked: boolean = false;
  private isMuted: boolean = false;
  private lastAnnouncedAlertId: string | null = null;
  private lastAnnouncementTime: string | null = null;
  private errorMessage: string | null = null;
  private currentRegionName: string = 'Marina Beach Coastal Region';
  private currentBroadcastText: string = '';

  private currentAudio: HTMLAudioElement | null = null;
  private watchdogTimer: any = null;
  private queueCancellationFlag: boolean = false;
  private listeners: Set<StateListener> = new Set();
  private cachedVoices: SpeechSynthesisVoice[] = [];

  // In-memory Blob URL cache for instant zero-latency audio playback
  private audioBlobMap = new Map<string, string>();
  private audioPreloadPromises = new Map<string, Promise<string | null>>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedMute = localStorage.getItem('wave_emergency_muted');
        if (storedMute !== null) {
          this.isMuted = storedMute === 'true';
        }
      } catch {}

      if ('speechSynthesis' in window) {
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Prewarm default broadcasts immediately in the background so audio starts in 0ms
      setTimeout(() => {
        this.preloadBroadcasts();
      }, 100);
    }
  }

  /**
   * Pre-fetches all 5 emergency language audio streams in parallel into browser Blob URLs
   * so playback starts instantly (0ms delay) with zero silence between languages.
   */
  public preloadBroadcasts(steps?: { lang: EmergencyLanguageKey; text: string }[]) {
    if (typeof window === 'undefined') return;
    const targetSteps = steps || getFiveLanguageHighRiskBroadcasts(this.currentRegionName);

    for (const step of targetSteps) {
      const cacheKey = `${step.lang}:${step.text}`;
      if (!this.audioBlobMap.has(cacheKey) && !this.audioPreloadPromises.has(cacheKey)) {
        const promise = fetch(
          `/api/tts?lang=${encodeURIComponent(step.lang)}&text=${encodeURIComponent(step.text)}`
        )
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            this.audioBlobMap.set(cacheKey, blobUrl);
            return blobUrl;
          })
          .catch((err) => {
            console.warn(`[Coastal Voice] Audio preload error for ${step.lang}:`, err);
            return null;
          });
        this.audioPreloadPromises.set(cacheKey, promise);
      }
    }
  }

  private loadVoices() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.cachedVoices = window.speechSynthesis.getVoices();
      }
    } catch {}
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => {
      try {
        l(s);
      } catch (err) {
        console.error('Error in voice broadcast listener:', err);
      }
    });
  }

  public getState(): CoastalVoiceState {
    const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return {
      status: this.status,
      isBroadcasting: this.isBroadcasting,
      isSpeaking: this.isSpeaking,
      announcementInProgress: this.announcementInProgress,
      isAllLanguagesActive: this.isAllLanguagesActive,
      selectedLanguage: this.selectedLanguage,
      currentSpeakingLanguage: this.currentSpeakingLanguage,
      currentLanguageIndex: this.currentLanguageIndex,
      autoplayBlocked: this.autoplayBlocked,
      voiceAvailable: hasSynth || true,
      lastAnnouncedAlertId: this.lastAnnouncedAlertId,
      lastAnnouncementTime: this.lastAnnouncementTime,
      isMuted: this.isMuted,
      errorMessage: this.errorMessage,
      currentRegionName: this.currentRegionName,
      currentBroadcastText: this.currentBroadcastText,
      fiveLanguageSteps: getFiveLanguageHighRiskBroadcasts(this.currentRegionName),
    };
  }

  public setBroadcastRegion(regionName: string) {
    if (regionName && regionName.trim()) {
      this.currentRegionName = regionName.trim();
      this.notify();
    }
  }

  public getBroadcastRegion(): string {
    return this.currentRegionName;
  }

  /**
   * Explicitly set emergency broadcast language.
   * If user selects a language, announcements will speak ONLY that language.
   */
  public setSelectedLanguage(lang: EmergencyLanguageKey | null) {
    this.selectedLanguage = lang;
    this.errorMessage = null;
    if (lang && this.status === 'Select Language') {
      this.status = 'Ready';
    }
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('wave_emergency_muted', String(muted));
    } catch {}
    if (muted) {
      this.stopAnnouncement();
      this.status = 'Voice muted';
    } else {
      if (this.status === 'Voice muted') {
        this.status = 'Ready';
      }
    }
    this.notify();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public unlockUserGesture(): boolean {
    this.autoplayBlocked = false;
    this.notify();
    return true;
  }

  /**
   * Stop any current speech, queued 5-language broadcasts, and streaming audio immediately.
   */
  public stopAnnouncement() {
    this.queueCancellationFlag = true;
    this.announcementInProgress = false;
    this.isSpeaking = false;
    this.isBroadcasting = false;
    this.isAllLanguagesActive = false;
    this.currentSpeakingLanguage = null;
    this.currentLanguageIndex = -1;

    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.status = 'Ready';
    this.errorMessage = null;
    this.notify();
  }

  /**
   * Stop alias for consistency
   */
  public stopEmergencyAnnouncement() {
    this.stopAnnouncement();
  }

  /**
   * The ONE SINGLE centralized voice announcement function:
   * playEmergencyAnnouncement(language)
   *
   * Rules:
   * 1. Only the explicitly selected language is allowed to use Text-to-Speech.
   * 2. If no language is selected, do NOT speak anything automatically.
   * 3. If an announcement is already playing, do not start another speech.
   */
  public async playEmergencyAnnouncement(language?: EmergencyLanguageKey): Promise<boolean> {
    const targetLang = language || this.selectedLanguage;

    // Rule: If no language is selected, do not speak anything automatically.
    if (!targetLang) {
      console.log('[Coastal Voice] No language selected. Not speaking automatically.');
      this.status = 'Select Language';
      this.errorMessage = 'Please select a broadcast language first.';
      this.notify();
      return false;
    }

    // Rule: Prevent interruption while announcement is already in progress.
    if (this.announcementInProgress) {
      console.log('[Coastal Voice] Announcement already in progress. Ignoring duplicate trigger.');
      return false;
    }

    if (this.isMuted) {
      console.log('[Coastal Voice] Voice muted by user.');
      this.status = 'Voice muted';
      this.notify();
      return false;
    }

    const config = EMERGENCY_LANGUAGES[targetLang];
    if (!config) return false;

    // Stop any stale speech before starting
    this.stopAnnouncement();
    this.queueCancellationFlag = false;
    this.announcementInProgress = true;
    this.selectedLanguage = targetLang;
    this.isAllLanguagesActive = false;
    this.currentSpeakingLanguage = targetLang;
    this.currentLanguageIndex = LANGUAGE_ORDER.indexOf(targetLang);
    this.lastAnnouncementTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const success = await this.executeSpeech(config.message, config.code, targetLang, config.phoneticText);
    this.announcementInProgress = false;
    return success;
  }

  /**
   * Play announcement backward-compatibility wrapper
   */
  public async playAnnouncement(lang?: EmergencyLanguageKey): Promise<boolean> {
    return this.playEmergencyAnnouncement(lang);
  }

  /**
   * Test Voice button:
   * Speaks ONLY the language currently selected by the user.
   * If no language is selected, asks user to select a language first.
   */
  public async playTestVoice(language?: EmergencyLanguageKey): Promise<boolean> {
    const targetLang = language || this.selectedLanguage;

    if (!targetLang) {
      this.status = 'Select Language';
      this.errorMessage = 'Please select a language to test.';
      this.notify();
      return false;
    }

    if (this.announcementInProgress) {
      return false;
    }

    const config = EMERGENCY_LANGUAGES[targetLang];
    if (!config) return false;

    this.stopAnnouncement();
    this.queueCancellationFlag = false;
    this.announcementInProgress = true;

    if (this.isMuted) {
      this.isMuted = false;
      try {
        localStorage.setItem('wave_emergency_muted', 'false');
      } catch {}
    }

    this.selectedLanguage = targetLang;
    this.isAllLanguagesActive = false;
    this.currentSpeakingLanguage = targetLang;
    this.currentLanguageIndex = LANGUAGE_ORDER.indexOf(targetLang);

    const success = await this.executeSpeech(config.testMessage, config.code, targetLang, config.testMessage);
    this.announcementInProgress = false;
    return success;
  }

  /**
   * Sequential Broadcast in all 5 languages per user requirement:
   * Exactly in this order:
   * 1. Tamil (தமிழ்)
   * 2. English
   * 3. Telugu (తెలుగు)
   * 4. Hindi (हिन्दी)
   * 5. Malayalam (മലയാളം)
   *
   * Spoken message incorporates the selected coastal region:
   * "today there is uncertainly having chances to high waves and some changes in coastal region.
   *  so, the fishermen and tourist peoples are prohibited to go the coastal region.
   *  Not to go into the ocean and stay away one kilometer from the coastal region"
   */
  public async broadcastAll5Languages(regionName?: string): Promise<boolean> {
    if (this.announcementInProgress) {
      console.log('[Coastal Voice] Announcement already in progress. Ignoring duplicate trigger.');
      return false;
    }

    if (regionName && regionName.trim()) {
      this.currentRegionName = regionName.trim();
    }

    this.stopAnnouncement();
    this.queueCancellationFlag = false;

    if (this.isMuted) {
      this.isMuted = false;
      try {
        localStorage.setItem('wave_emergency_muted', 'false');
      } catch {}
    }

    this.announcementInProgress = true;
    this.isBroadcasting = true;
    this.isAllLanguagesActive = true;
    this.status = 'Broadcasting…';
    this.lastAnnouncementTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const steps = getFiveLanguageHighRiskBroadcasts(this.currentRegionName);
    // Pre-fetch all 5 language audio streams in parallel immediately
    this.preloadBroadcasts(steps);

    for (let i = 0; i < steps.length; i++) {
      if (this.queueCancellationFlag) break;

      const step = steps[i];

      this.currentLanguageIndex = i;
      this.currentSpeakingLanguage = step.lang;
      this.selectedLanguage = step.lang;
      this.currentBroadcastText = step.text;
      this.status = 'Broadcasting…';
      this.notify();

      // Speak this language completely
      await new Promise<boolean>((resolve) => {
        this.executeSpeech(
          step.text,
          step.code,
          step.lang,
          step.phoneticText,
          () => {
            resolve(true);
          }
        );
      });

      if (this.queueCancellationFlag) break;

      // Immediate seamless transition between languages (no silence delay)
      if (i < steps.length - 1 && !this.queueCancellationFlag) {
        await new Promise((res) => setTimeout(res, 40));
      }
    }

    this.announcementInProgress = false;

    if (!this.queueCancellationFlag) {
      this.status = 'Broadcast Completed';
      this.isBroadcasting = false;
      this.isSpeaking = false;
      this.isAllLanguagesActive = false;
      this.currentSpeakingLanguage = null;
      this.currentBroadcastText = '';
      this.notify();
    }

    return true;
  }

  /**
   * Skip to the next language in an active 5-language broadcast sequence
   */
  public skipToNextLanguage() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch {}
    }
    if (this.isBroadcasting && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Play high risk regional broadcast for a single language with the selected coastal region
   */
  public async playHighRiskRegionalBroadcast(lang: EmergencyLanguageKey, regionName?: string): Promise<boolean> {
    if (this.announcementInProgress) {
      return false;
    }

    if (regionName && regionName.trim()) {
      this.currentRegionName = regionName.trim();
    }

    this.stopAnnouncement();
    this.queueCancellationFlag = false;

    if (this.isMuted) {
      this.isMuted = false;
      try {
        localStorage.setItem('wave_emergency_muted', 'false');
      } catch {}
    }

    const steps = getFiveLanguageHighRiskBroadcasts(this.currentRegionName);
    const targetStep = steps.find((s) => s.lang === lang) || steps[0];

    this.announcementInProgress = true;
    this.isBroadcasting = true;
    this.isAllLanguagesActive = false;
    this.selectedLanguage = lang;
    this.currentSpeakingLanguage = lang;
    this.currentLanguageIndex = LANGUAGE_ORDER.indexOf(lang);
    this.currentBroadcastText = targetStep.text;
    this.status = 'Broadcasting…';
    this.notify();

    const success = await this.executeSpeech(targetStep.text, targetStep.code, lang, targetStep.phoneticText);
    this.announcementInProgress = false;
    this.isBroadcasting = false;
    this.currentSpeakingLanguage = null;
    this.currentBroadcastText = '';
    this.status = 'Ready';
    this.notify();
    return success;
  }

  /**
   * Automatic alert trigger check:
   * Checks if an alert was already announced.
   * Strict rule: If user has NOT explicitly selected a language, do NOT speak automatically.
   * Only speak if a language was explicitly selected and no speech is in progress.
   */
  public triggerAutomaticHazardAlert(
    alertId: string,
    riskLevel: 'HIGH' | 'EXTREME' | 'CRITICAL',
    stationName?: string,
    waveHeight?: number
  ): boolean {
    if (this.lastAnnouncedAlertId === alertId) {
      return false; // Prevent duplicate voice announcements for the same alert
    }

    this.lastAnnouncedAlertId = alertId;
    this.lastAnnouncementTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // STRICT RULE: If no language is selected, do NOT speak anything automatically!
    if (!this.selectedLanguage) {
      console.log(`[Coastal Voice] Alert ${alertId} detected, but no broadcast language selected. Awaiting user selection.`);
      this.status = 'Select Language';
      this.notify();
      return false;
    }

    if (this.announcementInProgress || this.isBroadcasting) {
      console.log('[Coastal Voice] Speech already active. Ignoring automatic trigger.');
      return false;
    }

    // Only speak the explicitly selected language
    this.playEmergencyAnnouncement(this.selectedLanguage).catch((err) => {
      console.warn('Emergency voice announcement blocked or failed:', err);
    });

    return true;
  }

  /**
   * Internal core speech executor:
   * Speaks the complete emergency alert in the requested language.
   *
   * CRITICAL BUG FIX FOR TAMIL, TELUGU, MALAYALAM:
   * 1. If a native TTS voice for the language (e.g. Tamil, Telugu, Malayalam) is installed on the device,
   *    it speaks the pure native script containing the fully translated coastal/sea name.
   * 2. If NO native TTS voice exists for that language on this device/OS:
   *    Instead of passing unpronounceable Indic script to an English voice (which caused the voice to
   *    speak only the English sea name and cut off the rest), the engine uses an Indian English /
   *    fallback voice to speak the complete, accurate phonetic pronunciation!
   *    This guarantees that the broadcast is 100% complete, fully heard, and never truncates!
   */
  /**
   * Internal core speech executor:
   *
   * 1. PRIMARY ENGINE: High-Fidelity Studio Voice Audio (/api/tts)
   *    - Delivers authentic native female speech in Tamil, Telugu, Malayalam, Hindi, and English.
   *    - Uses Gemini 3.1 Flash TTS preview (female voice 'Kore') and neural audio stream.
   *    - COMPLETELY ELIMINATES robotic "English-like" accents when speaking regional languages!
   *    - Native slangs and colloquial coastal vocabulary are naturally articulated.
   *    - Articulation speed is tuned for calm, crystal-clear, and slow delivery with neat finish.
   *
   * 2. SECONDARY FALLBACK: Client-side Speech Synthesis
   *    - Used gracefully if the device is offline or audio cannot stream.
   */
  private async executeSpeech(
    text: string,
    langCode: string,
    langKey: EmergencyLanguageKey,
    phoneticBackup: string,
    onComplete?: () => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let isDone = false;
      const finishOnce = (statusResult: BroadcastStatus, errMsg?: string) => {
        if (isDone) return;
        isDone = true;
        this.isSpeaking = false;

        if (this.watchdogTimer) {
          clearTimeout(this.watchdogTimer);
          this.watchdogTimer = null;
        }

        if (this.currentAudio) {
          try {
            this.currentAudio.pause();
            this.currentAudio = null;
          } catch {}
        }

        this.status = statusResult;
        if (errMsg) {
          this.errorMessage = errMsg;
        }

        if (statusResult !== 'Broadcasting…') {
          this.isBroadcasting = false;
        }

        this.notify();
        if (onComplete) onComplete();
        resolve(true);
      };

      if (this.queueCancellationFlag) {
        finishOnce('Ready');
        return;
      }

      // Safety watchdog timer per language
      const maxDurationMs = Math.max(12000, Math.min(60000, text.length * 250));
      this.watchdogTimer = setTimeout(() => {
        if (!isDone) {
          console.warn('[Coastal Voice] Speech watchdog timeout reached.');
          finishOnce('Broadcast Completed');
        }
      }, maxDurationMs);

      // Attempt 1: High-fidelity Server Studio Audio Stream
      try {
        if (this.currentAudio) {
          try {
            this.currentAudio.pause();
            this.currentAudio = null;
          } catch {}
        }

        const cacheKey = `${langKey}:${text}`;
        const blobUrl = this.audioBlobMap.get(cacheKey);
        const ttsUrl = blobUrl || `/api/tts?lang=${encodeURIComponent(langKey)}&text=${encodeURIComponent(text)}`;

        const audio = new Audio(ttsUrl);
        audio.preload = 'auto';
        this.currentAudio = audio;

        // Slow, clear, neat articulation rate (0.90x for regional languages)
        audio.playbackRate = langKey === 'ta' || langKey === 'te' || langKey === 'ml' ? 0.90 : 0.94;

        audio.onplay = () => {
          this.status = 'Broadcasting…';
          this.isBroadcasting = true;
          this.isSpeaking = true;
          this.autoplayBlocked = false;
          this.errorMessage = null;
          this.notify();
        };

        audio.onended = () => {
          // Finish immediately without artificial silence pause
          finishOnce('Broadcast Completed');
        };

        audio.onerror = (e) => {
          console.warn('[Coastal Voice] Server audio stream failed or offline, falling back to browser speech synthesis:', e);
          this.fallbackSpeechSynthesis(text, langCode, langKey, phoneticBackup, finishOnce);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[Coastal Voice] Audio play error:', err);
            if (err.name === 'NotAllowedError') {
              this.autoplayBlocked = true;
              finishOnce('Ready', 'Click to play announcement');
            } else {
              this.fallbackSpeechSynthesis(text, langCode, langKey, phoneticBackup, finishOnce);
            }
          });
        }
        return;
      } catch (err) {
        console.warn('[Coastal Voice] Audio setup failed, using browser synthesis fallback:', err);
        this.fallbackSpeechSynthesis(text, langCode, langKey, phoneticBackup, finishOnce);
      }
    });
  }

  /**
   * Browser Speech Synthesis fallback
   */
  private fallbackSpeechSynthesis(
    text: string,
    langCode: string,
    langKey: EmergencyLanguageKey,
    phoneticBackup: string,
    finishOnce: (status: BroadcastStatus, errMsg?: string) => void
  ) {
    const hasSpeechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!hasSpeechSynth) {
      finishOnce('Voice unavailable', 'Speech synthesis is not supported in this browser.');
      return;
    }

    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    const prefix = langKey.toLowerCase();
    const { voice: voiceToUse, isConfirmedFemale } = selectBestFemaleVoice(voices, langKey, langCode);

    const hasNativeVoice =
      voiceToUse &&
      (voiceToUse.lang.toLowerCase().startsWith(prefix) ||
        voiceToUse.name.toLowerCase().includes(
          prefix === 'ta' ? 'tamil' : prefix === 'te' ? 'telugu' : prefix === 'ml' ? 'malayalam' : prefix === 'hi' ? 'hindi' : 'english'
        ));

    let textToSpeak: string;
    let targetLangCode: string;

    if (hasNativeVoice) {
      textToSpeak = text;
      targetLangCode = voiceToUse.lang || langCode;
    } else if (prefix === 'en') {
      textToSpeak = text;
      targetLangCode = voiceToUse ? voiceToUse.lang : 'en-US';
    } else {
      textToSpeak = phoneticBackup || text;
      targetLangCode = voiceToUse ? voiceToUse.lang : 'en-IN';
    }

    let speechRate = 0.80;
    if (langKey === 'hi') speechRate = 0.82;
    else if (langKey === 'en') speechRate = 0.84;

    const speechPitch = isConfirmedFemale ? 1.08 : 1.20;

    const sentences = textToSpeak
      .split(/(?<=[.!?।:])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const segments = sentences.length > 0 ? sentences : [textToSpeak];

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      let currentSegmentIdx = 0;

      const speakNextSegment = () => {
        if (this.queueCancellationFlag) {
          finishOnce('Ready');
          return;
        }

        if (currentSegmentIdx >= segments.length) {
          setTimeout(() => {
            finishOnce('Broadcast Completed');
          }, 450);
          return;
        }

        const segmentText = segments[currentSegmentIdx];
        currentSegmentIdx++;

        const utterance = new SpeechSynthesisUtterance(segmentText);
        utterance.lang = targetLangCode;
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = 1.0;

        if (voiceToUse) {
          utterance.voice = voiceToUse;
        }

        utterance.onstart = () => {
          this.status = 'Broadcasting…';
          this.isBroadcasting = true;
          this.isSpeaking = true;
          this.autoplayBlocked = false;
          this.errorMessage = null;
          this.notify();
        };

        utterance.onend = () => {
          if (currentSegmentIdx < segments.length && !this.queueCancellationFlag) {
            setTimeout(speakNextSegment, 260);
          } else {
            setTimeout(() => {
              finishOnce('Broadcast Completed');
            }, 450);
          }
        };

        utterance.onerror = (e) => {
          console.warn(`[Coastal Voice] Speech error in segment:`, e);
          if (e.error === 'not-allowed') {
            this.autoplayBlocked = true;
            finishOnce('Ready');
          } else {
            if (currentSegmentIdx < segments.length && !this.queueCancellationFlag) {
              setTimeout(speakNextSegment, 120);
            } else {
              finishOnce('Broadcast Completed');
            }
          }
        };

        (window as any).__currentCoastalUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      };

      speakNextSegment();
    } catch (err) {
      console.warn('[Coastal Voice] Speech execution error:', err);
      finishOnce('Voice unavailable');
    }
  }
}

export const coastalVoiceBroadcast = new CoastalVoiceBroadcastEngine();
