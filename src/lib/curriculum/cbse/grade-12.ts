/* ─────────────────────────────────────────────────────────────────────────────
   CBSE Grade 12 — 4 Domains: Science | Commerce | Humanities | Vocational
   Each subject has canonical ID: CBSE_12_{DOMAIN}_{CODE}
   Full topics included for all major subjects.
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
   SCIENCE DOMAIN — GRADE 12
═══════════════════════════════════════════════════════════════════════════ */

const phy12 = sub('CBSE_12_SCI_PHY','Physics','PHY',[
  ch('C12PHY1','Electric Charges and Fields',[
    t('C12PHY1T1','Coulomb\'s Law',[lo('LO1_PHY1T1','Apply','Apply Coulomb\'s Law to calculate electric force',3)]),
    t('C12PHY1T2','Electric Field and Field Lines'),
    t('C12PHY1T3','Electric Flux and Gauss\'s Law',[lo('LO1_PHY1T3','Apply',"Apply Gauss's Law to find electric field",3)]),
    t('C12PHY1T4','Electric Dipole'),
  ]),
  ch('C12PHY2','Electrostatic Potential and Capacitance',[
    t('C12PHY2T1','Electric Potential and Potential Difference'),
    t('C12PHY2T2','Capacitors and Capacitance'),
    t('C12PHY2T3','Parallel Plate Capacitor'),
    t('C12PHY2T4','Energy Stored in Capacitor'),
    t('C12PHY2T5','Dielectrics'),
  ]),
  ch('C12PHY3','Current Electricity',[
    t('C12PHY3T1','Ohm\'s Law and Resistance',[
      lo('LO3_PHY3T1_1','Apply',"Apply Ohm's Law to calculate current, voltage, resistance",3),
      lo('LO3_PHY3T1_2','Analyze','Analyze V-I characteristics of ohmic and non-ohmic devices',4),
    ]),
    t('C12PHY3T2','Resistivity and Conductivity'),
    t('C12PHY3T3','Combination of Resistors — Series and Parallel',[
      lo('LO3_PHY3T3_1','Calculate','Calculate equivalent resistance in series/parallel circuits',3),
    ]),
    t('C12PHY3T4','Kirchhoff\'s Laws',[
      lo('LO3_PHY3T4_1','Apply',"Apply Kirchhoff's Voltage and Current Laws",3),
    ]),
    t('C12PHY3T5','Wheatstone Bridge and Metre Bridge'),
    t('C12PHY3T6','Potentiometer'),
    t('C12PHY3T7','Electric Power and Energy'),
  ]),
  ch('C12PHY4','Moving Charges and Magnetism',[
    t('C12PHY4T1','Magnetic Force on a Charge'),t('C12PHY4T2','Biot-Savart Law'),
    t('C12PHY4T3','Ampere\'s Circuital Law'),t('C12PHY4T4','Moving Coil Galvanometer'),
  ]),
  ch('C12PHY5','Magnetism and Matter',[
    t('C12PHY5T1','Bar Magnet and Magnetic Field Lines'),t('C12PHY5T2','Earth\'s Magnetism'),
    t('C12PHY5T3','Diamagnetic, Paramagnetic, Ferromagnetic Materials'),
  ]),
  ch('C12PHY6','Electromagnetic Induction',[
    t('C12PHY6T1','Faraday\'s Laws',[lo('LO6_PHY6T1','Apply','Apply Faraday\'s Laws to find induced EMF',3)]),
    t('C12PHY6T2','Lenz\'s Law'),t('C12PHY6T3','Self and Mutual Inductance'),t('C12PHY6T4','AC Generator'),
  ]),
  ch('C12PHY7','Alternating Current',[
    t('C12PHY7T1','AC Voltage and Current'),t('C12PHY7T2','Phasors'),
    t('C12PHY7T3','LCR Circuit and Resonance'),t('C12PHY7T4','Transformers'),
  ]),
  ch('C12PHY8','Electromagnetic Waves',[
    t('C12PHY8T1','Maxwell\'s Equations'),t('C12PHY8T2','EM Spectrum'),
  ]),
  ch('C12PHY9','Ray Optics and Optical Instruments',[
    t('C12PHY9T1','Reflection — Spherical Mirrors',[lo('LO9_PHY9T1','Apply','Apply mirror formula to locate images',3)]),
    t('C12PHY9T2','Refraction and Snell\'s Law'),
    t('C12PHY9T3','Lens Formula and Power',[lo('LO9_PHY9T3','Calculate','Calculate image position using lens formula',3)]),
    t('C12PHY9T4','Total Internal Reflection'),t('C12PHY9T5','Optical Instruments'),
  ]),
  ch('C12PHY10','Wave Optics',[
    t('C12PHY10T1','Huygens\' Principle'),t('C12PHY10T2','Young\'s Double Slit Experiment'),
    t('C12PHY10T3','Diffraction'),t('C12PHY10T4','Polarisation'),
  ]),
  ch('C12PHY11','Dual Nature of Radiation and Matter',[
    t('C12PHY11T1','Photoelectric Effect'),t('C12PHY11T2','Einstein\'s Photoelectric Equation'),
    t('C12PHY11T3','de Broglie Wavelength'),
  ]),
  ch('C12PHY12','Atoms',[t('C12PHY12T1','Rutherford Model'),t('C12PHY12T2','Bohr Model'),t('C12PHY12T3','Spectral Lines')]),
  ch('C12PHY13','Nuclei',[t('C12PHY13T1','Nuclear Binding Energy'),t('C12PHY13T2','Radioactivity'),t('C12PHY13T3','Nuclear Fission and Fusion')]),
  ch('C12PHY14','Semiconductor Electronics',[
    t('C12PHY14T1','Energy Bands'),t('C12PHY14T2','p-n Junction Diode'),
    t('C12PHY14T3','Transistors and Logic Gates'),
  ]),
  ch('C12PHY15','Communication Systems',[
    t('C12PHY15T1','Modulation'),t('C12PHY15T2','AM and FM'),t('C12PHY15T3','Internet and Satellite Communication'),
  ]),
]);

const chem12 = sub('CBSE_12_SCI_CHE','Chemistry','CHE',[
  ch('C12CHE1','The Solid State',[
    t('C12CHE1T1','Types of Solids'),t('C12CHE1T2','Crystal Lattice and Unit Cells'),
    t('C12CHE1T3','Defects in Crystals'),
  ]),
  ch('C12CHE2','Solutions',[
    t('C12CHE2T1','Types of Solutions'),t('C12CHE2T2','Raoult\'s Law'),
    t('C12CHE2T3','Colligative Properties'),t('C12CHE2T4','Van\'t Hoff Factor'),
  ]),
  ch('C12CHE3','Electrochemistry',[
    t('C12CHE3T1','Electrochemical Cells'),t('C12CHE3T2','Nernst Equation'),
    t('C12CHE3T3','Faraday\'s Laws of Electrolysis'),t('C12CHE3T4','Corrosion'),
  ]),
  ch('C12CHE4','Chemical Kinetics',[
    t('C12CHE4T1','Rate of Reaction'),t('C12CHE4T2','Rate Law and Order'),
    t('C12CHE4T3','Integrated Rate Equations'),t('C12CHE4T4','Activation Energy and Arrhenius Equation'),
  ]),
  ch('C12CHE5','Surface Chemistry',[
    t('C12CHE5T1','Adsorption'),t('C12CHE5T2','Catalysis'),t('C12CHE5T3','Colloids'),
  ]),
  ch('C12CHE6','General Principles and Processes of Isolation of Elements'),
  ch('C12CHE7','The p-Block Elements',[t('C12CHE7T1','Group 15 Elements'),t('C12CHE7T2','Group 16 Elements'),t('C12CHE7T3','Group 17 and 18 Elements')]),
  ch('C12CHE8','The d- and f-Block Elements',[t('C12CHE8T1','Transition Metals'),t('C12CHE8T2','Lanthanides and Actinides')]),
  ch('C12CHE9','Coordination Compounds',[t('C12CHE9T1','IUPAC Nomenclature'),t('C12CHE9T2','Bonding in Coordination Compounds')]),
  ch('C12CHE10','Haloalkanes and Haloarenes',[t('C12CHE10T1','Classification'),t('C12CHE10T2','Nucleophilic Substitution')]),
  ch('C12CHE11','Alcohols, Phenols and Ethers',[t('C12CHE11T1','Preparation'),t('C12CHE11T2','Chemical Properties')]),
  ch('C12CHE12','Aldehydes, Ketones and Carboxylic Acids',[t('C12CHE12T1','Nucleophilic Addition'),t('C12CHE12T2','Acidity of Carboxylic Acids')]),
  ch('C12CHE13','Amines',[t('C12CHE13T1','Classification'),t('C12CHE13T2','Basicity')]),
  ch('C12CHE14','Biomolecules',[t('C12CHE14T1','Carbohydrates'),t('C12CHE14T2','Proteins'),t('C12CHE14T3','Nucleic Acids')]),
  ch('C12CHE15','Polymers'),ch('C12CHE16','Chemistry in Everyday Life'),
]);

const math12 = sub('CBSE_12_SCI_MAT','Mathematics','MAT',[
  ch('C12MAT1','Relations and Functions',[
    t('C12MAT1T1','Types of Relations'),t('C12MAT1T2','Types of Functions'),t('C12MAT1T3','Composition of Functions'),
  ]),
  ch('C12MAT2','Inverse Trigonometric Functions',[
    t('C12MAT2T1','Principal Value Branch'),t('C12MAT2T2','Properties of Inverse Trig'),
  ]),
  ch('C12MAT3','Matrices',[
    t('C12MAT3T1','Operations on Matrices'),t('C12MAT3T2','Transpose'),t('C12MAT3T3','Symmetric Matrices'),
  ]),
  ch('C12MAT4','Determinants',[
    t('C12MAT4T1','Properties of Determinants'),t('C12MAT4T2','Cofactors and Adjoint'),
    t('C12MAT4T3','Inverse of a Matrix'),t('C12MAT4T4','Cramer\'s Rule'),
  ]),
  ch('C12MAT5','Continuity and Differentiability',[
    t('C12MAT5T1','Continuity of Functions'),t('C12MAT5T2','Differentiability'),
    t('C12MAT5T3','Chain Rule'),t('C12MAT5T4','Implicit Differentiation'),t('C12MAT5T5','Logarithmic Differentiation'),
  ]),
  ch('C12MAT6','Applications of Derivatives',[
    t('C12MAT6T1','Rate of Change'),t('C12MAT6T2','Increasing and Decreasing Functions'),
    t('C12MAT6T3','Tangents and Normals'),t('C12MAT6T4','Maxima and Minima'),
  ]),
  ch('C12MAT7','Integrals',[
    t('C12MAT7T1','Integration by Substitution'),t('C12MAT7T2','Integration by Parts'),
    t('C12MAT7T3','Partial Fractions'),t('C12MAT7T4','Definite Integrals'),
  ]),
  ch('C12MAT8','Applications of the Integrals',[t('C12MAT8T1','Area Under Curves'),t('C12MAT8T2','Area Between Curves')]),
  ch('C12MAT9','Differential Equations',[
    t('C12MAT9T1','Order and Degree'),t('C12MAT9T2','Variable Separable'),t('C12MAT9T3','Linear Differential Equations'),
  ]),
  ch('C12MAT10','Vector Algebra',[
    t('C12MAT10T1','Types of Vectors'),t('C12MAT10T2','Dot Product'),t('C12MAT10T3','Cross Product'),
  ]),
  ch('C12MAT11','Three-dimensional Geometry',[
    t('C12MAT11T1','Direction Cosines'),t('C12MAT11T2','Equation of a Line'),t('C12MAT11T3','Equation of a Plane'),
  ]),
  ch('C12MAT12','Linear Programming',[t('C12MAT12T1','Formulation of LPP'),t('C12MAT12T2','Graphical Method')]),
  ch('C12MAT13','Probability',[
    t('C12MAT13T1','Conditional Probability'),t('C12MAT13T2','Bayes\' Theorem'),
    t('C12MAT13T3','Random Variables'),t('C12MAT13T4','Binomial Distribution'),
  ]),
]);

const bio12 = sub('CBSE_12_SCI_BIO','Biology','BIO',[
  ch('C12BIO1','Reproduction in Organisms'),
  ch('C12BIO2','Sexual Reproduction in Flowering Plants',[
    t('C12BIO2T1','Flower Structure and Pre-fertilisation Events',[
      lo('LO_BIO2_1','Identify','Identify the parts of a typical angiosperm flower',1),
      lo('LO_BIO2_2','Describe','Describe microsporogenesis and development of male gametophyte',2),
      lo('LO_BIO2_3','Describe','Describe megasporogenesis and development of female gametophyte',2),
    ]),
    t('C12BIO2T2','Pollination and Outbreeding Devices',[
      lo('LO_BIO2_4','Differentiate','Differentiate between autogamy, geitonogamy, and xenogamy',4),
      lo('LO_BIO2_5','Analyze','Analyze the significance of outbreeding devices and self-incompatibility',4),
      lo('LO_BIO2_6','Explain','Explain the steps involved in artificial hybridisation (emasculation and bagging)',3),
    ]),
    t('C12BIO2T3','Double Fertilisation and Post-fertilisation Events',[
      lo('LO_BIO2_7','Explain','Explain the process of double fertilisation and triple fusion',2),
      lo('LO_BIO2_8','Describe','Describe the development of endosperm and embryo',2),
      lo('LO_BIO2_9','Differentiate','Differentiate between albuminous and non-albuminous seeds',4),
    ]),
    t('C12BIO2T4','Apomixis and Polyembryony',[
      lo('LO_BIO2_10','Define','Define apomixis and its importance in agriculture',1),
      lo('LO_BIO2_11','Define','Define polyembryony with examples',1),
    ]),
  ]),
  ch('C12BIO3','Human Reproduction',[
    t('C12BIO3T1','Male Reproductive System'),t('C12BIO3T2','Female Reproductive System'),
    t('C12BIO3T3','Fertilisation and Embryo Development'),
  ]),
  ch('C12BIO4','Reproductive Health'),
  ch('C12BIO5','Principles of Inheritance and Variation',[
    t('C12BIO5T1','Mendel\'s Laws'),t('C12BIO5T2','Chromosomal Theory'),t('C12BIO5T3','Linkage and Crossing Over'),
  ]),
  ch('C12BIO6','Molecular Basis of Inheritance',[
    t('C12BIO6T1','DNA Structure'),t('C12BIO6T2','Replication'),t('C12BIO6T3','Transcription'),
    t('C12BIO6T4','Translation'),t('C12BIO6T5','Regulation of Gene Expression'),
  ]),
  ch('C12BIO7','Evolution',[t('C12BIO7T1','Theories of Evolution'),t('C12BIO7T2','Evidences of Evolution')]),
  ch('C12BIO8','Human Health and Disease',[t('C12BIO8T1','Immunity'),t('C12BIO8T2','Common Diseases'),t('C12BIO8T3','Drugs and Alcohol Abuse')]),
  ch('C12BIO9','Strategies for Enhancement in Food Production'),
  ch('C12BIO10','Microbes in Human Welfare'),
  ch('C12BIO11','Biotechnology: Principles and Processes',[
    t('C12BIO11T1','Recombinant DNA Technology'),t('C12BIO11T2','PCR and Gel Electrophoresis'),
  ]),
  ch('C12BIO12','Biotechnology and its Applications'),
  ch('C12BIO13','Organisms and Populations',[t('C12BIO13T1','Population Growth Models'),t('C12BIO13T2','Species Interactions')]),
  ch('C12BIO14','Ecosystem',[t('C12BIO14T1','Energy Flow'),t('C12BIO14T2','Nutrient Cycles')]),
  ch('C12BIO15','Biodiversity and Conservation'),ch('C12BIO16','Environmental Issues'),
]);

const cs12 = sub('CBSE_12_SCI_CS','Computer Science','CS',[
  ch('C12CS1','Review of Python Fundamentals'),
  ch('C12CS2','Object-Oriented Programming',[t('C12CS2T1','Classes and Objects'),t('C12CS2T2','Encapsulation')]),
  ch('C12CS3','Inheritance and Polymorphism',[t('C12CS3T1','Single and Multiple Inheritance'),t('C12CS3T2','Method Overriding')]),
  ch('C12CS4','File Handling in Python',[t('C12CS4T1','Text Files'),t('C12CS4T2','CSV and Binary Files')]),
  ch('C12CS5','Data Structures in Python — Stack and Queue',[t('C12CS5T1','Stack Operations'),t('C12CS5T2','Queue Operations')]),
  ch('C12CS6','Computer Networks',[t('C12CS6T1','Network Topologies'),t('C12CS6T2','Protocols'),t('C12CS6T3','IP Addressing')]),
  ch('C12CS7','Database Management',[t('C12CS7T1','Relational Model'),t('C12CS7T2','Normalisation')]),
  ch('C12CS8','Structured Query Language (SQL)',[t('C12CS8T1','DDL Commands'),t('C12CS8T2','DML Commands'),t('C12CS8T3','Joins and Subqueries')]),
  ch('C12CS9','Boolean Algebra'),ch('C12CS10','Communication and Network Technologies'),
]);

const eng12sci = sub('CBSE_12_SCI_ENG','English Core','ENG',[
  ch('C12ENGS1','Flamingo — Prose'),ch('C12ENGS2','Flamingo — Poems'),ch('C12ENGS3','Vistas (Supplementary)'),
  ch('C12ENGS4','Grammar — Tenses, Voice, Narration, Modals'),
  ch('C12ENGS5','Writing — Article, Speech, Report, Debate, Letter'),ch('C12ENGS6','Reading Comprehension'),
]);

const pe12 = sub('CBSE_12_SCI_PE','Physical Education','PE',[
  ch('C12PE1','Management of Sporting Events'),ch('C12PE2','Children and Women in Sports'),
  ch('C12PE3','Yoga and Lifestyle'),ch('C12PE4','Physical Education and Sports for CWSN'),
  ch('C12PE5','Sports and Nutrition'),ch('C12PE6','Test, Measurement and Evaluation'),
  ch('C12PE7','Physiology and Injuries in Sports'),ch('C12PE8','Biomechanics and Sports'),
  ch('C12PE9','Psychology and Sports'),ch('C12PE10','Training in Sports'),
]);

const amath12 = sub('CBSE_12_SCI_AMAT','Applied Mathematics','AMAT',[
  ch('C12AMAT1','Numbers, Quantification and Numerical Applications'),
  ch('C12AMAT2','Algebra'),ch('C12AMAT3','Calculus'),
  ch('C12AMAT4','Probability Distributions'),ch('C12AMAT5','Index Numbers and Time-based Data'),
  ch('C12AMAT6','Inferential Statistics'),ch('C12AMAT7','Financial Mathematics'),
  ch('C12AMAT8','Linear Programming'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   COMMERCE DOMAIN — GRADE 12
═══════════════════════════════════════════════════════════════════════════ */

const acc12 = sub('CBSE_12_COM_ACC','Accountancy','ACC',[
  ch('C12ACC1','Accounting for Partnership Firms — Fundamentals',[
    t('C12ACC1T1','Nature of Partnership'),t('C12ACC1T2','Partner\'s Capital Account'),
    t('C12ACC1T3','Profit and Loss Appropriation Account'),
  ]),
  ch('C12ACC2','Change in Profit Sharing Ratio',[
    t('C12ACC2T1','Sacrificing and Gaining Ratio'),t('C12ACC2T2','Revaluation Account'),
  ]),
  ch('C12ACC3','Admission of a Partner',[
    t('C12ACC3T1','Goodwill Valuation'),t('C12ACC3T2','Revaluation'),t('C12ACC3T3','Capital Adjustment'),
  ]),
  ch('C12ACC4','Retirement and Death of a Partner',[
    t('C12ACC4T1','Settlement of Outgoing Partner'),t('C12ACC4T2','Executor\'s Account'),
  ]),
  ch('C12ACC5','Dissolution of Partnership Firm',[
    t('C12ACC5T1','Realisation Account'),t('C12ACC5T2','Insolvency of Partners'),
  ]),
  ch('C12ACC6','Accounting for Share Capital',[
    t('C12ACC6T1','Issue of Shares'),t('C12ACC6T2','Forfeiture and Reissue'),
  ]),
  ch('C12ACC7','Issue and Redemption of Debentures',[
    t('C12ACC7T1','Issue of Debentures'),t('C12ACC7T2','Redemption Methods'),
  ]),
  ch('C12ACC8','Financial Statements of a Company',[
    t('C12ACC8T1','Balance Sheet'),t('C12ACC8T2','Statement of Profit and Loss'),
  ]),
  ch('C12ACC9','Analysis of Financial Statements',[
    t('C12ACC9T1','Comparative Statements'),t('C12ACC9T2','Common Size Statements'),
  ]),
  ch('C12ACC10','Accounting Ratios',[
    t('C12ACC10T1','Liquidity Ratios'),t('C12ACC10T2','Solvency Ratios'),
    t('C12ACC10T3','Profitability Ratios'),t('C12ACC10T4','Activity Ratios'),
  ]),
  ch('C12ACC11','Cash Flow Statement',[
    t('C12ACC11T1','Operating Activities'),t('C12ACC11T2','Investing Activities'),
    t('C12ACC11T3','Financing Activities'),
  ]),
]);

const bs12 = sub('CBSE_12_COM_BS','Business Studies','BS',[
  ch('C12BS1','Nature and Significance of Management',[
    t('C12BS1T1','Characteristics of Management'),t('C12BS1T2','Levels of Management'),
  ]),
  ch('C12BS2','Principles of Management',[
    t('C12BS2T1','Fayol\'s Principles'),t('C12BS2T2','Taylor\'s Scientific Management'),
  ]),
  ch('C12BS3','Business Environment',[
    t('C12BS3T1','Components of Business Environment'),t('C12BS3T2','PESTLE Analysis'),
  ]),
  ch('C12BS4','Planning',[t('C12BS4T1','Process of Planning'),t('C12BS4T2','Types of Plans')]),
  ch('C12BS5','Organising',[t('C12BS5T1','Organisational Structure'),t('C12BS5T2','Delegation and Decentralisation')]),
  ch('C12BS6','Staffing',[t('C12BS6T1','Recruitment and Selection'),t('C12BS6T2','Training and Development')]),
  ch('C12BS7','Directing',[t('C12BS7T1','Leadership Styles'),t('C12BS7T2','Motivation Theories'),t('C12BS7T3','Communication')]),
  ch('C12BS8','Controlling',[t('C12BS8T1','Control Process'),t('C12BS8T2','Techniques of Control')]),
  ch('C12BS9','Financial Management',[
    t('C12BS9T1','Financial Planning'),t('C12BS9T2','Capital Structure'),t('C12BS9T3','Working Capital'),
  ]),
  ch('C12BS10','Financial Markets',[
    t('C12BS10T1','Money Market'),t('C12BS10T2','Capital Market'),t('C12BS10T3','Stock Exchange'),
  ]),
  ch('C12BS11','Marketing Management',[
    t('C12BS11T1','4Ps of Marketing'),t('C12BS11T2','Consumer Behaviour'),
  ]),
  ch('C12BS12','Consumer Protection',[t('C12BS12T1','Consumer Rights'),t('C12BS12T2','Consumer Protection Act')]),
]);

const eco12 = sub('CBSE_12_COM_ECO','Economics','ECO',[
  ch('C12ECO1','Introduction to Macroeconomics',[t('C12ECO1T1','Circular Flow of Income')]),
  ch('C12ECO2','National Income Accounting',[
    t('C12ECO2T1','GDP and GNP'),t('C12ECO2T2','Methods of Measuring National Income'),
  ]),
  ch('C12ECO3','Money and Banking',[
    t('C12ECO3T1','Functions of Money'),t('C12ECO3T2','Commercial Banks'),t('C12ECO3T3','RBI and Monetary Policy'),
  ]),
  ch('C12ECO4','Income Determination',[
    t('C12ECO4T1','Aggregate Demand and Supply'),t('C12ECO4T2','Multiplier Effect'),
  ]),
  ch('C12ECO5','The Government: Budget and the Economy',[
    t('C12ECO5T1','Types of Budget'),t('C12ECO5T2','Fiscal Policy'),
  ]),
  ch('C12ECO6','Open Economy Macroeconomics',[
    t('C12ECO6T1','Balance of Payments'),t('C12ECO6T2','Foreign Exchange Rate'),
  ]),
  ch('C12ECO7','Consumer Equilibrium and Demand'),ch('C12ECO8','Production and Costs'),
  ch('C12ECO9','Theory of the Firm under Perfect Competition'),ch('C12ECO10','Non-competitive Markets'),
]);

const matCom12 = sub('CBSE_12_COM_MAT','Mathematics','MAT', math12.chapters);
const amatCom12 = sub('CBSE_12_COM_AMAT','Applied Mathematics','AMAT', amath12.chapters);
const eng12com = sub('CBSE_12_COM_ENG','English Core','ENG', eng12sci.chapters);

const ent12 = sub('CBSE_12_COM_ENT','Entrepreneurship','ENT',[
  ch('C12ENT1','Entrepreneurial Opportunity'),ch('C12ENT2','Entrepreneurial Planning'),
  ch('C12ENT3','Enterprise Marketing'),ch('C12ENT4','Enterprise Growth Strategies'),
  ch('C12ENT5','Business Arithmetic'),ch('C12ENT6','Resource Mobilisation'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   HUMANITIES DOMAIN — GRADE 12
═══════════════════════════════════════════════════════════════════════════ */

const hist12 = sub('CBSE_12_HUM_HIS','History','HIS',[
  ch('C12HIS1','Bricks, Beads and Bones: The Harappan Civilisation'),
  ch('C12HIS2','Kings, Farmers and Towns: Early States and Economies'),
  ch('C12HIS3','Kinship, Caste and Class: Early Societies'),
  ch('C12HIS4','Thinkers, Beliefs and Buildings: Cultural Developments'),
  ch('C12HIS5','Through the Eyes of Travellers'),ch('C12HIS6','Bhakti-Sufi Traditions'),
  ch('C12HIS7','An Imperial Capital: Vijayanagara'),ch('C12HIS8','Peasants, Zamindars and the State'),
  ch('C12HIS9','Kings and Chronicles: The Mughal Courts'),ch('C12HIS10','Colonialism and the Countryside'),
  ch('C12HIS11','Rebels and the Raj: The Revolt of 1857'),
  ch('C12HIS12','Colonial Cities: Urbanisation, Planning and Architecture'),
  ch('C12HIS13','Mahatma Gandhi and the Nationalist Movement'),
  ch('C12HIS14','Understanding Partition'),ch('C12HIS15','Framing the Constitution'),
]);

const polsci12 = sub('CBSE_12_HUM_POL','Political Science','POL',[
  ch('C12POL1','The Cold War Era'),ch('C12POL2','The End of Bipolarity'),
  ch('C12POL3','US Hegemony in World Politics'),ch('C12POL4','Alternative Centres of Power'),
  ch('C12POL5','Contemporary South Asia'),ch('C12POL6','International Organisations'),
  ch('C12POL7','Security in the Contemporary World'),ch('C12POL8','Environment and Natural Resources'),
  ch('C12POL9','Globalisation'),ch('C12POL10','Challenges of Nation Building'),
  ch('C12POL11','Era of One-Party Dominance'),ch('C12POL12','Politics of Planned Development'),
  ch('C12POL13',"India's External Relations"),ch('C12POL14','Challenges to the Congress System'),
  ch('C12POL15','Democratic Upsurge and Coalition Politics'),
  ch('C12POL16','Rise of Popular Movements'),ch('C12POL17','Regional Aspirations'),
]);

const geo12 = sub('CBSE_12_HUM_GEO','Geography','GEO',[
  ch('C12GEO1','Human Geography: Nature and Scope'),
  ch('C12GEO2','The World Population: Distribution, Density and Growth'),
  ch('C12GEO3','Population Composition'),ch('C12GEO4','Human Development'),
  ch('C12GEO5','Primary Activities'),ch('C12GEO6','Secondary Activities'),
  ch('C12GEO7','Tertiary and Quaternary Activities'),ch('C12GEO8','Transport and Communication'),
  ch('C12GEO9','International Trade'),ch('C12GEO10','Human Settlements'),
  ch('C12GEO11','Population: Distribution, Density, Growth and Composition (India)'),
  ch('C12GEO12','Migration: Types, Causes and Consequences (India)'),
  ch('C12GEO13','Human Development (India)'),ch('C12GEO14','Human Settlements (India)'),
  ch('C12GEO15','Land Resources and Agriculture (India)'),ch('C12GEO16','Water Resources (India)'),
  ch('C12GEO17','Mineral and Energy Resources (India)'),ch('C12GEO18','Manufacturing Industries (India)'),
  ch('C12GEO19','Planning and Sustainable Development'),
  ch('C12GEO20','Transport and Communication (India)'),ch('C12GEO21','International Trade (India)'),
]);

const soc12 = sub('CBSE_12_HUM_SOC','Sociology','SOC',[
  ch('C12SOC1','Introducing Indian Society'),ch('C12SOC2','The Demographic Structure of the Indian Society'),
  ch('C12SOC3','Social Institutions: Continuity and Change'),
  ch('C12SOC4','Market as a Social Institution'),ch('C12SOC5','Patterns of Social Inequality and Exclusion'),
  ch('C12SOC6','The Challenges of Cultural Diversity'),
  ch('C12SOC7','Suggestions for Project Work'),
  ch('C12SOC8','Structure of Indian Society — Change'),ch('C12SOC9','Social Change in India'),
]);

const psy12 = sub('CBSE_12_HUM_PSY','Psychology','PSY',[
  ch('C12PSY1','Variations in Psychological Attributes'),ch('C12PSY2','Self and Personality'),
  ch('C12PSY3','Meeting Life Challenges'),ch('C12PSY4','Psychological Disorders'),
  ch('C12PSY5','Therapeutic Approaches'),ch('C12PSY6','Attitude and Social Cognition'),
  ch('C12PSY7','Social Influence and Group Processes'),ch('C12PSY8','Psychology and Life'),
  ch('C12PSY9','Developing Psychological Skills'),
]);

const ecoHum12 = sub('CBSE_12_HUM_ECO','Economics','ECO', eco12.chapters);
const eng12hum = sub('CBSE_12_HUM_ENG','English Core','ENG', eng12sci.chapters);

const fineart12 = sub('CBSE_12_HUM_FAR','Fine Arts','FAR',[
  ch('C12FAR1','Classical Art Traditions'),ch('C12FAR2','Medieval Art'),
  ch('C12FAR3','Company Paintings and Bengal School'),ch('C12FAR4','Modern Indian Art'),
  ch('C12FAR5','Folk Art'),
]);

/* ════════════════════════════════════════════════════════════════════════════
   VOCATIONAL DOMAIN — GRADE 12 (Architecture-ready)
═══════════════════════════════════════════════════════════════════════════ */
const voc12Subjects: Subject[] = [
  sub('CBSE_12_VOC_IT','Information Technology','IT',[ch('C12IT1','Coming Soon — IT Vocational')]),
  sub('CBSE_12_VOC_TOU','Tourism','TOU',[ch('C12TOU1','Coming Soon — Tourism Vocational')]),
  sub('CBSE_12_VOC_HC','Health Care','HC',[ch('C12HC1','Coming Soon — Health Care Vocational')]),
];

/* ════════════════════════════════════════════════════════════════════════════
   GRADE 12 ASSEMBLY
═══════════════════════════════════════════════════════════════════════════ */
export const CBSE_GRADE_12: Grade = {
  value: '12',
  label: 'Class 12',
  hasDomains: true,
  domains: [
    {
      id: 'sci', label: 'Science', icon: '🔬',
      description: 'Physics, Chemistry, Mathematics, Biology, Computer Science',
      color: '#6366f1', status: 'active',
      subjects: [phy12, chem12, math12, bio12, cs12, amath12, eng12sci, pe12],
    },
    {
      id: 'com', label: 'Commerce', icon: '💼',
      description: 'Accountancy, Business Studies, Economics, Mathematics',
      color: '#10b981', status: 'active',
      subjects: [acc12, bs12, eco12, matCom12, amatCom12, ent12, eng12com],
    },
    {
      id: 'hum', label: 'Humanities', icon: '🎨',
      description: 'History, Political Science, Geography, Sociology, Psychology',
      color: '#f59e0b', status: 'active',
      subjects: [hist12, polsci12, geo12, soc12, psy12, ecoHum12, eng12hum, fineart12, pe12],
    },
    {
      id: 'voc', label: 'Vocational', icon: '🔧',
      description: 'IT, Tourism, Health Care, Retail, Automobile',
      color: '#8b5cf6', status: 'coming_soon',
      subjects: voc12Subjects,
    },
  ],
};
