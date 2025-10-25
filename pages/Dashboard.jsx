import React, { useState, useEffect } from "react";
import { TaxReturn, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  FileText, 
  Calculator, 
  CheckCircle, 
  Clock, 
  DollarSign,
  AlertTriangle
} from "lucide-react";

import WelcomeCard from "../components/dashboard/WelcomeCard.jsx";
import TaxReturnCard from "../components/dashboard/TaxReturnCard.jsx";
import QuickActions from "../components/dashboard/QuickActions.jsx";

export default function Dashboard() {
  const [taxReturns, setTaxReturns] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
  const returns = await TaxReturn.list('-created_at');
      setTaxReturns(returns);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getProgressPercent = (status) => {
    switch (status) {
      case 'draft': return 10;
      case 'in_progress': return 50;
      case 'review': return 85;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <WelcomeCard user={currentUser} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Tax Returns</h2>
              <Link to={createPageUrl("Interview")}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Tax Return
                </Button>
              </Link>
            </div>

            {taxReturns.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Tax Returns Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first tax return for this year.
                  </p>
                  <Link to={createPageUrl("Interview")}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Tax Return
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {taxReturns.map((taxReturn) => (
                  <TaxReturnCard 
                    key={taxReturn.id} 
                    taxReturn={taxReturn}
                    getProgressPercent={getProgressPercent}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <QuickActions />

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <AlertTriangle className="w-5 h-5" />
                  Tax Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">
                    Federal Tax Deadline: April 15, 2024
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Don't forget to file your federal tax return
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">
                    CA State Tax Deadline: April 15, 2024
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    California state tax return due date
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}