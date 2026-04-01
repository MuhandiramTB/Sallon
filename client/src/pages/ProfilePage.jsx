import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    setProfileMsg('');
    try {
      const res = await api('/auth/profile', { method: 'PUT', body: profileForm });
      login(res.data, localStorage.getItem('token'));
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Error: ' + err.message);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Error: Passwords do not match');
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      });
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordMsg('Error: ' + err.message);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Personal Details</h2>
        <form onSubmit={handleProfileSubmit}>
          {profileMsg && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium animate-slide-up ${profileMsg.startsWith('Error') ? 'bg-red-50 text-error' : 'bg-green-50 text-green-700'}`}>
              {profileMsg}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-border rounded-lg text-text-muted text-[15px]">{user?.email}</div>
          </div>
          <Input
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            required
          />
          <Input
            label="Mobile Number"
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="07X XXX XXXX"
            required
          />
          <Button type="submit" isLoading={isSubmittingProfile} className="w-full">
            Update Profile
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          {passwordMsg && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium animate-slide-up ${passwordMsg.startsWith('Error') ? 'bg-red-50 text-error' : 'bg-green-50 text-green-700'}`}>
              {passwordMsg}
            </div>
          )}
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="Min 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />
          <Button type="submit" isLoading={isSubmittingPassword} className="w-full">
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
