import { Header } from '@/components/Header';
import { RequestForm } from '@/components/RequestForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RequestPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Request Page</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RequestPage;
