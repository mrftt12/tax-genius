import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FederalStep({ data, onChange }) {
  const update = (patch) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Federal Taxes</h3>
        <p className="text-gray-600">Enter your federal withholding and any adjustments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withholding</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="federal_withholding">Federal Tax Withheld (W-2, box 2)</Label>
            <Input
              id="federal_withholding"
              type="number"
              min="0"
              step="0.01"
              value={data.withholding ?? ''}
              onChange={(e) => update({ withholding: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="federal_adjustments">Federal Adjustments (+/-)</Label>
            <Input
              id="federal_adjustments"
              type="number"
              step="0.01"
              value={data.adjustments ?? 0}
              onChange={(e) => update({ adjustments: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
