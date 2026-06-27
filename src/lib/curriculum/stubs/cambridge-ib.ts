import type { Curriculum, Grade, Subject, Chapter, Topic } from '../../curriculum/types';

function t(id: string, name: string): Topic { return { id, name, learningOutcomes: [] }; }
function ch(id: string, name: string, topics: Topic[] = []): Chapter { return { id, name, topics }; }
function sub(id: string, name: string, code: string, chapters: Chapter[]): Subject { return { id, name, code, chapters }; }

// --- Cambridge IGCSE Stub ---
const igcseMath = sub('CAIE_IGCSE_MAT', 'Mathematics (0580)', 'MAT', [
  ch('CAIEMAT1', 'Number', [t('CAIEMAT1T1', 'Percentages'), t('CAIEMAT1T2', 'Ratio')]),
  ch('CAIEMAT2', 'Algebra', [t('CAIEMAT2T1', 'Equations'), t('CAIEMAT2T2', 'Functions')]),
]);

const cambridgeIGCSE: Grade = {
  value: 'IGCSE',
  label: 'IGCSE (Year 10-11)',
  hasDomains: false,
  subjects: [igcseMath],
};

export const CAMBRIDGE: Curriculum = {
  id: 'cambridge',
  boardCode: 'CAIE',
  name: 'Cambridge International (CAIE)',
  shortName: 'Cambridge',
  country: 'International',
  flag: '🇬🇧',
  status: 'active',
  description: 'Cambridge IGCSE, O-Level, AS & A-Level curriculum.',
  academicYears: [
    {
      year: '2025-26',
      label: 'Academic Year 2025-26',
      isDefault: true,
      grades: [cambridgeIGCSE],
    }
  ],
};

// --- IB DP Stub ---
const ibMathAA = sub('IB_DP_MATAA', 'Mathematics: Analysis and Approaches', 'MATAA', [
  ch('IBMATAA1', 'Number and Algebra', [t('IBMATAA1T1', 'Sequences and Series'), t('IBMATAA1T2', 'Complex Numbers')]),
  ch('IBMATAA2', 'Functions', [t('IBMATAA2T1', 'Quadratics'), t('IBMATAA2T2', 'Exponentials')]),
]);

const ibDP: Grade = {
  value: 'DP',
  label: 'Diploma Programme (DP1-DP2)',
  hasDomains: false,
  subjects: [ibMathAA],
};

export const IB: Curriculum = {
  id: 'ib',
  boardCode: 'IB',
  name: 'International Baccalaureate',
  shortName: 'IB (DP)',
  country: 'International',
  flag: '🌐',
  status: 'active',
  description: 'IB Diploma Programme.',
  academicYears: [
    {
      year: '2025-26',
      label: 'Academic Year 2025-26',
      isDefault: true,
      grades: [ibDP],
    }
  ],
};
