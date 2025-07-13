
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, MessageCircle, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  customer_name: string;
  message: string;
  response: string;
  created_at: string;
}

interface OwnerDashboardProps {
  onClose: () => void;
}

const OwnerDashboard = ({ onClose }: OwnerDashboardProps) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      // Calculate 48 hours ago
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .gte('created_at', fortyEightHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        // If table doesn't exist, show empty state
        setChats([]);
      } else {
        setChats(data || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group chats by customer name
  const groupedChats = chats.reduce((acc, chat) => {
    if (!acc[chat.customer_name]) {
      acc[chat.customer_name] = [];
    }
    acc[chat.customer_name].push(chat);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  const customerNames = Object.keys(groupedChats);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 h-[80vh]">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p>Loading chat history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl mx-4 h-[90vh]">
        <CardHeader className="relative border-b">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Owner Dashboard - Chat History (Last 48 Hours)
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Total conversations: {customerNames.length} customers, {chats.length} messages
          </p>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Customer List */}
            <div className="w-1/3 border-r">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold">Customers</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="p-2">
                  {customerNames.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No chats in the last 48 hours</p>
                    </div>
                  ) : (
                    customerNames.map((customerName) => (
                      <Button
                        key={customerName}
                        variant={selectedCustomer === customerName ? "default" : "ghost"}
                        className="w-full justify-start mb-2 h-auto p-3"
                        onClick={() => setSelectedCustomer(customerName)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <p className="font-medium truncate">{customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {groupedChats[customerName].length} messages
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {groupedChats[customerName].length}
                          </Badge>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Messages */}
            <div className="flex-1">
              {selectedCustomer ? (
                <>
                  <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedCustomer}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {groupedChats[selectedCustomer].length} messages
                    </p>
                  </div>
                  <ScrollArea className="flex-1 h-full">
                    <div className="p-4 space-y-4">
                      {groupedChats[selectedCustomer].map((chat) => (
                        <div key={chat.id} className="space-y-3">
                          {/* User Message */}
                          <div className="flex justify-end">
                            <div className="bg-amber-600 text-white p-3 rounded-lg max-w-[80%]">
                              <p className="text-sm">{chat.message}</p>
                              <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(chat.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {/* AI Response */}
                          <div className="flex justify-start">
                            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                              <p className="text-sm whitespace-pre-line">{chat.response}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a customer to view their chat history</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
