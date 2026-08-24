import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            SocialAI
          </span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: "800px",
          }}
        >
          Schedule a Demo
        </h1>
        <p
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "600px",
            marginTop: "16px",
            lineHeight: 1.4,
          }}
        >
          See Why Teams Choose SocialAI for AI-Powered Social Media Management
        </p>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              borderRadius: "40px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              fontSize: "20px",
              fontWeight: 600,
              color: "white",
            }}
          >
            Book Your Demo
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
