import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth, type AuthMode } from "@/lib/auth-store";

export type { AuthMode };

export function Field({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: any }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        {...props}
        className={`h-12 w-full rounded-md border border-border bg-white pl-10 pr-3 text-[14px] outline-none focus:border-ink transition-colors ${props.className ?? ""}`}
      />
    </div>
  );
}

export function PrimaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-12 w-full rounded-md bg-ink text-white text-[13px] font-semibold uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-ink/90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function AuthPanel({
  onDone,
  initialMode = "signin",
  initialEmail,
  showGuest = true,
}: {
  onDone?: () => void;
  initialMode?: AuthMode;
  initialEmail?: string;
  showGuest?: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState(initialEmail ?? "");
  const signIn = useAuth((s) => s.signIn);
  const register = useAuth((s) => s.register);
  const isLoggedIn = useAuth((s) => s.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn && onDone) onDone();
  }, [isLoggedIn, onDone]);

  const switchMode = (m: AuthMode, opts?: { email?: string }) => {
    setMode(m);
    if (opts?.email) setEmail(opts.email);
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "signin" && (
            <SignInForm
              initialEmail={email}
              onSubmit={async (email, password) => {
                try {
                  await signIn(email, password);
                  toast.success("Welcome back");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Sign in failed");
                }
              }}
              onSwitch={switchMode}
              showGuest={showGuest}
            />
          )}
          {mode === "signup" && (
            <SignUpForm
              onSubmit={async (data) => {
                try {
                  await register(data);
                  switchMode("otp", { email: data.email });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Sign up failed");
                }
              }}
              onSwitch={switchMode}
            />
          )}
          {mode === "forgot" && (
            <ForgotForm
              initialEmail={email}
              onSubmit={async (email) => {
                try {
                  await useAuth.getState().forgotPassword(email);
                  toast.success("Reset link sent");
                  switchMode("otp", { email });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not send reset link");
                }
              }}
              onSwitch={switchMode}
            />
          )}
          {mode === "otp" && (
            <OtpForm
              email={email ?? "you@example.com"}
              onVerified={() => {
                toast.success("Verified");
              }}
              onBack={() => switchMode("signin")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AuthToaster() {
  return <Toaster position="top-center" />;
}

export function SignInForm({
  initialEmail,
  onSubmit,
  onSwitch,
  showGuest = true,
}: {
  initialEmail?: string;
  onSubmit: (email: string, password: string) => void | Promise<void>;
  onSwitch: (m: AuthMode, opts?: { email?: string }) => void;
  showGuest?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const valid = /.+@.+\..+/.test(email) && password.length >= 4;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return toast.error("Enter a valid email and password");
        void onSubmit(email, password);
      }}
      className="space-y-4"
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Members</div>
        <h1 className="font-display text-2xl font-bold mt-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to access your wardrobe, wallet and rewards.</p>
      </div>
      <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-10 text-[14px] outline-none focus:border-ink"
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-ink" /> Remember me</label>
        <button type="button" onClick={() => onSwitch("forgot", { email })} className="text-ink underline underline-offset-2">Forgot password?</button>
      </div>
      <PrimaryBtn type="submit">Sign in <ArrowRight className="h-4 w-4" /></PrimaryBtn>
      {showGuest && (
        <Link
          to="/"
          className="h-11 w-full rounded-md border border-border bg-white text-[12px] font-semibold uppercase tracking-widest inline-flex items-center justify-center hover:bg-muted/40"
        >
          Continue as guest
        </Link>
      )}
      <p className="text-center text-[13px] text-muted-foreground">
        New to ASL?{" "}
        <button type="button" onClick={() => onSwitch("signup")} className="text-ink font-semibold underline underline-offset-2">Create an account</button>
      </p>
    </form>
  );
}

export function SignUpForm({
  onSubmit,
  onSwitch,
}: {
  onSubmit: (d: { name: string; email: string; phone?: string; password: string }) => void;
  onSwitch: (m: AuthMode) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const valid = name.length >= 2 && /.+@.+\..+/.test(email) && password.length >= 6 && agree;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return toast.error("Complete all fields and agree to the terms");
        onSubmit({ name, email, phone, password });
      }}
      className="space-y-4"
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Join ASL</div>
        <h1 className="font-display text-2xl font-bold mt-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Members unlock free returns, member pricing and concierge sourcing.</p>
      </div>
      <Field icon={User} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Field icon={Phone} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      <Field icon={Lock} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      <label className="flex items-start gap-2 text-[12px] text-muted-foreground">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-ink" />
        <span>I agree to ASL's <Link to="/customer-care/terms-of-service" className="underline">Terms</Link> and <Link to="/customer-care/privacy-policy" className="underline">Privacy Policy</Link>.</span>
      </label>
      <PrimaryBtn type="submit">Create account <ArrowRight className="h-4 w-4" /></PrimaryBtn>
      <p className="text-center text-[13px] text-muted-foreground">
        Already a member?{" "}
        <button type="button" onClick={() => onSwitch("signin")} className="text-ink font-semibold underline underline-offset-2">Sign in</button>
      </p>
    </form>
  );
}

export function ForgotForm({
  initialEmail,
  onSubmit,
  onSwitch,
}: {
  initialEmail?: string;
  onSubmit: (email: string) => void;
  onSwitch: (m: AuthMode) => void;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const valid = /.+@.+\..+/.test(email);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!valid) return toast.error("Enter a valid email"); onSubmit(email); }} className="space-y-5">
      <div>
        <button type="button" onClick={() => onSwitch("signin")} className="text-[12px] text-muted-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </button>
        <h1 className="font-display text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a 6-digit reset code.</p>
      </div>
      <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <PrimaryBtn type="submit">Send reset code <ArrowRight className="h-4 w-4" /></PrimaryBtn>
    </form>
  );
}

export function OtpForm({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(30);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const isLoggedIn = useAuth((s) => s.isLoggedIn);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join("");
  const complete = code.length === 6;

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const n = [...d]; n[i] = clean; return n;
    });
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    const next = t.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    refs.current[Math.min(t.length, 5)]?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!complete) return toast.error("Enter the 6-digit code");
        onVerified();
      }}
      className="space-y-6"
    >
      <div>
        <button type="button" onClick={onBack} className="text-[12px] text-muted-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <h1 className="font-display text-2xl font-bold">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>. Enter it below to continue.{" "}
          <span className="italic">(Prototype: any 6 digits work)</span>
        </p>
      </div>
      <div className="grid grid-cols-6 gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={onKey(i)}
            className="h-11 text-center text-lg font-display font-bold rounded-md border border-border bg-white outline-none focus:border-ink"
          />
        ))}
      </div>
      <PrimaryBtn type="submit">Verify <Check className="h-4 w-4" /></PrimaryBtn>
      <div className="text-center text-[12px] text-muted-foreground">
        {cooldown > 0 ? (
          <>Resend code in <span className="text-ink font-medium">{cooldown}s</span></>
        ) : (
          <button type="button" onClick={() => { setCooldown(30); toast("New code sent"); }} className="text-ink font-semibold underline underline-offset-2">Resend code</button>
        )}
      </div>
    </form>
  );
}
