import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BrandMark, Wordmark } from "./Icons";
import { useApp } from "../context/AppContext";

export default function Auth() {
  const { mode: rawMode } = useParams();
  const mode = rawMode === "signup" ? "signup" : "login";
  const navigate = useNavigate();
  const { login, signup } = useApp();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupErr, setSignupErr] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginErr("Enter your email and password.");
      return;
    }
    setLoginErr("");
    setLoginBusy(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      navigate("/app/dashboard");
    } catch (err) {
      setLoginErr(err.message || "Could not log in.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      signupPassword.length < 6
    ) {
      setSignupErr("Check your name, email, and password (6+ characters).");
      return;
    }
    setSignupErr("");
    setSignupBusy(true);
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword);
      navigate("/app/dashboard");
    } catch (err) {
      setSignupErr(err.message || "Could not create your account.");
    } finally {
      setSignupBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "radial-gradient(circle at 20% 20%, #F8E4E9, #FBF6F4 60%)",
      }}
    >
      <div className="w-full max-w-[400px] bg-white border border-line rounded-[20px] p-9 shadow-card">
        <Link
          to="/"
          className="flex items-center justify-center gap-2.5 font-serif font-semibold text-[19px] text-wine-dark mb-6 hover:opacity-90"
        >
          <BrandMark />
          <Wordmark />
        </Link>

        <div className="flex bg-wine-tint rounded-full p-1 mb-6">
          <div
            className={`flex-1 text-center py-2 rounded-full text-[14px] font-semibold cursor-pointer transition-colors ${mode === "login" ? "bg-wine text-white" : "text-wine-dark opacity-60"}`}
            onClick={() => navigate("/auth/login")}
          >
            Log in
          </div>
          <div
            className={`flex-1 text-center py-2 rounded-full text-[14px] font-semibold cursor-pointer transition-colors ${mode === "signup" ? "bg-wine text-white" : "text-wine-dark opacity-60"}`}
            onClick={() => navigate("/auth/signup")}
          >
            Sign up
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="field mb-4">
              <label>Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="field mb-4">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginErr && (
                <div className="text-[#B23A48] text-[12.5px] mt-1.5">
                  {loginErr}
                </div>
              )}
            </div>
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={loginBusy}
            >
              {loginBusy ? "Logging in…" : "Log in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field mb-4">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>
            <div className="field mb-4">
              <label>Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
            <div className="field mb-4">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              {signupErr && (
                <div className="text-[#B23A48] text-[12.5px] mt-1.5">
                  {signupErr}
                </div>
              )}
            </div>
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={signupBusy}
            >
              {signupBusy ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="text-center text-[13px] text-muted mt-4">
          <code className="text-[11.5px]"></code>.
        </p>
      </div>
    </div>
  );
}
