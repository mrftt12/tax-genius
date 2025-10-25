import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TaxReturn, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import supabase from "@/integrations/supabaseClient.js";
import { getCAStandardDeductionByYear, calculateCAStateTaxByYear } from "@/src/tax/caByYear.js";
import { getFederalStandardDeductionByYear, calculateFederalTaxByYear } from "@/src/tax/federalByYear.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import PersonalInfoStep from "../components/interview/PersonalStep.jsx";
import IncomeStep from "../components/interview/IncomeStep.jsx";
import DeductionsStep from "../components/interview/DeductionStep.jsx";
import ReviewStep from "../components/interview/ReviewStep.jsx";
import CaliforniaStep from "../components/interview/CaliforniaStep.jsx";
import FederalStep from "../components/interview/FederalStep.jsx";

const STEPS = [
  { id: 'personal', title: 'Personal Information', description: 'Basic info and filing status' },
  { id: 'income', title: 'Income Sources', description: 'W-2s, 1099s, and other income' },
  { id: 'deductions', title: 'Deductions & Credits', description: 'Itemized or standard deductions' },
  { id: 'federal', title: 'Federal', description: 'Federal withholding and adjustments' },
  { id: 'california', title: 'California State', description: 'CA-specific info (withholding, residency)' },
  { id: 'review', title: 'Review', description: 'Verify all information' }
];

export default function Interview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [taxReturn, setTaxReturn] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    personal_info: {},
    income_info: {},
    deductions: { standard_deduction: true },
    federal: { withholding: 0, adjustments: 0 },
    ca: { resident: true, months_in_ca: 12, ca_withholding: 0, sdi_withheld: 0, adjustments: 0, renters_credit: false }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeTaxReturn(selectedYear);
  }, [selectedYear]);

  const initializeTaxReturn = async (year) => {
    try {
      // reset local state first to avoid stale data bleed
      setTaxReturn(null);
      setFormData({
        personal_info: {},
        income_info: {},
        deductions: { standard_deduction: true },
        federal: { withholding: 0, adjustments: 0 },
        ca: { resident: true, months_in_ca: 12, ca_withholding: 0, sdi_withheld: 0, adjustments: 0, renters_credit: false }
      });
      setCurrentStep(0);

      const { data: auth } = await supabase.auth.getUser();
      const supaUser = auth?.user;
      const user = await User.me();
      const currentYear = year || new Date().getFullYear();
      const filters = { tax_year: currentYear };
      if (supaUser?.id) filters.user_id = supaUser.id;
      // fetch more than 1 to decide whether to create fresh or reuse
      const returns = await TaxReturn.filter(filters, '-updated_at');
      
      if (returns.length > 0) {
        // Prefer a non-completed return if any; else fall back to most recently updated
        const existingReturn = returns.find(r => r.status !== 'completed') || returns[0];
        setTaxReturn(existingReturn);
        setFormData({
          personal_info: existingReturn.personal_info || {},
          income_info: existingReturn.income_info || {},
          deductions: existingReturn.deductions || { standard_deduction: true },
          federal: existingReturn.federal || { withholding: 0, adjustments: 0 },
          ca: existingReturn.ca || { resident: true, months_in_ca: 12, ca_withholding: 0, sdi_withheld: 0, adjustments: 0, renters_credit: false }
        });
      } else {
        const name = user.name || '';
        const firstName = name.split(' ')[0] || '';
        const lastName = name.split(' ').slice(1).join(' ') || '';
        const payload = {
          tax_year: currentYear,
          state: 'CA',
          status: 'draft',
          personal_info: {
            first_name: firstName,
            last_name: lastName
          }
        };
        if (supaUser?.id) payload.user_id = supaUser.id;
        const newReturn = await TaxReturn.create(payload);
        setTaxReturn(newReturn);
        setFormData({
          personal_info: newReturn.personal_info || {},
          income_info: {},
          deductions: { standard_deduction: true },
          federal: { withholding: 0, adjustments: 0 },
          ca: { resident: true, months_in_ca: 12, ca_withholding: 0, sdi_withheld: 0, adjustments: 0, renters_credit: false }
        });
      }
    } catch (error) {
      console.error("Error initializing tax return:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      await saveProgress();
      setCurrentStep(currentStep + 1);
    } else {
      await completeReturn();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProgress = async () => {
    if (!taxReturn) return;
    
    setIsSaving(true);
    try {
      const updatedStatus = currentStep === STEPS.length - 1 ? 'review' : 'in_progress';
      const updated = await taxReturn.update({
        ...formData,
        status: updatedStatus,
        tax_year: selectedYear,
      });
      setTaxReturn(updated);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
    setIsSaving(false);
  };

  const completeReturn = async () => {
    if (!taxReturn) return;
    
    setIsSaving(true);
    try {
      const totalIncome = Object.values(formData.income_info || {}).reduce((sum, val) => sum + (val || 0), 0);
      const filingStatus = formData.personal_info?.filing_status || 'single';
      // Deductions (generic itemized toggle, but standard differs by jurisdiction)
      const caStdDed = getCAStandardDeductionByYear(selectedYear, filingStatus);
      const fedStdDed = getFederalStandardDeductionByYear(selectedYear, filingStatus);
      const itemized = Object.entries(formData.deductions || {})
        .filter(([k]) => k !== 'standard_deduction')
        .reduce((sum, [_, v]) => sum + (typeof v === 'number' ? v : 0), 0);
      const useStd = formData.deductions?.standard_deduction !== false;
      const caDeductionAmount = useStd ? caStdDed : itemized;
      const fedDeductionAmount = useStd ? fedStdDed : itemized;
      
  const taxableIncomeFederal = Math.max(0, totalIncome - fedDeductionAmount + (formData.federal?.adjustments || 0));
      const taxableIncomeCA = Math.max(0, totalIncome - caDeductionAmount + (formData.ca?.adjustments || 0));

      const federal = calculateFederalTaxByYear(selectedYear, taxableIncomeFederal, filingStatus);
      const caState = calculateCAStateTaxByYear(selectedYear, taxableIncomeCA, filingStatus, {
        isRenter: !!formData.ca?.renters_credit,
        estimatedAGI: totalIncome, // rough proxy
      });
  const caTax = caState.afterCredits;
  const withholdingCA = Number(formData.ca?.ca_withholding || 0);
  const withholdingFed = Number(formData.federal?.withholding || 0);
  const refundOwed = withholdingCA - caTax; // positive => refund; negative => due (CA only for backward compat)
  const federalRefundOwed = withholdingFed - federal.afterCredits;
      
      const updated = await taxReturn.update({
        ...formData,
        status: 'completed',
        tax_year: selectedYear,
        calculated_tax: {
          federal_tax: federal.afterCredits,
          state_tax: caTax,
          total_tax: federal.afterCredits + caTax,
          refund_owed: refundOwed,
          federal_refund_owed: federalRefundOwed,
          withholdings: { federal: withholdingFed, california: withholdingCA },
          breakdown: {
            federal: { ...federal, taxableIncome: taxableIncomeFederal, deductionUsed: fedDeductionAmount },
            california: { ...caState, taxableIncome: taxableIncomeCA, deductionUsed: caDeductionAmount }
          }
        }
      });
  setTaxReturn(updated);
  navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error completing return:", error);
    }
    setIsSaving(false);
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const renderCurrentStep = () => {
    const stepId = STEPS[currentStep].id;

    switch (stepId) {
      case 'personal':
        return <PersonalInfoStep data={formData.personal_info} onChange={(data) => updateFormData('personal_info', data)} />;
      case 'income':
        return <IncomeStep data={formData.income_info} onChange={(data) => updateFormData('income_info', data)} />;
      case 'deductions':
        return <DeductionsStep data={formData.deductions} onChange={(data) => updateFormData('deductions', data)} />;
      case 'california':
        return <CaliforniaStep data={formData.ca} onChange={(data) => updateFormData('ca', data)} />;
      case 'federal':
        return <FederalStep data={formData.federal} onChange={(data) => updateFormData('federal', data)} />;
      case 'review':
        return <ReviewStep formData={formData} taxReturn={taxReturn} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Interview</h1>
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-600">Let's gather your tax information step by step</p>
            <div className="w-48">
              <label className="block text-sm text-gray-600 mb-1">Tax Year</label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</div>
            <Badge>{taxReturn?.status || 'draft'}</Badge>
          </div>
          <Progress value={((currentStep + 1) / STEPS.length) * 100} />
        </div>

        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}