/**
 * AI First Aid - Translation Dictionary (English & Tamil)
 */

export const translations = {
  en: {
    // UI Global & Navigation
    title: "AI FIRST AID",
    subtitle: "Emergency Decision Support & Triage",
    erss_ready: "ERSS 2.0 READY",
    active_engine: "Active Engine",
    local_rules: "Local Sandbox Rule Heuristics",
    gemini_live: "Gemini 1.5 Live Connection",
    copilot_tab: "🧠 AI Copilot",
    guide_tab: "🧰 Smart Guide",
    map_tab: "📍 AED / Hospital Map",
    disaster_tab: "🌪️ Disaster Prep",
    profile_tab: "👤 Profile & Contacts",
    
    // Header Settings Panel
    settings_title: "🔑 AI Engine Configuration",
    settings_desc: "By default, AI First Aid uses local heuristics for instant emergency classification. To enable advanced, context-rich NLP answers and real vision image analysis, input your Google Gemini API Key.",
    clear_btn: "Clear",
    
    // AI Copilot
    copilot_title: "AI Emergency Copilot",
    copilot_desc: "Describe the situation clearly. Mention breathing status, conscious status, age (infant/adult), and bleeding.",
    textarea_placeholder: "Describe: 'My friend fell from stairs, is bleeding from head and unresponsive...'",
    voice_mode_active: "Emergency Voice Assistant active. Please state what is happening.",
    voice_prompt_initial: "Describe what is happening...",
    voice_prompt_conscious: "Question: Is the victim conscious?",
    voice_prompt_cough: "Question: Can the victim cough or speak?",
    exit_voice: "Exit Voice Assistant",
    triage_btn: "Analyze Triage",
    image_btn: "Image Assess",
    live_camera: "Live Incident Camera",
    capture_btn: "Capture Frame",
    close_btn: "Close",
    upload_photo: "Upload Photo",
    image_feedback: "AI Image Analysis Feedback:",
    processing_img: "Processing frame algorithms...",
    suspected_category: "Suspected Category:",
    confidence: "Confidence",
    
    // Triage Dashboard results
    emergency_type: "Emergency Type:",
    conscious_status: "Conscious Status:",
    breathing_status: "Breathing:",
    bleeding_severity: "Bleeding Severity:",
    demographic: "Target Demographic:",
    physiological_hazard: "Physiological Hazard:",
    immediate_actions: "IMMEDIATE ACTIONS REQUIRED NOW:",
    open_guide_btn: "Open Step-By-Step Emergency Guide",
    
    // Profile
    profile_summary: "Profile Summary",
    name_lbl: "Name",
    age_lbl: "Age",
    blood_lbl: "Blood Group",
    allergies_lbl: "Allergies",
    conditions_lbl: "Medical Conditions",
    edit_contacts_btn: "Edit Card & Contacts →",
    responder_card: "Emergency Responder Card",
    responder_card_desc: "Show this card to medical professionals or dispatch officers in a crisis.",
    configure_profile: "Configure Medical Profile",
    fullname: "Full Name",
    contacts_header: "Emergency Contact Numbers",
    add_contact: "Add Contact",
    save_btn: "Save Profile Changes",
    saved_success: "Profile Saved Successfully",
    
    // Disaster
    disaster_header: "Disaster Preparedness Center",
    disaster_desc: "Follow these safety measures to minimize risks during structural crises.",
    timeline_before: "🟢 BEFORE",
    timeline_during: "🟠 DURING",
    timeline_after: "🔵 AFTER",
    disaster_sub_before: "Preventive preparation phase: Mitigate risks and build survival buffers before the emergency begins.",
    disaster_sub_during: "High-risk active phase: Protect physical safety immediately. Prioritize shelter and direct survival.",
    disaster_sub_after: "Re-entry and inspection phase: Avoid secondary hazards and check vital signs before restoring routine.",

    // Map
    map_header: "Location-Aware Resource Finder",
    map_desc: "Real-time mapping of AED units and emergency trauma centers near you.",
    map_ref: "Real-time Device GPS & OpenStreetMap",
    user_marker: "Your Location",
    user_marker_desc: "Emergency Incident Area",
    aed_marker: "AED",
    hospital_marker: "HOSPITAL",
    away: "away",
    walk: "walk",

    // Dynamic First-Aid Guides
    guides: {
      cpr: {
        title: "❤️ Cardiopulmonary Resuscitation (CPR)",
        description: "Emergency procedure combining chest compressions and rescue breaths to restore blood flow.",
        steps: {
          Infant: [
            { step: "Check responsiveness: Tap the infant's foot and shout. Check for breathing for max 10 seconds.", bold: true },
            { step: "Place infant on a firm, flat surface. Keep head neutral (do not tilt head back too far)." },
            { step: "Position fingers: Place TWO FINGERS in the center of the chest, just below the nipple line.", bold: true },
            { step: "Give compressions: Compress 1.5 inches deep at a rate of 100-120 compressions per minute.", anim: "compress" },
            { step: "Ratio: Perform 30 compressions followed by 2 gentle rescue breaths (puff cheeks, do not blow hard)." },
            { step: "Repeat cycle until help arrives or the infant shows clear signs of life." }
          ],
          Child: [
            { step: "Check responsiveness: Tap shoulders, shout name. Check breathing for max 10 seconds.", bold: true },
            { step: "Tilt head slightly back to open airway. Pinch nose and give 2 initial rescue breaths." },
            { step: "Position hands: Place ONE or TWO HANDS (depending on child's size) in the center of the chest.", bold: true },
            { step: "Give compressions: Compress 2 inches deep at a rate of 100-120 compressions per minute.", anim: "compress" },
            { step: "Ratio: 30 compressions to 2 rescue breaths." },
            { step: "Continue cycle until help arrives or the child breathes." }
          ],
          Adult: [
            { step: "Check responsiveness: Shake shoulders, shout 'Are you okay?'. Check breathing (5-10 secs).", bold: true },
            { step: "Call 112/108 immediately and get an AED if available." },
            { step: "Position hands: Place heel of one hand in the center of chest; interlock other hand on top.", bold: true },
            { step: "Give compressions: Compress 2 to 2.4 inches deep at a rate of 100-120 compressions per minute.", anim: "compress" },
            { step: "Ensure full chest recoil between compressions. Do not lean on the chest." },
            { step: "Give breaths: Tilt head back, lift chin, pinch nose, and blow 2 breaths. Ratio: 30 compressions to 2 breaths." },
            { step: "Continue cycles. If AED arrives, turn it on and follow verbal prompts immediately." }
          ],
          Elderly: [
            { step: "Check responsiveness: Shout clearly and squeeze shoulder. Check breathing (5-10 secs).", bold: true },
            { step: "Call 112/108 immediately and locate nearby AED." },
            { step: "Position hands: Place heel of one hand in the center of the chest, interlocking the other.", bold: true },
            { step: "Give compressions: Compress 2 inches deep. Rate: 100-120 CPM. Maintain steady pace.", anim: "compress" },
            { step: "Caution: Elderly bones are brittle. Rib fractures may occur, but continue compressions — saving life is priority.", bold: true },
            { step: "Perform 30 compressions to 2 breaths (or do continuous compressions if untrained in breaths)." }
          ]
        }
      },
      choking: {
        title: "😮💨 Choking (Airway Obstruction)",
        description: "Action required when a foreign object blocks the airway, preventing breathing.",
        steps: {
          Infant: [
            { step: "Confirm choking: Cannot cry, cough, or breathe. Face may turn red/blue.", bold: true },
            { step: "Position infant face down along your forearm, supporting their jaw. Point head slightly downward." },
            { step: "Give 5 back blows: Deliver 5 firm blows between the shoulder blades using the heel of your hand.", bold: true },
            { step: "Flip face up: Turn infant face up along your arm, keeping head lower than body." },
            { step: "Give 5 chest thrusts: Use two fingers in the center of the chest, compressing 1.5 inches.", bold: true },
            { step: "Repeat: Alternate 5 back blows and 5 chest thrusts. If they lose responsiveness, begin infant CPR." }
          ],
          Child: [
            { step: "Ask 'Are you choking?'. If they can speak or cough, encourage them to keep coughing." },
            { step: "If they cannot speak or breathe, stand behind them. Wrap arms around their waist." },
            { step: "Make a fist: Place the thumb side of your fist slightly above the belly button.", bold: true },
            { step: "Perform Heimlich maneuver: Give 5 quick inward and upward abdominal thrusts.", bold: true },
            { step: "Alternate: If thrusts fail, give 5 firm back blows between shoulder blades." },
            { step: "Repeat until object is dislodged or child goes unconscious. If unconscious, begin CPR." }
          ],
          Adult: [
            { step: "Verify complete blockage: Patient cannot talk, breathe, or cough; may grasp throat.", bold: true },
            { step: "Stand behind the person, wrap your arms around their waist." },
            { step: "Place fist: Make a fist, thumb side inward, slightly above the navel.", bold: true },
            { step: "Perform abdominal thrusts: Press inward and upward with quick, forceful thrusts.", bold: true },
            { step: "Perform 5 thrusts, check if object cleared. Repeat." },
            { step: "If pregnant or obese: Perform chest thrusts instead of abdominal thrusts (hands higher, on sternum).", bold: true },
            { step: "If they become unresponsive, lower them to the floor, call 112, and start CPR." }
          ],
          Elderly: [
            { step: "Verify blockage. Elderly swallow issues are common. Ensure they are sat up." },
            { step: "Perform standard abdominal thrusts (Heimlich). Be mindful of internal injuries, but apply force.", bold: true },
            { step: "If the elderly person is frail or wheelchair-bound, lean them forward and perform firm back blows.", bold: true },
            { step: "If unresponsive, start CPR. Be careful to check their airway for the dislodged object before breaths." }
          ]
        }
      },
      bleeding: {
        title: "🩸 Severe Bleeding Control",
        description: "Immediate direct pressure protocol to stop critical blood loss.",
        steps: {
          Adult: [
            { step: "Apply immediate direct pressure to the wound with a clean, sterile cloth.", bold: true },
            { step: "Hold firm, continuous pressure. Do not lift the cloth to check if bleeding has stopped.", bold: true },
            { step: "Elevate the bleeding site above the level of the heart if possible." },
            { step: "Wrap with a snug bandage. If blood leaks through, add another cloth on top — do not remove the first." },
            { step: "Monitor for cold skin, pale face, or lethargy (signs of shock)." }
          ]
        }
      },
      burn: {
        title: "🔥 Burn First Aid",
        description: "Cooling and dressing protocols for thermal, chemical, or radiation burns.",
        steps: {
          Adult: [
            { step: "Cool the burn: Run cool, tepid tap water over the burn for 10-15 minutes immediately. Do not use cold/ice water.", bold: true },
            { step: "Keep the rest of the patient warm with a blanket to prevent hypothermia.", bold: true },
            { step: "Do NOT apply butter, oil, grease, or ointments to the burn." },
            { step: "Remove clothing near the burn, but do not pull off clothing that is stuck to the wound." },
            { step: "Cover loosely with sterile, non-stick gauze. Seek immediate medical care." }
          ]
        }
      },
      shock: {
        title: "⚡ Electric Shock First Aid",
        description: "Safety protocols and vital support for electrocution or physiological shock.",
        steps: {
          Adult: [
            { step: "Do NOT touch the person if they are still touching the electrical current.", bold: true },
            { step: "Turn off the main power supply immediately. Or use a wooden broom/plastic object to push them away.", bold: true },
            { step: "Once safe, check for responsiveness and breathing. If absent, start CPR immediately.", bold: true },
            { step: "If they are breathing but shocked, lay them flat on their back and elevate legs 12 inches.", bold: true },
            { step: "Cover with a blanket to keep them warm. Treat any entry/exit burns with cool water and dry dressings." }
          ]
        }
      },
      fracture: {
        title: "🦴 Fracture & Broken Bones",
        description: "Immobilization and stabilization procedures for suspected bone fractures.",
        steps: {
          Adult: [
            { step: "Do NOT try to realign the bone or push a protruding bone back in.", bold: true },
            { step: "Stop any bleeding: Apply pressure to the wound with a clean cloth, avoiding pressing directly on the bone.", bold: true },
            { step: "Immobilize the injured area: Apply a splint (using rolled newspapers, wood, or cardboard) above and below the joint.", bold: true },
            { step: "Apply ice packs wrapped in a towel to reduce swelling. Do not apply ice directly to skin." },
            { step: "Elevate the fractured limb if possible without causing pain." },
            { step: "Keep the person lying down and quiet. Watch for signs of shock." }
          ]
        }
      },
      bite: {
        title: "🐍 Snake & Animal Bites",
        description: "Critical safety protocols to prevent venom spread or infection from bites.",
        steps: {
          Adult: [
            { step: "Keep the victim calm and absolutely still. Movement spreads venom faster.", bold: true },
            { step: "Remove rings, watches, or tight clothing near the bite, as swelling can happen rapidly.", bold: true },
            { step: "Keep the bite site BELOW the level of the heart.", bold: true },
            { step: "Do NOT cut the wound, do NOT try to suck out venom, and do NOT apply ice or tourniquets.", bold: true },
            { step: "Clean the bite site gently with soap and water if it is an animal bite. Cover with a clean bandage." },
            { step: "Try to note the appearance of the snake/animal and call 112/108 immediately." }
          ]
        }
      },
      poison: {
        title: "☠️ Poisoning & Exposure",
        description: "Immediate safety responses to ingested, inhaled, or chemical poisons.",
        steps: {
          Adult: [
            { step: "Identify the poison: Keep the chemical container or pill bottle for paramedics.", bold: true },
            { step: "Do NOT induce vomiting unless explicitly instructed by a doctor or Poison Control.", bold: true },
            { step: "If poison is on skin or eyes, flush immediately with large amounts of clean water for 15 minutes.", bold: true },
            { step: "If poison was inhaled, move the person to fresh air immediately." },
            { step: "If the person is unconscious or not breathing, start CPR immediately. Call 112." }
          ]
        }
      },
      fainting: {
        title: "😵 Fainting & Dizziness",
        description: "Supportive care when a person loses consciousness temporarily.",
        steps: {
          Adult: [
            { step: "Lay the person flat on their back. Elevate their feet about 12 inches.", bold: true },
            { step: "Loosen any tight clothing like collars, ties, or belts.", bold: true },
            { step: "Ensure fresh air circulation around the person. Fan them if necessary." },
            { step: "If they do not regain consciousness within 1 minute, call 112/108 immediately.", bold: true },
            { step: "Check breathing. If they are not breathing, begin CPR." },
            { step: "When they wake up, do not let them get up quickly. Give a glass of water if conscious." }
          ]
        }
      },
      accident: {
        title: "🚗 Accident & Trauma",
        description: "Emergency support for road accidents and severe body injuries.",
        steps: {
          Adult: [
            { step: "Ensure safety first: Turn on vehicle hazards, warn traffic, turn off ignitions of crashed cars.", bold: true },
            { step: "Do NOT move injured victims unless there is an immediate threat of fire or explosion.", bold: true },
            { step: "Control severe bleeding: Apply direct pressure to wounds with clean dressings.", bold: true },
            { step: "Support head and neck: If spinal injury is suspected, prevent the victim's head from rotating or moving.", bold: true },
            { step: "Keep the person warm with blankets, and talk to them to keep them calm until help arrives." }
          ]
        }
      }
    }
  },
  ta: {
    // UI Global & Navigation
    title: "AI முதலுதவி",
    subtitle: "அவசரநிலை முடிவு ஆதரவு மற்றும் வகைப்பாடு",
    erss_ready: "ERSS 2.0 தயாராக உள்ளது",
    active_engine: "செயலில் உள்ள எஞ்சின்",
    local_rules: "உள்ளூர் சாண்ட்பாக்ஸ் விதிமுறை வழிமுறைகள்",
    gemini_live: "ஜெமினி 1.5 நேரடி இணைப்பு",
    copilot_tab: "🧠 AI கோபைலட்",
    guide_tab: "🧰 வழிகாட்டி",
    map_tab: "📍 வரைபடம்",
    disaster_tab: "🌪️ பேரிடர் தயாரிப்பு",
    profile_tab: "👤 சுயவிவரம்",
    
    // Header Settings Panel
    settings_title: "🔑 AI எஞ்சின் கட்டமைப்பு",
    settings_desc: "இயல்பாக, AI முதலுதவி விரைவான அவசர வகைப்பாட்டிற்கு உள்ளூர் வழிமுறைகளைப் பயன்படுத்துகிறது. மேம்பட்ட, சூழல் சார்ந்த பதில்கள் மற்றும் பட பகுப்பாய்வை இயக்க, உங்கள் கூகிள் ஜெமினி API விசையை உள்ளிடவும்.",
    clear_btn: "அழி",
    
    // AI Copilot
    copilot_title: "AI அவசர கோபைலட்",
    copilot_desc: "சூழ்நிலையை தெளிவாக விவரிக்கவும். மூச்சு நிலை, சுயநினைவு, வயது (குழந்தை/பெரியவர்) மற்றும் இரத்தப்போக்கு பற்றி குறிப்பிடவும்.",
    textarea_placeholder: "விவரிக்கவும்: 'என் நண்பர் மாடியிலிருந்து விழுந்துவிட்டார், தலையில் இரத்தப்போக்கு உள்ளது மற்றும் சுயநினைவின்றி இருக்கிறார்...'",
    voice_mode_active: "அவசர குரல் உதவியாளர் செயலில் உள்ளது. என்ன நடக்கிறது என்று சொல்லுங்கள்.",
    voice_prompt_initial: "என்ன நடக்கிறது என்று சொல்லுங்கள்...",
    voice_prompt_conscious: "கேள்வி: நோயாளிக்கு சுயநினைவு உள்ளதா?",
    voice_prompt_cough: "கேள்வி: நோயாளிக்கு இரும அல்லது பேச முடிகிறதா?",
    exit_voice: "குரல் உதவியாளரிலிருந்து வெளியேறு",
    triage_btn: "வகைப்படுத்துக",
    image_btn: "பட பகுப்பாய்வு",
    live_camera: "நேரடி கேமரா",
    capture_btn: "படம் பிடி",
    close_btn: "மூடு",
    upload_photo: "படம் பதிவேற்று",
    image_feedback: "AI பட பகுப்பாய்வு கருத்து:",
    processing_img: "படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    suspected_category: "சந்தேகிக்கப்படும் பிரிவு:",
    confidence: "நம்பகத்தன்மை",
    
    // Triage Dashboard results
    emergency_type: "அவசர வகை:",
    conscious_status: "சுயநினைவு நிலை:",
    breathing_status: "சுவாசம்:",
    bleeding_severity: "இரத்தப்போக்கு தீவிரம்:",
    demographic: "பாதிக்கப்பட்டவர்:",
    physiological_hazard: "உடலியல் ஆபத்து:",
    immediate_actions: "உடனடியாக செய்ய வேண்டிய நடவடிக்கைகள்:",
    open_guide_btn: "முதலுதவி வழிகாட்டியைத் திறக்கவும்",
    
    // Profile
    profile_summary: "சுயவிவர சுருக்கம்",
    name_lbl: "பெயர்",
    age_lbl: "வயது பிரிவு",
    blood_lbl: "இரத்த பிரிவு",
    allergies_lbl: "ஒவ்வாமை",
    conditions_lbl: "மருத்துவ நிலைகள்",
    edit_contacts_btn: "சுயவிவரம் திருத்தவும் →",
    responder_card: "அவசரக்கால மருத்துவ அட்டை",
    responder_card_desc: "நெருக்கடி நேரத்தில் இந்த அட்டையை அவசர மருத்துவ அதிகாரிகளிடம் காண்பிக்கவும்.",
    configure_profile: "மருத்துவ சுயவிவரத்தை உள்ளிடவும்",
    fullname: "முழு பெயர்",
    contacts_header: "அவசர தொடர்பு எண்கள்",
    add_contact: "தொடர்பு சேர்க்க",
    save_btn: "சுயவிவரத்தை சேமிக்கவும்",
    saved_success: "சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது",
    
    // Disaster
    disaster_header: "பேரிடர் மேலாண்மை மையம்",
    disaster_desc: "பேரிடர் காலங்களில் ஆபத்துகளைக் குறைக்க இந்த பாதுகாப்பு நடவடிக்கைகளைப் பின்பற்றவும்.",
    timeline_before: "🟢 முன்னதாக",
    timeline_during: "🟠 போது",
    timeline_after: "🔵 பின்னர்",
    disaster_sub_before: "தடுப்பு தயாரிப்பு கட்டம்: அவசரநிலை தொடங்குவதற்கு முன் ஆபத்துகளை குறைத்து தயாரிப்புகளை மேற்கொள்ளுங்கள்.",
    disaster_sub_during: "அதி ஆபத்து கட்டம்: உடல் பாதுகாப்பிற்கு முன்னுரிமை அளிக்கவும். உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.",
    disaster_sub_after: "ஆய்வு மற்றும் மீட்பு கட்டம்: ஆபத்துகள் நீங்கியதை உறுதிசெய்துவிட்டு இயல்பு வாழ்க்கைக்கு திரும்பவும்.",

    // Map
    map_header: "இருப்பிடம் சார்ந்த மருத்துவ தேடுபொறி",
    map_desc: "உங்களுக்கு அருகிலுள்ள ஏ.இ.டி (AED) சாதனங்கள் மற்றும் அவசர சிகிச்சை மருத்துவமனைகளின் நேரடி வரைபடம்.",
    map_ref: "நேரடி சாதன GPS மற்றும் OpenStreetMap வரைபடம்",
    user_marker: "உங்கள் இருப்பிடம்",
    user_marker_desc: "அவசர விபத்து பகுதி",
    aed_marker: "ஏ.இ.டி",
    hospital_marker: "மருத்துவமனை",
    away: "தொலைவில்",
    walk: "நிமிட நடை",

    // Dynamic First-Aid Guides
    guides: {
      cpr: {
        title: "❤️ கார்டியோபுல்மோனரி புத்துயிர் (CPR)",
        description: "இரத்த ஓட்டத்தை மீட்டெடுக்க மார்பு அழுத்தங்கள் மற்றும் செயற்கை சுவாசத்தை இணைக்கும் அவசர சிகிச்சை முறை.",
        steps: {
          Infant: [
            { step: "பிரதிபலனைச் சரிபார்க்கவும்: குழந்தையின் பாதத்தைத் தட்டி சத்தமாக அழைக்கவும். 10 விநாடிகளுக்குள் மூச்சு உள்ளதா எனப் பார்க்கவும்.", bold: true },
            { step: "குழந்தையை ஒரு தட்டையான, உறுதியான பரப்பில் படுக்கவைக்கவும். தலை நடுநிலையாக இருக்கட்டும்." },
            { step: "விரல்களை வைக்கவும்: மார்பின் மையத்தில், முலைக் காம்பு கோட்டிற்கு சற்று கீழே இரண்டு விரல்களை வைக்கவும்.", bold: true },
            { step: "அழுத்தங்கள் கொடுக்கவும்: ஒரு நிமிடத்திற்கு 100-120 அழுத்தங்கள் என்ற வீதத்தில் 1.5 அங்குல ஆழத்திற்கு அழுத்தவும்.", anim: "compress" },
            { step: "விகிதம்: 30 அழுத்தங்கள் கொடுத்த பிறகு 2 முறை லேசாக மூச்சு கொடுக்கவும்." },
            { step: "உதவி வரும் வரை அல்லது குழந்தை மூச்சுவிடும் வரை மீண்டும் செய்யவும்." }
          ],
          Child: [
            { step: "பிரதிபலனைச் சரிபார்க்கவும்: தோள்களைத் தட்டி, பெயர் சொல்லி சத்தமாக அழைக்கவும். 10 விநாடிகளுக்குள் மூச்சு உள்ளதா எனப் பார்க்கவும்.", bold: true },
            { step: "தலையை சற்று பின்னால் சாய்த்து சுவாசப்பாதையைத் திறக்கவும். மூக்கை மூடி 2 முறை லேசாக மூச்சு கொடுக்கவும்." },
            { step: "கைகளை வைக்கவும்: குழந்தையின் அளவைப் பொறுத்து ஒன்று அல்லது இரண்டு கைகளை மார்பின் மையத்தில் வைக்கவும்.", bold: true },
            { step: "அழுத்தங்கள் கொடுக்கவும்: 2 அங்குல ஆழத்திற்கு, நிமிடத்திற்கு 100-120 அழுத்தங்கள் கொடுக்கவும்.", anim: "compress" },
            { step: "விகிதம்: 30 அழுத்தங்கள் மற்றும் 2 செயற்கை சுவாசம்." },
            { step: "உதவி வரும் வரை அல்லது குழந்தை மூச்சுவிடும் வரை தொடர்ந்து செய்யவும்." }
          ],
          Adult: [
            { step: "பிரதிபலனைச் சரிபார்க்கவும்: தோள்களைத் தட்டி, 'நீங்கள் நலமாக இருக்கிறீர்களா?' என்று சத்தமாக கேட்கவும்.", bold: true },
            { step: "112/108 ஐ உடனடியாக அழைத்து, ஏ.இ.டி (AED) சாதனத்தை கொண்டுவர சொல்லவும்." },
            { step: "கைகளை வைக்கவும்: ஒரு கையின் அடிப்பகுதியை மார்பின் நடுவில் வைத்து, மற்றொரு கையின் விரல்களை அதனுடன் கோர்க்கவும்.", bold: true },
            { step: "அழுத்தங்கள் கொடுக்கவும்: 2 முதல் 2.4 அங்குல ஆழத்திற்கு, நிமிடத்திற்கு 100-120 அழுத்தங்கள் கொடுக்கவும்.", anim: "compress" },
            { step: "அழுத்தங்களுக்கு இடையே மார்பு மீண்டும் பழைய நிலைக்கு வர அனுமதிக்கவும். மார்பின் மீது சாய வேண்டாம்." },
            { step: "செயற்கை சுவாசம்: தலையை பின்னால் சாய்த்து, தாடையை உயர்த்தி, மூக்கை மூடி 2 முறை மூச்சு ஊதவும். விகிதம்: 30 அழுத்தங்கள் : 2 மூச்சு." },
            { step: "உதவி வரும் வரை அல்லது நோயாளி மூச்சுவிடும் வரை தொடர்ந்து செய்யவும்." }
          ],
          Elderly: [
            { step: "பிரதிபலனைச் சரிபார்க்கவும்: சத்தமாக அழைத்து தோள்களை அழுத்தவும். மூச்சு உள்ளதா எனப் பார்க்கவும்.", bold: true },
            { step: "உடனடியாக 112/108ஐ அழைத்து அருகிலுள்ள ஏ.இ.டி சாதனத்தைக் கண்டறியவும்." },
            { step: "கைகளை வைக்கவும்: ஒரு கையின் அடிப்பகுதியை மார்பின் நடுவில் வைத்து, மற்றொரு கையின் விரல்களை கோர்க்கவும்.", bold: true },
            { step: "அழுத்தங்கள் கொடுக்கவும்: 2 அங்குல ஆழத்திற்கு, நிமிடத்திற்கு 100-120 அழுத்தங்கள் கொடுக்கவும்.", anim: "compress" },
            { step: "எச்சரிக்கை: முதியவர்களின் எலும்புகள் பலவீனமானவை. விலா எலும்புகள் முறிய வாய்ப்புள்ளது, ஆனால் அழுத்தங்களைத் தொடரவும் - உயிரைக் காப்பதே முக்கியம்.", bold: true },
            { step: "30 அழுத்தங்களுக்கு 2 மூச்சு வீதம் செய்யவும் (செயற்கை சுவாசம் தெரியாவிட்டால் மார்பு அழுத்தங்களை மட்டும் தொடரவும்)." }
          ]
        }
      },
      choking: {
        title: "😮💨 தொண்டை அடைப்பு (மூச்சுத்திணறல்)",
        description: "உணவு அல்லது பொருள் மூச்சுக்குழாயை அடைத்து சுவாசம் தடைபடும்போது உடனடியாக செய்ய வேண்டிய முறை.",
        steps: {
          Infant: [
            { step: "அடைப்பை உறுதிசெய்யவும்: அழவோ, இருமவோ அல்லது மூச்சுவிடவோ முடியாது. முகம் நீல நிறமாக மாறலாம்.", bold: true },
            { step: "குழந்தையை உங்கள் முன்கையின் மீது குப்புற படுக்கவைத்து, தாடையை தாங்கிப் பிடிக்கவும். தலையை சற்று கீழ்நோக்கி வைக்கவும்." },
            { step: "5 முதுகு தட்டுகள்: கையின் அடிப்பகுதியால் தோள்பட்டைகளுக்கு இடையே 5 முறை பலமாக தட்டவும்.", bold: true },
            { step: "முகத்தை மேலே திருப்பவும்: குழந்தையை நேராக திருப்பி, தலை உடலை விட தாழ்வாக இருக்குமாறு வைக்கவும்." },
            { step: "5 மார்பு அழுத்தங்கள்: மார்பின் நடுவில் இரண்டு விரல்களால் 1.5 அங்குல ஆழத்திற்கு 5 முறை அழுத்தவும்.", bold: true },
            { step: "மீண்டும் செய்யவும்: அடைப்பு நீங்கும் வரை அல்லது குழந்தை மயக்கமடையும் வரை மீண்டும் செய்யவும்." }
          ],
          Child: [
            { step: "கேள்வி: 'உங்களுக்கு தொண்டை அடைத்துள்ளதா?'. பேச அல்லது இரும முடிந்தால், தொடர்ந்து இருமச் சொல்லவும்." },
            { step: "பேச அல்லது மூச்சுவிட முடியாவிட்டால், குழந்தையின் பின்னால் நின்று, இடுப்பை உங்கள் கைகளால் கட்டிக்கொள்ளவும்." },
            { step: "முஷ்டி அமைக்கவும்: ஒரு கையை முஷ்டியாக்கி, பெருவிரல் பக்கத்தை தொப்புளுக்கு சற்று மேலே வைக்கவும்.", bold: true },
            { step: "ஹெய்ம்லிச் முறை: வேகமாகவும் பலமாகவும் உள்நோக்கியும் மேல்நோக்கியும் 5 அழுத்தங்கள் கொடுக்கவும்.", bold: true },
            { step: "மாற்று முறை: இது பலனளிக்காவிட்டால், தோள்களுக்கு இடையே 5 முறை பலமாக தட்டவும்." },
            { step: "பொருள் வெளியேறும் வரை அல்லது மயக்கம் வரும் வரை மீண்டும் செய்யவும். மயக்கமடைந்தால் சி.பி.ஆர் தொடங்கவும்." }
          ],
          Adult: [
            { step: "அடைப்பை உறுதிப்படுத்தவும்: நபரால் பேச, மூச்சுவிட அல்லது இரும முடியாது; தொண்டையைப் பிடித்துக் கொள்வார்.", bold: true },
            { step: "நபரின் பின்னால் நின்று, அவரது இடுப்பை உங்கள் கைகளால் கட்டிக்கொள்ளவும்." },
            { step: "முஷ்டியை வைக்கவும்: ஒரு கையை முஷ்டியாக்கி, பெருவிரல் பக்கத்தை தொப்புளுக்கு சற்று மேலே வைக்கவும்.", bold: true },
            { step: "வயிற்று அழுத்தங்கள் கொடுக்கவும்: வேகமாகவும் பலமாகவும் உள்நோக்கியும் மேல்நோக்கியும் அழுத்தங்களை கொடுக்கவும் (ஹெய்ம்லிச் முறை).", bold: true },
            { step: "5 அழுத்தங்கள் கொடுத்துவிட்டு அடைப்பு நீங்கியுள்ளதா என்று பார்க்கவும். மீண்டும் செய்யவும்." },
            { step: "கர்ப்பிணி பெண்கள்: வயிற்றிற்கு பதிலாக மார்பின் மீது கைகளை வைத்து அழுத்தவும்.", bold: true },
            { step: "உடல்நிலை மோசமடைந்தால் உடனடியாக 112ஐ அழைத்து சி.பி.ஆர் (CPR) செய்யவும்." }
          ],
          Elderly: [
            { step: "அடைப்பை உறுதிப்படுத்தவும். முதியவர்களுக்கு விழுங்குவதில் சிக்கல் ஏற்படுவது வழக்கம். நிமிர்ந்து உட்கார வைக்கவும்." },
            { step: "வழக்கமான வயிற்று அழுத்தங்களை (ஹெய்ம்லிச்) செய்யவும். கவனமாக ஆனால் பலமாக அழுத்தவும்.", bold: true },
            { step: "மிகவும் பலவீனமாக இருந்தால் அல்லது சக்கர நாற்காலியில் இருந்தால், அவர்களை முன்னோக்கி சாய்த்து முதுகில் பலமாக தட்டவும்.", bold: true },
            { step: "மயக்கமடைந்தால் சி.பி.ஆர் தொடங்கவும். செயற்கை சுவாசம் கொடுக்கும் முன் வாயில் ஏதேனும் அடைப்பு உள்ளதா எனப் பார்க்கவும்." }
          ]
        }
      },
      bleeding: {
        title: "🩸 கடுமையான இரத்தப்போக்கு கட்டுப்பாடு",
        description: "ஆபத்தான இரத்த இழப்பைத் தடுக்க உடனடியாக காயம் மீது அழுத்தம் கொடுக்கும் முறை.",
        steps: {
          Adult: [
            { step: "காயத்தின் மீது சுத்தமான, மலட்டுத் துணியை வைத்து உடனடியாக நேரடியாக அழுத்தம் கொடுக்கவும்.", bold: true },
            { step: "அழுத்தத்தை தொடர்ந்து கொடுக்கவும். இரத்தம் நின்றுவிட்டதா என்று பார்க்க துணியை எடுக்க வேண்டாம்.", bold: true },
            { step: "முடிந்தால், காயம் பட்ட இடத்தை இதய மட்டத்திற்கு மேல் உயர்த்தவும்." },
            { step: "துணியின் மேல் இறுக்கமாக கட்டு கட்டவும். இரத்தம் கசிந்தால், அதன் மேல் மற்றொரு துணியை வைக்கவும் - பழைய துணியை எடுக்க வேண்டாம்." },
            { step: "நோயாளிக்கு குளிர்ச்சி, சோம்பல் அல்லது முகம் வெளுத்தல் போன்ற அதிர்ச்சியின் அறிகுறிகள் உள்ளதா என கண்காணிக்கவும்." }
          ]
        }
      },
      burn: {
        title: "🔥 தீக்காயங்கள் முதலுதவி",
        description: "தீக்காயங்களை குளிர்விப்பதற்கும் கட்டு கட்டுவதற்குமான முதலுதவி வழிமுறைகள்.",
        steps: {
          Adult: [
            { step: "காயத்தைக் குளிர்விக்கவும்: உடனடியாக 10-15 நிமிடங்களுக்கு காயத்தின் மீது குளிர்ந்த குழாய் நீரை ஊற்றவும். பனிக்கட்டி நீரைப் பயன்படுத்த வேண்டாம்.", bold: true },
            { step: "உடல் வெப்பம் குறையாமல் இருக்க நோயாளியின் உடலை போர்வையால் போர்த்தவும்.", bold: true },
            { step: "தீக்காயத்தின் மீது வெண்ணெய், எண்ணெய் அல்லது பற்பசை (toothpaste) போன்றவற்றை தடவ வேண்டாம்." },
            { step: "காயத்திற்கு அருகிலுள்ள ஆடைகளை அகற்றவும், ஆனால் காயத்தில் ஒட்டியிருக்கும் ஆடைகளை இழுக்க வேண்டாம்." },
            { step: "மலட்டுத்தன்மையற்ற ஒட்டாத துணியால் லேசாக மூடவும். உடனடியாக மருத்துவ உதவியை நாடவும்." }
          ]
        }
      },
      shock: {
        title: "⚡ மின் அதிர்ச்சி முதலுதவி",
        description: "மின்சாரம் தாக்கிய நபரை மீட்கும் மற்றும் அவருக்கு முதலுதவி அளிக்கும் பாதுகாப்பு வழிமுறைகள்.",
        steps: {
          Adult: [
            { step: "நோயாளி இன்னும் மின் கம்பியுடன் இணைப்பில் இருந்தால் அவரை நேரடியாகத் தொட வேண்டாம்.", bold: true },
            { step: "உடனடியாக மின்சார இணைப்பை (Main Switch) அணைக்கவும். அல்லது உலர் மரத்தடி/பிளாஸ்டிக் கொண்டு அவரை தள்ளிவிடவும்.", bold: true },
            { step: "பாதுகாப்பான இடத்திற்கு வந்ததும், மூச்சு மற்றும் நாடித் துடிப்பை சரிபார்க்கவும். இல்லையெனில், உடனடியாக CPR தொடங்கவும்.", bold: true },
            { step: "மூச்சு இருந்தால், அவரை தட்டையாக படுக்கவைத்து கால்களை 12 அங்குலம் உயர்த்தவும்.", bold: true },
            { step: "உடலை கதகதப்பாக வைக்க போர்வையால் மூடவும். மின்சாரம் நுழைந்த மற்றும் வெளியேறிய தீக்காயங்களை குளிர்ந்த நீரால் கழுவி கட்டவும்." }
          ]
        }
      },
      fracture: {
        title: "🦴 எலும்பு முறிவு முதலுதவி",
        description: "எலும்பு முறிவு ஏற்பட்டதாக சந்தேகிக்கப்படும் போது தற்காலிகமாக அசையாமல் வைக்கும் வழிமுறைகள்.",
        steps: {
          Adult: [
            { step: "எலும்பை நேராக்க முயற்சிக்க வேண்டாம் அல்லது வெளியே தெரியும் எலும்பை உள்ளே தள்ள வேண்டாம்.", bold: true },
            { step: "இரத்தப்போக்கை நிறுத்தவும்: சுத்தமான துணியால் அழுத்தம் கொடுக்கவும், முறிந்த எலும்பின் மீது நேரடியாக அழுத்த வேண்டாம்.", bold: true },
            { step: "முறிந்த பகுதியை அசையாமல் கட்டவும்: அட்டை அல்லது பலகை கொண்டு முறிந்த கூட்டுக்கு மேலேயும் கீழேயும் கட்டுப்போடவும்.", bold: true },
            { step: "வீக்கத்தைக் குறைக்க துணியில் சுற்றிய பனிக்கட்டி வைக்கவும். பனிக்கட்டியை நேரடியாகத் தோலில் வைக்க வேண்டாம்." },
            { step: "வலி இல்லாத வரை முறிந்த பகுதியை சற்று உயர்த்தி வைக்கலாம்." },
            { step: "நோயாளியை படுக்கவைத்து அமைதிப்படுத்தவும். அதிர்ச்சியின் அறிகுறிகள் இருந்தால் கண்காணிக்கவும்." }
          ]
        }
      },
      bite: {
        title: "🐍 பாம்பு மற்றும் விலங்கு கடி",
        description: "விலங்கு அல்லது பாம்பு கடித்த பிறகு விஷம் பரவுவதைத் தடுக்கும் மற்றும் காயம் பராமரிக்கும் முறைகள்.",
        steps: {
          Adult: [
            { step: "பாதிக்கப்பட்டவரை அசையாமல் அமைதியாக படுக்கவைக்கவும் (நகர்வு விஷத்தை வேகமாக பரப்பும்).", bold: true },
            { step: "வீக்கம் விரைவாக ஏற்படும் என்பதால், கடி பட்ட இடத்திற்கு அருகிலுள்ள மோதிரம், கடிகாரம் போன்றவற்றை அகற்றவும்.", bold: true },
            { step: "கடி பட்ட இடத்தை இதய மட்டத்திற்கு கீழே அசையாமல் வைக்கவும்.", bold: true },
            { step: "வாயால் விஷத்தை உறிஞ்சவோ, காயத்தை வெட்டவோ அல்லது பனிக்கட்டி வைக்கவோ முயற்சிக்க வேண்டாம்.", bold: true },
            { step: "விலங்கு கடியாக இருந்தால், சோப்பு மற்றும் தண்ணீரால் காயத்தை மெதுவாகக் கழுவி, சுத்தமான துணியால் மூடவும்." },
            { step: "பாம்பு அல்லது விலங்கின் தோற்றத்தை நினைவில் கொள்ள முயற்சித்து, உடனடியாக 112/108ஐ அழைக்கவும்." }
          ]
        }
      },
      poison: {
        title: "☠️ விஷம் குடித்தல் முதலுதவி",
        description: "உட்கொண்ட, சுவாசித்த அல்லது தோலில் பட்ட விஷப் பொருட்களுக்கு உடனடியாக செய்ய வேண்டிய நடவடிக்கைகள்.",
        steps: {
          Adult: [
            { step: "விஷத்தை அடையாளம் காணவும்: உட்கொண்ட விஷத்தின் பாட்டில் அல்லது மாத்திரை அட்டையை பத்திரப்படுத்தவும்.", bold: true },
            { step: "மருத்துவர் அல்லது நச்சு கட்டுப்பாட்டு மையம் அறிவுறுத்தாதவரை வாந்தி எடுக்க வைக்க முயற்சிக்க வேண்டாம்.", bold: true },
            { step: "தோல் அல்லது கண்களில் பட்டிருந்தால், 15 நிமிடங்கள் ஓடும் சுத்தமான நீரால் உடனடியாகக் கழுவவும்.", bold: true },
            { step: "விஷவாயுவை சுவாசித்திருந்தால், உடனடியாக நல்ல காற்றோட்டமுள்ள பகுதிக்கு மாற்றவும்." },
            { step: "நோயாளி நினைவிழந்தாலோ அல்லது சுவாசம் நின்றாலோ உடனடியாக CPR ஐத் தொடங்கவும். 112ஐ அழைக்கவும்." }
          ]
        }
      },
      fainting: {
        title: "😵 மயக்கம் மற்றும் தலைச்சுற்றல்",
        description: "நோயாளி தற்காலிகமாக நினைவிழக்கும் போது அளிக்க வேண்டிய முதலுதவி.",
        steps: {
          Adult: [
            { step: "நோயாளியைத் தட்டையாக படுக்கவைத்து, கால்களை 12 அங்குலம் தூக்கி வைக்கவும்.", bold: true },
            { step: "சட்டை காலர், பெல்ட் போன்ற இறுக்கமான ஆடைகளைத் தளர்த்தவும்.", bold: true },
            { step: "நோயாளியைச் சுற்றி நல்ல காற்றோட்டம் இருப்பதை உறுதிப்படுத்தவும்." },
            { step: "நோயாளி 1 நிமிடத்திற்குள் சுயநினைவு பெறவில்லை என்றால், உடனடியாக 112/108ஐ அழைக்கவும்.", bold: true },
            { step: "சுவாசத்தை சரிபார்க்கவும். சுவாசம் இல்லை என்றால், சிபிஆர் தொடங்கவும்." },
            { step: "விழித்தவுடன் உடனடியாக எழுந்து நிற்க அனுமதிக்க வேண்டாம். சுயநினைவு வந்ததும் தண்ணீர் கொடுக்கவும்." }
          ]
        }
      },
      accident: {
        title: "🚗 சாலை விபத்து முதலுதவி",
        description: "சாலை விபத்துகளில் ஏற்படும் தீவிர காயங்களுக்கு அளிக்க வேண்டிய அவசர முதலுதவி.",
        steps: {
          Adult: [
            { step: "முதலில் பாதுகாப்பை உறுதிப்படுத்தவும்: பிற வாகனங்களை எச்சரிக்கவும், விபத்துக்குள்ளான கார்களின் இன்ஜின்களை அணைக்கவும்.", bold: true },
            { step: "தீ விபத்து போன்ற உடனடி ஆபத்து இல்லையென்றால் காயம்பட்டவர்களை நகர்த்த வேண்டாம்.", bold: true },
            { step: "கடுமையான இரத்தப்போக்கைக் கட்டுப்படுத்தவும்: காயங்களின் மீது துணிகொண்டு நேரடியாக அழுத்தம் கொடுக்கவும்.", bold: true },
            { step: "தலை மற்றும் கழுத்தை தாங்கவும்: தண்டுவட காயம் இருக்கலாம் என்பதால் தலையையும் கழுத்தையும் அசைக்காமல் நேராகப் பிடிக்கவும்.", bold: true },
            { step: "நோயாளியை போர்வையால் மூடி கதகதப்பாக வைத்திருக்கவும், அவசர மீட்புக்குழு வரும்வரை பேசி அமைதிப்படுத்தவும்." }
          ]
        }
      }
    }
  }
};
