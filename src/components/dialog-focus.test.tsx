// @vitest-environment jsdom

import { act } from "react";
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

  it("does not steal textarea focus when parent rerenders with a new close callback", async () => {
    const renderSheet = (onClose: () => void, value: string) => (
      <BottomSheet open title="Keep the thought" onClose={onClose}>
        <textarea aria-label="Thought" defaultValue={value} />
      </BottomSheet>
    );

    await act(async () => root.render(renderSheet(() => {}, "")));
    const input = document.querySelector("textarea");
    expect(input).not.toBeNull();
    input?.focus();
    expect(document.activeElement).toBe(input);

    // The live timer and note text can trigger new parent renders.
    await act(async () => root.render(renderSheet(() => {}, "first words")));
    expect(document.activeElement).toBe(input);
  });

  it("wraps Tab and Shift+Tab inside a note dialog", async () => {
    await act(async () =>
      root.render(
        <BottomSheet open title="Keep the thought" onClose={() => {}}>
          <textarea aria-label="Thought" />
          <button type="button">Save note</button>
        </BottomSheet>,
      ),
    );

    const close = document.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]');
    const save = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Save note");
    expect(close).toBeTruthy();
    expect(save).toBeTruthy();

    save?.focus();
    expect(document.activeElement).toBe(save);
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(close);

    close?.focus();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(save);
  });

  it("Escape uses the newest close callback without resetting the focus effect", async () => {
    const first = vi.fn();
    const latest = vi.fn();
    const sheet = (onClose: () => void) => (
      <BottomSheet open title="Keep the thought" onClose={onClose}>
        <textarea aria-label="Thought" />
      </BottomSheet>
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
