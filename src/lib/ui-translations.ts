/**
 * Static UI translations for customer-facing chrome.
 *
 * Menu-item text is translated server-side; these cover the fixed labels the
 * guest sees before (and around) the menu — the welcome sheet, table strip,
 * guest-count stepper, bottom bar, etc.
 *
 * Each language matches a code in `LANGUAGES` from `./languages.ts`.
 */

export interface UIStrings {
  /* ---- OrderModeSheet: choose step ---- */
  welcomeTo: string;          // "Welcome to {name}"
  howToOrder: string;         // "How would you like to order?"
  imAtTable: string;          // "I'm at table {n}"
  eatingHere: string;         // "I'm eating here"
  dineInDesc: string;         // "Order to your table …"
  pickupTakeaway: string;     // "Pickup / takeaway"
  collectAtCounter: string;   // "Collect it at the counter."
  minimum: string;            // "Minimum ₹{n}."

  /* ---- OrderModeSheet: guests step ---- */
  howManyEating: string;      // "How many are eating?"
  portionNote: string;        // "So the kitchen knows …"

  /* ---- OrderModeSheet: table step ---- */
  whichTable: string;         // "Which table are you at?"
  tableNote: string;          // "So the kitchen knows where …"
  noTablesOpen: string;       // "No tables are open …"

  /* ---- OrderModeSheet: pickup step ---- */
  whosCollecting: string;     // "Who's collecting?"
  pickupFormNote: string;     // "A name to call out …"
  yourName: string;           // "Your name, e.g. Aarav"
  mobile: string;             // "Mobile, e.g. 98765 43210"
  tellUsWho: string;          // "Tell us who the order is for."
  tenDigitMobile: string;     // "A 10-digit mobile number …"

  /* ---- OrderModeSheet: buttons ---- */
  startOrdering: string;      // "Start ordering"
  nextPickTable: string;      // "Next — pick a table"
  back: string;               // "Back"

  /* ---- TableStrip / SeatStrip ---- */
  table: string;              // "Table"
  seats: string;              // "seats"
  change: string;             // "Change"

  /* ---- GuestCount ---- */
  howManyPeople: string;      // "How many people?"
  helpsUsPortion: string;     // "Helps us portion and serve"

  /* ---- PickupStrip ---- */
  collectingFrom: string;     // "Collecting from {name}"
  minimumOrder: string;       // "Minimum order ₹{n}"
  eatingInInstead: string;    // "Eating in instead?"

  /* ---- Bottom bar / MenuShell ---- */
  viewOrder: string;          // "View order"
  addDishToStart: string;     // "Add a dish to start"
  orderInProgress: string;    // "Order in progress"
  staff: string;              // "Staff"
  yourOrder: string;          // "Your order"
  toCollect: string;          // "To collect"
  orderStatus: string;        // "Order status"
  updatesOnItsOwn: string;    // "Updates on its own."
  yourPastOrders: string;     // "Your past orders"

  /* ---- Stage text ---- */
  sentToKitchen: string;      // "Sent to kitchen"
  accepted: string;           // "Accepted"
  cooking: string;            // "Cooking"
  ready: string;              // "Ready"
  served: string;             // "Served"
}

const en: UIStrings = {
  welcomeTo: "Welcome to {name}",
  howToOrder: "How would you like to order?",
  imAtTable: "I'm at table {n}",
  eatingHere: "I'm eating here",
  dineInDesc: "Order to your table and follow it as it cooks.",
  pickupTakeaway: "Pickup / takeaway",
  collectAtCounter: "Collect it at the counter.",
  minimum: "Minimum ₹{n}.",

  howManyEating: "How many are eating?",
  portionNote: "So the kitchen knows how much to make.",

  whichTable: "Which table are you at?",
  tableNote: "So the kitchen knows where to bring it.",
  noTablesOpen: "No tables are open right now. Please ask a server.",

  whosCollecting: "Who's collecting?",
  pickupFormNote: "A name to call out and a number to ring.",
  yourName: "Your name, e.g. Aarav",
  mobile: "Mobile, e.g. 98765 43210",
  tellUsWho: "Tell us who the order is for.",
  tenDigitMobile: "A 10-digit mobile number, so they can call when it's ready.",

  startOrdering: "Start ordering",
  nextPickTable: "Next — pick a table",
  back: "Back",

  table: "Table",
  seats: "seats",
  change: "Change",

  howManyPeople: "How many people?",
  helpsUsPortion: "Helps us portion and serve",

  collectingFrom: "Collecting from {name}",
  minimumOrder: "Minimum order ₹{n}",
  eatingInInstead: "Eating in instead?",

  viewOrder: "View order",
  addDishToStart: "Add a dish to start",
  orderInProgress: "Order in progress",
  staff: "Staff",
  yourOrder: "Your order",
  toCollect: "To collect",
  orderStatus: "Order status",
  updatesOnItsOwn: "Updates on its own.",
  yourPastOrders: "Order history",

  sentToKitchen: "Sent to kitchen",
  accepted: "Accepted",
  cooking: "Cooking",
  ready: "Ready",
  served: "Served",
};

const hi: UIStrings = {
  welcomeTo: "{name} में आपका स्वागत है",
  howToOrder: "आप कैसे ऑर्डर करना चाहेंगे?",
  imAtTable: "मैं टेबल {n} पर हूँ",
  eatingHere: "मैं यहीं खा रहा/रही हूँ",
  dineInDesc: "अपनी टेबल पर ऑर्डर करें और बनते हुए ट्रैक करें।",
  pickupTakeaway: "पिकअप / पार्सल",
  collectAtCounter: "काउंटर से ले जाएँ।",
  minimum: "न्यूनतम ₹{n}।",

  howManyEating: "कितने लोग खा रहे हैं?",
  portionNote: "ताकि किचन को पता चले कितना बनाना है।",

  whichTable: "आप किस टेबल पर हैं?",
  tableNote: "ताकि किचन को पता चले कहाँ लाना है।",
  noTablesOpen: "अभी कोई टेबल खाली नहीं है। कृपया वेटर से पूछें।",

  whosCollecting: "कौन ले जाएगा?",
  pickupFormNote: "पुकारने के लिए नाम और कॉल करने के लिए नंबर।",
  yourName: "आपका नाम, जैसे आरव",
  mobile: "मोबाइल, जैसे 98765 43210",
  tellUsWho: "बताइए ऑर्डर किसके लिए है।",
  tenDigitMobile: "10 अंकों का मोबाइल नंबर, ताकि तैयार होने पर कॉल कर सकें।",

  startOrdering: "ऑर्डर शुरू करें",
  nextPickTable: "आगे — टेबल चुनें",
  back: "वापस",

  table: "टेबल",
  seats: "सीटें",
  change: "बदलें",

  howManyPeople: "कितने लोग हैं?",
  helpsUsPortion: "परोसने में मदद करता है",

  collectingFrom: "{name} से ले जा रहे हैं",
  minimumOrder: "न्यूनतम ऑर्डर ₹{n}",
  eatingInInstead: "यहीं खाना है?",

  viewOrder: "ऑर्डर देखें",
  addDishToStart: "शुरू करने के लिए कोई डिश जोड़ें",
  orderInProgress: "ऑर्डर जारी है",
  staff: "स्टाफ़",
  yourOrder: "आपका ऑर्डर",
  toCollect: "लेने के लिए",
  orderStatus: "ऑर्डर स्थिति",
  updatesOnItsOwn: "अपने आप अपडेट होता है।",
  yourPastOrders: "आपके पिछले ऑर्डर",

  sentToKitchen: "किचन में भेजा गया",
  accepted: "स्वीकार किया",
  cooking: "बन रहा है",
  ready: "तैयार",
  served: "परोसा गया",
};

const kn: UIStrings = {
  welcomeTo: "{name} ಗೆ ಸ್ವಾಗತ",
  howToOrder: "ನೀವು ಹೇಗೆ ಆರ್ಡರ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
  imAtTable: "ನಾನು ಟೇಬಲ್ {n} ರಲ್ಲಿದ್ದೇನೆ",
  eatingHere: "ನಾನು ಇಲ್ಲಿಯೇ ತಿನ್ನುತ್ತೇನೆ",
  dineInDesc: "ನಿಮ್ಮ ಟೇಬಲ್‌ಗೆ ಆರ್ಡರ್ ಮಾಡಿ ಮತ್ತು ಅಡುಗೆ ಮಾಡುವುದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
  pickupTakeaway: "ಪಿಕ್‌ಅಪ್ / ಪಾರ್ಸೆಲ್",
  collectAtCounter: "ಕೌಂಟರ್‌ನಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
  minimum: "ಕನಿಷ್ಠ ₹{n}.",

  howManyEating: "ಎಷ್ಟು ಜನ ತಿನ್ನುತ್ತಿದ್ದಾರೆ?",
  portionNote: "ಅಡುಗೆಮನೆಗೆ ಎಷ್ಟು ಮಾಡಬೇಕೆಂದು ತಿಳಿಯುತ್ತದೆ.",

  whichTable: "ನೀವು ಯಾವ ಟೇಬಲ್‌ನಲ್ಲಿದ್ದೀರಿ?",
  tableNote: "ಅಡುಗೆಮನೆಗೆ ಎಲ್ಲಿ ತರಬೇಕೆಂದು ತಿಳಿಯುತ್ತದೆ.",
  noTablesOpen: "ಈಗ ಯಾವುದೇ ಟೇಬಲ್ ತೆರೆದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರ್ವರ್ ಅನ್ನು ಕೇಳಿ.",

  whosCollecting: "ಯಾರು ತೆಗೆದುಕೊಳ್ಳುತ್ತಾರೆ?",
  pickupFormNote: "ಕರೆಯಲು ಹೆಸರು ಮತ್ತು ಫೋನ್ ಮಾಡಲು ನಂಬರ್.",
  yourName: "ನಿಮ್ಮ ಹೆಸರು, ಉದಾ. ಆರವ್",
  mobile: "ಮೊಬೈಲ್, ಉದಾ. 98765 43210",
  tellUsWho: "ಆರ್ಡರ್ ಯಾರಿಗೆ ಎಂದು ಹೇಳಿ.",
  tenDigitMobile: "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ನಂಬರ್, ಸಿದ್ಧವಾದಾಗ ಕರೆ ಮಾಡಲು.",

  startOrdering: "ಆರ್ಡರ್ ಪ್ರಾರಂಭಿಸಿ",
  nextPickTable: "ಮುಂದೆ — ಟೇಬಲ್ ಆಯ್ಕೆಮಾಡಿ",
  back: "ಹಿಂದೆ",

  table: "ಟೇಬಲ್",
  seats: "ಸೀಟುಗಳು",
  change: "ಬದಲಿಸಿ",

  howManyPeople: "ಎಷ್ಟು ಜನ?",
  helpsUsPortion: "ಪರಿಮಾಣ ಮತ್ತು ಸೇವೆಗೆ ಸಹಾಯ",

  collectingFrom: "{name} ನಿಂದ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದಾರೆ",
  minimumOrder: "ಕನಿಷ್ಠ ಆರ್ಡರ್ ₹{n}",
  eatingInInstead: "ಬದಲಿಗೆ ಇಲ್ಲಿ ತಿನ್ನುತ್ತೀರಾ?",

  viewOrder: "ಆರ್ಡರ್ ನೋಡಿ",
  addDishToStart: "ಪ್ರಾರಂಭಿಸಲು ಒಂದು ಡಿಶ್ ಸೇರಿಸಿ",
  orderInProgress: "ಆರ್ಡರ್ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ",
  staff: "ಸ್ಟಾಫ್",
  yourOrder: "ನಿಮ್ಮ ಆರ್ಡರ್",
  toCollect: "ತೆಗೆದುಕೊಳ್ಳಲು",
  orderStatus: "ಆರ್ಡರ್ ಸ್ಥಿತಿ",
  updatesOnItsOwn: "ತಾನಾಗಿಯೇ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.",
  yourPastOrders: "ನಿಮ್ಮ ಹಿಂದಿನ ಆರ್ಡರ್‌ಗಳು",

  sentToKitchen: "ಅಡುಗೆಮನೆಗೆ ಕಳಿಸಲಾಗಿದೆ",
  accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
  cooking: "ಅಡುಗೆ ಮಾಡುತ್ತಿದೆ",
  ready: "ಸಿದ್ಧ",
  served: "ಬಡಿಸಲಾಗಿದೆ",
};

const ta: UIStrings = {
  welcomeTo: "{name} க்கு வரவேற்கிறோம்",
  howToOrder: "எப்படி ஆர்டர் செய்ய விரும்புகிறீர்கள்?",
  imAtTable: "நான் டேபிள் {n} இல் இருக்கிறேன்",
  eatingHere: "நான் இங்கேயே சாப்பிடுகிறேன்",
  dineInDesc: "உங்கள் டேபிளுக்கு ஆர்டர் செய்து சமையலை கண்காணியுங்கள்.",
  pickupTakeaway: "பிக்அப் / பார்சல்",
  collectAtCounter: "கவுண்டரில் எடுத்துக்கொள்ளுங்கள்.",
  minimum: "குறைந்தபட்சம் ₹{n}.",

  howManyEating: "எத்தனை பேர் சாப்பிடுகிறார்கள்?",
  portionNote: "சமையலறைக்கு எவ்வளவு செய்ய வேண்டும் என்று தெரியும்.",

  whichTable: "நீங்கள் எந்த டேபிளில் இருக்கிறீர்கள்?",
  tableNote: "சமையலறைக்கு எங்கே கொண்டு வர வேண்டும் என்று தெரியும்.",
  noTablesOpen: "இப்போது டேபிள்கள் எதுவும் காலியாக இல்லை. சர்வரிடம் கேளுங்கள்.",

  whosCollecting: "யார் எடுத்துக்கொள்வார்கள்?",
  pickupFormNote: "அழைக்க ஒரு பெயரும் தொடர்புகொள்ள ஒரு எண்ணும்.",
  yourName: "உங்கள் பெயர், எ.கா. ஆரவ்",
  mobile: "மொபைல், எ.கா. 98765 43210",
  tellUsWho: "ஆர்டர் யாருக்கு என்று சொல்லுங்கள்.",
  tenDigitMobile: "10 இலக்க மொபைல் எண், தயாரானதும் அழைக்க.",

  startOrdering: "ஆர்டர் தொடங்குங்கள்",
  nextPickTable: "அடுத்து — டேபிள் தேர்ந்தெடுங்கள்",
  back: "பின்னால்",

  table: "டேபிள்",
  seats: "இருக்கைகள்",
  change: "மாற்று",

  howManyPeople: "எத்தனை பேர்?",
  helpsUsPortion: "பரிமாறவும் சேவை செய்யவும் உதவுகிறது",

  collectingFrom: "{name} இலிருந்து எடுக்கிறீர்கள்",
  minimumOrder: "குறைந்தபட்ச ஆர்டர் ₹{n}",
  eatingInInstead: "பதிலாக இங்கே சாப்பிடுகிறீர்களா?",

  viewOrder: "ஆர்டர் பார்க்க",
  addDishToStart: "தொடங்க ஒரு உணவு சேர்க்கவும்",
  orderInProgress: "ஆர்டர் நடைபெறுகிறது",
  staff: "ஊழியர்",
  yourOrder: "உங்கள் ஆர்டர்",
  toCollect: "எடுக்க",
  orderStatus: "ஆர்டர் நிலை",
  updatesOnItsOwn: "தானாகவே புதுப்பிக்கப்படும்.",
  yourPastOrders: "உங்கள் முந்தைய ஆர்டர்கள்",

  sentToKitchen: "சமையலறைக்கு அனுப்பப்பட்டது",
  accepted: "ஏற்றுக்கொள்ளப்பட்டது",
  cooking: "சமைக்கிறது",
  ready: "தயார்",
  served: "பரிமாறப்பட்டது",
};

const te: UIStrings = {
  welcomeTo: "{name} కి స్వాగతం",
  howToOrder: "మీరు ఎలా ఆర్డర్ చేయాలనుకుంటున్నారు?",
  imAtTable: "నేను టేబుల్ {n} వద్ద ఉన్నాను",
  eatingHere: "నేను ఇక్కడే తింటాను",
  dineInDesc: "మీ టేబుల్‌కి ఆర్డర్ చేసి వంట ట్రాక్ చేయండి.",
  pickupTakeaway: "పికప్ / పార్సెల్",
  collectAtCounter: "కౌంటర్ వద్ద తీసుకోండి.",
  minimum: "కనిష్టం ₹{n}.",

  howManyEating: "ఎంతమంది తింటున్నారు?",
  portionNote: "వంటగది ఎంత చేయాలో తెలుస్తుంది.",

  whichTable: "మీరు ఏ టేబుల్ వద్ద ఉన్నారు?",
  tableNote: "వంటగది ఎక్కడ తేవాలో తెలుస్తుంది.",
  noTablesOpen: "ప్రస్తుతం టేబుల్‌లు ఖాళీగా లేవు. దయచేసి సర్వర్‌ని అడగండి.",

  whosCollecting: "ఎవరు తీసుకుంటారు?",
  pickupFormNote: "పిలవడానికి పేరు మరియు కాల్ చేయడానికి నంబర్.",
  yourName: "మీ పేరు, ఉదా. ఆరవ్",
  mobile: "మొబైల్, ఉదా. 98765 43210",
  tellUsWho: "ఆర్డర్ ఎవరికోసం చెప్పండి.",
  tenDigitMobile: "10 అంకెల మొబైల్ నంబర్, సిద్ధమైనప్పుడు కాల్ చేయడానికి.",

  startOrdering: "ఆర్డర్ ప్రారంభించండి",
  nextPickTable: "తదుపరి — టేబుల్ ఎంచుకోండి",
  back: "వెనక్కి",

  table: "టేబుల్",
  seats: "సీట్లు",
  change: "మార్చు",

  howManyPeople: "ఎంతమంది?",
  helpsUsPortion: "పరిమాణం మరియు సేవకు సహాయం",

  collectingFrom: "{name} నుండి తీసుకుంటున్నారు",
  minimumOrder: "కనిష్ట ఆర్డర్ ₹{n}",
  eatingInInstead: "బదులుగా ఇక్కడ తింటారా?",

  viewOrder: "ఆర్డర్ చూడండి",
  addDishToStart: "ప్రారంభించడానికి ఒక వంటకం జోడించండి",
  orderInProgress: "ఆర్డర్ ప్రగతిలో ఉంది",
  staff: "స్టాఫ్",
  yourOrder: "మీ ఆర్డర్",
  toCollect: "తీసుకోవడానికి",
  orderStatus: "ఆర్డర్ స్థితి",
  updatesOnItsOwn: "స్వయంచాలకంగా అప్‌డేట్ అవుతుంది.",
  yourPastOrders: "మీ గత ఆర్డర్‌లు",

  sentToKitchen: "వంటగదికి పంపబడింది",
  accepted: "ఆమోదించబడింది",
  cooking: "వంట చేస్తోంది",
  ready: "సిద్ధం",
  served: "అందించబడింది",
};

const ml: UIStrings = {
  welcomeTo: "{name} ലേക്ക് സ്വാഗതം",
  howToOrder: "നിങ്ങൾ എങ്ങനെ ഓർഡർ ചെയ്യാൻ ആഗ്രഹിക്കുന്നു?",
  imAtTable: "ഞാൻ ടേബിൾ {n} ൽ ആണ്",
  eatingHere: "ഞാൻ ഇവിടെ കഴിക്കുകയാണ്",
  dineInDesc: "നിങ്ങളുടെ ടേബിളിലേക്ക് ഓർഡർ ചെയ്ത് പാചകം ട്രാക്ക് ചെയ്യൂ.",
  pickupTakeaway: "പിക്കപ്പ് / പാർസൽ",
  collectAtCounter: "കൗണ്ടറിൽ നിന്ന് എടുക്കൂ.",
  minimum: "കുറഞ്ഞത് ₹{n}.",

  howManyEating: "എത്ര പേർ കഴിക്കുന്നു?",
  portionNote: "അടുക്കളയ്ക്ക് എത്ര ഉണ്ടാക്കണമെന്ന് അറിയാം.",

  whichTable: "നിങ്ങൾ ഏത് ടേബിളിലാണ്?",
  tableNote: "അടുക്കളയ്ക്ക് എവിടെ കൊണ്ടുവരണമെന്ന് അറിയാം.",
  noTablesOpen: "ഇപ്പോൾ ടേബിളുകൾ ഒഴിവില്ല. ദയവായി സർവറിനോട് ചോദിക്കൂ.",

  whosCollecting: "ആരാണ് എടുക്കുന്നത്?",
  pickupFormNote: "വിളിക്കാൻ ഒരു പേരും ബന്ധപ്പെടാൻ ഒരു നമ്പരും.",
  yourName: "നിങ്ങളുടെ പേര്, ഉദാ. ആരവ്",
  mobile: "മൊബൈൽ, ഉദാ. 98765 43210",
  tellUsWho: "ഓർഡർ ആർക്കെന്ന് പറയൂ.",
  tenDigitMobile: "10 അക്ക മൊബൈൽ നമ്പർ, തയ്യാറാകുമ്പോൾ വിളിക്കാൻ.",

  startOrdering: "ഓർഡർ ആരംഭിക്കുക",
  nextPickTable: "അടുത്തത് — ടേബിൾ തിരഞ്ഞെടുക്കൂ",
  back: "പിന്നിലേക്ക്",

  table: "ടേബിൾ",
  seats: "സീറ്റുകൾ",
  change: "മാറ്റുക",

  howManyPeople: "എത്ര പേർ?",
  helpsUsPortion: "വിളമ്പാനും സേവിക്കാനും സഹായിക്കുന്നു",

  collectingFrom: "{name} ൽ നിന്ന് എടുക്കുന്നു",
  minimumOrder: "കുറഞ്ഞ ഓർഡർ ₹{n}",
  eatingInInstead: "പകരം ഇവിടെ കഴിക്കുന്നോ?",

  viewOrder: "ഓർഡർ കാണുക",
  addDishToStart: "ആരംഭിക്കാൻ ഒരു വിഭവം ചേർക്കൂ",
  orderInProgress: "ഓർഡർ പുരോഗതിയിലാണ്",
  staff: "സ്റ്റാഫ്",
  yourOrder: "നിങ്ങളുടെ ഓർഡർ",
  toCollect: "എടുക്കാൻ",
  orderStatus: "ഓർഡർ നില",
  updatesOnItsOwn: "സ്വയം അപ്‌ഡേറ്റ് ചെയ്യുന്നു.",
  yourPastOrders: "നിങ്ങളുടെ മുൻ ഓർഡറുകൾ",

  sentToKitchen: "അടുക്കളയിലേക്ക് അയച്ചു",
  accepted: "സ്വീകരിച്ചു",
  cooking: "പാചകം ചെയ്യുന്നു",
  ready: "തയ്യാർ",
  served: "വിളമ്പി",
};

const mr: UIStrings = {
  welcomeTo: "{name} मध्ये आपले स्वागत आहे",
  howToOrder: "तुम्हाला कसे ऑर्डर करायचे आहे?",
  imAtTable: "मी टेबल {n} वर आहे",
  eatingHere: "मी इथेच जेवतो/जेवते",
  dineInDesc: "तुमच्या टेबलवर ऑर्डर करा आणि बनताना ट्रॅक करा.",
  pickupTakeaway: "पिकअप / पार्सल",
  collectAtCounter: "काउंटरवरून घ्या.",
  minimum: "किमान ₹{n}.",

  howManyEating: "किती जण जेवत आहेत?",
  portionNote: "म्हणजे किचनला किती बनवायचे ते कळेल.",

  whichTable: "तुम्ही कोणत्या टेबलवर आहात?",
  tableNote: "म्हणजे किचनला कुठे आणायचे ते कळेल.",
  noTablesOpen: "सध्या कोणतेही टेबल रिकामे नाही. कृपया वेटरला विचारा.",

  whosCollecting: "कोण घेऊन जाणार?",
  pickupFormNote: "बोलवण्यासाठी नाव आणि कॉल करण्यासाठी नंबर.",
  yourName: "तुमचे नाव, उदा. आरव",
  mobile: "मोबाइल, उदा. 98765 43210",
  tellUsWho: "ऑर्डर कोणासाठी ते सांगा.",
  tenDigitMobile: "10 अंकी मोबाइल नंबर, तयार झाल्यावर कॉल करण्यासाठी.",

  startOrdering: "ऑर्डर सुरू करा",
  nextPickTable: "पुढे — टेबल निवडा",
  back: "मागे",

  table: "टेबल",
  seats: "सीट्स",
  change: "बदला",

  howManyPeople: "किती जण आहेत?",
  helpsUsPortion: "वाढण्यास मदत करते",

  collectingFrom: "{name} वरून घेत आहात",
  minimumOrder: "किमान ऑर्डर ₹{n}",
  eatingInInstead: "इथेच जेवायचे आहे?",

  viewOrder: "ऑर्डर पहा",
  addDishToStart: "सुरू करण्यासाठी एक डिश जोडा",
  orderInProgress: "ऑर्डर सुरू आहे",
  staff: "स्टाफ",
  yourOrder: "तुमची ऑर्डर",
  toCollect: "घेण्यासाठी",
  orderStatus: "ऑर्डर स्थिती",
  updatesOnItsOwn: "आपोआप अपडेट होते.",
  yourPastOrders: "तुमच्या मागील ऑर्डर्स",

  sentToKitchen: "किचनला पाठवले",
  accepted: "स्वीकारले",
  cooking: "बनत आहे",
  ready: "तयार",
  served: "वाढले",
};

const bn: UIStrings = {
  welcomeTo: "{name} এ স্বাগতম",
  howToOrder: "কিভাবে অর্ডার করতে চান?",
  imAtTable: "আমি টেবিল {n} এ আছি",
  eatingHere: "আমি এখানেই খাচ্ছি",
  dineInDesc: "আপনার টেবিলে অর্ডার করুন এবং রান্না ট্র্যাক করুন।",
  pickupTakeaway: "পিকআপ / পার্সেল",
  collectAtCounter: "কাউন্টার থেকে নিন।",
  minimum: "ন্যূনতম ₹{n}।",

  howManyEating: "কতজন খাচ্ছেন?",
  portionNote: "রান্নাঘর জানবে কতটুকু বানাতে হবে।",

  whichTable: "আপনি কোন টেবিলে আছেন?",
  tableNote: "রান্নাঘর জানবে কোথায় আনতে হবে।",
  noTablesOpen: "এখন কোনো টেবিল খালি নেই। দয়া করে সার্ভারকে জিজ্ঞাসা করুন।",

  whosCollecting: "কে নেবেন?",
  pickupFormNote: "ডাকার জন্য নাম এবং কল করার জন্য নম্বর।",
  yourName: "আপনার নাম, যেমন আরভ",
  mobile: "মোবাইল, যেমন 98765 43210",
  tellUsWho: "অর্ডার কার জন্য বলুন।",
  tenDigitMobile: "১০ সংখ্যার মোবাইল নম্বর, তৈরি হলে কল করতে।",

  startOrdering: "অর্ডার শুরু করুন",
  nextPickTable: "পরবর্তী — টেবিল বেছে নিন",
  back: "পিছনে",

  table: "টেবিল",
  seats: "আসন",
  change: "পরিবর্তন",

  howManyPeople: "কতজন?",
  helpsUsPortion: "পরিবেশনে সাহায্য করে",

  collectingFrom: "{name} থেকে নিচ্ছেন",
  minimumOrder: "ন্যূনতম অর্ডার ₹{n}",
  eatingInInstead: "বদলে এখানে খাচ্ছেন?",

  viewOrder: "অর্ডার দেখুন",
  addDishToStart: "শুরু করতে একটি পদ যোগ করুন",
  orderInProgress: "অর্ডার চলছে",
  staff: "স্টাফ",
  yourOrder: "আপনার অর্ডার",
  toCollect: "নেওয়ার জন্য",
  orderStatus: "অর্ডার অবস্থা",
  updatesOnItsOwn: "নিজে থেকে আপডেট হয়।",
  yourPastOrders: "আপনার আগের অর্ডার",

  sentToKitchen: "রান্নাঘরে পাঠানো হয়েছে",
  accepted: "গৃহীত",
  cooking: "রান্না হচ্ছে",
  ready: "তৈরি",
  served: "পরিবেশিত",
};

const gu: UIStrings = {
  welcomeTo: "{name} માં આપનું સ્વાગત છે",
  howToOrder: "તમે કેવી રીતે ઓર્ડર કરવા માંગો છો?",
  imAtTable: "હું ટેબલ {n} પર છું",
  eatingHere: "હું અહીં જ ખાઈ રહ્યો/રહી છું",
  dineInDesc: "તમારા ટેબલ પર ઓર્ડર કરો અને રસોઈ ટ્રેક કરો.",
  pickupTakeaway: "પિકઅપ / પાર્સલ",
  collectAtCounter: "કાઉન્ટર પરથી લઈ જાવ.",
  minimum: "ન્યૂનતમ ₹{n}.",

  howManyEating: "કેટલા લોકો ખાઈ રહ્યા છે?",
  portionNote: "જેથી રસોડાને ખબર પડે કેટલું બનાવવું.",

  whichTable: "તમે કયા ટેબલ પર છો?",
  tableNote: "જેથી રસોડાને ખબર પડે ક્યાં લાવવું.",
  noTablesOpen: "હાલ કોઈ ટેબલ ખાલી નથી. કૃપા કરી વેઈટરને પૂછો.",

  whosCollecting: "કોણ લેવા આવશે?",
  pickupFormNote: "બોલાવવા માટે નામ અને કોલ કરવા માટે નંબર.",
  yourName: "તમારું નામ, દા.ત. આરવ",
  mobile: "મોબાઈલ, દા.ત. 98765 43210",
  tellUsWho: "ઓર્ડર કોના માટે છે તે જણાવો.",
  tenDigitMobile: "10 અંકનો મોબાઈલ નંબર, તૈયાર થાય ત્યારે કોલ કરવા.",

  startOrdering: "ઓર્ડર શરૂ કરો",
  nextPickTable: "આગળ — ટેબલ પસંદ કરો",
  back: "પાછળ",

  table: "ટેબલ",
  seats: "સીટ",
  change: "બદલો",

  howManyPeople: "કેટલા લોકો?",
  helpsUsPortion: "પીરસવામાં મદદ કરે છે",

  collectingFrom: "{name} થી લઈ રહ્યા છો",
  minimumOrder: "ન્યૂનતમ ઓર્ડર ₹{n}",
  eatingInInstead: "અહીં જ ખાવું છે?",

  viewOrder: "ઓર્ડર જુઓ",
  addDishToStart: "શરૂ કરવા એક વાનગી ઉમેરો",
  orderInProgress: "ઓર્ડર ચાલુ છે",
  staff: "સ્ટાફ",
  yourOrder: "તમારો ઓર્ડર",
  toCollect: "લેવા માટે",
  orderStatus: "ઓર્ડર સ્થિતિ",
  updatesOnItsOwn: "આપોઆપ અપડેટ થાય છે.",
  yourPastOrders: "તમારા અગાઉના ઓર્ડર",

  sentToKitchen: "રસોડામાં મોકલ્યો",
  accepted: "સ્વીકાર્યો",
  cooking: "બની રહ્યું છે",
  ready: "તૈયાર",
  served: "પીરસાયું",
};

const pa: UIStrings = {
  welcomeTo: "{name} ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ",
  howToOrder: "ਤੁਸੀਂ ਕਿਵੇਂ ਆਰਡਰ ਕਰਨਾ ਚਾਹੋਗੇ?",
  imAtTable: "ਮੈਂ ਟੇਬਲ {n} 'ਤੇ ਹਾਂ",
  eatingHere: "ਮੈਂ ਇੱਥੇ ਹੀ ਖਾ ਰਿਹਾ/ਰਹੀ ਹਾਂ",
  dineInDesc: "ਆਪਣੇ ਟੇਬਲ 'ਤੇ ਆਰਡਰ ਕਰੋ ਅਤੇ ਪਕਾਉਣਾ ਟ੍ਰੈਕ ਕਰੋ.",
  pickupTakeaway: "ਪਿਕਅੱਪ / ਪਾਰਸਲ",
  collectAtCounter: "ਕਾਊਂਟਰ ਤੋਂ ਲੈ ਜਾਓ.",
  minimum: "ਘੱਟੋ-ਘੱਟ ₹{n}.",

  howManyEating: "ਕਿੰਨੇ ਲੋਕ ਖਾ ਰਹੇ ਹਨ?",
  portionNote: "ਤਾਂ ਜੋ ਰਸੋਈ ਨੂੰ ਪਤਾ ਲੱਗੇ ਕਿੰਨਾ ਬਣਾਉਣਾ ਹੈ.",

  whichTable: "ਤੁਸੀਂ ਕਿਹੜੇ ਟੇਬਲ 'ਤੇ ਹੋ?",
  tableNote: "ਤਾਂ ਜੋ ਰਸੋਈ ਨੂੰ ਪਤਾ ਲੱਗੇ ਕਿੱਥੇ ਲੈ ਕੇ ਆਉਣਾ ਹੈ.",
  noTablesOpen: "ਹੁਣ ਕੋਈ ਟੇਬਲ ਖਾਲੀ ਨਹੀਂ ਹੈ. ਕਿਰਪਾ ਕਰਕੇ ਵੇਟਰ ਨੂੰ ਪੁੱਛੋ.",

  whosCollecting: "ਕੌਣ ਲੈ ਕੇ ਜਾਵੇਗਾ?",
  pickupFormNote: "ਬੁਲਾਉਣ ਲਈ ਨਾਮ ਅਤੇ ਕਾਲ ਕਰਨ ਲਈ ਨੰਬਰ.",
  yourName: "ਤੁਹਾਡਾ ਨਾਮ, ਜਿਵੇਂ ਆਰਵ",
  mobile: "ਮੋਬਾਈਲ, ਜਿਵੇਂ 98765 43210",
  tellUsWho: "ਦੱਸੋ ਆਰਡਰ ਕਿਸ ਲਈ ਹੈ.",
  tenDigitMobile: "10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ, ਤਿਆਰ ਹੋਣ 'ਤੇ ਕਾਲ ਕਰਨ ਲਈ.",

  startOrdering: "ਆਰਡਰ ਸ਼ੁਰੂ ਕਰੋ",
  nextPickTable: "ਅੱਗੇ — ਟੇਬਲ ਚੁਣੋ",
  back: "ਪਿੱਛੇ",

  table: "ਟੇਬਲ",
  seats: "ਸੀਟਾਂ",
  change: "ਬਦਲੋ",

  howManyPeople: "ਕਿੰਨੇ ਲੋਕ?",
  helpsUsPortion: "ਪਰੋਸਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ",

  collectingFrom: "{name} ਤੋਂ ਲੈ ਰਹੇ ਹੋ",
  minimumOrder: "ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ₹{n}",
  eatingInInstead: "ਇੱਥੇ ਹੀ ਖਾਣਾ ਹੈ?",

  viewOrder: "ਆਰਡਰ ਵੇਖੋ",
  addDishToStart: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਇੱਕ ਪਕਵਾਨ ਜੋੜੋ",
  orderInProgress: "ਆਰਡਰ ਜਾਰੀ ਹੈ",
  staff: "ਸਟਾਫ਼",
  yourOrder: "ਤੁਹਾਡਾ ਆਰਡਰ",
  toCollect: "ਲੈਣ ਲਈ",
  orderStatus: "ਆਰਡਰ ਸਥਿਤੀ",
  updatesOnItsOwn: "ਆਪਣੇ ਆਪ ਅੱਪਡੇਟ ਹੁੰਦਾ ਹੈ.",
  yourPastOrders: "ਤੁਹਾਡੇ ਪਿਛਲੇ ਆਰਡਰ",

  sentToKitchen: "ਰਸੋਈ ਨੂੰ ਭੇਜਿਆ",
  accepted: "ਮਨਜ਼ੂਰ",
  cooking: "ਬਣ ਰਿਹਾ ਹੈ",
  ready: "ਤਿਆਰ",
  served: "ਪਰੋਸਿਆ",
};

const ur: UIStrings = {
  welcomeTo: "{name} میں خوش آمدید",
  howToOrder: "آپ کیسے آرڈر کرنا چاہیں گے؟",
  imAtTable: "میں ٹیبل {n} پر ہوں",
  eatingHere: "میں یہیں کھا رہا/رہی ہوں",
  dineInDesc: "اپنی ٹیبل پر آرڈر کریں اور پکنے کی نگرانی کریں۔",
  pickupTakeaway: "پک اپ / پارسل",
  collectAtCounter: "کاؤنٹر سے لے جائیں۔",
  minimum: "کم از کم ₹{n}۔",

  howManyEating: "کتنے لوگ کھا رہے ہیں؟",
  portionNote: "تاکہ باورچی خانے کو پتا ہو کتنا بنانا ہے۔",

  whichTable: "آپ کس ٹیبل پر ہیں؟",
  tableNote: "تاکہ باورچی خانے کو پتا ہو کہاں لانا ہے۔",
  noTablesOpen: "ابھی کوئی ٹیبل خالی نہیں۔ براہ کرم ویٹر سے پوچھیں۔",

  whosCollecting: "کون لے جائے گا؟",
  pickupFormNote: "بلانے کے لیے نام اور کال کرنے کے لیے نمبر۔",
  yourName: "آپ کا نام، مثلاً آرو",
  mobile: "موبائل، مثلاً 98765 43210",
  tellUsWho: "بتائیں آرڈر کس کے لیے ہے۔",
  tenDigitMobile: "10 ہندسے کا موبائل نمبر، تیار ہونے پر کال کرنے کے لیے۔",

  startOrdering: "آرڈر شروع کریں",
  nextPickTable: "اگلا — ٹیبل چنیں",
  back: "واپس",

  table: "ٹیبل",
  seats: "سیٹیں",
  change: "تبدیل کریں",

  howManyPeople: "کتنے لوگ؟",
  helpsUsPortion: "پیش کرنے میں مدد کرتا ہے",

  collectingFrom: "{name} سے لے رہے ہیں",
  minimumOrder: "کم از کم آرڈر ₹{n}",
  eatingInInstead: "یہیں کھانا ہے؟",

  viewOrder: "آرڈر دیکھیں",
  addDishToStart: "شروع کرنے کے لیے ایک ڈش شامل کریں",
  orderInProgress: "آرڈر جاری ہے",
  staff: "اسٹاف",
  yourOrder: "آپ کا آرڈر",
  toCollect: "لینے کے لیے",
  orderStatus: "آرڈر کی حیثیت",
  updatesOnItsOwn: "خود بخود اپ ڈیٹ ہوتا ہے۔",
  yourPastOrders: "آپ کے پچھلے آرڈرز",

  sentToKitchen: "باورچی خانے کو بھیجا گیا",
  accepted: "قبول کیا گیا",
  cooking: "بن رہا ہے",
  ready: "تیار",
  served: "پیش کیا گیا",
};

const ar: UIStrings = {
  welcomeTo: "مرحباً بك في {name}",
  howToOrder: "كيف تريد الطلب؟",
  imAtTable: "أنا على الطاولة {n}",
  eatingHere: "سأتناول الطعام هنا",
  dineInDesc: "اطلب إلى طاولتك وتابع الطهي.",
  pickupTakeaway: "استلام / وجبات خارجية",
  collectAtCounter: "استلم من الكاونتر.",
  minimum: "الحد الأدنى ₹{n}.",

  howManyEating: "كم عدد الأشخاص؟",
  portionNote: "حتى يعرف المطبخ الكمية المطلوبة.",

  whichTable: "على أي طاولة أنت؟",
  tableNote: "حتى يعرف المطبخ أين يقدم الطعام.",
  noTablesOpen: "لا توجد طاولات متاحة الآن. يرجى سؤال النادل.",

  whosCollecting: "من سيستلم؟",
  pickupFormNote: "اسم للنداء ورقم للاتصال.",
  yourName: "اسمك، مثلاً أحمد",
  mobile: "الجوال، مثلاً 98765 43210",
  tellUsWho: "أخبرنا لمن الطلب.",
  tenDigitMobile: "رقم جوال من 10 أرقام، للاتصال عند الجاهزية.",

  startOrdering: "ابدأ الطلب",
  nextPickTable: "التالي — اختر طاولة",
  back: "رجوع",

  table: "طاولة",
  seats: "مقاعد",
  change: "تغيير",

  howManyPeople: "كم شخص؟",
  helpsUsPortion: "يساعد في التقديم",

  collectingFrom: "الاستلام من {name}",
  minimumOrder: "الحد الأدنى للطلب ₹{n}",
  eatingInInstead: "تريد الأكل هنا بدلاً من ذلك؟",

  viewOrder: "عرض الطلب",
  addDishToStart: "أضف طبقاً للبدء",
  orderInProgress: "الطلب قيد التنفيذ",
  staff: "موظف",
  yourOrder: "طلبك",
  toCollect: "للاستلام",
  orderStatus: "حالة الطلب",
  updatesOnItsOwn: "يتحدث تلقائياً.",
  yourPastOrders: "طلباتك السابقة",

  sentToKitchen: "أُرسل إلى المطبخ",
  accepted: "تم القبول",
  cooking: "جارٍ الطهي",
  ready: "جاهز",
  served: "تم التقديم",
};

const fr: UIStrings = {
  welcomeTo: "Bienvenue chez {name}",
  howToOrder: "Comment souhaitez-vous commander ?",
  imAtTable: "Je suis à la table {n}",
  eatingHere: "Je mange ici",
  dineInDesc: "Commandez à votre table et suivez la cuisson.",
  pickupTakeaway: "À emporter",
  collectAtCounter: "Récupérez au comptoir.",
  minimum: "Minimum ₹{n}.",

  howManyEating: "Combien de personnes mangent ?",
  portionNote: "Pour que la cuisine sache combien préparer.",

  whichTable: "À quelle table êtes-vous ?",
  tableNote: "Pour que la cuisine sache où apporter.",
  noTablesOpen: "Aucune table disponible. Veuillez demander au serveur.",

  whosCollecting: "Qui récupère ?",
  pickupFormNote: "Un nom à appeler et un numéro à contacter.",
  yourName: "Votre nom, ex. Jean",
  mobile: "Mobile, ex. 98765 43210",
  tellUsWho: "Dites-nous pour qui est la commande.",
  tenDigitMobile: "Un numéro de mobile à 10 chiffres, pour appeler quand c'est prêt.",

  startOrdering: "Commencer la commande",
  nextPickTable: "Suivant — choisir une table",
  back: "Retour",

  table: "Table",
  seats: "places",
  change: "Changer",

  howManyPeople: "Combien de personnes ?",
  helpsUsPortion: "Aide à portionner et servir",

  collectingFrom: "Retrait chez {name}",
  minimumOrder: "Commande minimum ₹{n}",
  eatingInInstead: "Manger sur place plutôt ?",

  viewOrder: "Voir la commande",
  addDishToStart: "Ajoutez un plat pour commencer",
  orderInProgress: "Commande en cours",
  staff: "Serveur",
  yourOrder: "Votre commande",
  toCollect: "À récupérer",
  orderStatus: "État de la commande",
  updatesOnItsOwn: "Se met à jour automatiquement.",
  yourPastOrders: "Vos commandes précédentes",

  sentToKitchen: "Envoyé en cuisine",
  accepted: "Accepté",
  cooking: "En préparation",
  ready: "Prêt",
  served: "Servi",
};

const de: UIStrings = {
  welcomeTo: "Willkommen bei {name}",
  howToOrder: "Wie möchten Sie bestellen?",
  imAtTable: "Ich bin an Tisch {n}",
  eatingHere: "Ich esse hier",
  dineInDesc: "Bestellen Sie an Ihrem Tisch und verfolgen Sie die Zubereitung.",
  pickupTakeaway: "Zum Mitnehmen",
  collectAtCounter: "An der Theke abholen.",
  minimum: "Mindestens ₹{n}.",

  howManyEating: "Wie viele Personen essen?",
  portionNote: "Damit die Küche weiß, wie viel zubereitet werden soll.",

  whichTable: "An welchem Tisch sitzen Sie?",
  tableNote: "Damit die Küche weiß, wohin das Essen gebracht werden soll.",
  noTablesOpen: "Derzeit sind keine Tische frei. Bitte fragen Sie den Kellner.",

  whosCollecting: "Wer holt ab?",
  pickupFormNote: "Ein Name zum Aufrufen und eine Nummer zum Anrufen.",
  yourName: "Ihr Name, z.B. Max",
  mobile: "Mobil, z.B. 98765 43210",
  tellUsWho: "Sagen Sie uns, für wen die Bestellung ist.",
  tenDigitMobile: "Eine 10-stellige Mobilnummer, damit man anrufen kann, wenn es fertig ist.",

  startOrdering: "Bestellung starten",
  nextPickTable: "Weiter — Tisch wählen",
  back: "Zurück",

  table: "Tisch",
  seats: "Plätze",
  change: "Ändern",

  howManyPeople: "Wie viele Personen?",
  helpsUsPortion: "Hilft beim Portionieren und Servieren",

  collectingFrom: "Abholung bei {name}",
  minimumOrder: "Mindestbestellung ₹{n}",
  eatingInInstead: "Doch lieber hier essen?",

  viewOrder: "Bestellung ansehen",
  addDishToStart: "Ein Gericht hinzufügen, um zu beginnen",
  orderInProgress: "Bestellung läuft",
  staff: "Personal",
  yourOrder: "Ihre Bestellung",
  toCollect: "Zum Abholen",
  orderStatus: "Bestellstatus",
  updatesOnItsOwn: "Aktualisiert sich automatisch.",
  yourPastOrders: "Ihre früheren Bestellungen",

  sentToKitchen: "An die Küche gesendet",
  accepted: "Angenommen",
  cooking: "Wird zubereitet",
  ready: "Fertig",
  served: "Serviert",
};

const es: UIStrings = {
  welcomeTo: "Bienvenido a {name}",
  howToOrder: "¿Cómo desea pedir?",
  imAtTable: "Estoy en la mesa {n}",
  eatingHere: "Voy a comer aquí",
  dineInDesc: "Pida en su mesa y siga la cocción.",
  pickupTakeaway: "Para llevar",
  collectAtCounter: "Recoja en el mostrador.",
  minimum: "Mínimo ₹{n}.",

  howManyEating: "¿Cuántas personas comen?",
  portionNote: "Para que la cocina sepa cuánto preparar.",

  whichTable: "¿En qué mesa está?",
  tableNote: "Para que la cocina sepa adónde llevar.",
  noTablesOpen: "No hay mesas disponibles ahora. Pregunte al mesero.",

  whosCollecting: "¿Quién recoge?",
  pickupFormNote: "Un nombre para llamar y un número para contactar.",
  yourName: "Su nombre, ej. Juan",
  mobile: "Móvil, ej. 98765 43210",
  tellUsWho: "Díganos para quién es el pedido.",
  tenDigitMobile: "Un número de móvil de 10 dígitos, para llamar cuando esté listo.",

  startOrdering: "Empezar a pedir",
  nextPickTable: "Siguiente — elegir mesa",
  back: "Atrás",

  table: "Mesa",
  seats: "asientos",
  change: "Cambiar",

  howManyPeople: "¿Cuántas personas?",
  helpsUsPortion: "Ayuda a porcionar y servir",

  collectingFrom: "Recogiendo de {name}",
  minimumOrder: "Pedido mínimo ₹{n}",
  eatingInInstead: "¿Prefiere comer aquí?",

  viewOrder: "Ver pedido",
  addDishToStart: "Agregue un plato para empezar",
  orderInProgress: "Pedido en curso",
  staff: "Personal",
  yourOrder: "Su pedido",
  toCollect: "Para recoger",
  orderStatus: "Estado del pedido",
  updatesOnItsOwn: "Se actualiza solo.",
  yourPastOrders: "Sus pedidos anteriores",

  sentToKitchen: "Enviado a la cocina",
  accepted: "Aceptado",
  cooking: "Cocinando",
  ready: "Listo",
  served: "Servido",
};

const zh: UIStrings = {
  welcomeTo: "欢迎光临 {name}",
  howToOrder: "您想如何点餐？",
  imAtTable: "我在 {n} 号桌",
  eatingHere: "我在这里用餐",
  dineInDesc: "在您的桌上点餐并跟踪烹饪进度。",
  pickupTakeaway: "自取 / 外带",
  collectAtCounter: "在柜台领取。",
  minimum: "最低 ₹{n}。",

  howManyEating: "几位用餐？",
  portionNote: "方便厨房了解分量。",

  whichTable: "您在哪张桌？",
  tableNote: "方便厨房知道送到哪里。",
  noTablesOpen: "目前没有空桌。请询问服务员。",

  whosCollecting: "谁来取餐？",
  pickupFormNote: "叫号用的名字和联系电话。",
  yourName: "您的姓名，例如 小明",
  mobile: "手机号，例如 98765 43210",
  tellUsWho: "请告诉我们订单是给谁的。",
  tenDigitMobile: "10位手机号码，准备好后会电话通知。",

  startOrdering: "开始点餐",
  nextPickTable: "下一步 — 选择桌位",
  back: "返回",

  table: "桌号",
  seats: "座位",
  change: "更改",

  howManyPeople: "几位？",
  helpsUsPortion: "帮助我们分量和服务",

  collectingFrom: "从 {name} 取餐",
  minimumOrder: "最低订单 ₹{n}",
  eatingInInstead: "改为堂食？",

  viewOrder: "查看订单",
  addDishToStart: "添加一道菜开始",
  orderInProgress: "订单进行中",
  staff: "服务员",
  yourOrder: "您的订单",
  toCollect: "待取",
  orderStatus: "订单状态",
  updatesOnItsOwn: "自动更新。",
  yourPastOrders: "您的历史订单",

  sentToKitchen: "已发送到厨房",
  accepted: "已接受",
  cooking: "烹饪中",
  ready: "已准备好",
  served: "已上菜",
};

const ja: UIStrings = {
  welcomeTo: "{name} へようこそ",
  howToOrder: "どのように注文しますか？",
  imAtTable: "テーブル {n} にいます",
  eatingHere: "ここで食べます",
  dineInDesc: "テーブルから注文して調理状況を追跡しましょう。",
  pickupTakeaway: "テイクアウト",
  collectAtCounter: "カウンターでお受け取りください。",
  minimum: "最低 ₹{n}。",

  howManyEating: "何名様でお食事ですか？",
  portionNote: "キッチンが量を把握するためです。",

  whichTable: "どのテーブルですか？",
  tableNote: "キッチンがどこに届けるか把握するためです。",
  noTablesOpen: "現在空いているテーブルはありません。スタッフにお声がけください。",

  whosCollecting: "受け取りは誰ですか？",
  pickupFormNote: "呼び出し用のお名前と連絡先番号。",
  yourName: "お名前、例：太郎",
  mobile: "携帯番号、例：98765 43210",
  tellUsWho: "注文の受取人を教えてください。",
  tenDigitMobile: "10桁の携帯番号、準備ができたらお電話します。",

  startOrdering: "注文を始める",
  nextPickTable: "次へ — テーブルを選ぶ",
  back: "戻る",

  table: "テーブル",
  seats: "席",
  change: "変更",

  howManyPeople: "何名様？",
  helpsUsPortion: "盛り付けとサービスに役立ちます",

  collectingFrom: "{name} でお受け取り",
  minimumOrder: "最低注文額 ₹{n}",
  eatingInInstead: "店内でお食事にしますか？",

  viewOrder: "注文を見る",
  addDishToStart: "料理を追加して始めましょう",
  orderInProgress: "注文処理中",
  staff: "スタッフ",
  yourOrder: "ご注文",
  toCollect: "お受け取り",
  orderStatus: "注文状況",
  updatesOnItsOwn: "自動で更新されます。",
  yourPastOrders: "過去のご注文",

  sentToKitchen: "キッチンに送信済み",
  accepted: "受付済み",
  cooking: "調理中",
  ready: "準備完了",
  served: "提供済み",
};

/* ------------------------------------------------------------------ */

const TRANSLATIONS: Record<string, UIStrings> = {
  en, hi, kn, ta, te, ml, mr, bn, gu, pa, ur, ar, fr, de, es, zh, ja,
};

/**
 * Look up a translated UI string by key.
 *
 * Falls back to English when the language has no entry.
 */
export function t(key: keyof UIStrings, lang: string): string {
  return (TRANSLATIONS[lang] ?? en)[key];
}

/**
 * Translated stage text for the order tracker pill.
 */
export function stageText(stage: string, lang: string): string {
  const map: Record<string, keyof UIStrings> = {
    placed: "sentToKitchen",
    accepted: "accepted",
    preparing: "cooking",
    ready: "ready",
    served: "served",
  };
  const key = map[stage];
  return key ? t(key, lang) : stage;
}
