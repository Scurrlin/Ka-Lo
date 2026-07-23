import { ImageResponse } from "next/og";

export const alt = "Ka-Lo Hane official website";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#000000",
          color: "#ffffff",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          padding: "64px",
          position: "relative",
          width: "100%"
        }}
      >
        <img
          src="https://raw.githubusercontent.com/Scurrlin/Ka-Lo/main/public/assets/Silver-Cracks.webp"
          alt=""
          width="430"
          height="430"
          style={{
            borderRadius: "8px",
            boxShadow: "0 28px 80px rgba(255,255,255,0.18)",
            height: "430px",
            objectFit: "cover",
            width: "430px"
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "26px",
            marginLeft: "72px",
            maxWidth: "530px"
          }}
        >
          <div
            style={{
              fontSize: "118px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.86
            }}
          >
            KΛLO
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 500,
              lineHeight: 1.15
            }}
          >
            Ka-Lo Hané
          </div>
          <div
            style={{
              color: "#d7d7d0",
              fontSize: "34px",
              fontWeight: 400,
              lineHeight: 1.2
            }}
          >
            Not your traditional rapper
          </div>
        </div>
      </div>
    ),
    size
  );
}
