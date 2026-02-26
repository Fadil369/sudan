// Sudan Government Digital Unified System (SGDUS) — OID configuration
// Source of truth: sudan.md (OID SYSTEM SPECIFICATION)

export const OID_ROOT = process.env.REACT_APP_OID_BASE || '1.3.6.1.4.1.61026';

export const OID_BRANCHES = Object.freeze({
  places: `${OID_ROOT}.1`,
  citizens: `${OID_ROOT}.2`,
  businesses: `${OID_ROOT}.3`,
  governmentEntities: `${OID_ROOT}.4`,
  digitalServices: `${OID_ROOT}.5`,
  documentsCertificates: `${OID_ROOT}.6`,
});

export const OID_GOVERNMENT_BRANCHES = Object.freeze({
  ministries: `${OID_BRANCHES.governmentEntities}.1`,
  agencies: `${OID_BRANCHES.governmentEntities}.2`,
  localGovernments: `${OID_BRANCHES.governmentEntities}.3`,
  publicEnterprises: `${OID_BRANCHES.governmentEntities}.4`,
});

// OID branches for the portal's primary 11 ministries/departments (UI grouping).
export const MINISTRY_OIDS = Object.freeze({
  identity: `${OID_GOVERNMENT_BRANCHES.ministries}.1`,
  health: `${OID_GOVERNMENT_BRANCHES.ministries}.2`,
  education: `${OID_GOVERNMENT_BRANCHES.ministries}.3`,
  finance: `${OID_GOVERNMENT_BRANCHES.ministries}.4`,
  agriculture: `${OID_GOVERNMENT_BRANCHES.ministries}.5`,
  energy: `${OID_GOVERNMENT_BRANCHES.ministries}.6`,
  infrastructure: `${OID_GOVERNMENT_BRANCHES.ministries}.7`,
  justice: `${OID_GOVERNMENT_BRANCHES.ministries}.8`,
  foreignAffairs: `${OID_GOVERNMENT_BRANCHES.ministries}.9`,
  labor: `${OID_GOVERNMENT_BRANCHES.ministries}.10`,
  socialWelfare: `${OID_GOVERNMENT_BRANCHES.ministries}.11`,
});

export const SUDAN_STATE_CODES = Object.freeze([
  { code: '01', nameEn: 'Khartoum', nameAr: 'الخرطوم' },
  { code: '02', nameEn: 'Red Sea', nameAr: 'البحر الأحمر' },
  { code: '03', nameEn: 'Kassala', nameAr: 'كسلا' },
  { code: '04', nameEn: 'Al Qadarif', nameAr: 'القضارف' },
  { code: '05', nameEn: 'River Nile', nameAr: 'نهر النيل' },
  { code: '06', nameEn: 'Northern', nameAr: 'الشمالية' },
  { code: '07', nameEn: 'North Kordofan', nameAr: 'شمال كردفان' },
  { code: '08', nameEn: 'South Kordofan', nameAr: 'جنوب كردفان' },
  { code: '09', nameEn: 'West Kordofan', nameAr: 'غرب كردفان' },
  { code: '10', nameEn: 'Blue Nile', nameAr: 'النيل الأزرق' },
  { code: '11', nameEn: 'Sennar', nameAr: 'سنار' },
  { code: '12', nameEn: 'White Nile', nameAr: 'النيل الأبيض' },
  { code: '13', nameEn: 'North Darfur', nameAr: 'شمال دارفور' },
  { code: '14', nameEn: 'South Darfur', nameAr: 'جنوب دارفور' },
  { code: '15', nameEn: 'West Darfur', nameAr: 'غرب دارفور' },
  { code: '16', nameEn: 'Central Darfur', nameAr: 'وسط دارفور' },
  { code: '17', nameEn: 'East Darfur', nameAr: 'شرق دارفور' },
  { code: '18', nameEn: 'Al Jazirah', nameAr: 'الجزيرة' },
]);

export function createCitizenOid({
  stateCode,
  localityCode,
  entityId,
  checkDigit = '1',
} = {}) {
  const safeStateCode = stateCode || '01';
  const safeLocalityCode = localityCode || '001';
  const safeEntityId = entityId || '123456789';
  return `${OID_BRANCHES.citizens}.${safeStateCode}.${safeLocalityCode}.${safeEntityId}.${checkDigit}`;
}

