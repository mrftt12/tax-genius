import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, DollarSign, Receipt, Calculator } from "lucide-react";

export default function ReviewStep({ formData, taxReturn }) {
  const totalIncome = Object.values(formData.income_info || {}).reduce((sum, val) => sum + (val || 0), 0);
  const deductionAmount = formData.deductions?.standard_deduction ? 13850 : 
    Object.values(formData.deductions || {}).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  
  const taxableIncome = Math.max(0, totalIncome - deductionAmount);
  const estimatedTax = calculateEstimatedTax(taxableIncome);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Review Your Tax Information
        </h3>
        <p className="text-gray-600">
          Please verify all information before proceeding
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium">
                {formData.personal_info?.first_name} {formData.personal_info?.last_name}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Filing Status</div>
              <div className="font-medium capitalize">
                {formData.personal_info?.filing_status?.replace('_', ' ')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Income Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="font-semibold">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deductions</span>
              <span className="font-semibold">${deductionAmount.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Taxable Income</span>
              <span>${taxableIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-sm text-emerald-700">Estimated Tax</div>
                <div className="text-2xl font-bold text-emerald-900">
                  ${estimatedTax.toLocaleString()}
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-600">Ready to File</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateEstimatedTax(taxableIncome) {
  // Simplified 2024 tax brackets for single filers
  if (taxableIncome <= 11600) return taxableIncome * 0.10;
  if (taxableIncome <= 47150) return 1160 + (taxableIncome - 11600) * 0.12;
  if (taxableIncome <= 100525) return 5426 + (taxableIncome - 47150) * 0.22;
  if (taxableIncome <= 191950) return 17168.50 + (taxableIncome - 100525) * 0.24;
  if (taxableIncome <= 243725) return 39110.50 + (taxableIncome - 191950) * 0.32;
  if (taxableIncome <= 609350) return 55678.50 + (taxableIncome - 243725) * 0.35;
  return 183647.25 + (taxableIncome - 609350) * 0.37;
}