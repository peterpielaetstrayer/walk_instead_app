"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SecondaryButton, TextLink } from "./Buttons";
import { Card } from "./ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getInstallGuidance(): { title: string; steps: string[] } {
  if (typeof navigator === "undefined") {
    return {
      title: "Add to home screen",
      steps: [
        "Open this site in your mobile browser.",
        "Use the browser menu to add it to your home screen.",
      ],
    };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

  if (isIOS) {
    return {
      title: "Add to Home Screen on iPhone",
      steps: [
        "Tap the Share button in Safari.",
        "Scroll and tap “Add to Home Screen”.",
        "Tap Add.",
      ],
    };
  }

  if (/Android/i.test(ua)) {
    return {
      title: "Install on Android",
      steps: [
        "Open the browser menu (⋮).",
        "Tap “Install app” or “Add to Home screen”.",
      ],
    };
  }

  return {
    title: "Install this app",
    steps: isSafari
      ? [
          "Use your browser’s Share or File menu.",
          "Choose “Add to Dock” or “Add to Home Screen” if available.",
        ]
      : [
          "Look for an install icon in the address bar,",
          "or open the browser menu and choose “Install app”.",
        ],
  };
}

function subscribeDisplayMode(cb: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  window.addEventListener("appinstalled", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener("appinstalled", cb);
  };
}

function getInstalledSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function getInstalledServerSnapshot() {
  return false;
}

export function InstallPrompt({
  onContinue,
  onDismissed,
  primaryLabel = "Add to home screen",
  secondaryLabel = "Continue without installing",
}: {
  onContinue: () => void;
  onDismissed?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const installed = useSyncExternalStore(
    subscribeDisplayMode,
    getInstalledSnapshot,
    getInstalledServerSnapshot,
  );
  const [showGuide, setShowGuide] = useState(false);
  const guidance = getInstallGuidance();

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        onContinue();
        return;
      }
      onDismissed?.();
      return;
    }
    setShowGuide(true);
  };

  if (installed) {
    return (
      <div className="space-y-3">
        <Card>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            This app is already installed on this device.
          </p>
        </Card>
        <SecondaryButton onClick={onContinue}>Continue</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showGuide && (
        <Card>
          <p className="font-semibold mb-2">{guidance.title}</p>
          <ol className="list-decimal pl-5 space-y-1 text-[14px] text-[var(--color-text-secondary)]">
            {guidance.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
            Browsers differ. If install is unavailable, you can keep using Walk
            Instead in the browser.
          </p>
        </Card>
      )}
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex w-full items-center justify-center gap-2 min-h-11 px-5 py-3 text-base font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
      >
        {primaryLabel}
      </button>
      <div className="flex justify-center">
        <TextLink
          onClick={() => {
            onDismissed?.();
            onContinue();
          }}
        >
          {secondaryLabel}
        </TextLink>
      </div>
    </div>
  );
}
