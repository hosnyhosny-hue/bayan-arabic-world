"use client";

import { useEffect, useState } from "react";
import styles from "../pulse-main.module.css";

const channels = [
  { value: "all", label: "الكل" },
  { value: "school-news", label: "أخبار المدرسة" },
  { value: "arabic", label: "اللغة العربية" },
  { value: "events", label: "الفعاليات" },
  { value: "achievements", label: "الإنجازات" },
  { value: "arabic-bee", label: "Arabic Bee" },
  { value: "video", label: "الفيديو" },
  { value: "community", label: "المجتمع" },
];

export default function ChannelBar() {
  const [current, setCurrent] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCurrent(params.get("channel") || "all");
  }, []);

  function select(value: string) {
    setCurrent(value);

    const url = new URL(window.location.href);

    if (value === "all") {
      url.searchParams.delete("channel");
    } else {
      url.searchParams.set("channel", value);
    }

    url.hash = "feed";

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    window.dispatchEvent(
      new CustomEvent("bayan-channel-change", {
        detail: value,
      })
    );

    document
      .getElementById("feed")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={styles.channels} aria-label="قنوات نبض بيان">
      {channels.map((channel) => (
        <button
          key={channel.value}
          type="button"
          onClick={() => select(channel.value)}
          aria-pressed={current === channel.value}
          className={`${styles.channel} ${
            current === channel.value ? styles.channelActive : ""
          }`}
        >
          {channel.label}
        </button>
      ))}
    </div>
  );
}
