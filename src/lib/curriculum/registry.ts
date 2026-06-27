/* ─────────────────────────────────────────────────────────────────────────────
   Master Curriculum Registry
   Single source of truth for all curricula, grades, domains, subjects, chapters.
   All UI and API code should use these helpers instead of accessing data directly.
───────────────────────────────────────────────────────────────────────────── */
import type { Curriculum, AcademicYear, Grade, Domain, Subject, Chapter, Topic } from './types';
import { CBSE } from './cbse/index';
import { ICSE } from './stubs/icse';
import { CAMBRIDGE, IB } from './stubs/cambridge-ib';

/* ── Registry ─────────────────────────────────────────────────────────────── */
export const CURRICULUM_REGISTRY: Curriculum[] = [CBSE, ICSE, CAMBRIDGE, IB];

/* ── Curriculum helpers ───────────────────────────────────────────────────── */
export function getCurriculums(): Curriculum[] {
  return CURRICULUM_REGISTRY;
}

export function getCurriculum(id: string): Curriculum | undefined {
  return CURRICULUM_REGISTRY.find(c => c.id === id);
}

/* ── Academic Year helpers ────────────────────────────────────────────────── */
export function getAcademicYears(curriculumId: string): AcademicYear[] {
  return getCurriculum(curriculumId)?.academicYears ?? [];
}

export function getDefaultAcademicYear(curriculumId: string): AcademicYear | undefined {
  const years = getAcademicYears(curriculumId);
  return years.find(y => y.isDefault) ?? years[0];
}

/* ── Grade helpers ────────────────────────────────────────────────────────── */
export function getGrades(curriculumId: string, year: string): Grade[] {
  const curriculum = getCurriculum(curriculumId);
  if (!curriculum) return [];
  const ay = curriculum.academicYears.find(y => y.year === year)
    ?? curriculum.academicYears.find(y => y.isDefault)
    ?? curriculum.academicYears[0];
  return ay?.grades ?? [];
}

export function getGrade(curriculumId: string, year: string, gradeValue: string): Grade | undefined {
  return getGrades(curriculumId, year).find(g => g.value === gradeValue);
}

/* ── Domain helpers ───────────────────────────────────────────────────────── */
export function hasDomains(curriculumId: string, year: string, gradeValue: string): boolean {
  return getGrade(curriculumId, year, gradeValue)?.hasDomains ?? false;
}

export function getDomains(curriculumId: string, year: string, gradeValue: string): Domain[] {
  const grade = getGrade(curriculumId, year, gradeValue);
  if (!grade?.hasDomains) return [];
  return grade.domains ?? [];
}

export function getDomain(curriculumId: string, year: string, gradeValue: string, domainId: string): Domain | undefined {
  return getDomains(curriculumId, year, gradeValue).find(d => d.id === domainId);
}

/* ── Subject helpers ──────────────────────────────────────────────────────── */
export function getSubjects(
  curriculumId: string,
  year: string,
  gradeValue: string,
  domainId?: string,
): Subject[] {
  const grade = getGrade(curriculumId, year, gradeValue);
  if (!grade) return [];

  if (grade.hasDomains) {
    if (!domainId) return [];
    return getDomain(curriculumId, year, gradeValue, domainId)?.subjects ?? [];
  }
  return grade.subjects ?? [];
}

export function getSubjectById(subjectId: string, curriculumId: string, year: string): Subject | undefined {
  const grades = getGrades(curriculumId, year);
  for (const grade of grades) {
    if (grade.hasDomains) {
      for (const domain of grade.domains ?? []) {
        const found = domain.subjects.find(s => s.id === subjectId);
        if (found) return found;
      }
    } else {
      const found = (grade.subjects ?? []).find(s => s.id === subjectId);
      if (found) return found;
    }
  }
  return undefined;
}

/* ── Chapter helpers ──────────────────────────────────────────────────────── */
export function getChapters(
  curriculumId: string,
  year: string,
  gradeValue: string,
  domainId: string | null,
  subjectName: string,
): Chapter[] {
  const subjects = getSubjects(curriculumId, year, gradeValue, domainId ?? undefined);
  return subjects.find(s => s.name === subjectName)?.chapters ?? [];
}

export function getChapterById(chapterId: string, subject: Subject): Chapter | undefined {
  return subject.chapters.find(c => c.id === chapterId);
}

/* ── Topic helpers ────────────────────────────────────────────────────────── */
export function getTopics(chapter: Chapter): Topic[] {
  return chapter.topics ?? [];
}

export function hasTopics(chapter: Chapter): boolean {
  return chapter.topics.length > 0;
}

/* ── Utility: build subject ID from parts ─────────────────────────────────── */
export function buildSubjectId(
  curriculumId: string,
  gradeValue: string,
  domainId: string | null,
  subjectCode: string,
): string {
  const parts = [curriculumId.toUpperCase(), gradeValue];
  if (domainId) parts.push(domainId.toUpperCase());
  parts.push(subjectCode.toUpperCase());
  return parts.join('_');
}

/* ── Utility: find subject by name (cross-domain safe) ───────────────────── */
export function findSubjectByName(
  curriculumId: string,
  year: string,
  gradeValue: string,
  domainId: string | null,
  subjectName: string,
): Subject | undefined {
  return getSubjects(curriculumId, year, gradeValue, domainId ?? undefined)
    .find(s => s.name === subjectName);
}

/* ── Re-exports for convenience ───────────────────────────────────────────── */
export type { Curriculum, AcademicYear, Grade, Domain, Subject, Chapter, Topic, LearningOutcome, QuestionMetadata } from './types';
