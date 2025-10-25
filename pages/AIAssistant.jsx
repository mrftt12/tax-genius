
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, TaxReturn, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User as UserIcon, Loader2 } from "lucide-react";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaxReturn, setCurrentTaxReturn] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    loadCurrentTaxReturn();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const chatHistory = await ChatMessage.list('-created_date', 50);
      setMessages(chatHistory.reverse());
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const loadCurrentTaxReturn = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const returns = await TaxReturn.filter({ tax_year: currentYear }, '-created_date', 1);
      if (returns.length > 0) {
        setCurrentTaxReturn(returns[0]);
      }
    } catch (error) {
      console.error("Error loading tax return:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      role: "user",
      message: userMessage,
      created_date: new Date().toISOString(),
      tax_return_id: currentTaxReturn?.id
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Save user message
      await ChatMessage.create(newUserMessage);

      // Create context for the AI
      const context = {
        currentTaxYear: new Date().getFullYear(),
        taxReturnData: currentTaxReturn,
        userState: "California"
      };

      // Generate AI response
      const aiResponse = await InvokeLLM({
        prompt: `You are TaxGenius AI, an expert tax preparation assistant. Help users with tax-related questions, calculations, and guidance.

Current context:
- Tax Year: ${context.currentTaxYear}
- State: California
- User's tax return data: ${JSON.stringify(context.taxReturnData, null, 2)}

User question: ${userMessage}

Provide helpful, accurate tax advice. Be specific about California tax rules when relevant. If you need more information, ask clarifying questions. Always remind users to consult a tax professional for complex situations.`,
        add_context_from_internet: true
      });

      const assistantMessage = {
        role: "assistant",
        message: aiResponse,
        created_date: new Date().toISOString(),
        tax_return_id: currentTaxReturn?.id,
        context: context
      };

      setMessages(prev => [...prev, assistantMessage]);
      await ChatMessage.create(assistantMessage);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        message: "I'm sorry, I encountered an error. Please try again.",
        created_date: new Date().toISOString(),
        tax_return_id: currentTaxReturn?.id
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What deductions can I claim in California?",
    "How is my tax calculated?",
    "What documents do I need for my tax return?",
    "Can I deduct home office expenses?",
    "What's the difference between standard and itemized deductions?"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tax Assistant</h1>
          <p className="text-gray-600">
            Get expert tax advice and guidance powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-700">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 text-sm whitespace-normal"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">TaxGenius AI</CardTitle>
                      <p className="text-emerald-100 text-sm">Your AI Tax Expert</p>
                    </div>
                  </div>
                  {currentTaxReturn && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {currentTaxReturn.tax_year} Tax Return
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Welcome to TaxGenius AI!
                    </h3>
                    <p className="text-gray-500">
                      Ask me anything about your taxes, deductions, or tax preparation.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] flex gap-3">
                      <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 bg-gray-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>TaxGenius is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your taxes..."
                    className="flex-1 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
