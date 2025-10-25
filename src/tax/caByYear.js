// California tax utilities by year (2020–2024)
// NOTE: 2024 values are from centralized module; prior years currently use 2024 values as placeholders.
// Replace the bracket and deduction tables with official FTB schedules per year as needed.

import RAW_TABLES from './ca_data.json';

const YEARS = [2020, 2021, 2022, 2023, 2024];

const BASE_2024 = {
  brackets: {
    single: [
      { upTo: 10412, rate: 0.01 },
      { upTo: 24684, rate: 0.02 },
      { upTo: 38959, rate: 0.04 },
      { upTo: 54081, rate: 0.06 },
      { upTo: 68350, rate: 0.08 },
      { upTo: 349137, rate: 0.093 },
      { upTo: 418961, rate: 0.1023 },
      { upTo: 698271, rate: 0.113 },
      { upTo: Infinity, rate: 0.123 },
    ],
    married_joint: [
      { upTo: 20824, rate: 0.01 },
      { upTo: 49368, rate: 0.02 },
      { upTo: 77918, rate: 0.04 },
      { upTo: 108162, rate: 0.06 },
      { upTo: 136700, rate: 0.08 },
      { upTo: 698274, rate: 0.093 },
      { upTo: 837922, rate: 0.1023 },
      { upTo: 1396542, rate: 0.113 },
      { upTo: Infinity, rate: 0.123 },
    ],
    head_household: [
      { upTo: 20824, rate: 0.01 },
      { upTo: 32815, rate: 0.02 },
      { upTo: 42792, rate: 0.04 },
      { upTo: 54081, rate: 0.06 },
      { upTo: 68350, rate: 0.08 },
      { upTo: 349137, rate: 0.093 },
      { upTo: 418961, rate: 0.1023 },
      { upTo: 698271, rate: 0.113 },
      { upTo: Infinity, rate: 0.123 },
    ],
  },
  standardDeduction: {
    single: 5363,
    married_separate: 5363,
    married_joint: 10726,
    head_household: 10726,
    qualifying_widow: 10726,
  },
  personalExemptionCredit: {
    single: 146,
    married_separate: 146,
    married_joint: 292,
    head_household: 292,
    qualifying_widow: 292,
  },
  rentersCreditAmount: {
    single: 60,
    married_separate: 60,
    married_joint: 120,
    head_household: 120,
    qualifying_widow: 120,
  },
  rentersCreditIncomeLimit: {
    single: Infinity,
    married_separate: Infinity,
    married_joint: Infinity,
    head_household: Infinity,
    qualifying_widow: Infinity,
  },
};

// Merge JSON-driven tables, with 2024 as baseline fallback
const fromJson = Object.fromEntries(
  Object.entries(RAW_TABLES).map(([year, tbl]) => {
    // normalize Infinity/null in JSON
    const norm = (v) => (v === null ? Infinity : v);
    const normalizeBrackets = (b) =>
      Object.fromEntries(
        Object.entries(b || {}).map(([status, arr]) => [
          status,
          (arr || []).map(({ upTo, rate }) => ({ upTo: upTo === null ? Infinity : upTo, rate })),
        ])
      );
    return [
      Number(year),
      {
        brackets: normalizeBrackets(tbl.brackets),
        standardDeduction: tbl.standardDeduction || {},
        personalExemptionCredit: tbl.personalExemptionCredit || {},
        rentersCreditAmount: tbl.rentersCreditAmount || {},
        rentersCreditIncomeLimit: Object.fromEntries(
          Object.entries(tbl.rentersCreditIncomeLimit || {}).map(([k, v]) => [k, norm(v)])
        ),
      },
    ];
  })
);

const TABLES = YEARS.reduce((acc, y) => {
  const base = BASE_2024;
  const override = fromJson[y] || {};
  acc[y] = {
    brackets: { ...base.brackets, ...(override.brackets || {}) },
    standardDeduction: { ...base.standardDeduction, ...(override.standardDeduction || {}) },
    personalExemptionCredit: { ...base.personalExemptionCredit, ...(override.personalExemptionCredit || {}) },
    rentersCreditAmount: { ...base.rentersCreditAmount, ...(override.rentersCreditAmount || {}) },
    rentersCreditIncomeLimit: { ...base.rentersCreditIncomeLimit, ...(override.rentersCreditIncomeLimit || {}) },
  };
  return acc;
}, {});

function getTables(year) {
  return TABLES[year] || BASE_2024;
}

export function getCAStandardDeductionByYear(year, status) {
  const tables = getTables(year);
  return tables.standardDeduction[status] ?? tables.standardDeduction.single;
}

export function getCAPersonalExemptionCreditByYear(year, status) {
  const tables = getTables(year);
  return tables.personalExemptionCredit[status] ?? tables.personalExemptionCredit.single;
}

export function getCARentersCreditByYear(year, status, isRenter, estimatedAGI) {
  if (!isRenter) return 0;
  const tables = getTables(year);
  const limit = tables.rentersCreditIncomeLimit[status] ?? Infinity;
  if (estimatedAGI > limit) return 0;
  return tables.rentersCreditAmount[status] ?? 0;
}

export function calculateCATaxBeforeCreditsByYear(year, taxableIncome, status = 'single') {
  const tables = getTables(year);
  const brackets = status === 'qualifying_widow' ? tables.brackets.married_joint : tables.brackets[status] || tables.brackets.single;
  let remaining = taxableIncome;
  let prev = 0;
  let tax = 0;
  for (const b of brackets) {
    const amount = Math.max(0, Math.min(remaining, b.upTo - prev));
    tax += amount * b.rate;
    remaining -= amount;
    prev = b.upTo;
    if (remaining <= 0) break;
  }
  if (taxableIncome > 1_000_000) tax += (taxableIncome - 1_000_000) * 0.01; // MHST 1%
  return Math.round(tax);
}

export function calculateCAStateTaxByYear(year, taxableIncome, status, options = {}) {
  const beforeCredits = calculateCATaxBeforeCreditsByYear(year, taxableIncome, status);
  const personalCredit = getCAPersonalExemptionCreditByYear(year, status);
  const rentersCredit = getCARentersCreditByYear(year, status, !!options.isRenter, options.estimatedAGI ?? taxableIncome);
  const afterCredits = Math.max(0, beforeCredits - personalCredit - rentersCredit);
  return { beforeCredits, personalCredit, rentersCredit, afterCredits };
}

export default {
  getCAStandardDeductionByYear,
  getCAPersonalExemptionCreditByYear,
  getCARentersCreditByYear,
  calculateCATaxBeforeCreditsByYear,
  calculateCAStateTaxByYear,
};
