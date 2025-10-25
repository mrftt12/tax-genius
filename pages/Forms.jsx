import React, { useState, useEffect } from "react";
import { TaxReturn } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer, CheckCircle } from "lucide-react";

export default function Forms() {
  const [taxReturn, setTaxReturn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTaxReturn();
  }, []);

  const loadTaxReturn = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const returns = await TaxReturn.filter({ tax_year: currentYear }, '-created_date', 1);
      
      if (returns.length > 0) {
        setTaxReturn(returns[0]);
      }
    } catch (error) {
      console.error("Error loading tax return:", error);
    }
    setIsLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tax forms...</p>
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
            <p className="text-gray-600">Please complete the tax interview first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalIncome = Object.values(taxReturn.income_info || {}).reduce((sum, val) => sum + (val || 0), 0);
  const deductionAmount = taxReturn.deductions?.standard_deduction ? 13850 : 
    Object.values(taxReturn.deductions || {}).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  const taxableIncome = Math.max(0, totalIncome - deductionAmount);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Forms</h1>
            <p className="text-gray-600">Your completed tax return forms ready to print</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Forms
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-emerald-50 border-emerald-200 print:hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="text-xl font-semibold text-emerald-800">
                  Tax Return Completed
                </h3>
                <p className="text-emerald-700">
                  Your {taxReturn.tax_year} tax forms are ready. Review and print below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Federal Form 1040 */}
        <Card className="mb-8 shadow-lg border-2 border-gray-300 print:shadow-none print:border">
          <CardHeader className="bg-gray-50 border-b-2 border-gray-300">
            <CardTitle className="text-center">
              <div className="text-2xl font-bold">Form 1040</div>
              <div className="text-lg font-normal text-gray-600">
                U.S. Individual Income Tax Return
              </div>
              <div className="text-base font-normal text-gray-500">
                Tax Year {taxReturn.tax_year}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">First Name</div>
                  <div className="font-medium">{taxReturn.personal_info?.first_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last Name</div>
                  <div className="font-medium">{taxReturn.personal_info?.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Social Security Number</div>
                  <div className="font-medium">{taxReturn.personal_info?.ssn || '***-**-****'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Filing Status</div>
                  <div className="font-medium capitalize">
                    {taxReturn.personal_info?.filing_status?.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">
                  {taxReturn.personal_info?.address}<br />
                  {taxReturn.personal_info?.city}, CA {taxReturn.personal_info?.zip_code}
                </div>
              </div>
            </div>

            <Separator />

            {/* Income Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Income</h3>
              <div className="space-y-2">
                {Object.entries(taxReturn.income_info || {}).map(([key, value]) => {
                  if (value && value > 0) {
                    return (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
                <span>Total Income</span>
                <span>${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}