import React, { useEffect, useState } from "react";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (val: string) => void;

  isLoading: boolean;
  onVerify: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  isLoading,
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

  const handleSendCode = () => {
    if (!email) return;
    setIsCodeSent(true);
    setTimeLeft(600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="controls">
      <div
        className="input-group"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
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
        <div
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="form-control with-icon"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isCodeSent}
            style={{ flex: 1 }}
          />
        </div>
      </div>
      {!isCodeSent ? (
        <button
          type="button"
          className="btn btn-custom width-100"
          onClick={handleSendCode}
          disabled={!email || isLoading}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "5px 30px",
            whiteSpace: "nowrap",
            backgroundColor: "transparent",
            border: "1px solid #b1c900",
            color: "#b1c900",
          }}
        >
          Send Verification Link
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-custom width-100"
          onClick={() => setIsCodeSent(false)}
          disabled={isLoading}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "5px 30px",
            whiteSpace: "nowrap",
            backgroundColor: "transparent",
            border: "1px solid #b1c900",
            color: "#b1c900",
          }}
        >
          Change
        </button>
      )}

      {isCodeSent && (
        <>
          <div
            className="input-group"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          ></div>

          <div
            className="timer-display"
            style={{
              textAlign: "center",
              marginBottom: "15px",
              color: "#b1c900",
            }}
          >
            {timeLeft > 0 ? (
              <>
                Link expires in: <strong>{formatTime(timeLeft)}</strong>
              </>
            ) : (
              <span style={{ color: "#ff4d4d" }}>Link expired. </span>
            )}
            {timeLeft <= 0 && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSendCode();
                }}
                style={{
                  color: "#b1c900",
                  marginLeft: "5px",
                  textDecoration: "underline",
                }}
              >
                Resend Code
              </a>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: 10,
              color: "#666",
              fontSize: 13,
            }}
          >
            We sent a verification link to your email. Check your inbox (and
            spam).
          </div>
        </>
      )}

      <div className="form-footer" style={{ marginTop: "20px" }}>
        <div className="switch-mode">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBackToLogin();
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
