"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// SECTION 00 — OTT Subscription Hub
// ─────────────────────────────────────────────
export function IllustSubscription() {
  const rootRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const orbit = orbitRef.current;
    if (!root || !orbit) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 52, scale: 0.94 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 84%",
        once: true,
        onEnter: () => {
          gsap.to(root, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          });
        },
      });

      // Slow orbit rotation
      gsap.to(orbit, {
        rotation: 360,
        duration: 22,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center",
      });

      // Counter-rotate each badge so they stay upright
      orbit.querySelectorAll(".orbit-badge").forEach((badge) => {
        gsap.to(badge, {
          rotation: -360,
          duration: 22,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
        });
      });

      // Hub glow pulse
      gsap.to(root.querySelector(".hub-glow"), {
        scale: 1.35,
        opacity: 0.35,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Savings badge pop
      gsap.to(root.querySelector(".savings-badge"), {
        scale: 1.06,
        duration: 1.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Card float
      gsap.to(root, {
        y: "-=11",
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.0,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const OTT_BADGES = [
    { label: "N", color: "#E50914", bg: "rgba(229,9,20,0.14)", top: 0, left: 88 },
    { label: "D+", color: "#4fc3f7", bg: "rgba(79,195,247,0.14)", top: 88, left: 176 },
    { label: "▶", color: "#FF0000", bg: "rgba(255,80,80,0.14)", top: 176, left: 88 },
    { label: "W", color: "#ff4d7b", bg: "rgba(255,77,123,0.14)", top: 88, left: 0 },
  ];

  return (
    <div
      ref={rootRef}
      style={{
        width: 400,
        height: 470,
        background: "linear-gradient(150deg, #0d0d16 0%, #090910 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Background glow */}
      <div
        className="hub-glow"
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.45) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
        }}
      >
        00 — SUBMATE / OTT
      </div>

      {/* Orbit area */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: "50%",
          transform: "translateX(-50%)",
          width: 216,
          height: 216,
        }}
      >
        {/* Dashed ring */}
        <svg
          viewBox="0 0 216 216"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <circle
            cx="108"
            cy="108"
            r="92"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        </svg>

        {/* Rotating orbit container */}
        <div
          ref={orbitRef}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "108px 108px",
          }}
        >
          {OTT_BADGES.map((badge, i) => (
            <div
              key={i}
              className="orbit-badge"
              style={{
                position: "absolute",
                top: badge.top,
                left: badge.left,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: badge.bg,
                border: `1px solid ${badge.color}44`,
                color: badge.color,
                fontSize: 13,
                fontWeight: 800,
                backdropFilter: "blur(8px)",
                transformOrigin: "center center",
                fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
              }}
            >
              {badge.label}
            </div>
          ))}
        </div>

        {/* Center hub */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 68,
            height: 68,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #0071e3 100%)",
            boxShadow:
              "0 0 44px rgba(79,70,229,0.75), 0 8px 28px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            S
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: 290,
          left: 28,
          right: 28,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Price + savings */}
      <div
        style={{ position: "absolute", bottom: 32, left: 28, right: 28 }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          파티원 기준 / 월
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
                  fontSize: 40,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: -1.5,
                  lineHeight: 1,
                }}
              >
                ₩5,240
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.22)",
                  textDecoration: "line-through",
                }}
              >
                ₩17,000
              </span>
            </div>
          </div>

          <div
            className="savings-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              padding: "6px 12px",
              background: "rgba(52,211,153,0.13)",
              border: "1px solid rgba(52,211,153,0.28)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 6px #34d399",
              }}
            />
            <span
              style={{ color: "#34d399", fontSize: 13, fontWeight: 700 }}
            >
              68% 절약
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.28)",
            fontSize: 11,
          }}
        >
          <Icon
            icon="solar:star-bold"
            style={{ fontSize: 12, color: "#facc15" }}
          />
          Netflix · Disney+ · YouTube · Watcha 외 3개
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 02 — Private Email / Domain
// ─────────────────────────────────────────────
export function IllustEmail() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 52, scale: 0.94 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 84%",
        once: true,
        onEnter: () => {
          gsap.to(root, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          });

          // Arrow bounce
          gsap.fromTo(
            root.querySelector(".transform-arrow"),
            { y: -4 },
            {
              y: 4,
              duration: 0.9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: 0.6,
            },
          );
        },
      });

      // Shield glow pulse
      gsap.to(root.querySelector(".shield-glow"), {
        scale: 1.3,
        opacity: 0.4,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Card float
      gsap.to(root, {
        y: "-=11",
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.8,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        width: 400,
        height: 470,
        background: "linear-gradient(150deg, #090e12 0%, #060a0e 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Teal glow */}
      <div
        className="shield-glow"
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 230,
          height: 230,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,184,166,0.38) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
        }}
      >
        02 — PRIVATE EMAIL
      </div>

      {/* Envelope illustration */}
      <div
        style={{
          position: "absolute",
          top: 62,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <svg viewBox="0 0 130 104" width={130} height={104}>
          <defs>
            <linearGradient
              id="env-teal"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
            </linearGradient>
            <filter id="env-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="2"
            y="2"
            width="126"
            height="100"
            rx="14"
            fill="url(#env-teal)"
            stroke="rgba(20,184,166,0.5)"
            strokeWidth="1.5"
          />
          <polyline
            points="2,2 65,58 128,2"
            fill="none"
            stroke="rgba(20,184,166,0.65)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line
            x1="2"
            y1="102"
            x2="46"
            y2="58"
            stroke="rgba(20,184,166,0.28)"
            strokeWidth="1"
          />
          <line
            x1="128"
            y1="102"
            x2="84"
            y2="58"
            stroke="rgba(20,184,166,0.28)"
            strokeWidth="1"
          />
        </svg>

        {/* Lock badge on envelope */}
        <div
          style={{
            position: "absolute",
            right: -10,
            top: -10,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #14b8a6, #0d9488)",
            boxShadow: "0 0 22px rgba(20,184,166,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            icon="solar:lock-bold"
            style={{ fontSize: 15, color: "white" }}
          />
        </div>
      </div>

      {/* Email transform flow */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 28,
          right: 28,
        }}
      >
        {/* From row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 14,
            padding: "11px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Icon
            icon="solar:letter-bold"
            style={{ fontSize: 16, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "SF Mono, Menlo, monospace",
              fontSize: 12.5,
              color: "rgba(255,255,255,0.28)",
              textDecoration: "line-through",
              textDecorationColor: "rgba(239,68,68,0.55)",
              flex: 1,
            }}
          >
            you@gmail.com
          </span>
          <Icon
            icon="solar:close-circle-bold"
            style={{ fontSize: 15, color: "#ef4444", flexShrink: 0 }}
          />
        </div>

        {/* Arrow */}
        <div
          className="transform-arrow"
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "10px 0",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(20,184,166,0.14)",
              border: "1px solid rgba(20,184,166,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon="solar:arrow-down-bold"
              style={{ fontSize: 15, color: "#14b8a6" }}
            />
          </div>
        </div>

        {/* To row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 14,
            padding: "11px 14px",
            background: "rgba(20,184,166,0.08)",
            border: "1px solid rgba(20,184,166,0.22)",
          }}
        >
          <Icon
            icon="solar:letter-opened-bold"
            style={{ fontSize: 16, color: "#14b8a6", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "SF Mono, Menlo, monospace",
              fontSize: 12.5,
              color: "rgba(255,255,255,0.85)",
              flex: 1,
            }}
          >
            abc@submate.app
          </span>
          <Icon
            icon="solar:check-circle-bold"
            style={{ fontSize: 15, color: "#34d399", flexShrink: 0 }}
          />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          bottom: 76,
          left: 28,
          right: 28,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Bottom badge */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 28,
          right: 28,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            padding: "7px 18px",
            background: "rgba(20,184,166,0.1)",
            border: "1px solid rgba(20,184,166,0.22)",
          }}
        >
          <Icon
            icon="solar:shield-keyhole-bold"
            style={{ fontSize: 15, color: "#14b8a6" }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#14b8a6",
              textTransform: "uppercase",
            }}
          >
            Private Domain
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 03 — Fast Auto Matching
// ─────────────────────────────────────────────
export function IllustMatching() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 52, scale: 0.94 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 84%",
        once: true,
        onEnter: () => {
          gsap.to(root, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          });

          // Profiles slide in from sides
          gsap.fromTo(
            root.querySelector(".profile-left"),
            { x: -24, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", delay: 0.3 },
          );
          gsap.fromTo(
            root.querySelector(".profile-right"),
            { x: 24, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", delay: 0.3 },
          );

          // Matched badge pop
          gsap.fromTo(
            root.querySelector(".matched-badge"),
            { scale: 0.6, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.5,
              ease: "back.out(2)",
              delay: 0.85,
            },
          );
        },
      });

      // Bolt pulse
      gsap.to(root.querySelector(".bolt-badge"), {
        scale: 1.12,
        boxShadow: "0 0 36px rgba(251,191,36,0.65)",
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Card float
      gsap.to(root, {
        y: "-=11",
        duration: 2.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        width: 400,
        height: 470,
        background: "linear-gradient(150deg, #0e0c08 0%, #0a0906 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Amber glow */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
        }}
      >
        03 — FAST MATCHING
      </div>

      {/* Profiles + connection */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 36px",
        }}
      >
        {/* Left profile */}
        <div
          className="profile-left"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(79,70,229,0.08))",
              border: "1px solid rgba(79,70,229,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
            }}
          >
            <Icon
              icon="solar:user-rounded-bold"
              style={{ fontSize: 32, color: "rgba(165,180,252,0.85)" }}
            />
          </div>
          <div
            style={{
              borderRadius: 999,
              padding: "4px 10px",
              background: "rgba(79,70,229,0.18)",
              border: "1px solid rgba(79,70,229,0.32)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a5b4fc",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              파티장
            </span>
          </div>
        </div>

        {/* Center bolt */}
        <div style={{ flex: 1, position: "relative", height: 72 }}>
          {/* Dashed connector line */}
          <svg
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              width: "100%",
              height: 2,
              transform: "translateY(-50%)",
            }}
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="rgba(251,191,36,0.22)"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
          </svg>

          {/* Bolt */}
          <div
            className="bolt-badge"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              boxShadow: "0 0 28px rgba(251,191,36,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon="solar:bolt-bold"
              style={{ fontSize: 24, color: "white" }}
            />
          </div>
        </div>

        {/* Right profile */}
        <div
          className="profile-right"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background:
                "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.08))",
              border: "1px solid rgba(20,184,166,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
            }}
          >
            <Icon
              icon="solar:user-rounded-bold"
              style={{ fontSize: 32, color: "rgba(94,234,212,0.85)" }}
            />
          </div>
          <div
            style={{
              borderRadius: 999,
              padding: "4px 10px",
              background: "rgba(20,184,166,0.18)",
              border: "1px solid rgba(20,184,166,0.32)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#2dd4bf",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              파티원
            </span>
          </div>
        </div>
      </div>

      {/* Matched banner */}
      <div
        className="matched-badge"
        style={{
          position: "absolute",
          top: 228,
          left: 28,
          right: 28,
          borderRadius: 18,
          padding: "16px 20px",
          background: "rgba(251,191,36,0.07)",
          border: "1px solid rgba(251,191,36,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Icon
          icon="solar:check-circle-bold"
          style={{ fontSize: 20, color: "#fbbf24" }}
        />
        <span
          style={{
            fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: -0.4,
          }}
        >
          파티 매칭 완료
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          bottom: 108,
          left: 28,
          right: 28,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Stats row */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 28,
          right: 28,
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {[
          {
            icon: "solar:bolt-bold",
            label: "AUTO",
            sub: "자동 매칭",
            color: "#fbbf24",
          },
          {
            icon: "solar:stopwatch-bold",
            label: "FAST",
            sub: "빠른 시작",
            color: "#34d399",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon
              icon={stat.icon}
              style={{ fontSize: 22, color: stat.color }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: stat.color,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 04 — Start Date Selection
// ─────────────────────────────────────────────
export function IllustStartDate() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 52, scale: 0.94 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 84%",
        once: true,
        onEnter: () => {
          gsap.to(root, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          });

          // Calendar cells stagger in
          gsap.fromTo(
            root.querySelectorAll(".cal-cell"),
            { autoAlpha: 0, scale: 0.6 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.32,
              stagger: 0.035,
              ease: "back.out(2)",
              delay: 0.35,
            },
          );
        },
      });

      // Selected date glow pulse
      gsap.to(root.querySelector(".selected-cell"), {
        boxShadow:
          "0 0 32px rgba(14,165,233,0.8), 0 0 64px rgba(14,165,233,0.2)",
        duration: 1.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Card float
      gsap.to(root, {
        y: "-=11",
        duration: 3.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.7,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const AVAILABLE = new Set([6, 7, 13, 14, 15, 20, 21]);
  const OCCUPIED = new Set([1, 2, 3, 4, 8, 9, 10, 16, 17]);
  const SELECTED = 15;
  const DATES = Array.from({ length: 21 }, (_, i) => i + 1);

  return (
    <div
      ref={rootRef}
      style={{
        width: 400,
        height: 470,
        background: "linear-gradient(150deg, #080c14 0%, #060a10 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Sky glow */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,165,233,0.32) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            이용 시작일 선택
          </div>
          <div
            style={{
              fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              marginTop: 5,
              letterSpacing: -0.5,
            }}
          >
            2025년 6월
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
          <Icon
            icon="solar:alt-arrow-left-bold"
            style={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }}
          />
          <Icon
            icon="solar:alt-arrow-right-bold"
            style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}
          />
        </div>
      </div>

      {/* Weekday labels */}
      <div
        style={{
          position: "absolute",
          top: 108,
          left: 28,
          right: 28,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          textAlign: "center",
        }}
      >
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div
            key={d}
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.22)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          position: "absolute",
          top: 132,
          left: 28,
          right: 28,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 5,
        }}
      >
        {DATES.map((date) => {
          const isSelected = date === SELECTED;
          const isAvailable = AVAILABLE.has(date);
          const isOccupied = OCCUPIED.has(date);

          const cellStyle: React.CSSProperties = isSelected
            ? {
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                color: "white",
                boxShadow: "0 0 22px rgba(14,165,233,0.55)",
                fontWeight: 700,
              }
            : isAvailable
              ? {
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.26)",
                  color: "#38bdf8",
                  fontWeight: 600,
                }
              : isOccupied
                ? {
                    background: "transparent",
                    color: "rgba(255,255,255,0.14)",
                    fontWeight: 400,
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 400,
                  };

          return (
            <div
              key={date}
              className={`cal-cell${isSelected ? " selected-cell" : ""}`}
              style={{
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                ...cellStyle,
              }}
            >
              {date}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 28,
          right: 28,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {[
          { color: "#0ea5e9", label: "빈자리" },
          { color: "rgba(255,255,255,0.14)", label: "마감" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            <span
              style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
        <div
          style={{
            borderRadius: 999,
            padding: "5px 12px",
            background: "rgba(14,165,233,0.12)",
            border: "1px solid rgba(14,165,233,0.22)",
          }}
        >
          <span
            style={{ fontSize: 11, fontWeight: 600, color: "#38bdf8" }}
          >
            6월 15일 선택됨
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 05 — Auto Payment Flow (No DM)
// ─────────────────────────────────────────────
export function IllustAutoFlow() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 0, y: 52, scale: 0.94 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 84%",
        once: true,
        onEnter: () => {
          gsap.to(root, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
          });

          // DM bubble strike
          gsap.fromTo(
            root.querySelector(".dm-strike"),
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.45,
              ease: "power3.out",
              delay: 0.55,
              transformOrigin: "left center",
            },
          );

          // Flow nodes appear
          gsap.fromTo(
            root.querySelectorAll(".flow-node"),
            { autoAlpha: 0, scale: 0.7 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              stagger: 0.18,
              ease: "back.out(2)",
              delay: 0.75,
            },
          );
        },
      });

      // Arrow flow animation
      root.querySelectorAll(".flow-arrow-icon").forEach((arrow, i) => {
        gsap.to(arrow, {
          x: 5,
          opacity: 0.35,
          duration: 0.75,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.18,
        });
      });

      // DM bubble fade
      gsap.to(root.querySelector(".dm-bubble"), {
        opacity: 0.32,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Card float
      gsap.to(root, {
        y: "-=11",
        duration: 3.0,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.9,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        width: 400,
        height: 470,
        background: "linear-gradient(150deg, #0d0810 0%, #0a060c 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Violet glow */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
        }}
      >
        05 — AUTO PAYMENT
      </div>

      {/* DM crossed out */}
      <div
        style={{ position: "absolute", top: 66, left: 28, right: 28 }}
      >
        <div
          className="dm-bubble"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <Icon
            icon="solar:chat-round-dots-bold"
            style={{ fontSize: 17, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.32)",
              fontStyle: "italic",
              flex: 1,
            }}
          >
            "이번 달 정산 부탁드려요 🙏"
          </span>
          {/* Strike-through overlay */}
          <div
            className="dm-strike"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 2,
              background:
                "linear-gradient(90deg, transparent 10%, rgba(239,68,68,0.65) 20%, rgba(239,68,68,0.65) 80%, transparent 90%)",
              transform: "translateY(-50%)",
              transformOrigin: "left center",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingLeft: 4,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 6px #ef4444",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "rgba(239,68,68,0.75)",
              textTransform: "uppercase",
            }}
          >
            No More DM
          </span>
        </div>
      </div>

      {/* Flow diagram */}
      <div
        style={{ position: "absolute", top: 188, left: 28, right: 28 }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          자동 정산 흐름
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {[
            {
              type: "node" as const,
              icon: "solar:card-bold",
              label: "카드",
              color: "#a78bfa",
            },
            { type: "arrow" as const },
            {
              type: "node" as const,
              icon: "solar:refresh-circle-bold",
              label: "자동결제",
              color: "#818cf8",
            },
            { type: "arrow" as const },
            {
              type: "node" as const,
              icon: "solar:wallet-money-bold",
              label: "정산완료",
              color: "#34d399",
            },
          ].map((item, i) => {
            if (item.type === "arrow") {
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  {[0, 1, 2].map((j) => (
                    <Icon
                      key={j}
                      icon="solar:arrow-right-bold"
                      className="flow-arrow-icon"
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.2)",
                        opacity: 1 - j * 0.22,
                      }}
                    />
                  ))}
                </div>
              );
            }
            return (
              <div
                key={i}
                className="flow-node"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    boxShadow: `0 4px 20px ${item.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    icon={item.icon}
                    style={{ fontSize: 24, color: item.color }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          bottom: 86,
          left: 28,
          right: 28,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        }}
      />

      {/* Bottom checks */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 28,
          right: 28,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {[
          "독촉 부담 없이 자동 정산",
          "파티원 카드 자동결제 / 파티장 계좌 자동수취",
        ].map((text) => (
          <div
            key={text}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Icon
              icon="solar:check-circle-bold"
              style={{ fontSize: 14, color: "#34d399", flexShrink: 0 }}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
