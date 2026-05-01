import { useState } from "react";
import { useNavigate } from "react-router"; 
import { toast } from "sonner"; // --- ADDED ---
import { login, LoginCredentials } from "../api/authApi";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);

  const isLocked = attemptsLeft <= 0;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // 1. FRONTEND VALIDATION (Instant checks)
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      toast.warning("Email and password are required."); // Added for extra visibility
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      toast.warning("Password too short."); // Added for extra visibility
      return;
    }

    setLoading(true);

    try {
      const credentials: LoginCredentials = { email, password };
      const user = await login(credentials);

      // Successful login
      const role = (user as unknown as { role?: string }).role;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err: any) {
      // 2. BACKEND ERROR HANDLING
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      // Since we updated apiClient.ts, the parsed error is in err.message
      const errorMsg = err.message || "Invalid email or password.";

      if (remaining <= 0) {
        setError("Your account has been locked. Please contact your system administrator.");
        toast.error("Account Locked.");
      } else {
        setError(`${errorMsg} ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
        // We don't necessarily need a toast here because the 'error' state 
        // already shows the red box in the LoginForm.
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white font-sans px-4">
      <header className="text-center mb-10">
        <h1 className="text-[42px] font-bold text-[#1e3a5f] mb-2.5 tracking-wide">TRIBOT</h1>
        <p className="text-base text-[#5a6a7a] tracking-tight">
          Multilingual Clinical Translation Platform
        </p>
      </header>

      <section className="w-full max-w-[540px] bg-white rounded-2xl border border-[#e5e9f0] shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-10">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
          error={error}
          loading={loading}
          isLocked={isLocked}
        />
      </section>
    </main>
  );
}