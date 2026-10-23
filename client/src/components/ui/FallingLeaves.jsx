import { useEffect, useState } from "react";

const leaves = [
  { left: "5%", size: "24px", delay: "0.15s", duration: "8.4s", drift: "38px", sway: "22px", spin: "320deg", tilt: "-18deg", tone: "deep" },
  { left: "17%", size: "18px", delay: "0.9s", duration: "7.6s", drift: "54px", sway: "-16px", spin: "260deg", tilt: "26deg", tone: "fresh" },
  { left: "31%", size: "28px", delay: "0.45s", duration: "9.2s", drift: "-42px", sway: "18px", spin: "380deg", tilt: "-8deg", tone: "lime" },
  { left: "48%", size: "20px", delay: "1.35s", duration: "8.8s", drift: "32px", sway: "-20px", spin: "300deg", tilt: "14deg", tone: "olive" },
  { left: "63%", size: "26px", delay: "0.2s", duration: "8.1s", drift: "-36px", sway: "24px", spin: "340deg", tilt: "-24deg", tone: "deep" },
  { left: "78%", size: "17px", delay: "1.1s", duration: "7.9s", drift: "46px", sway: "-18px", spin: "280deg", tilt: "20deg", tone: "light" },
  { left: "91%", size: "22px", delay: "0.7s", duration: "9s", drift: "-28px", sway: "16px", spin: "360deg", tilt: "-12deg", tone: "fresh" }
];

let hasPlayed = false;

export default function FallingLeaves() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;
    hasPlayed = true;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="falling-leaves" aria-hidden="true">
      {leaves.map((leaf) => (
        <span
          key={leaf.left}
          className={`falling-leaf falling-leaf--${leaf.tone}`}
          style={{
            "--left": leaf.left,
            "--size": leaf.size,
            "--delay": leaf.delay,
            "--duration": leaf.duration,
            "--drift": leaf.drift,
            "--sway": leaf.sway,
            "--spin": leaf.spin,
            "--tilt": leaf.tilt
          }}
        >
          <svg viewBox="0 0 32 34" fill="none">
            <path
              d="M28 3C15.7 3.4 5.6 8.8 4.3 19.7c-.4 5.1 2.8 8.5 7.8 8.2C23.2 27.2 27.6 16.2 28 3Z"
              fill="currentColor"
            />
            <path
              d="M5.4 30.2c4.1-7.5 10.2-13.4 18.8-19.4"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              d="m11.7 22.2.5-5.6M16.1 18.1l.4-6.2M20.4 14.3l.3-5.1"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
