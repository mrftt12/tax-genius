import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Edit, DollarSign, ArrowRight } from "lucide-react";

export default function TaxReturnCard({ taxReturn, getProgressPercent, getStatusColor }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                {taxReturn.tax_year} Tax Return
              </CardTitle>
              <p className="text-gray-500">
                {taxReturn.state === 'CA' ? 'California' : 'Federal'} • 
                {taxReturn.personal_info?.filing_status ? 
                  ` ${taxReturn.personal_info.filing_status.replace('_', ' ')}` : 
                  ' Status not set'
                }
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(taxReturn.status)}>
            {taxReturn.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm text-gray-500">
              {getProgressPercent(taxReturn.status)}%
            </span>
          </div>
          <Progress 
            value={getProgressPercent(taxReturn.status)} 
            className="h-2"
          />
        </div>
        
        {taxReturn.calculated_tax && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Estimated Tax</span>
            </div>
            <span className="font-bold text-emerald-600">
              ${taxReturn.calculated_tax.total_tax?.toFixed(2) || '0.00'}
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Link to={createPageUrl("Interview")} className="flex-1">
            <Button variant="outline" className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </Link>
          <Link to={createPageUrl("Review")} className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}