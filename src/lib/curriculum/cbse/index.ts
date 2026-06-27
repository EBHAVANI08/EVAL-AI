import type { Curriculum } from '../../curriculum/types';
import { CBSE_GRADES_1_10 } from './grades-1-10';
import { CBSE_GRADE_11 } from './grade-11';
import { CBSE_GRADE_12 } from './grade-12';

export const CBSE: Curriculum = {
  id: 'cbse',
  boardCode: 'CBSE',
  name: 'Central Board of Secondary Education',
  shortName: 'CBSE',
  country: 'India',
  flag: '🇮🇳',
  status: 'active',
  description: 'India\'s national curriculum board. Covers Grades 1–12 with Science, Commerce, and Humanities streams in senior secondary.',
  academicYears: [
    {
      year: '2025-26',
      label: 'Academic Year 2025–26',
      isDefault: true,
      grades: [...CBSE_GRADES_1_10, CBSE_GRADE_11, CBSE_GRADE_12],
    },
    {
      year: '2024-25',
      label: 'Academic Year 2024–25',
      isDefault: false,
      // Same structure — can diverge if syllabus changes
      grades: [...CBSE_GRADES_1_10, CBSE_GRADE_11, CBSE_GRADE_12],
    },
  ],
};
