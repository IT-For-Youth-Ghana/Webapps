/**
 * Authentication Example Component
 * Shows how to use the shared AuthService in IT Incubator
 */

import { useState } from 'react';
import { authService } from '../config/api';

function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');

    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setMessage(`✅ Welcome, ${result.user.email}!`);
    } catch (error) {
      setMessage(`❌ Login failed: ${error.message}`);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setMessage('✅ Logged out successfully');
    } catch (error) {
      setMessage(`❌ Logout failed: ${error.message}`);
    }
  };

  // Get Profile
  const handleGetProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setMessage('✅ Profile loaded');
    } catch (error) {
      setMessage(`❌ Failed to load profile: ${error.message}`);
    }
  };

  // Check if authenticated
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔐 Auth Service Example - IT Incubator</h2>

      {/* Status */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <strong>Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        <br />
        <strong>Module:</strong> Incubator
      </div>

      {/* Login Form */}
      {!isAuthenticated && (
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <h3>Login</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            required
          />
          <button type="submit" style={{ padding: '10px 20px' }}>
            Login
          </button>
        </form>
      )}

      {/* User Info */}
      {user && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#e8f5e9' }}>
          <h3>Current User</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Modules:</strong> {user.modules?.join(', ') || 'N/A'}</p>
          <p>
            <strong>Has Incubator Access:</strong>{' '}
            {authService.hasIncubatorAccess() ? '✅ Yes' : '❌ No'}
          </p>
          <p>
            <strong>Has Courses Access:</strong>{' '}
            {authService.hasCoursesAccess() ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      )}

      {/* Actions */}
      {isAuthenticated && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleGetProfile} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Refresh Profile
          </button>
          <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
            Logout
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{ padding: '10px', background: '#fff3cd', marginTop: '20px' }}>
          {message}
        </div>
      )}

      {/* Code Example */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5' }}>
        <h3>📝 Usage Example</h3>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`import { authService } from './config/api';

// Login
const result = await authService.login(email, password);
console.log(result.user);

// Check module access
if (authService.hasIncubatorAccess()) {
  // User can access incubator
}

// Get profile
const profile = await authService.getProfile();

// Logout
await authService.logout();`}
        </pre>
      </div>
    </div>
  );
}

export default AuthExample;
