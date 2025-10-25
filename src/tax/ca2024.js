// California 2024 tax utilities (approximate values). Update as needed if FTB publishes new thresholds.

// Brackets per filing status
const BRACKETS = {
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
  // Head of Household (approximate; if precise official brackets differ, update here)
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
  // Qualifying Widow(er) typically follows Married Filing Joint
  qualifying_widow: null, // handled to use married_joint below
};

export function getCAStandardDeduction(status) {
  switch (status) {
    case 'married_joint':
    case 'head_household':
    case 'qualifying_widow':
      return 10726;
    case 'married_separate':
    case 'single':
    default:
      return 5363;
  }
}

export function getCAPersonalExemptionCredit(status) {
  switch (status) {
    case 'married_joint':
    case 'head_household':
    case 'qualifying_widow':
      return 292;
    case 'married_separate':
    case 'single':
    default:
      return 146;
  }
}

// Simplified renter's credit: assumes residency and rent paid >= 6 months
// Income limits vary; use broad approximations or set to Infinity to always allow when flagged
const RENTERS_CREDIT_AMOUNT = {
  single: 60,
  married_separate: 60,
  married_joint: 120,
  head_household: 120,
  qualifying_widow: 120,
};

const RENTERS_CREDIT_INCOME_LIMIT = {
  single: Infinity,
  married_separate: Infinity,
  married_joint: Infinity,
  head_household: Infinity,
  qualifying_widow: Infinity,
};

export function getCARentersCredit(status, isRenter, estimatedAGI) {
  if (!isRenter) return 0;
  const limit = RENTERS_CREDIT_INCOME_LIMIT[status] ?? Infinity;
  if (estimatedAGI > limit) return 0;
  return RENTERS_CREDIT_AMOUNT[status] ?? 0;
}

export function calculateCATaxBeforeCredits(taxableIncome, status = 'single') {
  const brackets = status === 'qualifying_widow' ? BRACKETS.married_joint : BRACKETS[status] || BRACKETS.single;
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
  // Mental Health Services Tax: 1% of income over $1,000,000
  if (taxableIncome > 1_000_000) tax += (taxableIncome - 1_000_000) * 0.01;
  return Math.round(tax);
}

export function calculateCAStateTax(taxableIncome, status, options = {}) {
  const beforeCredits = calculateCATaxBeforeCredits(taxableIncome, status);
  const personalCredit = getCAPersonalExemptionCredit(status);
  const rentersCredit = getCARentersCredit(status, !!options.isRenter, options.estimatedAGI ?? taxableIncome);
  const afterCredits = Math.max(0, beforeCredits - personalCredit - rentersCredit);
  return { beforeCredits, personalCredit, rentersCredit, afterCredits };
}

export default {
  getCAStandardDeduction,
  getCAPersonalExemptionCredit,
  getCARentersCredit,
  calculateCATaxBeforeCredits,
  calculateCAStateTax,
};
