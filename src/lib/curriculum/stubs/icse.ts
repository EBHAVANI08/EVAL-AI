import type { Curriculum, Grade, Subject, Chapter, Topic } from '../../curriculum/types';

function t(id: string, name: string): Topic { return { id, name, learningOutcomes: [] }; }
function ch(id: string, name: string, topics: Topic[] = []): Chapter { return { id, name, topics }; }
function sub(id: string, name: string, code: string, chapters: Chapter[]): Subject { return { id, name, code, chapters }; }

const math10 = sub('ICSE_10_MAT', 'Mathematics', 'MAT', [
  ch('ICSE10MAT1', 'Commercial Mathematics', [t('ICSE10MAT1T1', 'GST'), t('ICSE10MAT1T2', 'Banking')]),
  ch('ICSE10MAT2', 'Algebra', [t('ICSE10MAT2T1', 'Linear Inequations'), t('ICSE10MAT2T2', 'Quadratic Equations')]),
]);

const phy10 = sub('ICSE_10_PHY', 'Physics', 'PHY', [
  ch('ICSE10PHY1', 'Force, Work, Power and Energy', [t('ICSE10PHY1T1', 'Force'), t('ICSE10PHY1T2', 'Work and Energy')]),
  ch('ICSE10PHY2', 'Light', [t('ICSE10PHY2T1', 'Refraction'), t('ICSE10PHY2T2', 'Lenses')]),
]);

const icseGrade10: Grade = {
  value: '10',
  label: 'Class 10',
  hasDomains: false,
  subjects: [math10, phy10],
};

export const ICSE: Curriculum = {
  id: 'icse',
  boardCode: 'ICSE',
  name: 'Indian Certificate of Secondary Education',
  shortName: 'ICSE',
  country: 'India',
  flag: '🇮🇳',
  status: 'active',
  description: 'CISCE board curriculum covering Grades 1–12.',
  academicYears: [
    {
      year: '2025-26',
      label: 'Academic Year 2025-26',
      isDefault: true,
      grades: [icseGrade10],
    }
  ],
};
