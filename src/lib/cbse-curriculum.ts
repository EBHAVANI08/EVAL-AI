export interface CbseChapter { name: string }
export interface CbseSubject  { name: string; chapters: CbseChapter[] }
export interface CbseGrade    { value: string; label: string; subjects: CbseSubject[] }

export const CBSE_CURRICULUM: CbseGrade[] = [
  /* ── Class 1 ── */
  { value: '1', label: 'Class 1', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Shapes and Space' }, { name: 'Numbers 1–9' }, { name: 'Addition' },
      { name: 'Subtraction' }, { name: 'Numbers 10–20' }, { name: 'Time' },
      { name: 'Measurement' }, { name: 'Numbers 21–50' }, { name: 'Data Handling' },
      { name: 'Patterns' }, { name: 'Numbers 51–100' }, { name: 'Money' },
    ]},
    { name: 'English', chapters: [
      { name: 'Alphabet and Phonics' }, { name: 'Simple Words' }, { name: 'Sentences' },
      { name: 'Reading Comprehension' }, { name: 'Writing Practice' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वर्णमाला' }, { name: 'मात्राएँ' }, { name: 'सरल शब्द' },
      { name: 'छोटी कहानियाँ' }, { name: 'कविताएँ' },
    ]},
    { name: 'Environmental Studies', chapters: [
      { name: 'My Body' }, { name: 'My Family' }, { name: 'My School' },
      { name: 'Plants Around Us' }, { name: 'Animals Around Us' },
      { name: 'Food' }, { name: 'Transport' }, { name: 'Water' }, { name: 'Weather' },
    ]},
  ]},

  /* ── Class 2 ── */
  { value: '2', label: 'Class 2', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Counting in Groups' }, { name: 'Tens and Ones' }, { name: 'Addition' },
      { name: 'Subtraction' }, { name: 'Multiplication' }, { name: 'Length and Weight' },
      { name: 'Patterns' }, { name: 'Time' }, { name: 'Data Handling' }, { name: 'Money' },
    ]},
    { name: 'English', chapters: [
      { name: 'Phonics and Vocabulary' }, { name: 'Nouns and Pronouns' },
      { name: 'Verbs and Adjectives' }, { name: 'Sentences' },
      { name: 'Reading and Comprehension' }, { name: 'Writing' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वर्ण और मात्राएँ' }, { name: 'संज्ञा' }, { name: 'क्रिया' },
      { name: 'वाक्य बनाना' }, { name: 'कहानी' }, { name: 'कविताएँ' },
    ]},
    { name: 'Environmental Studies', chapters: [
      { name: 'My Family' }, { name: 'Plants We Use' }, { name: 'Animals We Know' },
      { name: 'Our Food' }, { name: 'Houses' }, { name: 'Clothes' },
      { name: 'Festivals' }, { name: 'Transport' }, { name: 'Communication' }, { name: 'Safety' },
    ]},
  ]},

  /* ── Class 3 ── */
  { value: '3', label: 'Class 3', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Numbers up to 9999' }, { name: 'Addition' }, { name: 'Subtraction' },
      { name: 'Multiplication' }, { name: 'Division' }, { name: 'Fractions' },
      { name: 'Measurement' }, { name: 'Time and Calendar' }, { name: 'Money' },
      { name: 'Shapes and Geometry' }, { name: 'Data Handling' },
    ]},
    { name: 'English', chapters: [
      { name: 'Nouns and Pronouns' }, { name: 'Verbs and Tenses' },
      { name: 'Adjectives and Adverbs' }, { name: 'Prepositions and Conjunctions' },
      { name: 'Sentences and Punctuation' }, { name: 'Reading Comprehension' },
      { name: 'Creative Writing' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'संज्ञा और सर्वनाम' }, { name: 'क्रिया और काल' }, { name: 'विशेषण' },
      { name: 'वाक्य और विराम चिह्न' }, { name: 'अनुच्छेद लेखन' }, { name: 'कहानी और कविता' },
    ]},
    { name: 'Environmental Studies', chapters: [
      { name: 'Plants and Animals' }, { name: 'Water' }, { name: 'Our Family' },
      { name: 'Food and Nutrition' }, { name: 'Shelter' }, { name: 'Clothing' },
      { name: 'Transport and Communication' }, { name: 'Our Environment' }, { name: 'Safety and Health' },
    ]},
  ]},

  /* ── Class 4 ── */
  { value: '4', label: 'Class 4', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Large Numbers' }, { name: 'Addition and Subtraction' }, { name: 'Multiplication' },
      { name: 'Division' }, { name: 'Fractions' }, { name: 'Decimals' },
      { name: 'Measurement' }, { name: 'Time' }, { name: 'Perimeter and Area' },
      { name: 'Shapes' }, { name: 'Data Handling' }, { name: 'Money' },
    ]},
    { name: 'English', chapters: [
      { name: 'Parts of Speech' }, { name: 'Tenses' }, { name: 'Punctuation' },
      { name: 'Direct and Indirect Speech' }, { name: 'Reading Comprehension' },
      { name: 'Letter Writing' }, { name: 'Paragraph Writing' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वर्ण-विचार' }, { name: 'शब्द-विचार' }, { name: 'वाक्य-विचार' },
      { name: 'संज्ञा, सर्वनाम, विशेषण' }, { name: 'क्रिया और काल' },
      { name: 'पत्र-लेखन' }, { name: 'निबंध' }, { name: 'कहानी और कविता' },
    ]},
    { name: 'Environmental Studies', chapters: [
      { name: 'Our Body and Health' }, { name: 'Plants and Animals' }, { name: 'Water and Air' },
      { name: 'Food Production' }, { name: 'Rocks and Soil' }, { name: 'The Solar System' },
      { name: 'Our Community' }, { name: 'Transport' }, { name: 'Communication' }, { name: 'Environment' },
    ]},
  ]},

  /* ── Class 5 ── */
  { value: '5', label: 'Class 5', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Large Numbers and Operations' }, { name: 'Fractions' }, { name: 'Decimals' },
      { name: 'Percentage' }, { name: 'Ratio and Proportion' }, { name: 'Area and Perimeter' },
      { name: 'Volume and Capacity' }, { name: 'Time and Speed' }, { name: 'Data Handling' },
      { name: 'Patterns and Symmetry' }, { name: 'Money' },
    ]},
    { name: 'English', chapters: [
      { name: 'Nouns, Pronouns, Adjectives' }, { name: 'Verbs and Tenses' },
      { name: 'Adverbs and Prepositions' }, { name: 'Conjunctions and Articles' },
      { name: 'Direct and Indirect Speech' }, { name: 'Active and Passive Voice' },
      { name: 'Reading Comprehension' }, { name: 'Essay and Letter Writing' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'संज्ञा, सर्वनाम, विशेषण, क्रिया' }, { name: 'काल (भूत, वर्तमान, भविष्य)' },
      { name: 'अव्यय' }, { name: 'वाक्य और मुहावरे' }, { name: 'पत्र-लेखन' },
      { name: 'निबंध-लेखन' }, { name: 'कहानी-लेखन' }, { name: 'कविता और अपठित गद्यांश' },
    ]},
    { name: 'Environmental Studies', chapters: [
      { name: 'Super Senses and Adaptation' }, { name: 'Food and Digestion' },
      { name: 'Seeds and Plants' }, { name: 'Water Cycle and Conservation' },
      { name: 'Mountains and Hills' }, { name: 'When Earth Shook' },
      { name: 'Space — Sun, Moon and Stars' }, { name: 'Natural Resources' },
      { name: 'Wildlife and Forests' }, { name: 'Pollution and Environment' },
    ]},
  ]},

  /* ── Class 6 ── */
  { value: '6', label: 'Class 6', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Knowing Our Numbers' }, { name: 'Whole Numbers' }, { name: 'Playing with Numbers' },
      { name: 'Basic Geometrical Ideas' }, { name: 'Understanding Elementary Shapes' },
      { name: 'Integers' }, { name: 'Fractions' }, { name: 'Decimals' },
      { name: 'Data Handling' }, { name: 'Mensuration' }, { name: 'Algebra' },
      { name: 'Ratio and Proportion' }, { name: 'Symmetry' }, { name: 'Practical Geometry' },
    ]},
    { name: 'Science', chapters: [
      { name: 'Food: Where Does It Come From?' }, { name: 'Components of Food' },
      { name: 'Fibre to Fabric' }, { name: 'Sorting Materials into Groups' },
      { name: 'Separation of Substances' }, { name: 'Changes Around Us' },
      { name: 'Getting to Know Plants' }, { name: 'Body Movements' },
      { name: 'The Living Organisms and Their Surroundings' },
      { name: 'Motion and Measurement of Distances' },
      { name: 'Light, Shadows and Reflections' }, { name: 'Electricity and Circuits' },
      { name: 'Fun with Magnets' }, { name: 'Water' }, { name: 'Air Around Us' },
      { name: 'Garbage In, Garbage Out' },
    ]},
    { name: 'Social Science — History', chapters: [
      { name: 'What, Where, How and When?' }, { name: 'On the Trail of the Earliest People' },
      { name: 'From Gathering to Growing Food' }, { name: 'In the Earliest Cities' },
      { name: 'What Books and Burials Tell Us' }, { name: 'Kingdoms, Kings and an Early Republic' },
      { name: 'New Questions and Ideas' }, { name: 'Ashoka, The Emperor Who Gave Up War' },
      { name: 'Vital Villages, Thriving Towns' }, { name: 'Traders, Kings and Pilgrims' },
      { name: 'New Empires and Kingdoms' }, { name: 'Buildings, Paintings and Books' },
    ]},
    { name: 'Social Science — Geography', chapters: [
      { name: 'The Earth in the Solar System' }, { name: 'Globe: Latitudes and Longitudes' },
      { name: 'Motions of the Earth' }, { name: 'Maps' }, { name: 'Major Domains of the Earth' },
      { name: 'Major Landforms of the Earth' }, { name: 'Our Country — India' },
      { name: 'India: Climate, Vegetation and Wildlife' },
    ]},
    { name: 'Social Science — Civics', chapters: [
      { name: 'Understanding Diversity' }, { name: 'Diversity and Discrimination' },
      { name: 'What is Government?' }, { name: 'Key Elements of a Democratic Government' },
      { name: 'Panchayati Raj' }, { name: 'Rural Administration' },
      { name: 'Urban Administration' }, { name: 'Rural Livelihoods' }, { name: 'Urban Livelihoods' },
    ]},
    { name: 'English', chapters: [
      { name: 'Comprehension Passages' }, { name: 'Grammar: Parts of Speech' },
      { name: 'Tenses and Voice' }, { name: 'Letter Writing' },
      { name: 'Essay and Paragraph Writing' }, { name: 'Prose Chapters' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वसंत — गद्य एवं पद्य' }, { name: 'दूर्वा' }, { name: 'बाल रामकथा' },
      { name: 'व्याकरण: संज्ञा, सर्वनाम, विशेषण' }, { name: 'क्रिया और काल' },
      { name: 'अपठित गद्यांश' }, { name: 'पत्र और निबंध' },
    ]},
  ]},

  /* ── Class 7 ── */
  { value: '7', label: 'Class 7', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Integers' }, { name: 'Fractions and Decimals' }, { name: 'Data Handling' },
      { name: 'Simple Equations' }, { name: 'Lines and Angles' },
      { name: 'The Triangle and its Properties' }, { name: 'Congruence of Triangles' },
      { name: 'Comparing Quantities' }, { name: 'Rational Numbers' },
      { name: 'Practical Geometry' }, { name: 'Perimeter and Area' },
      { name: 'Algebraic Expressions' }, { name: 'Exponents and Powers' },
      { name: 'Symmetry' }, { name: 'Visualising Solid Shapes' },
    ]},
    { name: 'Science', chapters: [
      { name: 'Nutrition in Plants' }, { name: 'Nutrition in Animals' },
      { name: 'Fibre to Fabric' }, { name: 'Heat' }, { name: 'Acids, Bases and Salts' },
      { name: 'Physical and Chemical Changes' },
      { name: 'Weather, Climate and Adaptations of Animals to Climate' },
      { name: 'Winds, Storms and Cyclones' }, { name: 'Soil' },
      { name: 'Respiration in Organisms' }, { name: 'Transportation in Animals and Plants' },
      { name: 'Reproduction in Plants' }, { name: 'Motion and Time' },
      { name: 'Electric Current and its Effects' }, { name: 'Light' },
      { name: 'Water: A Precious Resource' }, { name: 'Forests: Our Lifeline' },
      { name: 'Wastewater Story' },
    ]},
    { name: 'Social Science — History', chapters: [
      { name: 'Tracing Changes Through a Thousand Years' }, { name: 'New Kings and Kingdoms' },
      { name: 'The Delhi Sultans' }, { name: 'The Mughal Empire' }, { name: 'Rulers and Buildings' },
      { name: 'Towns, Traders and Craftspersons' },
      { name: 'Tribes, Nomads and Settled Communities' },
      { name: 'Devotional Paths to the Divine' }, { name: 'The Making of Regional Cultures' },
      { name: 'Eighteenth-Century Political Formations' },
    ]},
    { name: 'Social Science — Geography', chapters: [
      { name: 'Environment' }, { name: 'Inside Our Earth' }, { name: 'Our Changing Earth' },
      { name: 'Air' }, { name: 'Water' }, { name: 'Natural Vegetation and Wildlife' },
      { name: 'Human Environment — Settlement, Transport and Communication' },
      { name: 'Human Environment Interactions — The Tropical and the Subtropical Region' },
      { name: 'Life in the Temperate Grasslands' }, { name: 'Life in the Deserts' },
    ]},
    { name: 'Social Science — Civics', chapters: [
      { name: 'On Equality' }, { name: 'Role of the Government in Health' },
      { name: 'How the State Government Works' }, { name: 'Growing up as Boys and Girls' },
      { name: 'Women Change the World' }, { name: 'Understanding Media' },
      { name: 'Understanding Advertising' }, { name: 'Markets Around Us' },
      { name: 'A Shirt in the Market' },
    ]},
    { name: 'English', chapters: [
      { name: 'Comprehension — Seen and Unseen' }, { name: 'Grammar: Tenses and Voice' },
      { name: 'Reported Speech' }, { name: 'Modals' }, { name: 'Letter and Essay Writing' },
      { name: 'Prose Chapters' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वसंत — गद्य एवं पद्य' }, { name: 'दूर्वा' }, { name: 'महाभारत' },
      { name: 'व्याकरण: समास, संधि, उपसर्ग' }, { name: 'मुहावरे और लोकोक्तियाँ' },
      { name: 'अपठित गद्यांश' }, { name: 'पत्र और निबंध' },
    ]},
  ]},

  /* ── Class 8 ── */
  { value: '8', label: 'Class 8', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Rational Numbers' }, { name: 'Linear Equations in One Variable' },
      { name: 'Understanding Quadrilaterals' }, { name: 'Practical Geometry' },
      { name: 'Data Handling' }, { name: 'Squares and Square Roots' },
      { name: 'Cubes and Cube Roots' }, { name: 'Comparing Quantities' },
      { name: 'Algebraic Expressions and Identities' }, { name: 'Visualising Solid Shapes' },
      { name: 'Mensuration' }, { name: 'Exponents and Powers' },
      { name: 'Direct and Inverse Proportions' }, { name: 'Factorisation' },
      { name: 'Introduction to Graphs' }, { name: 'Playing with Numbers' },
    ]},
    { name: 'Science', chapters: [
      { name: 'Crop Production and Management' }, { name: 'Microorganisms: Friend and Foe' },
      { name: 'Synthetic Fibres and Plastics' }, { name: 'Materials: Metals and Non-Metals' },
      { name: 'Coal and Petroleum' }, { name: 'Combustion and Flame' },
      { name: 'Conservation of Plants and Animals' }, { name: 'Cell — Structure and Functions' },
      { name: 'Reproduction in Animals' }, { name: 'Reaching the Age of Adolescence' },
      { name: 'Force and Pressure' }, { name: 'Friction' }, { name: 'Sound' },
      { name: 'Chemical Effects of Electric Current' }, { name: 'Some Natural Phenomena' },
      { name: 'Light' }, { name: 'Stars and the Solar System' },
      { name: 'Pollution of Air and Water' },
    ]},
    { name: 'Social Science — History', chapters: [
      { name: 'How, When and Where' },
      { name: 'From Trade to Territory: The Company Establishes Power' },
      { name: 'Ruling the Countryside' }, { name: 'Tribals, Dikus and the Vision of a Golden Age' },
      { name: 'When People Rebel: 1857 and After' },
      { name: 'Weavers, Iron Smelters and Factory Owners' },
      { name: 'Civilising the "Native", Educating the Nation' },
      { name: 'Women, Caste and Reform' },
      { name: 'The Making of the National Movement: 1870s–1947' },
      { name: 'India After Independence' },
    ]},
    { name: 'Social Science — Geography', chapters: [
      { name: 'Resources' }, { name: 'Land, Soil, Water, Natural Vegetation and Wildlife' },
      { name: 'Mineral and Power Resources' }, { name: 'Agriculture' },
      { name: 'Industries' }, { name: 'Human Resources' },
    ]},
    { name: 'Social Science — Civics', chapters: [
      { name: 'The Indian Constitution' }, { name: 'Understanding Secularism' },
      { name: 'Why Do We Need a Parliament?' }, { name: 'Understanding Laws' },
      { name: 'Judiciary' }, { name: 'Understanding Our Criminal Justice System' },
      { name: 'Understanding Marginalisation' }, { name: 'Confronting Marginalisation' },
      { name: 'Public Facilities' }, { name: 'Law and Social Justice' },
    ]},
    { name: 'English', chapters: [
      { name: 'Comprehension — Seen and Unseen' }, { name: 'Grammar and Usage' },
      { name: 'Letter Writing — Formal and Informal' }, { name: 'Essay Writing' },
      { name: 'Prose Chapters' }, { name: 'Poems' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'वसंत — गद्य एवं पद्य' }, { name: 'दूर्वा' }, { name: 'भारत की खोज' },
      { name: 'व्याकरण: संधि, समास, अलंकार' }, { name: 'मुहावरे और लोकोक्तियाँ' },
      { name: 'अपठित गद्यांश' }, { name: 'पत्र और निबंध' },
    ]},
  ]},

  /* ── Class 9 ── */
  { value: '9', label: 'Class 9', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Number Systems' }, { name: 'Polynomials' }, { name: 'Coordinate Geometry' },
      { name: 'Linear Equations in Two Variables' }, { name: "Introduction to Euclid's Geometry" },
      { name: 'Lines and Angles' }, { name: 'Triangles' }, { name: 'Quadrilaterals' },
      { name: 'Areas of Parallelograms and Triangles' }, { name: 'Circles' },
      { name: 'Constructions' }, { name: "Heron's Formula" },
      { name: 'Surface Areas and Volumes' }, { name: 'Statistics' }, { name: 'Probability' },
    ]},
    { name: 'Science', chapters: [
      { name: 'Matter in Our Surroundings' }, { name: 'Is Matter Around Us Pure' },
      { name: 'Atoms and Molecules' }, { name: 'Structure of the Atom' },
      { name: 'The Fundamental Unit of Life' }, { name: 'Tissues' },
      { name: 'Diversity in Living Organisms' }, { name: 'Motion' },
      { name: 'Force and Laws of Motion' }, { name: 'Gravitation' },
      { name: 'Work and Energy' }, { name: 'Sound' },
      { name: 'Why Do We Fall Ill?' }, { name: 'Natural Resources' },
      { name: 'Improvement in Food Resources' },
    ]},
    { name: 'Social Science — History', chapters: [
      { name: 'The French Revolution' }, { name: 'Socialism in Europe and the Russian Revolution' },
      { name: 'Nazism and the Rise of Hitler' }, { name: 'Forest Society and Colonialism' },
      { name: 'Pastoralists in the Modern World' }, { name: 'Peasants and Farmers' },
      { name: 'History and Sport: The Story of Cricket' }, { name: 'Clothing: A Social History' },
    ]},
    { name: 'Social Science — Geography', chapters: [
      { name: 'India — Size and Location' }, { name: 'Physical Features of India' },
      { name: 'Drainage' }, { name: 'Climate' }, { name: 'Natural Vegetation and Wildlife' },
      { name: 'Population' },
    ]},
    { name: 'Social Science — Civics', chapters: [
      { name: 'Democracy in the Contemporary World' }, { name: 'What is Democracy? Why Democracy?' },
      { name: 'Constitutional Design' }, { name: 'Electoral Politics' },
      { name: 'Working of Institutions' }, { name: 'Democratic Rights' },
    ]},
    { name: 'Social Science — Economics', chapters: [
      { name: 'The Story of Village Palampur' }, { name: 'People as Resource' },
      { name: 'Poverty as a Challenge' }, { name: 'Food Security in India' },
    ]},
    { name: 'English', chapters: [
      { name: 'Beehive — Prose' }, { name: 'Beehive — Poems' },
      { name: 'Moments (Supplementary Reader)' }, { name: 'Grammar — Tenses, Voice, Narration' },
      { name: 'Writing — Formal Letter, Notice, Article' }, { name: 'Reading Comprehension' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'क्षितिज — काव्य खंड' }, { name: 'क्षितिज — गद्य खंड' }, { name: 'कृतिका' },
      { name: 'व्याकरण: अपठित गद्यांश, काव्यांश' }, { name: 'रचनात्मक लेखन' },
      { name: 'संधि, समास, अलंकार, रस, छंद' },
    ]},
  ]},

  /* ── Class 10 ── */
  { value: '10', label: 'Class 10', subjects: [
    { name: 'Mathematics', chapters: [
      { name: 'Real Numbers' }, { name: 'Polynomials' },
      { name: 'Pair of Linear Equations in Two Variables' }, { name: 'Quadratic Equations' },
      { name: 'Arithmetic Progressions' }, { name: 'Triangles' },
      { name: 'Coordinate Geometry' }, { name: 'Introduction to Trigonometry' },
      { name: 'Some Applications of Trigonometry' }, { name: 'Circles' },
      { name: 'Constructions' }, { name: 'Areas Related to Circles' },
      { name: 'Surface Areas and Volumes' }, { name: 'Statistics' }, { name: 'Probability' },
    ]},
    { name: 'Science', chapters: [
      { name: 'Chemical Reactions and Equations' }, { name: 'Acids, Bases and Salts' },
      { name: 'Metals and Non-metals' }, { name: 'Carbon and its Compounds' },
      { name: 'Periodic Classification of Elements' }, { name: 'Life Processes' },
      { name: 'Control and Coordination' }, { name: 'How do Organisms Reproduce?' },
      { name: 'Heredity and Evolution' }, { name: 'Light — Reflection and Refraction' },
      { name: 'Human Eye and the Colourful World' }, { name: 'Electricity' },
      { name: 'Magnetic Effects of Electric Current' }, { name: 'Sources of Energy' },
      { name: 'Our Environment' }, { name: 'Sustainable Management of Natural Resources' },
    ]},
    { name: 'Social Science — History', chapters: [
      { name: 'The Rise of Nationalism in Europe' }, { name: 'Nationalism in India' },
      { name: 'The Making of a Global World' }, { name: 'The Age of Industrialisation' },
      { name: 'Print Culture and the Modern World' },
    ]},
    { name: 'Social Science — Geography', chapters: [
      { name: 'Resources and Development' }, { name: 'Forest and Wildlife Resources' },
      { name: 'Water Resources' }, { name: 'Agriculture' },
      { name: 'Minerals and Energy Resources' }, { name: 'Manufacturing Industries' },
      { name: 'Life Lines of National Economy' },
    ]},
    { name: 'Social Science — Civics', chapters: [
      { name: 'Power Sharing' }, { name: 'Federalism' }, { name: 'Democracy and Diversity' },
      { name: 'Gender, Religion and Caste' }, { name: 'Popular Struggles and Movements' },
      { name: 'Political Parties' }, { name: 'Outcomes of Democracy' },
      { name: 'Challenges to Democracy' },
    ]},
    { name: 'Social Science — Economics', chapters: [
      { name: 'Development' }, { name: 'Sectors of the Indian Economy' },
      { name: 'Money and Credit' }, { name: 'Globalisation and the Indian Economy' },
      { name: 'Consumer Rights' },
    ]},
    { name: 'English', chapters: [
      { name: 'First Flight — Prose' }, { name: 'First Flight — Poems' },
      { name: 'Footprints Without Feet (Supplementary Reader)' },
      { name: 'Grammar — Tenses, Voice, Narration, Modals' },
      { name: 'Writing — Letter, Article, Report' }, { name: 'Reading Comprehension' },
    ]},
    { name: 'Hindi', chapters: [
      { name: 'क्षितिज — काव्य खंड' }, { name: 'क्षितिज — गद्य खंड' }, { name: 'कृतिका' },
      { name: 'व्याकरण: अपठित गद्यांश, काव्यांश' }, { name: 'रचनात्मक लेखन' },
      { name: 'संधि, समास, अलंकार, रस, छंद' }, { name: 'व्याकरण: वाच्य, पद, वाक्य' },
    ]},
  ]},

  /* ── Class 11 ── */
  { value: '11', label: 'Class 11', subjects: [
    { name: 'Physics', chapters: [
      { name: 'Physical World' }, { name: 'Units and Measurements' },
      { name: 'Motion in a Straight Line' }, { name: 'Motion in a Plane' },
      { name: 'Laws of Motion' }, { name: 'Work, Energy and Power' },
      { name: 'System of Particles and Rotational Motion' }, { name: 'Gravitation' },
      { name: 'Mechanical Properties of Solids' }, { name: 'Mechanical Properties of Fluids' },
      { name: 'Thermal Properties of Matter' }, { name: 'Thermodynamics' },
      { name: 'Kinetic Theory' }, { name: 'Oscillations' }, { name: 'Waves' },
    ]},
    { name: 'Chemistry', chapters: [
      { name: 'Some Basic Concepts of Chemistry' }, { name: 'Structure of Atom' },
      { name: 'Classification of Elements and Periodicity in Properties' },
      { name: 'Chemical Bonding and Molecular Structure' },
      { name: 'States of Matter: Gases and Liquids' }, { name: 'Thermodynamics' },
      { name: 'Equilibrium' }, { name: 'Redox Reactions' }, { name: 'Hydrogen' },
      { name: 'The s-Block Elements' }, { name: 'The p-Block Elements' },
      { name: 'Organic Chemistry: Some Basic Principles and Techniques' },
      { name: 'Hydrocarbons' }, { name: 'Environmental Chemistry' },
    ]},
    { name: 'Mathematics', chapters: [
      { name: 'Sets' }, { name: 'Relations and Functions' }, { name: 'Trigonometric Functions' },
      { name: 'Principle of Mathematical Induction' },
      { name: 'Complex Numbers and Quadratic Equations' }, { name: 'Linear Inequalities' },
      { name: 'Permutations and Combinations' }, { name: 'Binomial Theorem' },
      { name: 'Sequences and Series' }, { name: 'Straight Lines' }, { name: 'Conic Sections' },
      { name: 'Introduction to Three-dimensional Geometry' }, { name: 'Limits and Derivatives' },
      { name: 'Mathematical Reasoning' }, { name: 'Statistics' }, { name: 'Probability' },
    ]},
    { name: 'Biology', chapters: [
      { name: 'The Living World' }, { name: 'Biological Classification' }, { name: 'Plant Kingdom' },
      { name: 'Animal Kingdom' }, { name: 'Morphology of Flowering Plants' },
      { name: 'Anatomy of Flowering Plants' }, { name: 'Structural Organisation in Animals' },
      { name: 'Cell: The Unit of Life' }, { name: 'Biomolecules' }, { name: 'Cell Cycle and Cell Division' },
      { name: 'Transport in Plants' }, { name: 'Mineral Nutrition' },
      { name: 'Photosynthesis in Higher Plants' }, { name: 'Respiration in Plants' },
      { name: 'Plant Growth and Development' }, { name: 'Digestion and Absorption' },
      { name: 'Breathing and Exchange of Gases' }, { name: 'Body Fluids and Circulation' },
      { name: 'Excretory Products and their Elimination' }, { name: 'Locomotion and Movement' },
      { name: 'Neural Control and Coordination' }, { name: 'Chemical Coordination and Integration' },
    ]},
    { name: 'English', chapters: [
      { name: 'Hornbill — Prose' }, { name: 'Hornbill — Poems' }, { name: 'Snapshots (Supplementary)' },
      { name: 'Grammar — Tenses, Voice, Reported Speech, Modals' },
      { name: 'Writing — Article, Speech, Report, Debate' }, { name: 'Reading Comprehension' },
    ]},
    { name: 'Accountancy', chapters: [
      { name: 'Introduction to Accounting' }, { name: 'Theory Base of Accounting' },
      { name: 'Recording of Transactions – I' }, { name: 'Recording of Transactions – II' },
      { name: 'Bank Reconciliation Statement' }, { name: 'Trial Balance and Rectification of Errors' },
      { name: 'Depreciation, Provisions and Reserves' }, { name: 'Bill of Exchange' },
      { name: 'Financial Statements – I' }, { name: 'Financial Statements – II' },
      { name: 'Accounts from Incomplete Records' }, { name: 'Applications of Computers in Accounting' },
    ]},
    { name: 'Economics', chapters: [
      { name: "Introduction to Economics and Economy" }, { name: "Consumer's Equilibrium and Demand" },
      { name: 'Producer Behaviour and Supply' }, { name: 'Forms of Market and Price Determination' },
      { name: 'Indian Economy on the Eve of Independence' }, { name: 'Indian Economy 1950–1990' },
      { name: 'Economic Reforms Since 1991' }, { name: 'Poverty' },
      { name: 'Human Capital Formation in India' }, { name: 'Rural Development' },
      { name: 'Employment: Growth, Informalisation and Other Issues' },
      { name: 'Infrastructure' }, { name: 'Environment and Sustainable Development' },
    ]},
    { name: 'Computer Science', chapters: [
      { name: 'Computer Systems and Organisation' }, { name: 'Computational Thinking and Programming' },
      { name: 'Python Fundamentals' }, { name: 'Working with Python' }, { name: 'Functions' },
      { name: 'File Handling' }, { name: 'Exception Handling' }, { name: 'Data Structures' },
      { name: 'Computer Networks' }, { name: 'Database Concepts and SQL' },
      { name: 'Boolean Algebra' }, { name: 'Communication Technologies' },
    ]},
    { name: 'Business Studies', chapters: [
      { name: 'Business, Trade and Commerce' }, { name: 'Forms of Business Organisation' },
      { name: 'Private, Public and Global Enterprises' }, { name: 'Business Services' },
      { name: 'Emerging Modes of Business' }, { name: 'Social Responsibilities of Business and Business Ethics' },
      { name: 'Formation of a Company' }, { name: 'Sources of Business Finance' },
      { name: 'Small Business' }, { name: 'Internal Trade' }, { name: 'International Business' },
    ]},
    { name: 'History', chapters: [
      { name: 'From the Beginning of Time' }, { name: 'Early Cities' },
      { name: 'An Empire Across Three Continents' }, { name: 'The Central Islamic Lands' },
      { name: 'Nomadic Empires' }, { name: 'The Three Orders' },
      { name: 'Changing Cultural Traditions' }, { name: 'Confrontation of Cultures' },
      { name: 'The Industrial Revolution' }, { name: 'Displacing Indigenous Peoples' },
      { name: 'Paths to Modernisation' },
    ]},
    { name: 'Political Science', chapters: [
      { name: 'Political Theory: An Introduction' }, { name: 'Freedom' }, { name: 'Equality' },
      { name: 'Social Justice' }, { name: 'Rights' }, { name: 'Citizenship' },
      { name: 'Nationalism' }, { name: 'Secularism' }, { name: 'Peace' }, { name: 'Development' },
      { name: 'Constitution: Why and How?' }, { name: 'Rights in the Indian Constitution' },
      { name: 'Election and Representation' }, { name: 'Executive' }, { name: 'Legislature' },
      { name: 'Judiciary' }, { name: 'Federalism' }, { name: 'Local Governments' },
    ]},
    { name: 'Geography', chapters: [
      { name: 'Geography as a Discipline' }, { name: 'The Origin and Evolution of the Earth' },
      { name: 'Interior of the Earth' }, { name: 'Distribution of Oceans and Continents' },
      { name: 'Minerals and Rocks' }, { name: 'Geomorphic Processes' },
      { name: 'Landforms and their Evolution' }, { name: 'Composition and Structure of Atmosphere' },
      { name: 'Solar Radiation, Heat Balance and Temperature' },
      { name: 'Atmospheric Circulation and Weather Systems' }, { name: 'Water in the Atmosphere' },
      { name: 'World Climate and Climate Change' }, { name: 'Water (Oceans)' },
      { name: 'Movements of Ocean Water' }, { name: 'Life on the Earth' },
      { name: 'Biodiversity and Conservation' },
    ]},
  ]},

  /* ── Class 12 ── */
  { value: '12', label: 'Class 12', subjects: [
    { name: 'Physics', chapters: [
      { name: 'Electric Charges and Fields' }, { name: 'Electrostatic Potential and Capacitance' },
      { name: 'Current Electricity' }, { name: 'Moving Charges and Magnetism' },
      { name: 'Magnetism and Matter' }, { name: 'Electromagnetic Induction' },
      { name: 'Alternating Current' }, { name: 'Electromagnetic Waves' },
      { name: 'Ray Optics and Optical Instruments' }, { name: 'Wave Optics' },
      { name: 'Dual Nature of Radiation and Matter' }, { name: 'Atoms' },
      { name: 'Nuclei' }, { name: 'Semiconductor Electronics' }, { name: 'Communication Systems' },
    ]},
    { name: 'Chemistry', chapters: [
      { name: 'The Solid State' }, { name: 'Solutions' }, { name: 'Electrochemistry' },
      { name: 'Chemical Kinetics' }, { name: 'Surface Chemistry' },
      { name: 'General Principles and Processes of Isolation of Elements' },
      { name: 'The p-Block Elements' }, { name: 'The d- and f-Block Elements' },
      { name: 'Coordination Compounds' }, { name: 'Haloalkanes and Haloarenes' },
      { name: 'Alcohols, Phenols and Ethers' },
      { name: 'Aldehydes, Ketones and Carboxylic Acids' },
      { name: 'Amines' }, { name: 'Biomolecules' }, { name: 'Polymers' },
      { name: 'Chemistry in Everyday Life' },
    ]},
    { name: 'Mathematics', chapters: [
      { name: 'Relations and Functions' }, { name: 'Inverse Trigonometric Functions' },
      { name: 'Matrices' }, { name: 'Determinants' },
      { name: 'Continuity and Differentiability' }, { name: 'Applications of Derivatives' },
      { name: 'Integrals' }, { name: 'Applications of the Integrals' },
      { name: 'Differential Equations' }, { name: 'Vector Algebra' },
      { name: 'Three-dimensional Geometry' }, { name: 'Linear Programming' },
      { name: 'Probability' },
    ]},
    { name: 'Biology', chapters: [
      { name: 'Reproduction in Organisms' }, { name: 'Sexual Reproduction in Flowering Plants' },
      { name: 'Human Reproduction' }, { name: 'Reproductive Health' },
      { name: 'Principles of Inheritance and Variation' }, { name: 'Molecular Basis of Inheritance' },
      { name: 'Evolution' }, { name: 'Human Health and Disease' },
      { name: 'Strategies for Enhancement in Food Production' },
      { name: 'Microbes in Human Welfare' }, { name: 'Biotechnology: Principles and Processes' },
      { name: 'Biotechnology and its Applications' }, { name: 'Organisms and Populations' },
      { name: 'Ecosystem' }, { name: 'Biodiversity and Conservation' }, { name: 'Environmental Issues' },
    ]},
    { name: 'English', chapters: [
      { name: 'Flamingo — Prose' }, { name: 'Flamingo — Poems' }, { name: 'Vistas (Supplementary)' },
      { name: 'Grammar — Tenses, Voice, Narration, Modals' },
      { name: 'Writing — Article, Speech, Report, Debate, Letter' }, { name: 'Reading Comprehension' },
    ]},
    { name: 'Accountancy', chapters: [
      { name: 'Accounting for Partnership Firms — Fundamentals' },
      { name: 'Change in Profit Sharing Ratio' }, { name: 'Admission of a Partner' },
      { name: 'Retirement and Death of a Partner' }, { name: 'Dissolution of Partnership Firm' },
      { name: 'Accounting for Share Capital' }, { name: 'Issue and Redemption of Debentures' },
      { name: 'Financial Statements of a Company' }, { name: 'Analysis of Financial Statements' },
      { name: 'Accounting Ratios' }, { name: 'Cash Flow Statement' },
    ]},
    { name: 'Economics', chapters: [
      { name: 'Introduction to Macroeconomics' }, { name: 'National Income Accounting' },
      { name: 'Money and Banking' }, { name: 'Income Determination' },
      { name: 'The Government: Budget and the Economy' }, { name: 'Open Economy Macroeconomics' },
      { name: 'Consumer Equilibrium and Demand' }, { name: 'Production and Costs' },
      { name: 'Theory of the Firm under Perfect Competition' }, { name: 'Non-competitive Markets' },
    ]},
    { name: 'Computer Science', chapters: [
      { name: 'Review of Python Fundamentals' }, { name: 'Object-Oriented Programming' },
      { name: 'Inheritance and Polymorphism' }, { name: 'File Handling in Python' },
      { name: 'Data Structures in Python — Stack and Queue' }, { name: 'Computer Networks' },
      { name: 'Database Management' }, { name: 'Structured Query Language (SQL)' },
      { name: 'Boolean Algebra' }, { name: 'Communication and Network Technologies' },
    ]},
    { name: 'Business Studies', chapters: [
      { name: 'Nature and Significance of Management' }, { name: 'Principles of Management' },
      { name: 'Business Environment' }, { name: 'Planning' }, { name: 'Organising' },
      { name: 'Staffing' }, { name: 'Directing' }, { name: 'Controlling' },
      { name: 'Financial Management' }, { name: 'Financial Markets' },
      { name: 'Marketing Management' }, { name: 'Consumer Protection' },
    ]},
    { name: 'History', chapters: [
      { name: 'Bricks, Beads and Bones: The Harappan Civilisation' },
      { name: 'Kings, Farmers and Towns: Early States and Economies' },
      { name: 'Kinship, Caste and Class: Early Societies' },
      { name: 'Thinkers, Beliefs and Buildings: Cultural Developments' },
      { name: 'Through the Eyes of Travellers' }, { name: 'Bhakti-Sufi Traditions' },
      { name: 'An Imperial Capital: Vijayanagara' },
      { name: 'Peasants, Zamindars and the State' }, { name: 'Kings and Chronicles: The Mughal Courts' },
      { name: 'Colonialism and the Countryside' },
      { name: 'Rebels and the Raj: The Revolt of 1857' },
      { name: 'Colonial Cities: Urbanisation, Planning and Architecture' },
      { name: 'Mahatma Gandhi and the Nationalist Movement' },
      { name: 'Understanding Partition' }, { name: 'Framing the Constitution' },
    ]},
    { name: 'Political Science', chapters: [
      { name: 'The Cold War Era' }, { name: 'The End of Bipolarity' },
      { name: 'US Hegemony in World Politics' }, { name: 'Alternative Centres of Power' },
      { name: 'Contemporary South Asia' }, { name: 'International Organisations' },
      { name: 'Security in the Contemporary World' }, { name: 'Environment and Natural Resources' },
      { name: 'Globalisation' }, { name: 'Challenges of Nation Building' },
      { name: 'Era of One-Party Dominance' }, { name: 'Politics of Planned Development' },
      { name: "India's External Relations" }, { name: 'Challenges to the Congress System' },
      { name: 'Democratic Upsurge and Coalition Politics' },
      { name: 'Rise of Popular Movements' }, { name: 'Regional Aspirations' },
    ]},
    { name: 'Geography', chapters: [
      { name: 'Human Geography: Nature and Scope' },
      { name: 'The World Population: Distribution, Density and Growth' },
      { name: 'Population Composition' }, { name: 'Human Development' },
      { name: 'Primary Activities' }, { name: 'Secondary Activities' },
      { name: 'Tertiary and Quaternary Activities' },
      { name: 'Transport and Communication' }, { name: 'International Trade' },
      { name: 'Human Settlements' },
      { name: 'Population: Distribution, Density, Growth and Composition (India)' },
      { name: 'Migration: Types, Causes and Consequences (India)' },
      { name: 'Human Development (India)' }, { name: 'Human Settlements (India)' },
      { name: 'Land Resources and Agriculture (India)' }, { name: 'Water Resources (India)' },
      { name: 'Mineral and Energy Resources (India)' }, { name: 'Manufacturing Industries (India)' },
      { name: 'Planning and Sustainable Development' },
      { name: 'Transport and Communication (India)' }, { name: 'International Trade (India)' },
    ]},
  ]},
];

export function getSubjectsForGrade(gradeValue: string): CbseSubject[] {
  return CBSE_CURRICULUM.find((g) => g.value === gradeValue)?.subjects ?? [];
}

export function getChaptersForSubject(gradeValue: string, subjectName: string): CbseChapter[] {
  return getSubjectsForGrade(gradeValue).find((s) => s.name === subjectName)?.chapters ?? [];
}
