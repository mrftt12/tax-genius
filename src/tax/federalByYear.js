// Federal tax utilities by year (2020–2025)
// NOTE: 2024 values are populated; other years currently fall back to 2024 until official tables are added.

import RAW_TABLES from './fed_data.json';

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

// 2024 baseline (IRS IR-2023-208). Thresholds are the top of each bracket.
const BASE_2024 = {
  brackets: {
    single: [
      { upTo: 11600, rate: 0.10 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    married_joint: [
      { upTo: 23200, rate: 0.10 },
      { upTo: 94300, rate: 0.12 },
      { upTo: 201050, rate: 0.22 },
      { upTo: 383900, rate: 0.24 },
      { upTo: 487450, rate: 0.32 },
      { upTo: 731200, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    married_separate: [
      { upTo: 11600, rate: 0.10 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 365600, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    head_household: [
      // NOTE: These are approximations; replace with official HOH thresholds as needed
      { upTo: 16550, rate: 0.10 },
      { upTo: 63100, rate: 0.12 },
      { upTo: 100500, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243700, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    qualifying_widow: [
      { upTo: 23200, rate: 0.10 },
      { upTo: 94300, rate: 0.12 },
      { upTo: 201050, rate: 0.22 },
      { upTo: 383900, rate: 0.24 },
      { upTo: 487450, rate: 0.32 },
      { upTo: 731200, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  standardDeduction: {
    single: 14600,
    married_separate: 14600,
    married_joint: 29200,
    head_household: 21900,
    qualifying_widow: 29200,
  },
};

// Merge JSON-driven tables with baseline; allow per-year overrides
const fromJson = Object.fromEntries(
  Object.entries(RAW_TABLES).map(([year, tbl]) => {
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
  };
  return acc;
}, {});

function getTables(year) {
  return TABLES[year] || BASE_2024;
}

export function getFederalStandardDeductionByYear(year, status) {
  const tables = getTables(year);
  return tables.standardDeduction[status] ?? tables.standardDeduction.single;
}

export function calculateFederalTaxBeforeCreditsByYear(year, taxableIncome, status = 'single') {
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
  return Math.round(tax);
}

export function calculateFederalTaxByYear(year, taxableIncome, status, options = {}) {
  const beforeCredits = calculateFederalTaxBeforeCreditsByYear(year, taxableIncome, status);
  // Placeholder for credits (e.g., CTC, AOTC, etc.). Add when inputs exist.
  const nonrefundableCredits = 0;
  const afterCredits = Math.max(0, beforeCredits - nonrefundableCredits);
  return { beforeCredits, nonrefundableCredits, afterCredits };
}

export default {
  getFederalStandardDeductionByYear,
  calculateFederalTaxBeforeCreditsByYear,
  calculateFederalTaxByYear,
};
