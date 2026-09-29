/**
 * The demo sites are self-contained designs with their own fonts. They depend
 * on the heading rules scoped to `.sss-demo` in styles/globals.css, so every
 * demo renders inside this wrapper.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className="sss-demo">{children}</div>;
}
