import React, { useState, useEffect } from "react";
import { TaxReturn } from "@/entities/all";
import supabase from "@/integrations/supabaseClient.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calculator, FileText, DollarSign, CheckCircle, Edit, Trash2 } from "lucide-react";
import { getCAStandardDeductionByYear, calculateCAStateTaxByYear } from "@/src/tax/caByYear.js";
import { getFederalStandardDeductionByYear, calculateFederalTaxByYear } from "@/src/tax/federalByYear.js";

export default function Review() {
  const [taxReturn, setTaxReturn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTaxReturn();
  }, []);

  const loadTaxReturn = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const { data: auth } = await supabase.auth.getUser();
      const supaUser = auth?.user;
      const filters = { tax_year: currentYear };
      if (supaUser?.id) filters.user_id = supaUser.id;
      const returns = await TaxReturn.filter(filters, '-updated_at', 1);
      
      if (returns.length > 0) {
        setTaxReturn(returns[0]);
      }
    } catch (error) {
      console.error("Error loading tax return:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tax return...</p>
        </div>
      </div>
    );
  }

  if (!taxReturn) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Tax Return Found</h2>
            <p className="text-gray-600 mb-6">Start by creating a new tax return.</p>
            <Link to={createPageUrl("Interview")}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Start Tax Interview
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!taxReturn) return;
    if (!confirm('Delete this tax return? This cannot be undone.')) return;
    try {
      await taxReturn.delete();
      setTaxReturn(null);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const totalIncome = Object.values(taxReturn.income_info || {}).reduce((sum, val) => sum + (val || 0), 0);
  const filingStatus = taxReturn.personal_info?.filing_status || 'single';
  const year = taxReturn.tax_year || new Date().getFullYear();
  const caStd = getCAStandardDeductionByYear(year, filingStatus);
  const fedStd = getFederalStandardDeductionByYear(year, filingStatus);
  const itemized = Object.entries(taxReturn.deductions || {})
    .filter(([k]) => k !== 'standard_deduction')
    .reduce((sum, [_, v]) => sum + (typeof v === 'number' ? v : 0), 0);
  const useStd = taxReturn.deductions?.standard_deduction !== false;
  const caDeductionAmount = useStd ? caStd : itemized;
  const fedDeductionAmount = useStd ? fedStd : itemized;
  const caAdj = Number(taxReturn.ca?.adjustments || 0);
  const taxableIncomeCA = Math.max(0, totalIncome - caDeductionAmount + caAdj);
  const taxableIncomeFederal = Math.max(0, totalIncome - fedDeductionAmount);
  const caWithheld = Number(taxReturn.ca?.ca_withholding || 0);
  const caState = calculateCAStateTaxByYear(year, taxableIncomeCA, filingStatus, {
    isRenter: !!taxReturn.ca?.renters_credit,
    estimatedAGI: totalIncome,
  });
  const caTaxRaw = caState.beforeCredits;
  const caTaxNet = caState.afterCredits;
  const caRefund = caWithheld - caTaxNet; // positive => refund, negative => due
  const federal = calculateFederalTaxByYear(year, taxableIncomeFederal, filingStatus);
  const federalWithheld = Number(taxReturn.federal?.withholding || 0);
  const federalRefund = federalWithheld - federal.afterCredits;
  const caSDI = Number(taxReturn.ca?.sdi_withheld || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Calculate</h1>
          <p className="text-sm text-gray-500">Tax Year: <span className="font-medium">{year}</span></p>
          <p className="text-gray-600">
            Review your tax information and see your estimated tax liability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <DollarSign className="w-5 h-5" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Calculator className="w-5 h-5" />
                CA Deductions {useStd ? '(Standard)' : '(Itemized)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${caDeductionAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-emerald-50 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                Taxable Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">${taxableIncomeCA.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Federal Tax Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Federal Tax (before credits)</span>
                <span className="font-semibold text-lg">${federal.beforeCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Nonrefundable Credits</span>
                <span className="font-semibold text-lg">-${federal.nonrefundableCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Federal Tax (after credits)</span>
                <span className="font-semibold text-lg">${federal.afterCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Federal Deduction Used</span>
                <span className="font-semibold text-lg">${fedDeductionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Taxable Income (Federal)</span>
                <span className="font-semibold text-lg">${taxableIncomeFederal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Federal Withholding</span>
                <span className="font-semibold text-lg">-${federalWithheld.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-4 bg-emerald-50 px-4 rounded-lg">
                <span className="font-bold text-lg">{federalRefund >= 0 ? 'Estimated Federal Refund' : 'Federal Amount Due'}</span>
                <span className="font-bold text-2xl text-emerald-700">${Math.abs(federalRefund).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>California Tax Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">CA Tax (before credits)</span>
                <span className="font-semibold text-lg">${caTaxRaw.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Personal Exemption Credit</span>
                <span className="font-semibold text-lg">-${caState.personalCredit.toLocaleString()}</span>
              </div>
              {taxReturn.ca?.renters_credit && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Renter's Credit</span>
                  <span className="font-semibold text-lg">-${caState.rentersCredit.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">CA Tax (after credits)</span>
                <span className="font-semibold text-lg">${caTaxNet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">CA Withholding</span>
                <span className="font-semibold text-lg">-${caWithheld.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-4 bg-emerald-50 px-4 rounded-lg">
                <span className="font-bold text-lg">{caRefund >= 0 ? 'Estimated Refund' : 'Amount Due'}</span>
                <span className="font-bold text-2xl text-emerald-700">${Math.abs(caRefund).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("Interview")}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tax Return
                </Button>
              </Link>
              <Button variant="destructive" className="w-full justify-start bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Tax Return
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>California Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Residency</span><span className="font-medium">{taxReturn.ca?.resident ? 'Resident' : 'Part-year'}</span></div>
              {!taxReturn.ca?.resident && (
                <div className="flex justify-between"><span className="text-gray-600">Months in CA</span><span className="font-medium">{taxReturn.ca?.months_in_ca ?? 0}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-600">CA Withholding</span><span className="font-medium">${caWithheld.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">SDI Withheld</span><span className="font-medium">${caSDI.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">CA Adjustments</span><span className="font-medium">${caAdj.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}