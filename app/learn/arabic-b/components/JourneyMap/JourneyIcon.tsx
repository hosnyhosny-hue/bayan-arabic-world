import type { JourneyStop } from "./journey-data";

type JourneyIconProps = {
  name: JourneyStop["icon"];
};

export default function JourneyIcon({ name }: JourneyIconProps) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "school") {
    return (
      <svg {...common}>
        <path d="m3 10 9-6 9 6" />
        <path d="M5 9v10h14V9" />
        <path d="M9 19v-6h6v6" />
        <path d="M9 9h.01M15 9h.01" />
      </svg>
    );
  }

  if (name === "canteen") {
    return (
      <svg {...common}>
        <path d="M6 3v8M3.5 3v5a2.5 2.5 0 0 0 5 0V3M6 11v10" />
        <path d="M15 3v18M15 3c4 1 5 5 2 9h-2" />
      </svg>
    );
  }

  if (name === "library") {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    );
  }

  if (name === "market") {
    return (
      <svg {...common}>
        <path d="M3 9h18l-2-5H5L3 9Z" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
        <path d="M3 9c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0" />
      </svg>
    );
  }

  if (name === "hospital") {
    return (
      <svg {...common}>
        <path d="M4 21V6h16v15" />
        <path d="M9 21v-5h6v5" />
        <path d="M9 10h6M12 7v6" />
        <path d="M2 21h20" />
      </svg>
    );
  }

  if (name === "airport") {
    return (
      <svg {...common}>
        <path d="M22 2 9 15" />
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m3 10 9-6 9 6-9 6-9-6Z" />
      <path d="M7 12v5c3 2 7 2 10 0v-5" />
      <path d="M21 10v6" />
    </svg>
  );
}
