import React, { useEffect, useState } from "react";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (val: string) => void;
  otp: string;
  setOtp: (val: string) => void;

  isLoading: boolean;
  onSendCode: (email: string) => Promise<boolean>;
  onVerify: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  otp,
  setOtp,
  isLoading,
  onSendCode,
  onVerify,
  onBackToLogin,
}) => {
  const [timeLeft, setTimeLeft] = useState(600);
  const [isCodeSent, setIsCodeSent] = useState(false);

  useEffect(() => {
    if (!isCodeSent) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCodeSent]);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    const success = await onSendCode(email);
    if (success) {
      setIsCodeSent(true);
      setTimeLeft(180);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeSent) {
      handleSendCode();
    } else {
      if (otp.length === 6) {
        onVerify(e);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form className="controls" onSubmit={handleFormSubmit}>
      {!isCodeSent ? (
        <>
          <div className="input-group">
            <span className="input-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="form-control with-icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-custom"
            disabled={!email || isLoading}
            style={{ width: "100%", marginTop: "10px" }}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                <span>Send OTP Code</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="otp-verification-section">
          {/* Email Display & Change */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "10px 15px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Sending code to
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "white",
                  fontWeight: 600,
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCodeSent(false);
                setOtp("");
              }}
              style={{
                background: "rgba(34, 211, 238, 0.1)",
                border: "none",
                color: "#22d3ee",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(34, 211, 238, 0.2)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(34, 211, 238, 0.1)")
              }
            >
              Edit
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.6)",
                marginBottom: "15px",
              }}
            >
              Enter the 6-digit code we just sent to your inbox.
            </p>

            <div className="input-group">
              <input
                type="text"
                name="otp"
                placeholder="000 000"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                autoFocus
                style={{
                  textAlign: "center",
                  fontSize: "24px",
                  letterSpacing: "8px",
                  fontWeight: 700,
                  height: "55px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "2px solid rgba(34, 211, 238, 0.2)",
                  color: "#22d3ee",
                }}
                disabled={isLoading}
              />
            </div>

            <div
              style={{
                fontSize: "13px",
                margin: "15px 0",
                color: timeLeft > 0 ? "rgba(255, 255, 255, 0.5)" : "#ff4d4d",
              }}
            >
              {timeLeft > 0 ? (
                <span>
                  Resend in{" "}
                  <strong style={{ color: "white" }}>
                    {formatTime(timeLeft)}
                  </strong>
                </span>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span>Code expired.</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSendCode();
                    }}
                    style={{
                      color: "#22d3ee",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Resend Code
                  </a>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-custom"
            disabled={otp.length !== 6 || isLoading}
            style={{ width: "100%", height: "48px" }}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span>Verify & Continue</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="form-footer" style={{ marginTop: "25px" }}>
        <div className="switch-mode">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBackToLogin();
            }}
            style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
