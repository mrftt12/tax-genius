import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married Filing Jointly' },
  { value: 'married_separate', label: 'Married Filing Separately' },
  { value: 'head_household', label: 'Head of Household' },
  { value: 'qualifying_widow', label: 'Qualifying Widow(er)' }
];

export default function PersonalInfoStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={data.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={data.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ssn">Social Security Number</Label>
          <Input
            id="ssn"
            value={data.ssn || ''}
            onChange={(e) => handleChange('ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filing_status">Filing Status</Label>
        <Select
          value={data.filing_status || ''}
          onValueChange={(value) => handleChange('filing_status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your filing status" />
          </SelectTrigger>
          <SelectContent>
            {FILING_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Address</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Los Angeles"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code</Label>
            <Input
              id="zip_code"
              value={data.zip_code || ''}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="90210"
            />
          </div>
        </div>
      </div>
    </div>
  );
}