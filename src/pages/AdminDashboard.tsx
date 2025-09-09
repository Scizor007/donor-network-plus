import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity, Droplet, Users } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <Badge variant="secondary">Mock Data</Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Donations (30d)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">1,284</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Units Issued (30d)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">1,102</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Outdating Risk</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-amber-600">7.3%</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Active Camps</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">12</CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5" /> Donations Trend</CardTitle>
              <CardDescription>Daily donations over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 bg-gray-50 border rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Line chart placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Droplet className="w-5 h-5" /> Blood Group Mix</CardTitle>
              <CardDescription>Distribution of collected units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 bg-gray-50 border rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Donut chart placeholder
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-600" /> Low Stock Alerts</CardTitle>
              <CardDescription>Groups approaching threshold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>O-</span>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>B-</span>
                <Badge variant="secondary">Low</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>AB-</span>
                <Badge variant="secondary">Low</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Top Donor Cities</CardTitle>
              <CardDescription>Highest donation volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-50 border rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Bar chart placeholder
              </div>
              <div className="pt-4">
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;