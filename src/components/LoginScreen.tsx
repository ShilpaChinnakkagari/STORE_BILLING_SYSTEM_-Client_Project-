import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Lock, Mail, Eye, EyeOff, ShoppingBasket, Sparkles } from "lucide-react";
import { useAuth, DEFAULT_EMAIL, DEFAULT_PAD } from "@/lib/auth";
import { toast } from "sonner";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pad, setPad] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, pad);
      setLoading(false);
      if (!ok) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast.error("Invalid credentials");
      } else {
        toast.success("Welcome back!");
      }
    }, 350);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/30">
      {/* animated tri-color blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 animate-blob rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-blob rounded-full bg-accent/40 blur-3xl [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 animate-blob rounded-full bg-brand-cyan/30 blur-3xl [animation-delay:4s]" />
        <div className="absolute top-10 right-20 h-60 w-60 animate-blob rounded-full bg-brand-amber/25 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="perspective-1000 relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* logo */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="animate-float mb-3 flex h-16 w-16 items-center justify-center rounded-2xl gradient-tri shadow-glow transition-transform duration-300 hover:scale-110 hover:rotate-12">
              <ShoppingBasket className="h-8 w-8 text-white drop-shadow" />
            </div>
            <h1 className="text-gradient-tri text-3xl font-extrabold tracking-tight">
              FreshMart POS
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Sign in to your billing dashboard
            </p>
          </div>

          {/* gradient-bordered 3D card */}
          <div className={`tilt-3d rounded-2xl p-[2px] gradient-tri ${shake ? "animate-shake" : ""}`}>
            <form
              onSubmit={submit}
              className="card-3d rounded-2xl bg-card/90 p-6 backdrop-blur-xl"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <Input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@mart.com"
                      className="h-11 pl-9 transition-all focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">PAD / Passcode</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                    <Input
                      type={show ? "text" : "password"}
                      value={pad}
                      onChange={(e) => setPad(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pl-9 pr-10 font-mono tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="group btn-3d relative h-12 w-full overflow-hidden gradient-tri text-base font-bold text-white border-0 hover:opacity-100"
                >
                  <span className="relative z-10 drop-shadow">
                    {loading ? "Signing in..." : "Sign In"}
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Button>

                <button
                  type="button"
                  onClick={() => { setEmail(DEFAULT_EMAIL); setPad(DEFAULT_PAD); }}
                  className="w-full rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary hover:bg-muted/60 hover:text-foreground"
                >
                  Use demo credentials → <span className="font-mono">{DEFAULT_EMAIL}</span> / <span className="font-mono">{DEFAULT_PAD}</span>
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Store className="h-3 w-3" /> Secured POS · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
