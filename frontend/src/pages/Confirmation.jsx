
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";

import AuthLayout from "../components/AuthLayout";
import { UseUser } from "../context/UserContext";
import {
  resendCode,
  forgotPassword,
  verifyResetCode,
} from "../api/backend";
import confirmationImage from "../assets/reference/auth/confirmation.jpg";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmCode } = UseUser();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const isSignup = location.state?.flow === "signup";
  const email = location.state?.email || "";

  const submit = async (event) => {
    event.preventDefault();

    const cleanCode = code.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      toast.info("Enter the complete 6-digit confirmation code");
      return;
    }

    setBusy(true);

    try {
      if (isSignup) {
        // Signup: verify the email and consume the verification code.
        await confirmCode(email, cleanCode);
        navigate("/login", {
          replace: true,
          state: { email, from: location.state?.from },
        });
      } else {
        // Password recovery: validate the code but keep it for the
        // new-password request.
        const result = await verifyResetCode(email, cleanCode);

        if (!result?.success) {
          toast.error(
            result?.message || "Invalid or expired reset code"
          );
          return;
        }

        navigate("/enter-new-password", {
          state: { email, code: cleanCode },
        });
      }
    } catch {
      // Signup errors are already displayed by UserContext.
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email) {
      toast.info(
        "Go back and submit your email again to resend the code"
      );
      return;
    }

    setResending(true);

    try {
      // A reset request generates a fresh password-reset code.
      // Signup uses the dedicated verification-code resend endpoint.
      const result = isSignup
        ? await resendCode(email)
        : await forgotPassword(email);

      if (result?.success) {
        setCode("");
        toast.success(
          result.message || "A new code has been sent"
        );
      } else {
        toast.error(
          result?.message || "Could not resend the code"
        );
      }
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      variant="confirmation"
      image={confirmationImage}
    >
      <div className="sign__content sign-content _confirmation">
        <h1 className="sign-content__title">
          Enter The Confirmation Code
        </h1>

        {email && (
          <p className="mt-3 text-center text-[13px] text-[#7a7a7a]">
            We sent a code to{" "}
            <span className="font-semibold text-black">
              {email}
            </span>
          </p>
        )}
      </div>

      <div className="sign__confirmation confirmation">
        <form
          className="confirmation__form form-confirmation"
          onSubmit={submit}
        >
          <div className="form-confirmation__item">
            <input
              className="form-confirmation__input"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Confirmation Code"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>

          <div className="form-confirmation__item _button">
            <button
              type="submit"
              disabled={busy || resending}
              className="form-confirmation__button button sign-button"
            >
              {busy
                ? "Confirming…"
                : isSignup
                  ? "Confirm & Continue"
                  : "Recover Account"}
            </button>
          </div>

          <div className="form-confirmation__item">
            <div className="form-confirmation__link">
              Didn't receive Confirmation Code?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={resending || busy}
              >
                {resending ? "Resending…" : "Resend Now"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Confirmation;
