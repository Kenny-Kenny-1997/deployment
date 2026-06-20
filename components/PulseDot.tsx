type PulseDotProps = {
  size?: "sm" | "md";
  label?: string;
};

/**
 * The signature visual element for Pulse: a small dot with an expanding
 * ring, like a heartbeat on a monitor. Used wherever something is "live" -
 * next to the logo, on active/online indicators, on the compose button.
 */
export function PulseDot({ size = "sm", label }: PulseDotProps) {
  const dimensions = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex">
        <span className={`relative inline-flex rounded-full bg-pulse ${dimensions}`} />
        <span
          className={`absolute inline-flex rounded-full bg-pulse ${dimensions} animate-pulseRing`}
          aria-hidden="true"
        />
      </span>
      {label && <span className="text-xs text-mist-300">{label}</span>}
    </span>
  );
}
