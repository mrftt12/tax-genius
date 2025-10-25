import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, Upload, Calculator, CheckSquare } from "lucide-react";

const quickActions = [
  {
    title: "Ask AI Assistant",
    description: "Get tax advice and guidance",
    icon: MessageSquare,
    href: "AIAssistant",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Upload Documents",
    description: "Add W-2s, 1099s, receipts",
    icon: Upload,
    href: "Documents",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "Tax Calculator",
    description: "Estimate your refund",
    icon: Calculator,
    href: "Review",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Review & File",
    description: "Final review and print",
    icon: CheckSquare,
    href: "Forms",
    color: "text-orange-600",
    bg: "bg-orange-50"
  }
];

export default function QuickActions() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-emerald-700">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Link key={index} to={createPageUrl(action.href)}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-4 hover:bg-gray-50"
            >
              <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center mr-3`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}