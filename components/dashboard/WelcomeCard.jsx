import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

export default function WelcomeCard({ user }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <Card className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl border-0">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {user?.full_name || 'Tax Filer'}!
            </h1>
            <p className="text-emerald-100 text-lg">
              Ready to prepare your {currentYear} tax return with AI assistance?
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Calendar className="w-4 h-4 mr-2" />
              Tax Year {currentYear}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <User className="w-4 h-4 mr-2" />
              California Resident
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}