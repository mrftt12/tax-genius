import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Building, TrendingUp, Briefcase } from "lucide-react";

const INCOME_FIELDS = [
  {
    key: 'wages',
    label: 'Wages (W-2)',
    placeholder: '0.00',
    description: 'Income from employment, box 1 of W-2',
    icon: Building
  },
  {
    key: 'interest',
    label: 'Interest Income',
    placeholder: '0.00',
    description: 'Bank interest, savings accounts',
    icon: TrendingUp
  },
  {
    key: 'dividends',
    label: 'Dividend Income',
    placeholder: '0.00',
    description: 'Stock dividends, investment income',
    icon: TrendingUp
  },
  {
    key: 'business_income',
    label: 'Business Income',
    placeholder: '0.00',
    description: 'Self-employment, Schedule C income',
    icon: Briefcase
  },
  {
    key: 'capital_gains',
    label: 'Capital Gains',
    placeholder: '0.00',
    description: 'Investment sales, stock transactions',
    icon: TrendingUp
  },
  {
    key: 'other_income',
    label: 'Other Income',
    placeholder: '0.00',
    description: 'Retirement, unemployment, other sources',
    icon: DollarSign
  }
];

export default function IncomeStep({ data, onChange }) {
  const handleChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    onChange({ [field]: numericValue });
  };

  const totalIncome = INCOME_FIELDS.reduce((sum, field) => {
    return sum + (data[field.key] || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          What was your total income?
        </h3>
        <p className="text-gray-600">
          Enter all sources of income for the tax year
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INCOME_FIELDS.map((field) => (
          <Card key={field.key} className="border border-gray-200 hover:border-emerald-300 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <field.icon className="w-5 h-5 text-emerald-600" />
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
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="pl-10 text-lg font-medium"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-emerald-800">Total Income</h3>
              <p className="text-emerald-600">Sum of all income sources</p>
            </div>
            <div className="text-3xl font-bold text-emerald-700">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}