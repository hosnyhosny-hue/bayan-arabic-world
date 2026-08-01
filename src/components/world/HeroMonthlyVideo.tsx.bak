"use client";

import { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useWorld } from "@/src/context/WorldContext";
import styles from "./HeroMonthlyVideo.module.css";

const VIDEO_SRC = "/media/bayan-video-of-the-month.mp4";
const POSTER_SRC = "/media/bayan-video-poster.svg";

export default function HeroMonthlyVideo() {
  const { isArabic, playSound } = useWorld();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const title = isArabic ? "نافذة بيان" : "Bayan Spotlight";
  const subtitle = isArabic
    ? "فيلم القسم لهذا الشهر"
    : "Arabic Department Film of the Month";

  const openCinema = async () => {
    playSound("click");
    setHasError(false);
    setIsOpen(true);

    window.setTimeout(async () => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = false;
      setIsMuted(false);

      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }, 120);
  };

  const closeCinema = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsPlaying(false);
    setIsOpen(false);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const restart = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const enterFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      } else {
        const safariVideo = video as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };
        safariVideo.webkitEnterFullscreen?.();
      }
    } catch {
      // Fullscreen may be unavailable in some embedded browsers.
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCinema();
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlayback();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={styles.preview}
        onClick={openCinema}
        onMouseEnter={() => playSound("hover")}
        aria-label={
          isArabic
            ? "تشغيل فيديو القسم لهذا الشهر"
            : "Play this month’s department film"
        }
      >
        <span className={styles.poster} aria-hidden="true">
          <span className={styles.posterShade} />
          <span className={styles.monthLabel}>
            {isArabic ? "فيديو الشهر" : "VIDEO OF THE MONTH"}
          </span>

          <span className={styles.playButton}>
            <Play size={25} fill="currentColor" />
          </span>

          <span className={styles.previewCopy}>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>

          <span className={styles.soundLabel}>
            <Volume2 size={15} />
            {isArabic ? "يعمل بالصوت" : "Plays with sound"}
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          className={styles.cinema}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            className={styles.backdrop}
            onClick={closeCinema}
            aria-label={isArabic ? "إغلاق الفيديو" : "Close video"}
          />

          <section className={styles.playerShell}>
            <header className={styles.playerHeader}>
              <div>
                <span>{isArabic ? "عالم بيان العربية" : "Bayan Arabic World"}</span>
                <h2>{title}</h2>
              </div>

              <button
                type="button"
                className={styles.iconButton}
                onClick={closeCinema}
                aria-label={isArabic ? "إغلاق" : "Close"}
              >
                <X size={23} />
              </button>
            </header>

            <div className={styles.videoStage}>
              <video
                ref={videoRef}
                className={styles.video}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                preload="metadata"
                playsInline
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                  setHasError(true);
                  setIsPlaying(false);
                }}
                onClick={() => void togglePlayback()}
              />

              {!isPlaying && !hasError && (
                <button
                  type="button"
                  className={styles.centerPlay}
                  onClick={() => void togglePlayback()}
                  aria-label={isArabic ? "تشغيل" : "Play"}
                >
                  <Play size={38} fill="currentColor" />
                </button>
              )}

              {hasError && (
                <div className={styles.errorMessage}>
                  <strong>
                    {isArabic
                      ? "لم يُعثر على ملف الفيديو"
                      : "The video file was not found"}
                  </strong>
                  <span>
                    {isArabic
                      ? "ضع الفيديو باسم bayan-video-of-the-month.mp4 داخل public/media"
                      : "Add bayan-video-of-the-month.mp4 inside public/media"}
                  </span>
                </div>
              )}
            </div>

            <footer className={styles.controls}>
              <div className={styles.controlGroup}>
                <button
                  type="button"
                  className={styles.controlButton}
                  onClick={() => void togglePlayback()}
                >
                  {isPlaying ? <Pause size={19} /> : <Play size={19} />}
                  <span>
                    {isPlaying
                      ? isArabic
                        ? "إيقاف مؤقت"
                        : "Pause"
                      : isArabic
                        ? "تشغيل"
                        : "Play"}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.controlButton}
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                  <span>
                    {isMuted
                      ? isArabic
                        ? "تشغيل الصوت"
                        : "Unmute"
                      : isArabic
                        ? "كتم الصوت"
                        : "Mute"}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.controlButton}
                  onClick={() => void restart()}
                >
                  <RotateCcw size={18} />
                  <span>{isArabic ? "إعادة" : "Replay"}</span>
                </button>
              </div>

              <button
                type="button"
                className={styles.controlButton}
                onClick={() => void enterFullscreen()}
              >
                <Maximize2 size={18} />
                <span>{isArabic ? "ملء الشاشة" : "Fullscreen"}</span>
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
