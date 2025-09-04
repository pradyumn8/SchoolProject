import React, { useMemo, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  const canSubmit = useMemo(
    () => !sending && /\S+@\S+\.\S+/.test(email.trim()),
    [sending, email]
  );

  const actionCodeSettings = {
    url: `${window.location.origin}/login`, // must be authorized
    handleCodeInApp: false,
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const targetEmail = email.trim();
    if (!targetEmail) return setMsg("Please enter your email.");

    try {
      setSending(true);
      await sendPasswordResetEmail(auth, targetEmail, actionCodeSettings);

      // Security best-practice: Generic success message (avoid account enumeration)
      setOk(true);
      setMsg("If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      // Map common codes to friendly text; keep generic in prod if you prefer
      const code = err?.code || "";
      if (code === "auth/invalid-email") setMsg("Please enter a valid email address.");
      else if (code === "auth/too-many-requests") setMsg("Too many attempts. Please try again later.");
      else setMsg("If an account exists for that email, a reset link has been sent.");
      // ^ generic to avoid user enumeration
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Reset your password</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {msg && (
              <p className={`text-sm text-center ${ok ? "text-green-600" : "text-gray-600"}`}>
                {msg}
              </p>
            )}

            <Button type="submit" disabled={!canSubmit} isLoading={sending} fullWidth>
              Send reset link
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
