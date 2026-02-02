// Chichewa and English translations for Matola
// Chichewa is the national language of Malawi, spoken by ~70% of the population

export type Language = "en" | "ny" // ny = Chichewa (Nyanja)

export const translations = {
  en: {
    // Common
    app_name: "Matola",
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",
    done: "Done",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    yes: "Yes",
    no: "No",
    ok: "OK",

    // Navigation
    nav_home: "Home",
    nav_shipments: "Shipments",
    nav_loads: "Loads",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_help: "Help",
    nav_logout: "Logout",

    // Auth
    login: "Login",
    register: "Register",
    phone_number: "Phone Number",
    enter_phone: "Enter your phone number",
    enter_pin: "Enter your PIN",
    create_pin: "Create a 4-digit PIN",
    confirm_pin: "Confirm your PIN",
    forgot_pin: "Forgot PIN?",
    verify_otp: "Enter the code sent to your phone",
    resend_code: "Resend code",

    // User Types
    i_am_shipper: "I need to ship goods",
    i_am_transporter: "I have a truck",
    shipper: "Shipper",
    transporter: "Transporter",

    // Shipper
    post_load: "Post a Load",
    my_shipments: "My Shipments",
    track_shipment: "Track Shipment",
    shipment_posted: "Shipment Posted!",
    finding_transporters: "Finding Transporters...",
    select_origin: "Where from?",
    select_destination: "Where to?",
    select_cargo: "What are you shipping?",
    select_weight: "How heavy?",
    when_pickup: "When to pickup?",
    your_price: "Your budget",

    // Transporter
    find_loads: "Find Loads",
    my_trips: "My Trips",
    go_online: "Go Online",
    go_offline: "Go Offline",
    online_status: "You're Online",
    offline_status: "You're Offline",
    receiving_requests: "Receiving load requests",
    not_receiving: "Not receiving requests",
    accept_load: "Accept",
    reject_load: "Decline",
    view_details: "Details",
    empty_return: "Empty Return?",
    find_return_loads: "Find loads on your way back",

    // Cargo Types
    cargo_farm: "Farm Produce",
    cargo_goods: "General Goods",
    cargo_building: "Building Materials",
    cargo_furniture: "Furniture",
    cargo_equipment: "Equipment",
    cargo_other: "Other",

    // Weights
    weight_small: "Small (Under 500kg)",
    weight_medium: "Medium (500kg - 2 tons)",
    weight_large: "Large (2 - 5 tons)",
    weight_heavy: "Heavy (Over 5 tons)",

    // Status
    status_pending: "Pending",
    status_matched: "Matched",
    status_accepted: "Accepted",
    status_in_transit: "In Transit",
    status_delivered: "Delivered",
    status_completed: "Completed",
    status_cancelled: "Cancelled",

    // Locations (Major Malawian cities)
    loc_lilongwe: "Lilongwe",
    loc_blantyre: "Blantyre",
    loc_mzuzu: "Mzuzu",
    loc_zomba: "Zomba",
    loc_salima: "Salima",
    loc_mangochi: "Mangochi",
    loc_kasungu: "Kasungu",
    loc_karonga: "Karonga",
    loc_nkhata_bay: "Nkhata Bay",
    loc_dedza: "Dedza",

    // Trust & Verification
    verified: "Verified",
    not_verified: "Not Verified",
    verify_now: "Verify Now",
    trust_score: "Trust Score",
    community_vouched: "Community Vouched",
    union_member: "Union Member",
    government_verified: "Government Verified",
    trips_completed: "Trips Completed",

    // Payments
    payment: "Payment",
    pay_now: "Pay Now",
    wallet_balance: "Wallet Balance",
    add_money: "Add Money",
    withdraw: "Withdraw",
    airtel_money: "Airtel Money",
    tnm_mpamba: "TNM Mpamba",
    bank_transfer: "Bank Transfer",
    payment_pending: "Payment Pending",
    payment_completed: "Payment Completed",

    // Ratings
    rate_trip: "Rate this trip",
    leave_review: "Leave a review",
    how_was_service: "How was the service?",
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",

    // Safety
    emergency_sos: "Emergency SOS",
    call_police: "Call Police",
    call_emergency: "Call Emergency",
    share_location: "Share My Location",
    report_issue: "Report Issue",
    unsafe_situation: "I feel unsafe",

    // Offline
    offline_mode: "You're offline",
    offline_message: "Don't worry, you can still use the app",
    pending_sync: "Pending sync",
    will_sync: "Will sync when online",
    syncing: "Syncing...",
    synced: "All synced!",

    // Celebrations
    congrats: "Congratulations!",
    first_trip: "First Trip Completed!",
    milestone_10: "10 Trips Completed!",
    milestone_50: "50 Trips Completed!",
    milestone_100: "100 Trips - Transport Hero!",
    top_rated: "Top Rated Transporter!",
    earned_badge: "You earned a badge!",

    // Seasonal
    harvest_season: "Harvest Season",
    high_demand: "High Demand",
    low_demand: "Low Demand",
    rainy_season: "Rainy Season",
    road_conditions: "Road Conditions",

    // Voice
    tap_to_speak: "Tap to speak",
    listening: "Listening...",
    voice_command: "Voice Command",
    say_destination: "Say your destination",
    say_cargo: "Say your cargo type",
  },

  // Chichewa (Nyanja) - National language of Malawi
  ny: {
    // Common
    app_name: "Matola",
    loading: "Kukonza...",
    error: "Pali vuto",
    retry: "Yesaninso",
    cancel: "Lekani",
    confirm: "Vomerezani",
    save: "Sungani",
    edit: "Sinthani",
    delete: "Chotsani",
    back: "Bwerera",
    next: "Kupita",
    done: "Kwatha",
    search: "Fufuzani",
    filter: "Sankhani",
    clear: "Chotsani",
    yes: "Inde",
    no: "Ayi",
    ok: "Chabwino",

    // Navigation
    nav_home: "Kwathu",
    nav_shipments: "Katundu",
    nav_loads: "Katundu",
    nav_profile: "Mbiri Yanu",
    nav_settings: "Zosintha",
    nav_help: "Thandizo",
    nav_logout: "Tulukani",

    // Auth
    login: "Lowani",
    register: "Lembani",
    phone_number: "Nambala ya Foni",
    enter_phone: "Lembani nambala ya foni",
    enter_pin: "Lembani PIN yanu",
    create_pin: "Pangani PIN ya manambala 4",
    confirm_pin: "Tsimikizani PIN yanu",
    forgot_pin: "Mwayiwala PIN?",
    verify_otp: "Lembani nambala yomwe mwatumizidwa",
    resend_code: "Tumizaninso",

    // User Types
    i_am_shipper: "Ndikufuna kutumiza katundu",
    i_am_transporter: "Ndili ndi galimoto",
    shipper: "Wotumiza",
    transporter: "Wonyamula",

    // Shipper
    post_load: "Tumizani Katundu",
    my_shipments: "Katundu Wanga",
    track_shipment: "Tsatani Katundu",
    shipment_posted: "Katundu Walembedwa!",
    finding_transporters: "Kufufuza Oyendetsa...",
    select_origin: "Kuchokera kuti?",
    select_destination: "Kupita kuti?",
    select_cargo: "Mukukatundu wanji?",
    select_weight: "Kulemera kwake?",
    when_pickup: "Liti?",
    your_price: "Ndalama zanu",

    // Transporter
    find_loads: "Pezani Katundu",
    my_trips: "Maulendo Anga",
    go_online: "Yambirani",
    go_offline: "Imitsani",
    online_status: "Muli Pa Intaneti",
    offline_status: "Simuli Pa Intaneti",
    receiving_requests: "Mukulandira zopempha",
    not_receiving: "Simukulandira zopempha",
    accept_load: "Vomerani",
    reject_load: "Kanani",
    view_details: "Zambiri",
    empty_return: "Kubwerera Opanda?",
    find_return_loads: "Pezani katundu pobwerera",

    // Cargo Types
    cargo_farm: "Zokolola",
    cargo_goods: "Katundu",
    cargo_building: "Zomangira",
    cargo_furniture: "Mipando",
    cargo_equipment: "Zipangizo",
    cargo_other: "Zina",

    // Weights
    weight_small: "Pang'ono (Pansi pa 500kg)",
    weight_medium: "Pakati (500kg - 2 tons)",
    weight_large: "Zazikulu (2 - 5 tons)",
    weight_heavy: "Zolemera (Pamwamba pa 5 tons)",

    // Status
    status_pending: "Kudikira",
    status_matched: "Apezeka",
    status_accepted: "Avomerezedwa",
    status_in_transit: "Pa Ulendo",
    status_delivered: "Wafika",
    status_completed: "Watha",
    status_cancelled: "Wachotsedwa",

    // Locations
    loc_lilongwe: "Lilongwe",
    loc_blantyre: "Blantyre",
    loc_mzuzu: "Mzuzu",
    loc_zomba: "Zomba",
    loc_salima: "Salima",
    loc_mangochi: "Mangochi",
    loc_kasungu: "Kasungu",
    loc_karonga: "Karonga",
    loc_nkhata_bay: "Nkhata Bay",
    loc_dedza: "Dedza",

    // Trust & Verification
    verified: "Wotsimikizidwa",
    not_verified: "Osatsimikizidwa",
    verify_now: "Tsimikizani Tsopano",
    trust_score: "Mfundo za Kukhulupirira",
    community_vouched: "Anthu Akutsimikizira",
    union_member: "Membala wa Union",
    government_verified: "Boma Latsimikizira",
    trips_completed: "Maulendo Omalizidwa",

    // Payments
    payment: "Malipiro",
    pay_now: "Lipireni Tsopano",
    wallet_balance: "Ndalama Zanu",
    add_money: "Onjezani Ndalama",
    withdraw: "Chotsani Ndalama",
    airtel_money: "Airtel Money",
    tnm_mpamba: "TNM Mpamba",
    bank_transfer: "Ku Banki",
    payment_pending: "Kudikira Malipiro",
    payment_completed: "Malipiro Atheka",

    // Ratings
    rate_trip: "Perekani Mfundo",
    leave_review: "Lembani Ndemanga",
    how_was_service: "Muthandizidwa bwanji?",
    excellent: "Zabwino Kwambiri",
    good: "Zabwino",
    average: "Pakati",
    poor: "Zoyipa",

    // Safety
    emergency_sos: "Chithandizo Chadzidzidzi",
    call_police: "Imbani Apolisi",
    call_emergency: "Chithandizo",
    share_location: "Tumizani Malo Anu",
    report_issue: "Nenani Vuto",
    unsafe_situation: "Sindikudzimva bwino",

    // Offline
    offline_mode: "Simuli pa intaneti",
    offline_message: "Musadandaule, mungagwiritsirebe ntchito",
    pending_sync: "Zikudikirira",
    will_sync: "Zidzatumizidwa mukakhala pa intaneti",
    syncing: "Kutumiza...",
    synced: "Zonse zatumizidwa!",

    // Celebrations
    congrats: "Zikomo!",
    first_trip: "Ulendo Woyamba Watha!",
    milestone_10: "Maulendo 10 Atheka!",
    milestone_50: "Maulendo 50 Atheka!",
    milestone_100: "Maulendo 100 - Ngwazi!",
    top_rated: "Wopambana!",
    earned_badge: "Mwapeza njingli!",

    // Seasonal
    harvest_season: "Nthawi Yokolola",
    high_demand: "Akufuna Ambiri",
    low_demand: "Akufuna Ochepa",
    rainy_season: "Nthawi ya Mvula",
    road_conditions: "Momwe Misewu Ilili",

    // Voice
    tap_to_speak: "Dinani kuti mulankhule",
    listening: "Ndikumvera...",
    voice_command: "Lankhulani",
    say_destination: "Nenani komwe mukupita",
    say_cargo: "Nenani mtundu wa katundu",
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function t(key: TranslationKey, lang: Language = "en"): string {
  return translations[lang][key] || translations.en[key] || key
}
