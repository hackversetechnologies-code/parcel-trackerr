import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import globeAnim from '@/assets/Earth globe rotating with Seamless loop animation.json';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        await axios.post('http://127.0.0.1:8000/register', { email, password, role: 'client' });
        toast({ title: 'Success', description: 'Registered successfully!' });
        navigate('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        const res = await axios.post('http://127.0.0.1:8000/login', { email, password });
        localStorage.setItem('token', res.data.token);
        toast({ title: 'Success', description: 'Logged in!' });
        navigate('/');
      }
    } catch (e) {
      toast({ title: 'Error', description: e.message });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <Lottie animationData={globeAnim} loop autoplay />
      </div>
      <div className="relative w-full max-w-md p-8 space-y-4 bg-white rounded shadow">
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleSubmit}>{isRegister ? 'Register' : 'Login'}</Button>
        <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </Button>
      </div>
    </div>
  );
}

export default Login;