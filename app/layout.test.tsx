import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";

import { useTheme } from "@/components/theme-provider";
import { useWallet } from "@/components/wallet-provider";

import RootLayout from "./layout";

// Mock the components that we aren't testing, so they don't do real DOM operations or fetch data
vi.mock("@/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("@/components/skip-link", () => ({
  SkipLink: () => <a data-testid="skip-link">Skip</a>,
}));

// We will NOT mock the Providers because the requirement states:
// "Add a test asserting the providers are actually present and wrapping the tree
// (e.g. by rendering a probe component that consumes one of the provided contexts
// and asserting it receives a value, rather than just checking the provider component appears in a snapshot)."

// Since WalletProvider and ThemeProvider might use client-side hooks,
// we have to mock their dependencies if they complain in a server render,
// but let's assume they work with renderToStaticMarkup (as shown in wallet-provider.test.tsx).

function Probe() {
  const { theme } = useTheme();
  const wallet = useWallet();
  return (
    <div data-testid="probe" data-theme={theme} data-wallet-ready={wallet !== undefined}>
      Probe Active
    </div>
  );
}

describe("RootLayout", () => {
  it("renders the header and correctly renders its children", () => {
    const el = RootLayout({ children: <div data-testid="child">Test Child</div> });
    const htmlString = renderToStaticMarkup(el);

    expect(htmlString).toContain("Test Child");
    expect(htmlString).toContain("Header");
    expect(htmlString).toContain("Skip"); // from skip-link mock
  });

  it("wraps the tree in providers", () => {
    const el = RootLayout({ children: <Probe /> });
    const htmlString = renderToStaticMarkup(el);

    // The probe should successfully consume the contexts and render them
    // Assuming default theme is "dark" and wallet context is defined
    expect(htmlString).toContain("Probe Active");
    expect(htmlString).toContain('data-theme="dark"'); // ThemeProvider default
    expect(htmlString).toContain('data-wallet-ready="true"');
  });
});
