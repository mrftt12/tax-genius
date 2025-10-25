import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Home, Heart, GraduationCap, DollarSign } from "lucide-react";

const ITEMIZED_FIELDS = [
  {
    key: 'charitable_contributions',
    label: 'Charitable Contributions',
    placeholder: '0.00',
    description: 'Donations to qualified charities',
    icon: Heart
  },
  {
    key: 'mortgage_interest',
    label: 'Mortgage Interest',
    placeholder: '0.00',
    description: 'Home mortgage interest payments',
    icon: Home
  },
  {
    key: 'state_local_taxes',
    label: 'State & Local Taxes',
    placeholder: '0.00',
    description: 'Property taxes, state income taxes (up to $10,000)',
    icon: DollarSign
  },
  {
    key: 'medical_expenses',
    label: 'Medical & Dental Expenses',
    placeholder: '0.00',
    description: 'Unreimbursed medical expenses',
    icon: GraduationCap
  }
];

export default function DeductionsStep({ data, onChange }) {
  const handleDeductionTypeChange = (isStandard) => {
    onChange({ standard_deduction: isStandard });
  };

  const handleItemizedChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    onChange({ [field]: numericValue });
  };

  const totalItemized = ITEMIZED_FIELDS.reduce((sum, field) => {
    return sum + (data[field.key] || 0);
  }, 0);

  const standardAmount = 13850; // 2023 standard deduction for single filers

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Choose Your Deduction Method
        </h3>
        <p className="text-gray-600">
          We'll help you maximize your tax savings
        </p>
      </div>

      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-lg">Deduction Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.standard_deduction ? 'standard' : 'itemized'}
            onValueChange={(value) => handleDeductionTypeChange(value === 'standard')}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="standard" id="standard" />
              <div className="flex-1">
                <Label htmlFor="standard" className="font-medium">
                  Standard Deduction
                </Label>
                <p className="text-sm text-gray-500">
                  Claim ${standardAmount.toLocaleString()} automatically
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600">
                  ${standardAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="itemized" id="itemized" />
              <div className="flex-1">
                <Label htmlFor="itemized" className="font-medium">
                  Itemized Deductions
                </Label>
                <p className="text-sm text-gray-500">
                  List specific deductible expenses
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600">
                  ${totalItemized.toLocaleString()}
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {!data.standard_deduction && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Itemized Deductions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ITEMIZED_FIELDS.map((field) => (
                <Card key={field.key} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <field.icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      {field.label}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{field.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data[field.key] || ''}
                        onChange={(e) => handleItemizedChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-blue-800">Total Itemized</h4>
                    <p className="text-sm text-blue-600">
                      {totalItemized > standardAmount ? 
                        `Save $${(totalItemized - standardAmount).toLocaleString()} vs standard` :
                        'Consider standard deduction instead'
                      }
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    ${totalItemized.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}