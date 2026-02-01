import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import type { CredentialResponse } from "@react-oauth/google";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

declare global {
  interface Window {
    particlesJS: (id: string, config: object) => void;
  }
}

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

const Login = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load particles.js script dynamically
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js";
    script.async = true;
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS("particles-js", {
          particles: {
            number: {
              value: 100,
              density: {
                enable: true,
                value_area: 500,
              },
            },
            color: {
              value: "#b1c900",
            },
            shape: {
              type: "circle",
              stroke: {
                width: 0,
                color: "#000000",
              },
              polygon: {
                nb_sides: 5,
              },
            },
            opacity: {
              value: 0.5,
              random: false,
              anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 5,
              random: true,
              anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 6,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "repulse",
              },
              onclick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const validateForm = (): boolean => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    if (mode === "forgot-password") {
      if (!otp.trim()) {
        setError("Verification code is required");
        return false;
      }
      return true;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (mode === "register" || mode === "reset-password") {
      if (mode === "register" && !fullName.trim()) {
        setError("Full name is required");
        return false;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (mode === "register" && !agreeTerms) {
        setError("You must agree to the terms and conditions");
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      setSuccess("Login successful! Welcome " + response.data.user.fullName);
      console.log("Login successful:", response.data);
      // TODO: Redirect to dashboard or home page
      navigate("/");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string }; status?: number };
        };
        const errorMessage =
          axiosError.response?.data?.message ||
          "Login failed. Please try again.";
        const statusCode = axiosError.response?.status;

        setError(errorMessage);

        // Show resend verification option if email not verified (403 status)
        if (
          statusCode === 403 &&
          errorMessage.toLowerCase().includes("verify")
        ) {
          setShowResendVerification(true);
        } else {
          setShowResendVerification(false);
        }
      } else {
        setError("Login failed. Please try again.");
        setShowResendVerification(false);
      }
    }
  };

  const handleRegister = async () => {
    try {
      const response = await register({
        email,
        password,
        fullName,
      });
      setSuccess(
        `Registration successful! Please check your email (${email}) to verify your account.`,
      );
      console.log("Registration successful:", response.data);
      // TODO: Redirect to dashboard or home page
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosError.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        await handleLogin();
      } else if (mode === "register") {
        await handleRegister();
      } else if (mode === "forgot-password") {
        // UI only: simulate verification
        setSuccess("OTP Verified! Please set your new password.");
        setMode("reset-password");
      } else if (mode === "reset-password") {
        // UI only: simulate reset
        setSuccess("Password reset successful! You can now login.");
        setMode("login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
    setAgreeTerms(false);
    setOtp("");
  };

  const switchToForgotPassword = () => {
    setMode("forgot-password");
    setError("");
    setSuccess("");
    setOtp("");
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setError("");
    setSuccess("");
    try {
      const response = await loginWithGoogle(credentialResponse.credential!);
      setSuccess("Login successful! Welcome " + response.data.user.fullName);
      // TODO: Redirect to dashboard
      navigate("/");
    } catch (err: unknown) {
      console.error("Google login error:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosError.response?.data?.message ||
            "Google login failed. Please try again.",
        );
      } else {
        setError("Google login failed. Please try again.");
      }
    }
  };

  const handleGoogleError = () => {
    console.log("Google login error");
    setError("Google login failed. Please try again.");
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5172"}/api/Auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok) {
        setSuccess("Verification email sent! Please check your inbox.");
        setError("");
        setShowResendVerification(false);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to send verification email.");
      }
    } catch {
      setError("Failed to send verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div id="particles-js"></div>
      <div id="login-box">
        {/* Logo & Branding */}
        <div className="logo">
          <div className="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="50"
              height="50"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <h1 className="logo-caption">
            <span className="tweak">P</span>IMS
          </h1>
          <p className="logo-subtitle">Project Information Management System</p>
        </div>

        {/* Welcome Message */}
        <div className="welcome-text">
          {mode === "login"
            ? "Welcome back! Please login to your account."
            : mode === "register"
              ? "Create your account to get started."
              : mode === "forgot-password"
                ? "Verify your identity to reset your password."
                : "Reset password."}
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            {error}
            {showResendVerification && (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  display: "block",
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: resendLoading ? "not-allowed" : "pointer",
                  width: "100%",
                  opacity: resendLoading ? 0.7 : 1,
                }}
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            )}
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Form */}
        {mode === "login" ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSubmit={handleSubmit}
            handleGoogleLogin={handleGoogleLogin}
            handleGoogleError={handleGoogleError}
            onSwitchMode={switchMode}
            onForgotPassword={switchToForgotPassword}
          />
        ) : mode === "register" ? (
          <RegisterForm
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            agreeTerms={agreeTerms}
            setAgreeTerms={setAgreeTerms}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onSubmit={handleSubmit}
            handleGoogleLogin={handleGoogleLogin}
            handleGoogleError={handleGoogleError}
            onSwitchMode={switchMode}
          />
        ) : mode === "forgot-password" ? (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
            onVerify={handleSubmit}
            onBackToLogin={switchMode}
          />
        ) : (
          <ResetPasswordForm
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
