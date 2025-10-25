import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CaliforniaStep({ data, onChange }) {
  const update = (patch) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">California State Details</h3>
        <p className="text-gray-600">Provide CA residency and withholding info to estimate your state tax.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Residency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Were you a California resident for 2024?</Label>
            <RadioGroup
              value={data.resident ? 'yes' : 'no'}
              onValueChange={(v) => update({ resident: v === 'yes' })}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2">
                <RadioGroupItem id="res-yes" value="yes" />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem id="res-no" value="no" />
                <span>No (part-year resident)</span>
              </label>
            </RadioGroup>
          </div>

          {!data.resident && (
            <div className="space-y-2">
              <Label htmlFor="months_in_ca">Months lived in CA</Label>
              <Input
                id="months_in_ca"
                type="number"
                min="0"
                max="12"
                value={data.months_in_ca ?? 0}
                onChange={(e) => update({ months_in_ca: Number(e.target.value || 0) })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withholding and Contributions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ca_withholding">CA Tax Withheld (W-2, box 17)</Label>
            <Input
              id="ca_withholding"
              type="number"
              min="0"
              step="0.01"
              value={data.ca_withholding ?? ''}
              onChange={(e) => update({ ca_withholding: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sdi_withheld">SDI Withheld (CA SDI)</Label>
            <Input
              id="sdi_withheld"
              type="number"
              min="0"
              step="0.01"
              value={data.sdi_withheld ?? ''}
              onChange={(e) => update({ sdi_withheld: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="adjustments">CA Adjustments (+/-)</Label>
            <Input
              id="adjustments"
              type="number"
              step="0.01"
              value={data.adjustments ?? 0}
              onChange={(e) => update({ adjustments: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Renter's Credit</Label>
            <RadioGroup
              value={data.renters_credit ? 'yes' : 'no'}
              onValueChange={(v) => update({ renters_credit: v === 'yes' })}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2">
                <RadioGroupItem id="rc-yes" value="yes" />
                <span>I paid rent in CA for 6+ months</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem id="rc-no" value="no" />
                <span>No</span>
              </label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
