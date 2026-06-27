/* ─────────────────────────────────────────────────────────────────────────────
   CBSE Grades 1–10 — No domains, subjects listed directly under grade.
   Topics are simplified for lower grades; Grade 9–10 have richer topics.
───────────────────────────────────────────────────────────────────────────── */
import type { Grade, Subject, Chapter, Topic } from '../../curriculum/types';

function t(id: string, name: string): Topic {
  return { id, name, learningOutcomes: [] };
}

function ch(id: string, name: string, topics: Topic[] = []): Chapter {
  return { id, name, topics };
}

function sub(id: string, name: string, code: string, chapters: Chapter[]): Subject {
  return { id, name, code, chapters };
}

/* ── Class 1 ─────────────────────────────────────────────────────────────── */
const class1: Grade = {
  value: '1', label: 'Class 1', hasDomains: false,
  subjects: [
    sub('CBSE_1_MAT', 'Mathematics', 'MAT', [
      ch('C1M1','Shapes and Space'), ch('C1M2','Numbers 1–9'), ch('C1M3','Addition'),
      ch('C1M4','Subtraction'), ch('C1M5','Numbers 10–20'), ch('C1M6','Time'),
      ch('C1M7','Measurement'), ch('C1M8','Numbers 21–50'), ch('C1M9','Data Handling'),
      ch('C1M10','Patterns'), ch('C1M11','Numbers 51–100'), ch('C1M12','Money'),
    ]),
    sub('CBSE_1_ENG', 'English', 'ENG', [
      ch('C1E1','Alphabet and Phonics'), ch('C1E2','Simple Words'), ch('C1E3','Sentences'),
      ch('C1E4','Reading Comprehension'), ch('C1E5','Writing Practice'), ch('C1E6','Poems'),
    ]),
    sub('CBSE_1_HIN', 'Hindi', 'HIN', [
      ch('C1H1','वर्णमाला'), ch('C1H2','मात्राएँ'), ch('C1H3','सरल शब्द'),
      ch('C1H4','छोटी कहानियाँ'), ch('C1H5','कविताएँ'),
    ]),
    sub('CBSE_1_EVS', 'Environmental Studies', 'EVS', [
      ch('C1V1','My Body'), ch('C1V2','My Family'), ch('C1V3','My School'),
      ch('C1V4','Plants Around Us'), ch('C1V5','Animals Around Us'),
      ch('C1V6','Food'), ch('C1V7','Transport'), ch('C1V8','Water'), ch('C1V9','Weather'),
    ]),
  ],
};

/* ── Class 2 ─────────────────────────────────────────────────────────────── */
const class2: Grade = {
  value: '2', label: 'Class 2', hasDomains: false,
  subjects: [
    sub('CBSE_2_MAT','Mathematics','MAT',[
      ch('C2M1','Counting in Groups'),ch('C2M2','Tens and Ones'),ch('C2M3','Addition'),
      ch('C2M4','Subtraction'),ch('C2M5','Multiplication'),ch('C2M6','Length and Weight'),
      ch('C2M7','Patterns'),ch('C2M8','Time'),ch('C2M9','Data Handling'),ch('C2M10','Money'),
    ]),
    sub('CBSE_2_ENG','English','ENG',[
      ch('C2E1','Phonics and Vocabulary'),ch('C2E2','Nouns and Pronouns'),
      ch('C2E3','Verbs and Adjectives'),ch('C2E4','Sentences'),
      ch('C2E5','Reading and Comprehension'),ch('C2E6','Writing'),ch('C2E7','Poems'),
    ]),
    sub('CBSE_2_HIN','Hindi','HIN',[
      ch('C2H1','वर्ण और मात्राएँ'),ch('C2H2','संज्ञा'),ch('C2H3','क्रिया'),
      ch('C2H4','वाक्य बनाना'),ch('C2H5','कहानी'),ch('C2H6','कविताएँ'),
    ]),
    sub('CBSE_2_EVS','Environmental Studies','EVS',[
      ch('C2V1','My Family'),ch('C2V2','Plants We Use'),ch('C2V3','Animals We Know'),
      ch('C2V4','Our Food'),ch('C2V5','Houses'),ch('C2V6','Clothes'),
      ch('C2V7','Festivals'),ch('C2V8','Transport'),ch('C2V9','Communication'),ch('C2V10','Safety'),
    ]),
  ],
};

/* ── Class 3 ─────────────────────────────────────────────────────────────── */
const class3: Grade = {
  value: '3', label: 'Class 3', hasDomains: false,
  subjects: [
    sub('CBSE_3_MAT','Mathematics','MAT',[
      ch('C3M1','Numbers up to 9999'),ch('C3M2','Addition'),ch('C3M3','Subtraction'),
      ch('C3M4','Multiplication'),ch('C3M5','Division'),ch('C3M6','Fractions'),
      ch('C3M7','Measurement'),ch('C3M8','Time and Calendar'),ch('C3M9','Money'),
      ch('C3M10','Shapes and Geometry'),ch('C3M11','Data Handling'),
    ]),
    sub('CBSE_3_ENG','English','ENG',[
      ch('C3E1','Nouns and Pronouns'),ch('C3E2','Verbs and Tenses'),
      ch('C3E3','Adjectives and Adverbs'),ch('C3E4','Prepositions and Conjunctions'),
      ch('C3E5','Sentences and Punctuation'),ch('C3E6','Reading Comprehension'),
      ch('C3E7','Creative Writing'),ch('C3E8','Poems'),
    ]),
    sub('CBSE_3_HIN','Hindi','HIN',[
      ch('C3H1','संज्ञा और सर्वनाम'),ch('C3H2','क्रिया और काल'),ch('C3H3','विशेषण'),
      ch('C3H4','वाक्य और विराम चिह्न'),ch('C3H5','अनुच्छेद लेखन'),ch('C3H6','कहानी और कविता'),
    ]),
    sub('CBSE_3_EVS','Environmental Studies','EVS',[
      ch('C3V1','Plants and Animals'),ch('C3V2','Water'),ch('C3V3','Our Family'),
      ch('C3V4','Food and Nutrition'),ch('C3V5','Shelter'),ch('C3V6','Clothing'),
      ch('C3V7','Transport and Communication'),ch('C3V8','Our Environment'),ch('C3V9','Safety and Health'),
    ]),
  ],
};

/* ── Class 4 ─────────────────────────────────────────────────────────────── */
const class4: Grade = {
  value: '4', label: 'Class 4', hasDomains: false,
  subjects: [
    sub('CBSE_4_MAT','Mathematics','MAT',[
      ch('C4M1','Large Numbers'),ch('C4M2','Addition and Subtraction'),ch('C4M3','Multiplication'),
      ch('C4M4','Division'),ch('C4M5','Fractions'),ch('C4M6','Decimals'),
      ch('C4M7','Measurement'),ch('C4M8','Time'),ch('C4M9','Perimeter and Area'),
      ch('C4M10','Shapes'),ch('C4M11','Data Handling'),ch('C4M12','Money'),
    ]),
    sub('CBSE_4_ENG','English','ENG',[
      ch('C4E1','Parts of Speech'),ch('C4E2','Tenses'),ch('C4E3','Punctuation'),
      ch('C4E4','Direct and Indirect Speech'),ch('C4E5','Reading Comprehension'),
      ch('C4E6','Letter Writing'),ch('C4E7','Paragraph Writing'),ch('C4E8','Poems'),
    ]),
    sub('CBSE_4_HIN','Hindi','HIN',[
      ch('C4H1','वर्ण-विचार'),ch('C4H2','शब्द-विचार'),ch('C4H3','वाक्य-विचार'),
      ch('C4H4','संज्ञा, सर्वनाम, विशेषण'),ch('C4H5','क्रिया और काल'),
      ch('C4H6','पत्र-लेखन'),ch('C4H7','निबंध'),ch('C4H8','कहानी और कविता'),
    ]),
    sub('CBSE_4_EVS','Environmental Studies','EVS',[
      ch('C4V1','Our Body and Health'),ch('C4V2','Plants and Animals'),ch('C4V3','Water and Air'),
      ch('C4V4','Food Production'),ch('C4V5','Rocks and Soil'),ch('C4V6','The Solar System'),
      ch('C4V7','Our Community'),ch('C4V8','Transport'),ch('C4V9','Communication'),ch('C4V10','Environment'),
    ]),
  ],
};

/* ── Class 5 ─────────────────────────────────────────────────────────────── */
const class5: Grade = {
  value: '5', label: 'Class 5', hasDomains: false,
  subjects: [
    sub('CBSE_5_MAT','Mathematics','MAT',[
      ch('C5M1','Large Numbers and Operations'),ch('C5M2','Fractions'),ch('C5M3','Decimals'),
      ch('C5M4','Percentage'),ch('C5M5','Ratio and Proportion'),ch('C5M6','Area and Perimeter'),
      ch('C5M7','Volume and Capacity'),ch('C5M8','Time and Speed'),ch('C5M9','Data Handling'),
      ch('C5M10','Patterns and Symmetry'),ch('C5M11','Money'),
    ]),
    sub('CBSE_5_ENG','English','ENG',[
      ch('C5E1','Nouns, Pronouns, Adjectives'),ch('C5E2','Verbs and Tenses'),
      ch('C5E3','Adverbs and Prepositions'),ch('C5E4','Conjunctions and Articles'),
      ch('C5E5','Direct and Indirect Speech'),ch('C5E6','Active and Passive Voice'),
      ch('C5E7','Reading Comprehension'),ch('C5E8','Essay and Letter Writing'),ch('C5E9','Poems'),
    ]),
    sub('CBSE_5_HIN','Hindi','HIN',[
      ch('C5H1','संज्ञा, सर्वनाम, विशेषण, क्रिया'),ch('C5H2','काल (भूत, वर्तमान, भविष्य)'),
      ch('C5H3','अव्यय'),ch('C5H4','वाक्य और मुहावरे'),ch('C5H5','पत्र-लेखन'),
      ch('C5H6','निबंध-लेखन'),ch('C5H7','कहानी-लेखन'),ch('C5H8','कविता और अपठित गद्यांश'),
    ]),
    sub('CBSE_5_EVS','Environmental Studies','EVS',[
      ch('C5V1','Super Senses and Adaptation'),ch('C5V2','Food and Digestion'),
      ch('C5V3','Seeds and Plants'),ch('C5V4','Water Cycle and Conservation'),
      ch('C5V5','Mountains and Hills'),ch('C5V6','When Earth Shook'),
      ch('C5V7','Space — Sun, Moon and Stars'),ch('C5V8','Natural Resources'),
      ch('C5V9','Wildlife and Forests'),ch('C5V10','Pollution and Environment'),
    ]),
  ],
};

/* ── Class 6 ─────────────────────────────────────────────────────────────── */
const class6: Grade = {
  value: '6', label: 'Class 6', hasDomains: false,
  subjects: [
    sub('CBSE_6_MAT','Mathematics','MAT',[
      ch('C6M1','Knowing Our Numbers'),ch('C6M2','Whole Numbers'),ch('C6M3','Playing with Numbers'),
      ch('C6M4','Basic Geometrical Ideas'),ch('C6M5','Understanding Elementary Shapes'),
      ch('C6M6','Integers'),ch('C6M7','Fractions'),ch('C6M8','Decimals'),
      ch('C6M9','Data Handling'),ch('C6M10','Mensuration'),ch('C6M11','Algebra'),
      ch('C6M12','Ratio and Proportion'),ch('C6M13','Symmetry'),ch('C6M14','Practical Geometry'),
    ]),
    sub('CBSE_6_SCI','Science','SCI',[
      ch('C6S1','Food: Where Does It Come From?'),ch('C6S2','Components of Food'),
      ch('C6S3','Fibre to Fabric'),ch('C6S4','Sorting Materials into Groups'),
      ch('C6S5','Separation of Substances'),ch('C6S6','Changes Around Us'),
      ch('C6S7','Getting to Know Plants'),ch('C6S8','Body Movements'),
      ch('C6S9','The Living Organisms and Their Surroundings'),
      ch('C6S10','Motion and Measurement of Distances'),
      ch('C6S11','Light, Shadows and Reflections'),ch('C6S12','Electricity and Circuits'),
      ch('C6S13','Fun with Magnets'),ch('C6S14','Water'),ch('C6S15','Air Around Us'),
      ch('C6S16','Garbage In, Garbage Out'),
    ]),
    sub('CBSE_6_HIS','Social Science — History','HIS',[
      ch('C6H1','What, Where, How and When?'),ch('C6H2','On the Trail of the Earliest People'),
      ch('C6H3','From Gathering to Growing Food'),ch('C6H4','In the Earliest Cities'),
      ch('C6H5','What Books and Burials Tell Us'),ch('C6H6','Kingdoms, Kings and an Early Republic'),
      ch('C6H7','New Questions and Ideas'),ch('C6H8','Ashoka, The Emperor Who Gave Up War'),
      ch('C6H9','Vital Villages, Thriving Towns'),ch('C6H10','Traders, Kings and Pilgrims'),
      ch('C6H11','New Empires and Kingdoms'),ch('C6H12','Buildings, Paintings and Books'),
    ]),
    sub('CBSE_6_GEO','Social Science — Geography','GEO',[
      ch('C6G1','The Earth in the Solar System'),ch('C6G2','Globe: Latitudes and Longitudes'),
      ch('C6G3','Motions of the Earth'),ch('C6G4','Maps'),ch('C6G5','Major Domains of the Earth'),
      ch('C6G6','Major Landforms of the Earth'),ch('C6G7','Our Country — India'),
      ch('C6G8','India: Climate, Vegetation and Wildlife'),
    ]),
    sub('CBSE_6_CIV','Social Science — Civics','CIV',[
      ch('C6C1','Understanding Diversity'),ch('C6C2','Diversity and Discrimination'),
      ch('C6C3','What is Government?'),ch('C6C4','Key Elements of a Democratic Government'),
      ch('C6C5','Panchayati Raj'),ch('C6C6','Rural Administration'),
      ch('C6C7','Urban Administration'),ch('C6C8','Rural Livelihoods'),ch('C6C9','Urban Livelihoods'),
    ]),
    sub('CBSE_6_ENG','English','ENG',[
      ch('C6E1','Comprehension Passages'),ch('C6E2','Grammar: Parts of Speech'),
      ch('C6E3','Tenses and Voice'),ch('C6E4','Letter Writing'),
      ch('C6E5','Essay and Paragraph Writing'),ch('C6E6','Prose Chapters'),ch('C6E7','Poems'),
    ]),
    sub('CBSE_6_HIN','Hindi','HIN',[
      ch('C6H1','वसंत — गद्य एवं पद्य'),ch('C6H2','दूर्वा'),ch('C6H3','बाल रामकथा'),
      ch('C6H4','व्याकरण: संज्ञा, सर्वनाम, विशेषण'),ch('C6H5','क्रिया और काल'),
      ch('C6H6','अपठित गद्यांश'),ch('C6H7','पत्र और निबंध'),
    ]),
  ],
};

/* ── Class 7 ─────────────────────────────────────────────────────────────── */
const class7: Grade = {
  value: '7', label: 'Class 7', hasDomains: false,
  subjects: [
    sub('CBSE_7_MAT','Mathematics','MAT',[
      ch('C7M1','Integers'),ch('C7M2','Fractions and Decimals'),ch('C7M3','Data Handling'),
      ch('C7M4','Simple Equations'),ch('C7M5','Lines and Angles'),
      ch('C7M6','The Triangle and its Properties'),ch('C7M7','Congruence of Triangles'),
      ch('C7M8','Comparing Quantities'),ch('C7M9','Rational Numbers'),
      ch('C7M10','Practical Geometry'),ch('C7M11','Perimeter and Area'),
      ch('C7M12','Algebraic Expressions'),ch('C7M13','Exponents and Powers'),
      ch('C7M14','Symmetry'),ch('C7M15','Visualising Solid Shapes'),
    ]),
    sub('CBSE_7_SCI','Science','SCI',[
      ch('C7S1','Nutrition in Plants'),ch('C7S2','Nutrition in Animals'),
      ch('C7S3','Fibre to Fabric'),ch('C7S4','Heat'),ch('C7S5','Acids, Bases and Salts'),
      ch('C7S6','Physical and Chemical Changes'),
      ch('C7S7','Weather, Climate and Adaptations of Animals to Climate'),
      ch('C7S8','Winds, Storms and Cyclones'),ch('C7S9','Soil'),
      ch('C7S10','Respiration in Organisms'),ch('C7S11','Transportation in Animals and Plants'),
      ch('C7S12','Reproduction in Plants'),ch('C7S13','Motion and Time'),
      ch('C7S14','Electric Current and its Effects'),ch('C7S15','Light'),
      ch('C7S16','Water: A Precious Resource'),ch('C7S17','Forests: Our Lifeline'),
      ch('C7S18','Wastewater Story'),
    ]),
    sub('CBSE_7_HIS','Social Science — History','HIS',[
      ch('C7H1','Tracing Changes Through a Thousand Years'),ch('C7H2','New Kings and Kingdoms'),
      ch('C7H3','The Delhi Sultans'),ch('C7H4','The Mughal Empire'),ch('C7H5','Rulers and Buildings'),
      ch('C7H6','Towns, Traders and Craftspersons'),
      ch('C7H7','Tribes, Nomads and Settled Communities'),
      ch('C7H8','Devotional Paths to the Divine'),ch('C7H9','The Making of Regional Cultures'),
      ch('C7H10','Eighteenth-Century Political Formations'),
    ]),
    sub('CBSE_7_GEO','Social Science — Geography','GEO',[
      ch('C7G1','Environment'),ch('C7G2','Inside Our Earth'),ch('C7G3','Our Changing Earth'),
      ch('C7G4','Air'),ch('C7G5','Water'),ch('C7G6','Natural Vegetation and Wildlife'),
      ch('C7G7','Human Environment — Settlement, Transport and Communication'),
      ch('C7G8','Human Environment Interactions — The Tropical and the Subtropical Region'),
      ch('C7G9','Life in the Temperate Grasslands'),ch('C7G10','Life in the Deserts'),
    ]),
    sub('CBSE_7_CIV','Social Science — Civics','CIV',[
      ch('C7C1','On Equality'),ch('C7C2','Role of the Government in Health'),
      ch('C7C3','How the State Government Works'),ch('C7C4','Growing up as Boys and Girls'),
      ch('C7C5','Women Change the World'),ch('C7C6','Understanding Media'),
      ch('C7C7','Understanding Advertising'),ch('C7C8','Markets Around Us'),
      ch('C7C9','A Shirt in the Market'),
    ]),
    sub('CBSE_7_ENG','English','ENG',[
      ch('C7E1','Comprehension — Seen and Unseen'),ch('C7E2','Grammar: Tenses and Voice'),
      ch('C7E3','Reported Speech'),ch('C7E4','Modals'),ch('C7E5','Letter and Essay Writing'),
      ch('C7E6','Prose Chapters'),ch('C7E7','Poems'),
    ]),
    sub('CBSE_7_HIN','Hindi','HIN',[
      ch('C7H1','वसंत — गद्य एवं पद्य'),ch('C7H2','दूर्वा'),ch('C7H3','महाभारत'),
      ch('C7H4','व्याकरण: समास, संधि, उपसर्ग'),ch('C7H5','मुहावरे और लोकोक्तियाँ'),
      ch('C7H6','अपठित गद्यांश'),ch('C7H7','पत्र और निबंध'),
    ]),
  ],
};

/* ── Class 8 ─────────────────────────────────────────────────────────────── */
const class8: Grade = {
  value: '8', label: 'Class 8', hasDomains: false,
  subjects: [
    sub('CBSE_8_MAT','Mathematics','MAT',[
      ch('C8M1','Rational Numbers'),ch('C8M2','Linear Equations in One Variable'),
      ch('C8M3','Understanding Quadrilaterals'),ch('C8M4','Practical Geometry'),
      ch('C8M5','Data Handling'),ch('C8M6','Squares and Square Roots'),
      ch('C8M7','Cubes and Cube Roots'),ch('C8M8','Comparing Quantities'),
      ch('C8M9','Algebraic Expressions and Identities'),ch('C8M10','Visualising Solid Shapes'),
      ch('C8M11','Mensuration'),ch('C8M12','Exponents and Powers'),
      ch('C8M13','Direct and Inverse Proportions'),ch('C8M14','Factorisation'),
      ch('C8M15','Introduction to Graphs'),ch('C8M16','Playing with Numbers'),
    ]),
    sub('CBSE_8_SCI','Science','SCI',[
      ch('C8S1','Crop Production and Management'),ch('C8S2','Microorganisms: Friend and Foe'),
      ch('C8S3','Synthetic Fibres and Plastics'),ch('C8S4','Materials: Metals and Non-Metals'),
      ch('C8S5','Coal and Petroleum'),ch('C8S6','Combustion and Flame'),
      ch('C8S7','Conservation of Plants and Animals'),ch('C8S8','Cell — Structure and Functions'),
      ch('C8S9','Reproduction in Animals'),ch('C8S10','Reaching the Age of Adolescence'),
      ch('C8S11','Force and Pressure'),ch('C8S12','Friction'),ch('C8S13','Sound'),
      ch('C8S14','Chemical Effects of Electric Current'),ch('C8S15','Some Natural Phenomena'),
      ch('C8S16','Light'),ch('C8S17','Stars and the Solar System'),
      ch('C8S18','Pollution of Air and Water'),
    ]),
    sub('CBSE_8_HIS','Social Science — History','HIS',[
      ch('C8H1','How, When and Where'),
      ch('C8H2','From Trade to Territory: The Company Establishes Power'),
      ch('C8H3','Ruling the Countryside'),ch('C8H4','Tribals, Dikus and the Vision of a Golden Age'),
      ch('C8H5','When People Rebel: 1857 and After'),
      ch('C8H6','Weavers, Iron Smelters and Factory Owners'),
      ch('C8H7','Civilising the "Native", Educating the Nation'),
      ch('C8H8','Women, Caste and Reform'),
      ch('C8H9','The Making of the National Movement: 1870s–1947'),
      ch('C8H10','India After Independence'),
    ]),
    sub('CBSE_8_GEO','Social Science — Geography','GEO',[
      ch('C8G1','Resources'),ch('C8G2','Land, Soil, Water, Natural Vegetation and Wildlife'),
      ch('C8G3','Mineral and Power Resources'),ch('C8G4','Agriculture'),
      ch('C8G5','Industries'),ch('C8G6','Human Resources'),
    ]),
    sub('CBSE_8_CIV','Social Science — Civics','CIV',[
      ch('C8C1','The Indian Constitution'),ch('C8C2','Understanding Secularism'),
      ch('C8C3','Why Do We Need a Parliament?'),ch('C8C4','Understanding Laws'),
      ch('C8C5','Judiciary'),ch('C8C6','Understanding Our Criminal Justice System'),
      ch('C8C7','Understanding Marginalisation'),ch('C8C8','Confronting Marginalisation'),
      ch('C8C9','Public Facilities'),ch('C8C10','Law and Social Justice'),
    ]),
    sub('CBSE_8_ENG','English','ENG',[
      ch('C8E1','Comprehension — Seen and Unseen'),ch('C8E2','Grammar and Usage'),
      ch('C8E3','Letter Writing — Formal and Informal'),ch('C8E4','Essay Writing'),
      ch('C8E5','Prose Chapters'),ch('C8E6','Poems'),
    ]),
    sub('CBSE_8_HIN','Hindi','HIN',[
      ch('C8H1','वसंत — गद्य एवं पद्य'),ch('C8H2','दूर्वा'),ch('C8H3','भारत की खोज'),
      ch('C8H4','व्याकरण: संधि, समास, अलंकार'),ch('C8H5','मुहावरे और लोकोक्तियाँ'),
      ch('C8H6','अपठित गद्यांश'),ch('C8H7','पत्र और निबंध'),
    ]),
  ],
};

/* ── Class 9 ─────────────────────────────────────────────────────────────── */
const class9: Grade = {
  value: '9', label: 'Class 9', hasDomains: false,
  subjects: [
    sub('CBSE_9_MAT','Mathematics','MAT',[
      ch('C9M1','Number Systems',[t('C9M1T1','Real Numbers'),t('C9M1T2','Irrational Numbers'),t('C9M1T3','Laws of Exponents')]),
      ch('C9M2','Polynomials',[t('C9M2T1','Types of Polynomials'),t('C9M2T2','Zeroes of a Polynomial'),t('C9M2T3','Factor Theorem')]),
      ch('C9M3','Coordinate Geometry',[t('C9M3T1','Cartesian Plane'),t('C9M3T2','Plotting Points')]),
      ch('C9M4','Linear Equations in Two Variables',[t('C9M4T1','Solutions of Linear Equations'),t('C9M4T2','Graph of Linear Equation')]),
      ch('C9M5',"Introduction to Euclid's Geometry"),
      ch('C9M6','Lines and Angles',[t('C9M6T1','Pairs of Angles'),t('C9M6T2','Parallel Lines and Transversal')]),
      ch('C9M7','Triangles',[t('C9M7T1','Congruence of Triangles'),t('C9M7T2','Inequalities in a Triangle')]),
      ch('C9M8','Quadrilaterals'),ch('C9M9','Areas of Parallelograms and Triangles'),
      ch('C9M10','Circles',[t('C9M10T1','Chord Properties'),t('C9M10T2','Angle Subtended by Arc')]),
      ch('C9M11','Constructions'),ch('C9M12',"Heron's Formula"),
      ch('C9M13','Surface Areas and Volumes',[t('C9M13T1','Cuboid and Cube'),t('C9M13T2','Cone and Cylinder'),t('C9M13T3','Sphere')]),
      ch('C9M14','Statistics',[t('C9M14T1','Mean, Median, Mode'),t('C9M14T2','Frequency Distribution')]),
      ch('C9M15','Probability',[t('C9M15T1','Experimental Probability'),t('C9M15T2','Event and Sample Space')]),
    ]),
    sub('CBSE_9_SCI','Science','SCI',[
      ch('C9S1','Matter in Our Surroundings',[t('C9S1T1','States of Matter'),t('C9S1T2','Evaporation')]),
      ch('C9S2','Is Matter Around Us Pure',[t('C9S2T1','Mixtures and Solutions'),t('C9S2T2','Separation Techniques')]),
      ch('C9S3','Atoms and Molecules',[t('C9S3T1','Laws of Chemical Combination'),t('C9S3T2','Mole Concept')]),
      ch('C9S4','Structure of the Atom',[t('C9S4T1','Subatomic Particles'),t('C9S4T2','Bohr Model')]),
      ch('C9S5','The Fundamental Unit of Life',[t('C9S5T1','Cell Structure'),t('C9S5T2','Cell Organelles')]),
      ch('C9S6','Tissues'),ch('C9S7','Diversity in Living Organisms'),
      ch('C9S8','Motion',[t('C9S8T1','Distance and Displacement'),t('C9S8T2','Speed, Velocity, Acceleration'),t('C9S8T3','Equations of Motion')]),
      ch('C9S9','Force and Laws of Motion',[t('C9S9T1',"Newton's Laws"),t('C9S9T2','Conservation of Momentum')]),
      ch('C9S10','Gravitation',[t('C9S10T1','Universal Gravitation'),t('C9S10T2','Free Fall'),t('C9S10T3','Thrust and Pressure')]),
      ch('C9S11','Work and Energy',[t('C9S11T1','Work Done'),t('C9S11T2','Kinetic and Potential Energy'),t('C9S11T3','Power')]),
      ch('C9S12','Sound',[t('C9S12T1','Wave Properties'),t('C9S12T2','Speed of Sound'),t('C9S12T3','Echo and Reverberation')]),
      ch('C9S13','Why Do We Fall Ill?'),ch('C9S14','Natural Resources'),ch('C9S15','Improvement in Food Resources'),
    ]),
    sub('CBSE_9_HIS','Social Science — History','HIS',[
      ch('C9H1','The French Revolution'),ch('C9H2','Socialism in Europe and the Russian Revolution'),
      ch('C9H3','Nazism and the Rise of Hitler'),ch('C9H4','Forest Society and Colonialism'),
      ch('C9H5','Pastoralists in the Modern World'),ch('C9H6','Peasants and Farmers'),
      ch('C9H7','History and Sport: The Story of Cricket'),ch('C9H8','Clothing: A Social History'),
    ]),
    sub('CBSE_9_GEO','Social Science — Geography','GEO',[
      ch('C9G1','India — Size and Location'),ch('C9G2','Physical Features of India'),
      ch('C9G3','Drainage'),ch('C9G4','Climate'),ch('C9G5','Natural Vegetation and Wildlife'),
      ch('C9G6','Population'),
    ]),
    sub('CBSE_9_CIV','Social Science — Civics','CIV',[
      ch('C9C1','Democracy in the Contemporary World'),ch('C9C2','What is Democracy? Why Democracy?'),
      ch('C9C3','Constitutional Design'),ch('C9C4','Electoral Politics'),
      ch('C9C5','Working of Institutions'),ch('C9C6','Democratic Rights'),
    ]),
    sub('CBSE_9_ECO','Social Science — Economics','ECO',[
      ch('C9E1','The Story of Village Palampur'),ch('C9E2','People as Resource'),
      ch('C9E3','Poverty as a Challenge'),ch('C9E4','Food Security in India'),
    ]),
    sub('CBSE_9_ENG','English','ENG',[
      ch('C9EN1','Beehive — Prose'),ch('C9EN2','Beehive — Poems'),
      ch('C9EN3','Moments (Supplementary Reader)'),ch('C9EN4','Grammar — Tenses, Voice, Narration'),
      ch('C9EN5','Writing — Formal Letter, Notice, Article'),ch('C9EN6','Reading Comprehension'),
    ]),
    sub('CBSE_9_HIN','Hindi','HIN',[
      ch('C9H1','क्षितिज — काव्य खंड'),ch('C9H2','क्षितिज — गद्य खंड'),ch('C9H3','कृतिका'),
      ch('C9H4','व्याकरण: अपठित गद्यांश, काव्यांश'),ch('C9H5','रचनात्मक लेखन'),
      ch('C9H6','संधि, समास, अलंकार, रस, छंद'),
    ]),
  ],
};

/* ── Class 10 ────────────────────────────────────────────────────────────── */
const class10: Grade = {
  value: '10', label: 'Class 10', hasDomains: false,
  subjects: [
    sub('CBSE_10_MAT','Mathematics','MAT',[
      ch('C10M1','Real Numbers',[t('C10M1T1','Euclid\'s Division Lemma'),t('C10M1T2','Fundamental Theorem of Arithmetic'),t('C10M1T3','Irrational Numbers')]),
      ch('C10M2','Polynomials',[t('C10M2T1','Zeros of Polynomial'),t('C10M2T2','Division Algorithm')]),
      ch('C10M3','Pair of Linear Equations in Two Variables',[t('C10M3T1','Graphical Method'),t('C10M3T2','Substitution and Elimination')]),
      ch('C10M4','Quadratic Equations',[t('C10M4T1','Factorisation'),t('C10M4T2','Quadratic Formula'),t('C10M4T3','Discriminant')]),
      ch('C10M5','Arithmetic Progressions',[t('C10M5T1','nth Term'),t('C10M5T2','Sum of n Terms')]),
      ch('C10M6','Triangles',[t('C10M6T1','Similar Triangles'),t('C10M6T2','Pythagoras Theorem')]),
      ch('C10M7','Coordinate Geometry',[t('C10M7T1','Distance Formula'),t('C10M7T2','Section Formula'),t('C10M7T3','Area of Triangle')]),
      ch('C10M8','Introduction to Trigonometry',[t('C10M8T1','Trigonometric Ratios'),t('C10M8T2','Trigonometric Identities')]),
      ch('C10M9','Some Applications of Trigonometry',[t('C10M9T1','Heights and Distances')]),
      ch('C10M10','Circles',[t('C10M10T1','Tangent to a Circle'),t('C10M10T2','Number of Tangents')]),
      ch('C10M11','Constructions'),ch('C10M12','Areas Related to Circles'),
      ch('C10M13','Surface Areas and Volumes',[t('C10M13T1','Combination of Solids'),t('C10M13T2','Conversion of Solids')]),
      ch('C10M14','Statistics',[t('C10M14T1','Mean of Grouped Data'),t('C10M14T2','Median and Mode'),t('C10M14T3','Ogive')]),
      ch('C10M15','Probability',[t('C10M15T1','Classical Probability'),t('C10M15T2','Complementary Events')]),
    ]),
    sub('CBSE_10_SCI','Science','SCI',[
      ch('C10S1','Chemical Reactions and Equations',[t('C10S1T1','Types of Reactions'),t('C10S1T2','Balancing Equations')]),
      ch('C10S2','Acids, Bases and Salts',[t('C10S2T1','pH Scale'),t('C10S2T2','Salts and their Uses')]),
      ch('C10S3','Metals and Non-metals',[t('C10S3T1','Properties'),t('C10S3T2','Reactivity Series'),t('C10S3T3','Corrosion')]),
      ch('C10S4','Carbon and its Compounds',[t('C10S4T1','Covalent Bonds'),t('C10S4T2','Functional Groups'),t('C10S4T3','Soaps and Detergents')]),
      ch('C10S5','Periodic Classification of Elements',[t('C10S5T1','Mendeleev\'s Table'),t('C10S5T2','Modern Periodic Table')]),
      ch('C10S6','Life Processes',[t('C10S6T1','Nutrition'),t('C10S6T2','Respiration'),t('C10S6T3','Transportation'),t('C10S6T4','Excretion')]),
      ch('C10S7','Control and Coordination',[t('C10S7T1','Nervous System'),t('C10S7T2','Hormones')]),
      ch('C10S8','How do Organisms Reproduce?',[t('C10S8T1','Asexual Reproduction'),t('C10S8T2','Sexual Reproduction')]),
      ch('C10S9','Heredity and Evolution',[t('C10S9T1','Mendel\'s Laws'),t('C10S9T2','Evolution and Classification')]),
      ch('C10S10','Light — Reflection and Refraction',[t('C10S10T1','Mirror Formula'),t('C10S10T2','Snell\'s Law'),t('C10S10T3','Lenses')]),
      ch('C10S11','Human Eye and the Colourful World',[t('C10S11T1','Defects of Vision'),t('C10S11T2','Dispersion of Light')]),
      ch('C10S12','Electricity',[t('C10S12T1','Ohm\'s Law'),t('C10S12T2','Resistance in Series and Parallel'),t('C10S12T3','Heating Effect')]),
      ch('C10S13','Magnetic Effects of Electric Current',[t('C10S13T1','Magnetic Field'),t('C10S13T2','Electromagnetic Induction'),t('C10S13T3','AC and DC')]),
      ch('C10S14','Sources of Energy'),ch('C10S15','Our Environment'),
      ch('C10S16','Sustainable Management of Natural Resources'),
    ]),
    sub('CBSE_10_HIS','Social Science — History','HIS',[
      ch('C10H1','The Rise of Nationalism in Europe'),ch('C10H2','Nationalism in India'),
      ch('C10H3','The Making of a Global World'),ch('C10H4','The Age of Industrialisation'),
      ch('C10H5','Print Culture and the Modern World'),
    ]),
    sub('CBSE_10_GEO','Social Science — Geography','GEO',[
      ch('C10G1','Resources and Development'),ch('C10G2','Forest and Wildlife Resources'),
      ch('C10G3','Water Resources'),ch('C10G4','Agriculture'),
      ch('C10G5','Minerals and Energy Resources'),ch('C10G6','Manufacturing Industries'),
      ch('C10G7','Life Lines of National Economy'),
    ]),
    sub('CBSE_10_CIV','Social Science — Civics','CIV',[
      ch('C10C1','Power Sharing'),ch('C10C2','Federalism'),ch('C10C3','Democracy and Diversity'),
      ch('C10C4','Gender, Religion and Caste'),ch('C10C5','Popular Struggles and Movements'),
      ch('C10C6','Political Parties'),ch('C10C7','Outcomes of Democracy'),
      ch('C10C8','Challenges to Democracy'),
    ]),
    sub('CBSE_10_ECO','Social Science — Economics','ECO',[
      ch('C10E1','Development'),ch('C10E2','Sectors of the Indian Economy'),
      ch('C10E3','Money and Credit'),ch('C10E4','Globalisation and the Indian Economy'),
      ch('C10E5','Consumer Rights'),
    ]),
    sub('CBSE_10_ENG','English','ENG',[
      ch('C10EN1','First Flight — Prose'),ch('C10EN2','First Flight — Poems'),
      ch('C10EN3','Footprints Without Feet (Supplementary Reader)'),
      ch('C10EN4','Grammar — Tenses, Voice, Narration, Modals'),
      ch('C10EN5','Writing — Letter, Article, Report'),ch('C10EN6','Reading Comprehension'),
    ]),
    sub('CBSE_10_HIN','Hindi','HIN',[
      ch('C10H1','क्षितिज — काव्य खंड'),ch('C10H2','क्षितिज — गद्य खंड'),ch('C10H3','कृतिका'),
      ch('C10H4','व्याकरण: अपठित गद्यांश, काव्यांश'),ch('C10H5','रचनात्मक लेखन'),
      ch('C10H6','संधि, समास, अलंकार, रस, छंद'),ch('C10H7','व्याकरण: वाच्य, पद, वाक्य'),
    ]),
  ],
};

export const CBSE_GRADES_1_10: Grade[] = [class1,class2,class3,class4,class5,class6,class7,class8,class9,class10];
