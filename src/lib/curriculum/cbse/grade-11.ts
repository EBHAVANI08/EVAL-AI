/* ─────────────────────────────────────────────────────────────────────────────
   CBSE Grade 11 — 4 Domains: Science | Commerce | Humanities | Vocational
   Each subject has canonical ID: CBSE_11_{DOMAIN}_{CODE}
   Topics included for core Science and Commerce subjects.
───────────────────────────────────────────────────────────────────────────── */
import type { Grade, Domain, Subject, Chapter, Topic, LearningOutcome } from '../../curriculum/types';

function lo(id: string, verb: string, description: string, bloomsLevel: 1|2|3|4|5|6): LearningOutcome {
  return { id, verb, description, bloomsLevel };
}
function t(id: string, name: string, learningOutcomes: LearningOutcome[] = []): Topic {
  return { id, name, learningOutcomes };
}
function ch(id: string, name: string, topics: Topic[] = []): Chapter {
  return { id, name, topics };
}
function sub(id: string, name: string, code: string, chapters: Chapter[]): Subject {
  return { id, name, code, chapters };
}

/* ════════════════════════════════════════════════════════════════════════════
   SCIENCE DOMAIN SUBJECTS
═══════════════════════════════════════════════════════════════════════════ */

const phy11 = sub('CBSE_11_SCI_PHY','Physics','PHY',[
  ch('C11PHY1','Physical World',[t('C11PHY1T1','Scope of Physics'),t('C11PHY1T2','Physics and Technology')]),
  ch('C11PHY2','Units and Measurements',[
    t('C11PHY2T1','SI Units',[lo('LO_C11PHY2T1_1','Identify','Identify fundamental and derived SI units',1)]),
    t('C11PHY2T2','Significant Figures'),t('C11PHY2T3','Dimensional Analysis',[lo('LO_C11PHY2T3_1','Apply','Apply dimensional analysis to verify equations',3)]),
    t('C11PHY2T4','Errors in Measurement'),
  ]),
  ch('C11PHY3','Motion in a Straight Line',[
    t('C11PHY3T1','Distance and Displacement'),t('C11PHY3T2','Speed, Velocity and Acceleration'),
    t('C11PHY3T3','Equations of Motion',[lo('LO_C11PHY3T3_1','Apply','Apply kinematic equations to solve problems',3)]),
    t('C11PHY3T4','Motion Under Gravity'),
  ]),
  ch('C11PHY4','Motion in a Plane',[
    t('C11PHY4T1','Vectors and Scalars'),t('C11PHY4T2','Projectile Motion'),
    t('C11PHY4T3','Circular Motion'),
  ]),
  ch('C11PHY5','Laws of Motion',[
    t('C11PHY5T1',"Newton's First Law — Inertia"),
    t('C11PHY5T2',"Newton's Second Law — F = ma",[lo('LO_C11PHY5T2_1','Apply',"Apply Newton's Second Law to calculate net force",3)]),
    t('C11PHY5T3',"Newton's Third Law"),t('C11PHY5T4','Friction'),t('C11PHY5T5','Circular Motion and Laws'),
  ]),
  ch('C11PHY6','Work, Energy and Power',[
    t('C11PHY6T1','Work Done by a Force'),t('C11PHY6T2','Kinetic and Potential Energy'),
    t('C11PHY6T3','Conservation of Energy'),t('C11PHY6T4','Power and Efficiency'),
  ]),
  ch('C11PHY7','System of Particles and Rotational Motion',[
    t('C11PHY7T1','Centre of Mass'),t('C11PHY7T2','Torque and Angular Momentum'),
    t('C11PHY7T3','Moment of Inertia'),t('C11PHY7T4','Rolling Motion'),
  ]),
  ch('C11PHY8','Gravitation',[
    t('C11PHY8T1','Universal Law of Gravitation'),t('C11PHY8T2','Acceleration Due to Gravity'),
    t('C11PHY8T3','Escape Velocity'),t('C11PHY8T4','Satellites and Orbital Motion'),
  ]),
  ch('C11PHY9','Mechanical Properties of Solids',[
    t('C11PHY9T1','Elastic Behaviour'),t('C11PHY9T2',"Young's, Bulk, Shear Modulus"),
  ]),
  ch('C11PHY10','Mechanical Properties of Fluids',[
    t('C11PHY10T1','Pressure and Pascal\'s Law'),t('C11PHY10T2','Bernoulli\'s Principle'),t('C11PHY10T3','Viscosity'),
  ]),
  ch('C11PHY11','Thermal Properties of Matter',[
    t('C11PHY11T1','Heat and Temperature'),t('C11PHY11T2','Specific Heat'),t('C11PHY11T3','Thermal Expansion'),
  ]),
  ch('C11PHY12','Thermodynamics',[
    t('C11PHY12T1','Laws of Thermodynamics'),t('C11PHY12T2','Heat Engines'),t('C11PHY12T3','Entropy'),
  ]),
  ch('C11PHY13','Kinetic Theory',[
    t('C11PHY13T1','Kinetic Theory of Gases'),t('C11PHY13T2','RMS Speed'),t('C11PHY13T3','Degrees of Freedom'),
  ]),
  ch('C11PHY14','Oscillations',[
    t('C11PHY14T1','Simple Harmonic Motion'),t('C11PHY14T2','Energy in SHM'),t('C11PHY14T3','Pendulum'),
  ]),
  ch('C11PHY15','Waves',[
    t('C11PHY15T1','Wave Characteristics'),t('C11PHY15T2','Speed of Sound'),
    t('C11PHY15T3','Superposition and Interference'),t('C11PHY15T4','Doppler Effect'),
  ]),
]);

const chem11 = sub('CBSE_11_SCI_CHE','Chemistry','CHE',[
  ch('C11CHE1','Some Basic Concepts of Chemistry',[
    t('C11CHE1T1','Laws of Chemical Combination'),t('C11CHE1T2','Mole Concept and Molar Mass'),
    t('C11CHE1T3','Stoichiometry'),
  ]),
  ch('C11CHE2','Structure of Atom',[
    t('C11CHE2T1','Subatomic Particles'),t('C11CHE2T2','Bohr Model'),
    t('C11CHE2T3','Quantum Numbers'),t('C11CHE2T4','Electronic Configuration'),
  ]),
  ch('C11CHE3','Classification of Elements and Periodicity in Properties',[
    t('C11CHE3T1','Mendeleev\'s Periodic Law'),t('C11CHE3T2','Modern Periodic Table'),
    t('C11CHE3T3','Periodic Trends — Atomic Radius, IE, EN'),
  ]),
  ch('C11CHE4','Chemical Bonding and Molecular Structure',[
    t('C11CHE4T1','Ionic and Covalent Bonds'),t('C11CHE4T2','VSEPR Theory'),
    t('C11CHE4T3','Hybridisation'),t('C11CHE4T4','Hydrogen Bonding'),
  ]),
  ch('C11CHE5','States of Matter: Gases and Liquids',[
    t('C11CHE5T1','Gas Laws'),t('C11CHE5T2','Ideal Gas Equation'),t('C11CHE5T3','Kinetic Theory of Gases'),
  ]),
  ch('C11CHE6','Thermodynamics',[
    t('C11CHE6T1','Enthalpy and Heat Capacity'),t('C11CHE6T2','Hess\'s Law'),
    t('C11CHE6T3','Entropy and Gibbs Free Energy'),
  ]),
  ch('C11CHE7','Equilibrium',[
    t('C11CHE7T1','Law of Chemical Equilibrium'),t('C11CHE7T2','Le Chatelier\'s Principle'),
    t('C11CHE7T3','Ionic Equilibrium and pH'),
  ]),
  ch('C11CHE8','Redox Reactions',[t('C11CHE8T1','Oxidation and Reduction'),t('C11CHE8T2','Balancing Redox Equations')]),
  ch('C11CHE9','Hydrogen'),ch('C11CHE10','The s-Block Elements'),ch('C11CHE11','The p-Block Elements'),
  ch('C11CHE12','Organic Chemistry: Some Basic Principles and Techniques',[
    t('C11CHE12T1','IUPAC Nomenclature'),t('C11CHE12T2','Isomerism'),t('C11CHE12T3','Reaction Mechanisms'),
  ]),
  ch('C11CHE13','Hydrocarbons',[
    t('C11CHE13T1','Alkanes'),t('C11CHE13T2','Alkenes and Alkynes'),t('C11CHE13T3','Aromatic Compounds'),
  ]),
  ch('C11CHE14','Environmental Chemistry'),
]);

const math11 = sub('CBSE_11_SCI_MAT','Mathematics','MAT',[
  ch('C11MAT1','Sets',[t('C11MAT1T1','Types of Sets'),t('C11MAT1T2','Set Operations'),t('C11MAT1T3','Venn Diagrams')]),
  ch('C11MAT2','Relations and Functions',[t('C11MAT2T1','Domain and Range'),t('C11MAT2T2','Types of Functions')]),
  ch('C11MAT3','Trigonometric Functions',[
    t('C11MAT3T1','Trigonometric Ratios'),t('C11MAT3T2','Trigonometric Identities'),
    t('C11MAT3T3','Graphs of Trig Functions'),t('C11MAT3T4','Inverse Trig Functions'),
  ]),
  ch('C11MAT4','Principle of Mathematical Induction'),
  ch('C11MAT5','Complex Numbers and Quadratic Equations',[
    t('C11MAT5T1','Algebra of Complex Numbers'),t('C11MAT5T2','Modulus and Argument'),
    t('C11MAT5T3','Quadratic Equations with Complex Roots'),
  ]),
  ch('C11MAT6','Linear Inequalities'),
  ch('C11MAT7','Permutations and Combinations',[t('C11MAT7T1','Permutations'),t('C11MAT7T2','Combinations')]),
  ch('C11MAT8','Binomial Theorem',[t('C11MAT8T1','Binomial Expansion'),t('C11MAT8T2','General Term')]),
  ch('C11MAT9','Sequences and Series',[t('C11MAT9T1','AP'),t('C11MAT9T2','GP'),t('C11MAT9T3','Special Series')]),
  ch('C11MAT10','Straight Lines',[t('C11MAT10T1','Slope and Intercepts'),t('C11MAT10T2','Equations of a Line')]),
  ch('C11MAT11','Conic Sections',[t('C11MAT11T1','Circle'),t('C11MAT11T2','Parabola'),t('C11MAT11T3','Ellipse'),t('C11MAT11T4','Hyperbola')]),
  ch('C11MAT12','Introduction to Three-dimensional Geometry'),
  ch('C11MAT13','Limits and Derivatives',[t('C11MAT13T1','Concept of Limit'),t('C11MAT13T2','Differentiation by First Principles')]),
  ch('C11MAT14','Mathematical Reasoning'),
  ch('C11MAT15','Statistics',[t('C11MAT15T1','Measures of Dispersion'),t('C11MAT15T2','Variance and SD')]),
  ch('C11MAT16','Probability',[t('C11MAT16T1','Classical Probability'),t('C11MAT16T2','Conditional Probability')]),
]);

const bio11 = sub('CBSE_11_SCI_BIO','Biology','BIO',[
  ch('C11BIO1','The Living World'),ch('C11BIO2','Biological Classification'),ch('C11BIO3','Plant Kingdom'),
  ch('C11BIO4','Animal Kingdom'),ch('C11BIO5','Morphology of Flowering Plants'),
  ch('C11BIO6','Anatomy of Flowering Plants'),ch('C11BIO7','Structural Organisation in Animals'),
  ch('C11BIO8','Cell: The Unit of Life',[t('C11BIO8T1','Cell Structure'),t('C11BIO8T2','Cell Organelles')]),
  ch('C11BIO9','Biomolecules',[t('C11BIO9T1','Carbohydrates'),t('C11BIO9T2','Proteins'),t('C11BIO9T3','Enzymes')]),
  ch('C11BIO10','Cell Cycle and Cell Division',[t('C11BIO10T1','Mitosis'),t('C11BIO10T2','Meiosis')]),
  ch('C11BIO11','Transport in Plants'),ch('C11BIO12','Mineral Nutrition'),
  ch('C11BIO13','Photosynthesis in Higher Plants',[
    t('C11BIO13T1','Light Reactions'),t('C11BIO13T2','Calvin Cycle'),t('C11BIO13T3','C3 and C4 Plants'),
  ]),
  ch('C11BIO14','Respiration in Plants',[t('C11BIO14T1','Glycolysis'),t('C11BIO14T2','Krebs Cycle'),t('C11BIO14T3','ETC')]),
  ch('C11BIO15','Plant Growth and Development'),
  ch('C11BIO16','Digestion and Absorption'),ch('C11BIO17','Breathing and Exchange of Gases'),
  ch('C11BIO18','Body Fluids and Circulation'),ch('C11BIO19','Excretory Products and their Elimination'),
  ch('C11BIO20','Locomotion and Movement'),ch('C11BIO21','Neural Control and Coordination'),
  ch('C11BIO22','Chemical Coordination and Integration'),
]);

const cs11 = sub('CBSE_11_SCI_CS','Computer Science','CS',[
  ch('C11CS1','Computer Systems and Organisation'),ch('C11CS2','Computational Thinking and Programming'),
  ch('C11CS3','Python Fundamentals',[t('C11CS3T1','Variables and Data Types'),t('C11CS3T2','Input/Output'),t('C11CS3T3','Operators')]),
  ch('C11CS4','Working with Python',[t('C11CS4T1','Control Structures'),t('C11CS4T2','Loops')]),
  ch('C11CS5','Functions',[t('C11CS5T1','User Defined Functions'),t('C11CS5T2','Recursion')]),
  ch('C11CS6','File Handling'),ch('C11CS7','Exception Handling'),
  ch('C11CS8','Data Structures',[t('C11CS8T1','Lists and Tuples'),t('C11CS8T2','Dictionaries and Sets')]),
  ch('C11CS9','Computer Networks'),ch('C11CS10','Database Concepts and SQL'),
  ch('C11CS11','Boolean Algebra'),ch('C11CS12','Communication Technologies'),
]);

const ip11 = sub('CBSE_11_SCI_IP','Informatics Practices','IP',[
  ch('C11IP1','Computer Systems'),ch('C11IP2','Introduction to Python'),
  ch('C11IP3','Data Handling using Python'),ch('C11IP4','Data Visualisation'),
  ch('C11IP5','Introduction to SQL'),ch('C11IP6','Web Development Basics'),
]);

const eng11sci = sub('CBSE_11_SCI_ENG','English Core','ENG',[
  ch('C11ENGS1','Hornbill — Prose'),ch('C11ENGS2','Hornbill — Poems'),ch('C11ENGS3','Snapshots (Supplementary)'),
  ch('C11ENGS4','Grammar — Tenses, Voice, Reported Speech, Modals'),
  ch('C11ENGS5','Writing — Article, Speech, Report, Debate'),ch('C11ENGS6','Reading Comprehension'),
]);

const pe11 = sub('CBSE_11_SCI_PE','Physical Education','PE',[
  ch('C11PE1','Changing Trends and Career in Physical Education'),ch('C11PE2','Olympic Movement'),
  ch('C11PE3','Physical Fitness, Wellness and Lifestyle'),ch('C11PE4','Physical Education and Sports for CWSN'),
  ch('C11PE5','Yoga'),ch('C11PE6','Test and Measurement in Sports'),
]);

const amath11 = sub('CBSE_11_SCI_AMAT','Applied Mathematics','AMAT',[
  ch('C11AMAT1','Numbers, Quantification and Numerical Applications'),
  ch('C11AMAT2','Algebra'),ch('C11AMAT3','Mathematical Reasoning'),
  ch('C11AMAT4','Calculus'),ch('C11AMAT5','Probability'),
  ch('C11AMAT6','Descriptive Statistics'),ch('C11AMAT7','Financial Mathematics'),
  ch('C11AMAT8','Linear Programming'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   COMMERCE DOMAIN SUBJECTS
═══════════════════════════════════════════════════════════════════════════ */

const acc11 = sub('CBSE_11_COM_ACC','Accountancy','ACC',[
  ch('C11ACC1','Introduction to Accounting',[
    t('C11ACC1T1','Meaning and Objectives'),t('C11ACC1T2','Accounting Concepts and Principles'),
  ]),
  ch('C11ACC2','Theory Base of Accounting',[
    t('C11ACC2T1','Accounting Standards'),t('C11ACC2T2','GAAP'),
  ]),
  ch('C11ACC3','Recording of Transactions – I',[
    t('C11ACC3T1','Journal Entries'),t('C11ACC3T2','Ledger Posting'),
  ]),
  ch('C11ACC4','Recording of Transactions – II',[
    t('C11ACC4T1','Cash Book'),t('C11ACC4T2','Subsidiary Books'),
  ]),
  ch('C11ACC5','Bank Reconciliation Statement'),
  ch('C11ACC6','Trial Balance and Rectification of Errors'),
  ch('C11ACC7','Depreciation, Provisions and Reserves',[
    t('C11ACC7T1','Methods of Depreciation'),t('C11ACC7T2','Provisions vs Reserves'),
  ]),
  ch('C11ACC8','Bill of Exchange'),
  ch('C11ACC9','Financial Statements – I',[
    t('C11ACC9T1','Trading Account'),t('C11ACC9T2','Profit and Loss Account'),
  ]),
  ch('C11ACC10','Financial Statements – II',[
    t('C11ACC10T1','Balance Sheet'),t('C11ACC10T2','Adjustments'),
  ]),
  ch('C11ACC11','Accounts from Incomplete Records'),
  ch('C11ACC12','Applications of Computers in Accounting'),
]);

const bs11 = sub('CBSE_11_COM_BS','Business Studies','BS',[
  ch('C11BS1','Business, Trade and Commerce'),ch('C11BS2','Forms of Business Organisation',[
    t('C11BS2T1','Sole Proprietorship'),t('C11BS2T2','Partnership'),t('C11BS2T3','Company'),
  ]),
  ch('C11BS3','Private, Public and Global Enterprises'),ch('C11BS4','Business Services'),
  ch('C11BS5','Emerging Modes of Business'),
  ch('C11BS6','Social Responsibilities of Business and Business Ethics'),
  ch('C11BS7','Formation of a Company'),ch('C11BS8','Sources of Business Finance'),
  ch('C11BS9','Small Business'),ch('C11BS10','Internal Trade'),ch('C11BS11','International Business'),
]);

const eco11 = sub('CBSE_11_COM_ECO','Economics','ECO',[
  ch('C11ECO1','Introduction to Economics and Economy',[
    t('C11ECO1T1','Microeconomics vs Macroeconomics'),t('C11ECO1T2','Central Problems of Economy'),
  ]),
  ch('C11ECO2',"Consumer's Equilibrium and Demand",[
    t('C11ECO2T1','Law of Demand'),t('C11ECO2T2','Utility Analysis'),t('C11ECO2T3','Indifference Curve'),
  ]),
  ch('C11ECO3','Producer Behaviour and Supply',[
    t('C11ECO3T1','Production Function'),t('C11ECO3T2','Cost Curves'),t('C11ECO3T3','Law of Supply'),
  ]),
  ch('C11ECO4','Forms of Market and Price Determination',[
    t('C11ECO4T1','Perfect Competition'),t('C11ECO4T2','Monopoly'),t('C11ECO4T3','Price Determination'),
  ]),
  ch('C11ECO5','Indian Economy on the Eve of Independence'),ch('C11ECO6','Indian Economy 1950–1990'),
  ch('C11ECO7','Economic Reforms Since 1991'),ch('C11ECO8','Poverty'),
  ch('C11ECO9','Human Capital Formation in India'),ch('C11ECO10','Rural Development'),
  ch('C11ECO11','Employment: Growth, Informalisation and Other Issues'),
  ch('C11ECO12','Infrastructure'),ch('C11ECO13','Environment and Sustainable Development'),
]);

const matCom11 = sub('CBSE_11_COM_MAT','Mathematics','MAT', math11.chapters);
const amatCom11 = sub('CBSE_11_COM_AMAT','Applied Mathematics','AMAT', amath11.chapters);
const eng11com = sub('CBSE_11_COM_ENG','English Core','ENG', eng11sci.chapters);

const ent11 = sub('CBSE_11_COM_ENT','Entrepreneurship','ENT',[
  ch('C11ENT1','Entrepreneurship: What, Why and How'),ch('C11ENT2','An Entrepreneur'),
  ch('C11ENT3','Entrepreneurial Journey'),ch('C11ENT4','Entrepreneurship as Innovation'),
  ch('C11ENT5','Business Arithmetic'),ch('C11ENT6','Resource Mobilisation'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   HUMANITIES DOMAIN SUBJECTS
═══════════════════════════════════════════════════════════════════════════ */

const hist11 = sub('CBSE_11_HUM_HIS','History','HIS',[
  ch('C11HIS1','From the Beginning of Time'),ch('C11HIS2','Early Cities'),
  ch('C11HIS3','An Empire Across Three Continents'),ch('C11HIS4','The Central Islamic Lands'),
  ch('C11HIS5','Nomadic Empires'),ch('C11HIS6','The Three Orders'),
  ch('C11HIS7','Changing Cultural Traditions'),ch('C11HIS8','Confrontation of Cultures'),
  ch('C11HIS9','The Industrial Revolution'),ch('C11HIS10','Displacing Indigenous Peoples'),
  ch('C11HIS11','Paths to Modernisation'),
]);

const polsci11 = sub('CBSE_11_HUM_POL','Political Science','POL',[
  ch('C11POL1','Political Theory: An Introduction'),ch('C11POL2','Freedom'),ch('C11POL3','Equality'),
  ch('C11POL4','Social Justice'),ch('C11POL5','Rights'),ch('C11POL6','Citizenship'),
  ch('C11POL7','Nationalism'),ch('C11POL8','Secularism'),ch('C11POL9','Peace'),ch('C11POL10','Development'),
  ch('C11POL11','Constitution: Why and How?'),ch('C11POL12','Rights in the Indian Constitution'),
  ch('C11POL13','Election and Representation'),ch('C11POL14','Executive'),ch('C11POL15','Legislature'),
  ch('C11POL16','Judiciary'),ch('C11POL17','Federalism'),ch('C11POL18','Local Governments'),
]);

const geo11 = sub('CBSE_11_HUM_GEO','Geography','GEO',[
  ch('C11GEO1','Geography as a Discipline'),ch('C11GEO2','The Origin and Evolution of the Earth'),
  ch('C11GEO3','Interior of the Earth'),ch('C11GEO4','Distribution of Oceans and Continents'),
  ch('C11GEO5','Minerals and Rocks'),ch('C11GEO6','Geomorphic Processes'),
  ch('C11GEO7','Landforms and their Evolution'),ch('C11GEO8','Composition and Structure of Atmosphere'),
  ch('C11GEO9','Solar Radiation, Heat Balance and Temperature'),
  ch('C11GEO10','Atmospheric Circulation and Weather Systems'),ch('C11GEO11','Water in the Atmosphere'),
  ch('C11GEO12','World Climate and Climate Change'),ch('C11GEO13','Water (Oceans)'),
  ch('C11GEO14','Movements of Ocean Water'),ch('C11GEO15','Life on the Earth'),
  ch('C11GEO16','Biodiversity and Conservation'),
]);

const soc11 = sub('CBSE_11_HUM_SOC','Sociology','SOC',[
  ch('C11SOC1','Sociology and Society'),ch('C11SOC2','Terms, Concepts and their Use in Sociology'),
  ch('C11SOC3','Understanding Social Institutions'),ch('C11SOC4','Culture and Socialisation'),
  ch('C11SOC5','Doing Sociology: Research Methods'),
  ch('C11SOC6','Social Structure, Stratification and Social Processes'),
  ch('C11SOC7','Social Change and Social Order in Rural and Urban Society'),
  ch('C11SOC8','Environment and Society'),ch('C11SOC9','Introducing Western Sociologists'),
  ch('C11SOC10','Indian Sociologists'),
]);

const psy11 = sub('CBSE_11_HUM_PSY','Psychology','PSY',[
  ch('C11PSY1','What is Psychology?'),ch('C11PSY2','Methods of Enquiry in Psychology'),
  ch('C11PSY3','The Bases of Human Behaviour'),ch('C11PSY4','Human Development'),
  ch('C11PSY5','Sensory, Attentional and Perceptual Processes'),
  ch('C11PSY6','Learning'),ch('C11PSY7','Human Memory'),ch('C11PSY8','Thinking'),
  ch('C11PSY9','Motivation and Emotion'),
]);

const ecoHum11 = sub('CBSE_11_HUM_ECO','Economics','ECO', eco11.chapters);
const eng11hum = sub('CBSE_11_HUM_ENG','English Core','ENG', eng11sci.chapters);

const fineart11 = sub('CBSE_11_HUM_FAR','Fine Arts','FAR',[
  ch('C11FAR1','Prehistoric Art'),ch('C11FAR2','Art of the Indus Valley Civilisation'),
  ch('C11FAR3','Buddhist, Jain and Hindu Art'),ch('C11FAR4','Indo-Islamic Architecture'),
  ch('C11FAR5','Indian Painting Traditions'),ch('C11FAR6','Modern Indian Art'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   VOCATIONAL DOMAIN (Architecture-ready, subjects coming soon)
═══════════════════════════════════════════════════════════════════════════ */
const voc11Subjects: Subject[] = [
  sub('CBSE_11_VOC_IT','Information Technology','IT',[ch('C11IT1','Coming Soon — IT Vocational')]),
  sub('CBSE_11_VOC_TOU','Tourism','TOU',[ch('C11TOU1','Coming Soon — Tourism Vocational')]),
  sub('CBSE_11_VOC_HC','Health Care','HC',[ch('C11HC1','Coming Soon — Health Care Vocational')]),
];

/* ════════════════════════════════════════════════════════════════════════════
   GRADE 11 ASSEMBLY
═══════════════════════════════════════════════════════════════════════════ */
export const CBSE_GRADE_11: Grade = {
  value: '11',
  label: 'Class 11',
  hasDomains: true,
  domains: [
    {
      id: 'sci', label: 'Science', icon: '🔬',
      description: 'Physics, Chemistry, Mathematics, Biology, Computer Science',
      color: '#6366f1', status: 'active',
      subjects: [phy11, chem11, math11, bio11, cs11, ip11, amath11, eng11sci, pe11],
    },
    {
      id: 'com', label: 'Commerce', icon: '💼',
      description: 'Accountancy, Business Studies, Economics, Mathematics',
      color: '#10b981', status: 'active',
      subjects: [acc11, bs11, eco11, matCom11, amatCom11, ent11, eng11com],
    },
    {
      id: 'hum', label: 'Humanities', icon: '🎨',
      description: 'History, Political Science, Geography, Sociology, Psychology',
      color: '#f59e0b', status: 'active',
      subjects: [hist11, polsci11, geo11, soc11, psy11, ecoHum11, eng11hum, fineart11, pe11],
    },
    {
      id: 'voc', label: 'Vocational', icon: '🔧',
      description: 'IT, Tourism, Health Care, Retail, Automobile',
      color: '#8b5cf6', status: 'coming_soon',
      subjects: voc11Subjects,
    },
  ],
};
