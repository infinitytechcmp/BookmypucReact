import { useState } from 'react';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getMockData, saveMockData } from '@/data/mockData';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all fields');
      return;
    }

    const data = getMockData();
    const userIndex = data.users.findIndex((u) => u.id === user?.id);
    if (userIndex !== -1) {
      data.users[userIndex] = {
        ...data.users[userIndex],
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      saveMockData(data);
      
      // Update localStorage user
      const storedUser = localStorage.getItem('bookMyPucUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('bookMyPucUser', JSON.stringify({
          ...parsedUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }));
      }
      
      toast.success('Profile updated successfully');
      window.location.reload();
    }
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <GradientHeading level={2} className="text-3xl font-bold">Profile</GradientHeading>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}
