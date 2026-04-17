import { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RequestForm } from '@/components/RequestForm';
import { RequesterSidebar } from '@/components/RequesterSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RequestPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent multiple calls
    console.log('Logout button clicked');
    setLoggingOut(true);
    try {
      console.log('Calling supabase.auth.signOut()');
      await supabase.auth.signOut();
      console.log('Sign out successful');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.log('Error during logout:', error);
      toast.error('Error logging out');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Multimedia Request</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                My Requests
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Create New Request</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestForm />
            </CardContent>
          </Card>
        </div>
      </main>

      <RequesterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default RequestPage;
