import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthProvider.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn({ email, password });
      } else {
        await signUp({ email, password });
      }
      navigate('/Dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{mode === 'signin' ? 'Sign in' : 'Create account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? 'Processing…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
            <div className="text-sm text-center text-gray-600">
              {mode === 'signin' ? (
                <button type="button" className="underline" onClick={() => setMode('signup')}>
                  New here? Create an account
                </button>
              ) : (
                <button type="button" className="underline" onClick={() => setMode('signin')}>
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
