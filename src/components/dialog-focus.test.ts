// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./Dialog";

describe("walk note sheet focus lifecycle", () => {
  let mount: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    mount = document.createElement("div");
    document.body.appendChild(mount);
    root = createRoot(mount);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    mount.remove();
  });

  it("does not steal textarea focus when its parent rerenders with a new close callback", async () => {
    const renderSheet = (onClose: () => void, value: string) =>
      createElement(
        BottomSheet,
        { open: true, title: "Keep the thought", onClose, children: createElement("textarea", { "aria-label": "Thought", defaultValue: value }) },
      );

    await act(async () => root.render(renderSheet(() => {}, "")));
    const input = document.querySelector("textarea");
    expect(input).not.toBeNull();
    input?.focus();
    expect(document.activeElement).toBe(input);

    // The live timer and note text trigger parent renders every few seconds/keystrokes.
    await act(async () => root.render(renderSheet(() => {}, "first words")));
    expect(document.activeElement).toBe(input);
  });

  it("Escape uses the newest close callback without re-running the focus effect", async () => {
    const first = vi.fn();
    const latest = vi.fn();
    const sheet = (onClose: () => void) =>
      createElement(
        BottomSheet,
        { open: true, title: "Keep the thought", onClose, children: createElement("textarea", { "aria-label": "Thought" }) },
      );

    await act(async () => root.render(sheet(first)));
    await act(async () => root.render(sheet(latest)));
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });
});
