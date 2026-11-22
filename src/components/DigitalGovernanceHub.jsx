import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  AccountBalance,
  Gavel,
  Terrain,
  VerifiedUser,
  Security,
  WarningAmber,
  CheckCircle,
  Lock,
  Translate,
  Calculate,
} from '@mui/icons-material';
import { SUDAN_STATE_CODES, OID_ROOT } from '../config/oidConfig';

// Client-side fallback equalization calculator mirroring api/treasury.js (45/50/5 + 10% producing + 5-factor horizontal)
const STATE_PROFILES = [
  { code: '01', nameEn: 'Khartoum', nameAr: 'الخرطوم', population: 8.5, povertyIndex: 0.35, warDamage: 0.95, geographicArea: 2.2, fiscalEffort: 0.92 },
  { code: '02', nameEn: 'Red Sea', nameAr: 'البحر الأحمر', population: 1.6, povertyIndex: 0.62, warDamage: 0.20, geographicArea: 21.8, fiscalEffort: 0.85 },
  { code: '05', nameEn: 'River Nile', nameAr: 'نهر النيل', population: 1.6, povertyIndex: 0.42, warDamage: 0.22, geographicArea: 12.2, fiscalEffort: 0.80 },
  { code: '13', nameEn: 'North Darfur', nameAr: 'شمال دارفور', population: 2.9, povertyIndex: 0.84, warDamage: 0.94, geographicArea: 29.6, fiscalEffort: 0.38 },
  { code: '14', nameEn: 'South Darfur', nameAr: 'جنوب دارفور', population: 3.9, povertyIndex: 0.82, warDamage: 0.92, geographicArea: 8.1, fiscalEffort: 0.42 },
  { code: '15', nameEn: 'West Darfur', nameAr: 'غرب دارفور', population: 1.8, povertyIndex: 0.88, warDamage: 0.98, geographicArea: 2.3, fiscalEffort: 0.32 },
  { code: '18', nameEn: 'Al Jazirah', nameAr: 'الجزيرة', population: 5.4, povertyIndex: 0.52, warDamage: 0.88, geographicArea: 2.7, fiscalEffort: 0.78 },
];

function computeLocalEqualization(totalPoolSdg, goldRevenueSdg = 680000000, portRevenueSdg = 420000000) {
  const pool = Math.max(Number(totalPoolSdg) || 0, 1);
  const producingBonus = Math.min(Math.round((goldRevenueSdg + portRevenueSdg) * 0.1), pool * 0.5);
  const netPool = pool - producingBonus;
  const federalShareSdg = Math.round(netPool * 0.45);
  const statesPoolSdg = Math.round(netPool * 0.5);
  const sovereignReserveSdg = netPool - federalShareSdg - statesPoolSdg;

  const totals = STATE_PROFILES.reduce(
    (acc, s) => ({
      population: acc.population + s.population,
      povertyIndex: acc.povertyIndex + s.povertyIndex,
      warDamage: acc.warDamage + s.warDamage,
      geographicArea: acc.geographicArea + s.geographicArea,
      fiscalEffort: acc.fiscalEffort + s.fiscalEffort,
    }),
    { population: 0, povertyIndex: 0, warDamage: 0, geographicArea: 0, fiscalEffort: 0 }
  );

  const stateAllocations = STATE_PROFILES.map((s) => {
    const factor =
      (s.population / totals.population) * 0.3 +
      (s.povertyIndex / totals.povertyIndex) * 0.25 +
      (s.warDamage / totals.warDamage) * 0.2 +
      (s.geographicArea / totals.geographicArea) * 0.15 +
      (s.fiscalEffort / totals.fiscalEffort) * 0.1;
    const horizontalShareSdg = Math.round(statesPoolSdg * factor);
    const producingRegionShareSdg =
      s.code === '05'
        ? Math.round(goldRevenueSdg * 0.1)
        : s.code === '02'
        ? Math.round(portRevenueSdg * 0.1)
        : 0;
    return {
      stateCode: s.code,
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      compositeFactorPct: Math.round(factor * 10000) / 100,
      warDamageIndex: s.warDamage,
      horizontalShareSdg,
      producingRegionShareSdg,
      totalTransferSdg: horizontalShareSdg + producingRegionShareSdg,
    };
  }).sort((a, b) => b.totalTransferSdg - a.totalTransferSdg);

  return {
    totalPoolSdg: pool,
    totalProducingRegionShareSdg: producingBonus,
    verticalSplit: {
      federalPct: 45,
      statesPct: 50,
      sovereignReservePct: 5,
      federalShareSdg,
      statesPoolSdg,
      sovereignReserveSdg,
    },
    stateAllocations,
  };
}

const DEFAULT_SUMMARY = {
  totalRevenueSdg: 1450000000,
  totalDisbursementsSdg: 180000000,
  netBalanceSdg: 1270000000,
  entryCount: 4,
  latestEntryHash: 'd4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeef0000004',
};

const DEFAULT_TENDERS = [
  {
    id: 'tender-seed-001',
    ocid: 'ocds-sd-2026-0001',
    title_ar: 'إعادة تأهيل محطة مياه الخرطوم بحري',
    title_en: 'Khartoum North Water Treatment Plant Rehabilitation',
    ministry_oid: `${OID_ROOT}.4.1.7`,
    state_code: '01',
    budget_sdg: 450000000,
    status: 'open',
    flagged_bid_count: 1,
  },
  {
    id: 'tender-seed-002',
    ocid: 'ocds-sd-2026-0002',
    title_ar: 'توريد منظومات طاقة شمسية لمستشفيات دارفور',
    title_en: 'Solar Microgrid Supply for Darfur Regional Hospitals',
    ministry_oid: `${OID_ROOT}.4.1.2`,
    state_code: '13',
    budget_sdg: 290000000,
    status: 'open',
    flagged_bid_count: 0,
  },
  {
    id: 'tender-seed-003',
    ocid: 'ocds-sd-2026-0003',
    title_ar: 'تطوير قنوات الري الرقمية بمشروع الجزيرة',
    title_en: 'Al Jazirah Scheme Digital Irrigation Telemetry Upgrade',
    ministry_oid: `${OID_ROOT}.4.1.5`,
    state_code: '18',
    budget_sdg: 175000000,
    status: 'awarded',
    flagged_bid_count: 1,
  },
];

const DEFAULT_PARCELS = [
  {
    id: 'parcel-seed-001',
    parcel_oid: `${OID_ROOT}.1.18.001.00042`,
    owner_oid: `${OID_ROOT}.2.18.001.445566778.3`,
    owner_name_ar: 'تعاونية مزارعي ود مدني الزراعية',
    owner_name_en: 'Wad Madani Farmers Cooperative',
    state_code: '18',
    locality: 'Wad Madani',
    area_feddan: 120.5,
    tenure_type: 'freehold',
    dispute_status: 'clear',
  },
  {
    id: 'parcel-seed-002',
    parcel_oid: `${OID_ROOT}.1.15.002.00108`,
    owner_oid: `${OID_ROOT}.2.15.002.881122334.9`,
    owner_name_ar: 'حاكورة مجتمع الجنينة التقليدية',
    owner_name_en: 'El Geneina Customary Hawakeer Community',
    state_code: '15',
    locality: 'El Geneina',
    area_feddan: 840.0,
    tenure_type: 'hawakeer_communal',
    dispute_status: 'frozen',
  },
  {
    id: 'parcel-seed-003',
    parcel_oid: `${OID_ROOT}.1.01.003.00519`,
    owner_oid: `${OID_ROOT}.2.01.003.112233445.5`,
    owner_name_ar: 'أسرة أحمد النيل — أم درمان',
    owner_name_en: 'Ahmed El-Nile Family — Omdurman',
    state_code: '01',
    locality: 'Omdurman',
    area_feddan: 0.75,
    tenure_type: 'freehold',
    dispute_status: 'frozen',
  },
];

const DEFAULT_CONSENTS = [
  {
    id: 'consent-seed-001',
    receipt_id: 'CR-2026-HEALTH-001',
    citizen_oid: `${OID_ROOT}.2.01.001.123456789.1`,
    requesting_ministry_oid: `${OID_ROOT}.4.1.2`,
    scopes: ['health:vaccination_record', 'identity:age_over_18'],
    purpose: 'Khartoum Teaching Hospital Emergency Care Verification',
    status: 'active',
    expires_at: '2027-06-30T23:59:59.000Z',
  },
  {
    id: 'consent-seed-002',
    receipt_id: 'CR-2026-AGRI-002',
    citizen_oid: `${OID_ROOT}.2.01.001.123456789.1`,
    requesting_ministry_oid: `${OID_ROOT}.4.1.5`,
    scopes: ['land:parcel_ownership', 'finance:subsidy_eligibility'],
    purpose: 'Al Jazirah Seasonal Agricultural Micro-Credit Enrollment',
    status: 'active',
    expires_at: '2027-09-30T23:59:59.000Z',
  },
];

function formatSdg(amount) {
  return `${Number(amount || 0).toLocaleString('en-US')} SDG`;
}

export default function DigitalGovernanceHub({ language: initialLanguage = 'ar' }) {
  const [lang, setLang] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState(0);

  // Pillar 1: STA & Equalization state
  const [staSummary, setStaSummary] = useState(DEFAULT_SUMMARY);
  const [poolInput, setPoolInput] = useState('2000000000');
  const [equalization, setEqualization] = useState(() => computeLocalEqualization(2000000000));

  // Pillar 2: OCDS Procurement state
  const [tenders, setTenders] = useState(DEFAULT_TENDERS);

  // Pillar 3: Land & Hawakeer state
  const [parcels, setParcels] = useState(DEFAULT_PARCELS);
  const [landStateFilter, setLandStateFilter] = useState('all');
  const [landTenureFilter, setLandTenureFilter] = useState('all');

  // Pillar 4: Citizen Consent Wallet state
  const [consents, setConsents] = useState(DEFAULT_CONSENTS);
  const [consentNotice, setConsentNotice] = useState('');

  useEffect(() => {
    setLang(initialLanguage);
  }, [initialLanguage]);

  const isAr = lang === 'ar';

  // Hydrate from live Cloudflare Worker APIs when available (graceful fallback to defaults)
  useEffect(() => {
    let active = true;
    const loadLiveData = async () => {
      try {
        const [staRes, procRes, landRes, consentRes] = await Promise.all([
          fetch('/api/treasury/summary').catch(() => null),
          fetch('/api/procurement/tenders').catch(() => null),
          fetch('/api/land/parcels').catch(() => null),
          fetch('/api/consent/list').catch(() => null),
        ]);

        if (!active) return;

        if (staRes?.ok) {
          const data = await staRes.json().catch(() => null);
          if (data?.totalRevenueSdg != null) setStaSummary(data);
        }
        if (procRes?.ok) {
          const data = await procRes.json().catch(() => null);
          if (Array.isArray(data?.tenders) && data.tenders.length > 0) setTenders(data.tenders);
        }
        if (landRes?.ok) {
          const data = await landRes.json().catch(() => null);
          if (Array.isArray(data?.parcels) && data.parcels.length > 0) setParcels(data.parcels);
        }
        if (consentRes?.ok) {
          const data = await consentRes.json().catch(() => null);
          if (Array.isArray(data?.receipts) && data.receipts.length > 0) setConsents(data.receipts);
        }
      } catch (_) {
        // Fallback defaults remain active
      }
    };
    loadLiveData();
    return () => {
      active = false;
    };
  }, []);

  const handleCalculateEqualization = async () => {
    const numericPool = Number(poolInput) || 2000000000;
    try {
      const res = await fetch('/api/treasury/equalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalPoolSdg: numericPool,
          producingResourceRevenues: [
            { stateCode: '05', amountSdg: 680000000, resource: 'gold_royalty' },
            { stateCode: '02', amountSdg: 420000000, resource: 'port_fee' },
          ],
        }),
      });
      if (res?.ok) {
        const data = await res.json().catch(() => null);
        if (data?.verticalSplit && Array.isArray(data?.stateAllocations)) {
          setEqualization(data);
          return;
        }
      }
    } catch (_) {
      // Fallback to pure client calculation
    }
    setEqualization(computeLocalEqualization(numericPool));
  };

  const handleRevokeConsent = async (receiptId) => {
    try {
      await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId }),
      }).catch(() => null);
    } catch (_) {
      // Optimistically update local wallet state
    }
    setConsents((prev) =>
      prev.map((c) => (c.receipt_id === receiptId ? { ...c, status: 'revoked' } : c))
    );
    setConsentNotice(
      isAr
        ? `تم سحب إيصال الموافقة ${receiptId} فوراً ومنع الوصول للبيانات.`
        : `Consent receipt ${receiptId} revoked immediately.`
    );
  };

  const filteredParcels = useMemo(
    () =>
      parcels.filter(
        (p) =>
          (landStateFilter === 'all' || p.state_code === landStateFilter) &&
          (landTenureFilter === 'all' || p.tenure_type === landTenureFilter)
      ),
    [parcels, landStateFilter, landTenureFilter]
  );

  return (
    <Box
      dir={isAr ? 'rtl' : 'ltr'}
      data-testid="digital-governance-hub"
      sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}
    >
      {/* Header Banner */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1B3A5C 0%, #0F2640 60%, #005A2D 100%)',
          color: '#FFFFFF',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {isAr
                  ? 'مركز الحكومة الرقمية العملية — جمهورية المقرن'
                  : 'Practical Digital Government Hub — Al-Muqran Republic'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isAr
                  ? `الركائز الدستورية الأربع للحوكمة الرقمية المرتبطة بالمعرف السيادي ${OID_ROOT}`
                  : `Four constitutional digital-governance pillars anchored on Sovereign OID ${OID_ROOT}`}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Translate />}
              onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              data-testid="governance-lang-toggle"
            >
              {isAr ? 'English' : 'العربية'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Four Pillar Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={isAr ? 'ركائز الحوكمة الرقمية' : 'Digital Governance Pillars'}
        >
          <Tab
            icon={<AccountBalance />}
            iconPosition="start"
            label={isAr ? 'الخزينة الموحدة والتوزيع الاتحادي' : 'STA Treasury & Federal Calculator'}
            data-testid="tab-treasury"
          />
          <Tab
            icon={<Gavel />}
            iconPosition="start"
            label={isAr ? 'المشتريات المفتوحة (OCDS)' : 'OCDS Procurement Watch'}
            data-testid="tab-procurement"
          />
          <Tab
            icon={<Terrain />}
            iconPosition="start"
            label={isAr ? 'السجل العقاري والحواكير' : 'Land & Hawakeer Shield'}
            data-testid="tab-land"
          />
          <Tab
            icon={<VerifiedUser />}
            iconPosition="start"
            label={isAr ? 'محفظة موافقات المواطن' : 'Citizen Consent Wallet'}
            data-testid="tab-consent"
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Single Treasury Account & Federal Fiscal Equalization Calculator */}
      {activeTab === 0 && (
        <Box data-testid="panel-treasury">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {isAr ? 'إجمالي إيرادات الخزينة الموحدة (STA)' : 'Total STA Revenues'}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="secondary.main">
                    {formatSdg(staSummary.totalRevenueSdg)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {isAr ? 'إجمالي المنصرفات والتحويلات الولائية' : 'Total Disbursements & Transfers'}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {formatSdg(staSummary.totalDisbursementsSdg)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {isAr ? 'الرصيد الصافي (سلسلة تجزئة SHA-256)' : 'Net Balance (SHA-256 Chain Head)'}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatSdg(staSummary.netBalanceSdg)}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<Security />}
                    color="success"
                    label={`SHA-256: ${(staSummary.latestEntryHash || '').slice(0, 14)}...`}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {isAr
                  ? 'حاسبة القسمة المالية الاتحادية (45% اتحادي / 50% ولايات / 5% احتياطي سيادي + 10% للولاية المنتجة)'
                  : 'Federal Fiscal Equalization Calculator (45% Federal / 50% States / 5% Reserve + 10% Producing Share)'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isAr
                  ? 'صيغة التوزيع الأفقي ذات العوامل الخمسة: السكان 30% • الفقر 25% • أضرار الحرب والتمييز الإيجابي 20% • المساحة 15% • الجهد الضريبي 10%'
                  : '5-Factor Horizontal Formula: Population 30% • Poverty 25% • War-Damage Affirmative Action 20% • Area 15% • Fiscal Effort 10%'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label={isAr ? 'إجمالي الوعاء الإيرادي (جنيه سوداني)' : 'Total Distributable Pool (SDG)'}
                  type="number"
                  size="small"
                  value={poolInput}
                  onChange={(e) => setPoolInput(e.target.value)}
                  sx={{ minWidth: 260 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={handleCalculateEqualization}
                  data-testid="calculate-equalization-btn"
                >
                  {isAr ? 'احسب التوزيع الاتحادي' : 'Calculate Equalization'}
                </Button>
              </Stack>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Chip
                    color="primary"
                    label={`${isAr ? 'الاتحادي 45%' : 'Federal 45%'}: ${formatSdg(equalization.verticalSplit.federalShareSdg)}`}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    color="secondary"
                    label={`${isAr ? 'الولايات 50%' : 'States 50%'}: ${formatSdg(equalization.verticalSplit.statesPoolSdg)}`}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    color="info"
                    label={`${isAr ? 'الاحتياطي 5%' : 'Reserve 5%'}: ${formatSdg(equalization.verticalSplit.sovereignReserveSdg)}`}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    color="warning"
                    label={`${isAr ? 'حصة الإنتاج 10%' : 'Producing 10%'}: ${formatSdg(equalization.totalProducingRegionShareSdg)}`}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{isAr ? 'الولاية' : 'State'}</TableCell>
                      <TableCell align="right">{isAr ? 'مؤشر أضرار الحرب' : 'War-Damage Index'}</TableCell>
                      <TableCell align="right">{isAr ? 'التوزيع الأفقي' : 'Horizontal Share'}</TableCell>
                      <TableCell align="right">{isAr ? 'حصة الولاية المنتجة (10%)' : 'Producing Share (10%)'}</TableCell>
                      <TableCell align="right">{isAr ? 'إجمالي التحويل' : 'Total Transfer'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equalization.stateAllocations.slice(0, 7).map((row) => (
                      <TableRow key={row.stateCode}>
                        <TableCell>
                          {row.stateCode} — {isAr ? row.nameAr : row.nameEn}
                        </TableCell>
                        <TableCell align="right">{Math.round(row.warDamageIndex * 100)}%</TableCell>
                        <TableCell align="right">{formatSdg(row.horizontalShareSdg)}</TableCell>
                        <TableCell align="right">{formatSdg(row.producingRegionShareSdg)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatSdg(row.totalTransferSdg)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: Open e-Procurement (OCDS) Watch */}
      {activeTab === 1 && (
        <Box data-testid="panel-procurement">
          <Alert severity="info" sx={{ mb: 2 }}>
            {isAr
              ? 'بوابة المشتريات المفتوحة (OCDS): يتم فحص الملكية المستفيدة (UBO) تلقائياً لحظر أي عطاء يرتبط بمسؤول حكومي أو كيان معاقب أو شركة واجهة عسكرية.'
              : 'Open Contracting (OCDS): Automated Beneficial Ownership (UBO) screening blocks bids linked to public officials, sanctioned entities, or military commercial affiliates.'}
          </Alert>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>OCID</TableCell>
                  <TableCell>{isAr ? 'المناقصة' : 'Tender Title'}</TableCell>
                  <TableCell>{isAr ? 'الجهة (OID)' : 'Ministry OID'}</TableCell>
                  <TableCell align="right">{isAr ? 'الميزانية' : 'Budget'}</TableCell>
                  <TableCell>{isAr ? 'الحالة' : 'Status'}</TableCell>
                  <TableCell>{isAr ? 'فحص تضارب المصالح (UBO)' : 'UBO Conflict Check'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenders.map((t) => (
                  <TableRow key={t.id || t.ocid}>
                    <TableCell>
                      <code>{t.ocid}</code>
                    </TableCell>
                    <TableCell>{isAr ? t.title_ar : t.title_en}</TableCell>
                    <TableCell>
                      <code>{t.ministry_oid}</code>
                    </TableCell>
                    <TableCell align="right">{formatSdg(t.budget_sdg)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={t.status === 'open' ? 'primary' : 'success'}
                        label={t.status}
                      />
                    </TableCell>
                    <TableCell>
                      {Number(t.flagged_bid_count) > 0 ? (
                        <Chip
                          size="small"
                          color="error"
                          icon={<WarningAmber />}
                          label={
                            isAr
                              ? `تم حظر ${t.flagged_bid_count} عطاء متعارض`
                              : `${t.flagged_bid_count} Conflict Bid Blocked`
                          }
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                          label={isAr ? 'سليم — لا يوجد تعارض' : 'Clean — Verified'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: Land & Hawakeer Dispute Shield */}
      {activeTab === 2 && (
        <Box data-testid="panel-land">
          <Alert severity="warning" sx={{ mb: 2 }}>
            {isAr
              ? 'درع العدالة الانتقالية للأراضي والحواكير: أي قطعة أرض عليها نزاع نزوح أو تزوير تُجمّد تلقائياً ويُرفض نقل ملكيتها برمز (409 Conflict).'
              : 'Transitional-Justice Land & Hawakeer Shield: Parcels under displacement or forged-deed disputes are automatically frozen and reject transfers with HTTP 409 Conflict.'}
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              label={isAr ? 'تصفية حسب الولاية' : 'Filter by State'}
              value={landStateFilter}
              onChange={(e) => setLandStateFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">{isAr ? 'جميع الولايات (18)' : 'All 18 States'}</MenuItem>
              {SUDAN_STATE_CODES.map((st) => (
                <MenuItem key={st.code} value={st.code}>
                  {st.code} — {isAr ? st.nameAr : st.nameEn}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label={isAr ? 'نوع الحيازة' : 'Tenure Type'}
              value={landTenureFilter}
              onChange={(e) => setLandTenureFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">{isAr ? 'جميع أنواع الحيازة' : 'All Tenure Types'}</MenuItem>
              <MenuItem value="freehold">{isAr ? 'ملكية حرة (Freehold)' : 'Freehold'}</MenuItem>
              <MenuItem value="hawakeer_communal">{isAr ? 'حاكورة مجتمعية (Hawakeer)' : 'Customary Hawakeer'}</MenuItem>
              <MenuItem value="leasehold">{isAr ? 'حكر / إيجار (Leasehold)' : 'Leasehold'}</MenuItem>
              <MenuItem value="state_trust">{isAr ? 'أمانة دولة (State Trust)' : 'State Trust'}</MenuItem>
            </TextField>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{isAr ? 'معرف القطعة (Place OID)' : 'Parcel Place OID'}</TableCell>
                  <TableCell>{isAr ? 'المالك / المجتمع' : 'Owner / Community'}</TableCell>
                  <TableCell>{isAr ? 'المحلية' : 'Locality'}</TableCell>
                  <TableCell align="right">{isAr ? 'المساحة (فدان)' : 'Area (Feddan)'}</TableCell>
                  <TableCell>{isAr ? 'نوع الحيازة' : 'Tenure Type'}</TableCell>
                  <TableCell>{isAr ? 'حالة التجميد والنزاع' : 'Dispute Freeze Status'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParcels.map((p) => (
                  <TableRow key={p.id || p.parcel_oid}>
                    <TableCell>
                      <code>{p.parcel_oid}</code>
                    </TableCell>
                    <TableCell>{isAr ? p.owner_name_ar || p.owner_oid : p.owner_name_en || p.owner_oid}</TableCell>
                    <TableCell>{p.locality}</TableCell>
                    <TableCell align="right">{p.area_feddan}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={p.tenure_type === 'hawakeer_communal' ? 'secondary' : 'default'}
                        label={
                          p.tenure_type === 'hawakeer_communal'
                            ? isAr
                              ? 'حاكورة مجتمعية'
                              : 'Hawakeer Communal'
                            : p.tenure_type
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {p.dispute_status === 'clear' ? (
                        <Chip
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                          label={isAr ? 'سليم — قابل للنقل' : 'Clear — Transferable'}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="error"
                          icon={<Lock />}
                          label={isAr ? 'مجمّد (409 نزاع نشط)' : 'Frozen (409 Dispute Shield)'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 3: Citizen Consent Wallet */}
      {activeTab === 3 && (
        <Box data-testid="panel-consent">
          {consentNotice && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setConsentNotice('')}>
              {consentNotice}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            {isAr
              ? 'محفظة موافقات المواطن: لا يحق لأي وزارة قراءة بياناتك دون إيصال موافقة موقّع بـ HMAC-SHA256 ومحدد الغرض والمدة.'
              : 'Citizen Consent Wallet: No ministry may access your records without a time-bounded, purpose-scoped, HMAC-SHA256 signed Consent Receipt.'}
          </Alert>

          <Grid container spacing={2}>
            {consents.map((c) => (
              <Grid item xs={12} md={6} key={c.receipt_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {c.receipt_id}
                      </Typography>
                      <Chip
                        size="small"
                        color={c.status === 'active' ? 'success' : 'default'}
                        label={
                          c.status === 'active'
                            ? isAr
                              ? 'موافقة نشطة'
                              : 'Active'
                            : isAr
                            ? 'تم السحب'
                            : 'Revoked'
                        }
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {isAr ? 'الجهة الطالبة:' : 'Requesting Ministry:'}{' '}
                      <code>{c.requesting_ministry_oid}</code>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {c.purpose}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                      {(Array.isArray(c.scopes) ? c.scopes : []).map((scope) => (
                        <Chip key={scope} size="small" variant="outlined" label={scope} />
                      ))}
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={c.status !== 'active'}
                      onClick={() => handleRevokeConsent(c.receipt_id)}
                      data-testid={`revoke-consent-${c.receipt_id}`}
                    >
                      {isAr ? 'سحب الموافقة فوراً' : 'Revoke Consent'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
