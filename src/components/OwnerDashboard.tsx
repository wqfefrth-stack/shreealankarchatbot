import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, MessageSquare, Clock, User, RefreshCw, Calendar, ArrowLeft, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChatLog {
  id: string;
  customer_name: string;
  message: string;
  response: string;
  created_at: string;
}

interface GroupedChats {
  [customerName: string]: ChatLog[];
}

interface OwnerDashboardProps {
  onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onLogout }) => {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const { toast } = useToast();

  const fetchChatLogs = async () => {
    setIsLoading(true);
    try {
      // Get chats from last 48 hours
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .gte('created_at', fortyEightHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      console.log('Chat logs query result:', { data, error, fortyEightHoursAgo: fortyEightHoursAgo.toISOString() });

      if (error) {
        console.error('Error fetching chat logs:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched chat logs:', data);
      setChatLogs(data || []);
      
      // Group chats by customer name
      const grouped = (data || []).reduce((acc: GroupedChats, chat) => {
        const customerName = chat.customer_name;
        if (!acc[customerName]) {
          acc[customerName] = [];
        }
        acc[customerName].push(chat);
        return acc;
      }, {});

      setGroupedChats(grouped);
    } catch (error) {
      console.error('Error fetching chat logs:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, []);

  const customerNames = Object.keys(groupedChats);
  const totalChats = chatLogs.length;
  const uniqueCustomers = customerNames.length;

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const CustomerList = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <User className="w-5 h-5 mr-2" />
          Customers ({uniqueCustomers})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] md:h-[500px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading customers...
            </div>
          ) : customerNames.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No chat history found for the last 48 hours
            </div>
          ) : (
            <div className="space-y-1">
              {customerNames.map((customerName, index) => (
                <div
                  key={customerName}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted/70 ${
                    selectedCustomer === customerName ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    setSelectedCustomer(customerName);
                    setIsMobileSheetOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm md:text-base">{customerName}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {groupedChats[customerName].length} messages
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {groupedChats[customerName].length}
                    </Badge>
                  </div>
                  {index < customerNames.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedCustomer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                  className="md:hidden p-2 hover:bg-primary-foreground/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
                  {selectedCustomer ? selectedCustomer : 'Owner Dashboard'}
                </h1>
                <p className="text-primary-foreground/80 text-xs md:text-sm">
                  {selectedCustomer ? 'Chat History' : 'Last 48 Hours'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Mobile Customer List Trigger */}
              {!selectedCustomer && (
                <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden p-2 hover:bg-primary-foreground/10"
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Customers</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <CustomerList />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchChatLogs}
                disabled={isLoading}
                className="p-2 hover:bg-primary-foreground/10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-2 hover:bg-red-500/20 text-red-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:py-6">
        {/* Stats Cards - Only show when no customer selected on mobile */}
        {!selectedCustomer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs md:text-sm">Total Chats</p>
                    <p className="text-xl md:text-2xl font-bold">{totalChats}</p>
                  </div>
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs md:text-sm">Customers</p>
                    <p className="text-xl md:text-2xl font-bold">{uniqueCustomers}</p>
                  </div>
                  <User className="w-6 h-6 md:w-8 md:h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs md:text-sm">Period</p>
                    <p className="text-sm md:text-lg font-bold">48h</p>
                  </div>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Desktop Customer List */}
          <div className="hidden md:block lg:col-span-4">
            <CustomerList />
          </div>

          {/* Mobile: Customer List OR Chat History */}
          <div className="md:hidden">
            {selectedCustomer ? (
              /* Mobile Chat View */
              <Card className="h-[calc(100vh-280px)]">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {groupedChats[selectedCustomer]?.map((chat) => (
                        <div key={chat.id} className="space-y-3">
                          {/* Customer Message */}
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                <span className="font-medium text-blue-600 dark:text-blue-300 text-sm">
                                  {chat.customer_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(chat.created_at)}
                                </span>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm break-words">{chat.message}</p>
                              </div>
                            </div>
                          </div>

                          {/* Assistant Response */}
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
                              <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <span className="font-medium text-green-600 dark:text-green-300 text-sm">
                                  Assistant
                                </span>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-sm whitespace-pre-wrap break-words">{chat.response}</p>
                              </div>
                            </div>
                          </div>

                          <Separator />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              /* Mobile Customer List */
              <CustomerList />
            )}
          </div>

          {/* Desktop Chat History */}
          <div className="hidden md:block lg:col-span-8">
            <Card className="h-[500px] lg:h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {selectedCustomer ? `Chat with ${selectedCustomer}` : 'Select a customer to view chat history'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <ScrollArea className="h-full">
                  {selectedCustomer ? (
                    <div className="p-4 space-y-4">
                      {groupedChats[selectedCustomer]?.map((chat) => (
                        <div key={chat.id} className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-blue-600 dark:text-blue-300">
                                  {chat.customer_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(chat.created_at)}
                                </span>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm">{chat.message}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                              <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-green-600 dark:text-green-300">
                                  Assistant
                                </span>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
                              </div>
                            </div>
                          </div>

                          <Separator />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a customer to view their chat history</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;