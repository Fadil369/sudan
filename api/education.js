/**
 * Education Ministry Worker — Sudan Digital Government Portal
 * Cloudflare Worker: handles /api/education routes
 */

export const getData = async (sub, env) => {
  const schools = {
    total: 17_420,
    primary: 12_800,
    middle: 3_100,
    secondary: 1_520,
    byState: {
      Khartoum: 2400, Gezira: 1800, Kassala: 1200, 'Blue Nile': 900,
      Sennar: 950, 'Red Sea': 800, 'River Nile': 750, Northern: 680,
      'North Kordofan': 1100, 'South Kordofan': 950, 'North Darfur': 1100,
      'South Darfur': 1050, 'East Darfur': 600, 'Central Darfur': 550,
      'West Darfur': 700, 'White Nile': 900, Gedaref: 850, Aj_Jazirah: 140,
    },
  };

  const students = {
    total: 10_200_000,
    primary: 6_800_000,
    middle: 2_200_000,
    secondary: 1_200_000,
    higherEducation: 480_000,
    genderRatio: { male: 0.51, female: 0.49 },
    enrollmentRate: { primary: 0.68, middle: 0.45, secondary: 0.28 },
  };

  const teachers = {
    total: 285_000,
    certified: 210_000,
    inTraining: 25_000,
    studentTeacherRatio: 35.8,
  };

  const universities = [
    { name: 'University of Khartoum', founded: 1902, students: 42_000, faculties: 18 },
    { name: 'Omdurman Islamic University', founded: 1912, students: 35_000, faculties: 14 },
    { name: 'Sudan University of Science and Technology', founded: 1975, students: 55_000, faculties: 22 },
    { name: 'University of Gezira', founded: 1975, students: 30_000, faculties: 12 },
    { name: 'University of Juba', founded: 1977, students: 18_000, faculties: 10 },
    { name: 'Ahfad University for Women', founded: 1907, students: 6_000, faculties: 8 },
    { name: 'Nile Valley University', founded: 1990, students: 22_000, faculties: 10 },
    { name: 'Kassala University', founded: 1990, students: 15_000, faculties: 8 },
  ];

  const budget = {
    totalSDG: 48_500_000_000,
    percentOfGDP: 4.2,
    perStudentSDG: 4_760,
    salaries: 0.71,
    infrastructure: 0.18,
    materials: 0.11,
  };

  const exams = {
    sudanCertificate: { year: 2024, candidates: 480_000, passRate: 0.78 },
    basicEducation: { year: 2024, candidates: 1_100_000, passRate: 0.82 },
  };

  if (sub === 'schools') return schools;
  if (sub === 'students') return students;
  if (sub === 'teachers') return teachers;
  if (sub === 'universities') return universities;
  if (sub === 'budget') return budget;
  if (sub === 'exams') return exams;
  return { schools, students, teachers, universities, budget };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = url.pathname.split('/').filter(Boolean).pop();
    const data = await getData(sub, env);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
