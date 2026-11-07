"use client";

import { useFormStatus } from "react-dom";
import styles from "./signup.module.css";

export default function SignupSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div>
      <button
        type="submit"
        className={styles.submitButton}
        disabled={pending}
        aria-busy={pending}
        style={{
          width: "100%",
          opacity: pending ? 0.75 : 1,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.help}
        style={{ minHeight: "1.5em", marginTop: "10px" }}
      >
        {pending
          ? "Please wait while we securely create your account."
          : ""}
      </p>
    </div>
  );
}