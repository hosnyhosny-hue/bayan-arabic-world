import JourneyEngineProvider from "../engine/core/JourneyEngineProvider";

export default function WorldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JourneyEngineProvider>{children}</JourneyEngineProvider>;
}
