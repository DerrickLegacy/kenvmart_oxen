import { Image } from "react-bootstrap";

function CarouselImage({
  text,
  textColor = "#fff",
  textAlign = "center",
  imageUrl,
  altText,
  height = "400px",
  objectFit = "cover", // 1. Added new prop with default fallback
  children,
}) {
  return (
    <div style={{ position: "relative", height: height, overflow: "hidden" }}>
      <Image
        src={
          imageUrl ||
          "https://via.placeholder.com/1200x400/007bff/ffffff?text=" + text
        }
        alt={altText || text || "Carousel image"}
        fluid
        style={{
          width: "100%",
          height: "100%",
          objectFit: objectFit, // 2. Bind the prop here
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: textAlign,
          padding: "20px",
        }}
      >
        {children || (
          <div>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: textColor,
                textAlign: textAlign,
              }}
            >
              {text || "Slide Title"}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarouselImage;
