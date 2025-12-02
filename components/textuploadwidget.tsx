"use client";

import React, { useState } from "react";

const cardStyle: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.55)",
  borderRadius: "24px",
  padding: "24px 28px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
};

const TextGenerateWidget: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleClear = () => {
    setPrompt("");
    setNegativePrompt("");
    setStatus(null);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setStatus("Please enter a text prompt first.");
      return;
    }

    setStatus(
      "Request prepared. Once the backend is connected, this prompt will be sent to the reconstruction pipeline."
    );

    console.log("TEXT GENERATE PAYLOAD:", {
      prompt,
      negativePrompt,
    });
  };

  return (
    <div
      style={{
        padding: "80px 10vw 40px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 10,
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Generate from text
        </h1>

        <p
          style={{
            opacity: 0.9,
            maxWidth: 820,
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.92)",
            marginTop: 8,
          }}
        >
          Describe a single object in natural language. We will process your
          description and send it into our reconstruction backend.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: "2 1 420px", ...cardStyle }}>
          <div
            style={{
              borderRadius: "18px",
              border: "1px dashed rgba(255, 255, 255, 0.3)",
              padding: "18px 20px",
              marginBottom: 20,
              minHeight: 220,
              background:
                "radial-gradient(circle at 10% 0%, rgba(255,255,255,0.03), transparent 55%)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                marginBottom: 8,
                opacity: 0.85,
                fontWeight: 500,
              }}
            >
              Text prompt
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A red toy car with glossy paint and four black wheels."
              style={{
                width: "100%",
                minHeight: 140,
                resize: "vertical",
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(0, 0, 0, 0.45)",
                color: "#fff",
                padding: "10px 12px",
                fontSize: 14,
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              <span>
                {prompt.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <span>Keep it concise and object-focused.</span>
            </div>
          </div>

          {/* Negative prompt row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: "1 1 220px" }}>
              <div
                style={{
                  fontSize: 13,
                  marginBottom: 4,
                  opacity: 0.85,
                  fontWeight: 500,
                }}
              >
                Negative prompt (optional)
              </div>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="e.g. no background, no people, no text"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(0, 0, 0, 0.45)",
                  color: "#fff",
                  padding: "8px 10px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "8px 24px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.6)",
                background: "transparent",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                transition: "0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              style={{
                padding: "8px 28px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.85)",
                background: "transparent",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Generate
            </button>

            {status && (
              <span style={{ fontSize: 12, opacity: 0.8 }}>{status}</span>
            )}
          </div>
        </div>

        <div style={{ flex: "1.6 1 320px", ...cardStyle }}>
          <h2 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>
            Prompt example
          </h2>

          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              lineHeight: 1.55,
              opacity: 0.9,
            }}
          >
            • a meerkat wearing cool black sunglasses and a stylish brown leather
            jacket, high detail, professional photography
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextGenerateWidget;
