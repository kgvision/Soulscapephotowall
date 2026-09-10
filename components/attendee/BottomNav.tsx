"use client";

import styles from "./BottomNav.module.css";

const ITEMS = [
  { key: "feed", num: "01", label: "THE PHOTO WALL" },
  { key: "capture", num: "02", label: "CAMERA" },
  { key: "mine", num: "03", label: "MY PHOTOS" },
] as const;

type NavKey = (typeof ITEMS)[number]["key"];

export function BottomNav({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (screen: NavKey) => void;
}) {
  return (
    <div className={styles.nav}>
      {ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={styles.item}
          data-active={item.key === active ? "" : undefined}
          onClick={() => onNavigate(item.key)}
        >
          <span className={styles.num}>{item.num}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
