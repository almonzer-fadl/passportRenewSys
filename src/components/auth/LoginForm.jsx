import { useState } from 'react';
import { signIn } from 'next-auth/react'; 

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); 
    // Call the NextAuth signIn function
    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirect
      email,
      password,
    });

    if (result.error) {
      
      setError(result.error);
    } else {
      
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>} {/* Display error message if any */}
    </form>
  );
};

export default LoginForm;
