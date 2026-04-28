import { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUserRequests } from '@/hooks/useRequests';
import { STATUS_LABELS, TASK_TYPE_LABELS } from '@/types';
import type { TaskStatus, TaskType } from '@/types';
import { format } from 'date-fns';

interface RequesterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequesterSidebar({ isOpen, onClose }: RequesterSidebarProps) {
  const { data: requests = [], isLoading, error, refetch, isFetching } = useUserRequests();

  // Check for completed requests and create notifications
  const notifications = useMemo(() => {
    const completedRequests = requests.filter(req => req.status === 'completed');
    return completedRequests.map(req =>
      `Your request "${req.task_description.substring(0, 50)}..." has been completed!`
    );
  }, [requests]);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">My Requests</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isFetching}
              title="Refresh requests"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Error Display */}
          {error && (
            <Card className="mb-4 border-red-300 bg-red-50">
              <CardContent className="pt-4">
                <p className="text-sm text-red-600">
                  Error loading requests: {error.message}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications ({notifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200">
                    {notification}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* My Requests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Requests ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No requests found.</p>
                  <p className="text-xs mt-2">Create a new request to get started!</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="mt-3"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium text-sm">
                            {TASK_TYPE_LABELS[request.task_type as TaskType]}
                          </span>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {STATUS_LABELS[request.status as TaskStatus]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {request.task_description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Requested: {format(new Date(request.date_requested), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {format(new Date(request.target_completion_date), 'MMM dd, yyyy')}
                      </div>
                      {request.task_id && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {request.task_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
}