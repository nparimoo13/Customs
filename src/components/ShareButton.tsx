import { useState } from "react";
import { shareResult } from "../lib/share";

interface ShareButtonProps {
  text: string;
}

const MESSAGES = {
  shared: "Shared!",
  copied: "Copied to clipboard — paste it in the group chat.",
  cancelled: "",
  failed: "Couldn't copy automatically. Select the text above and copy it.",
};

export function ShareButton({ text }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  const onClick = async () => {
    const outcome = await shareResult(text);
    setMessage(MESSAGES[outcome]);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className="btn-sort w-full rounded-lg bg-cleared px-4 py-4 font-stencil text-2xl tracking-[0.2em] text-white uppercase"
      >
        Share 📋
      </button>
      <p className="mt-2 min-h-5 text-center text-sm" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
