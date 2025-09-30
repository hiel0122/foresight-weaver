import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TopNav } from '@/components/TopNav';

export default function Account() {
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await updateProfile({ display_name: displayName });

    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });

    setLoading(false);
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">My Account</h1>
          <p className="text-lg text-gray-600 mb-8">Manage your profile settings</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-1 bg-gray-50 rounded-md border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1 rounded-md border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <Input
                type="text"
                value={profile.role}
                disabled
                className="mt-1 bg-gray-50 rounded-md border-gray-300"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black text-white px-4 py-2 font-medium hover:bg-gray-900 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
