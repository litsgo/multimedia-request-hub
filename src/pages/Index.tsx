import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold font-display text-foreground sm:text-4xl">
            Multimedia Request Hub 
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Online Request form for Multimedia Services.
          </p>
          <p className="mt-3 text-base text-muted-foreground sm:text-sm">
            Please choose only the Employee section. Thank you.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Admin</CardTitle>
              <CardDescription>
                For Multimedia Personnel access only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin">Go to Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Employee</CardTitle>
              <CardDescription>
                Click the button below to submit a multimedia request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/request">Go to Request Form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
