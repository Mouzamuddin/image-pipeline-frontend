import React, { useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Slider,
  Typography,
  Box,
  Container,
  Stack, 
} from "@mui/material";
import logo from './img/imagepipeline-logo.webp'; 
import "./App.css";
const baseurl = process.env.REACT_APP_BASE_URL;


function App() {
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [brushSize, setBrushSize] = useState(10); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);

      const maskCanvas = maskCanvasRef.current;
      const maskCtx = maskCanvas.getContext("2d");
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  };

  const handleMouseDown = (e) => {
    if (!image) return;
    setIsDrawing(true);
    draw(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    maskCtx.fillStyle = "white";
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const exportMask = async () => {
    const maskCanvas = maskCanvasRef.current;
    const maskBlob = await new Promise((resolve) => maskCanvas.toBlob(resolve));

    const formData = new FormData();
    formData.append("original_image", document.querySelector("input[type=file]").files[0]);
    formData.append("mask_image", maskBlob, "mask.png");
    formData.append("description", "Example inpainting image");

    try {
      const response = await fetch(`${baseurl}upload/`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log("Upload successful:", result);
        setUploadedData(result.data);
        alert("Upload successful!");
      } else {
        console.error("Upload failed:", result);
        alert("Upload failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during the upload.");
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#1a1a27", boxShadow: "none" }}>
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: 40,
              marginRight: 2,
            }}
          />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ mt: 4, color: "white", padding: 4, minHeight: "100vh" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Image Inpainting Widget
        </Typography>

        {/* Choose File Button */}
        <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#1a1a27", 
              color: "#F9F9F9", 
              border: "2px solid #1a1a27",
              boxShadow: "0 0 15px 5px rgba(67, 74, 39, 0.7)", 
              '&:hover': {
                boxShadow: "0 0 20px 7px rgba(67, 74, 39, 1)", 
              }
            }}
          >
            Choose File
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
              hidden
            />
          </Button>
        </Box>

        {/* Canvas */}
        <Box sx={{ position: "relative", marginTop: 2 }}>
          {image && (
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                cursor: "crosshair",
                border: "1px solid black",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={draw}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            ></canvas>
          )}
          <canvas ref={maskCanvasRef} width={600} height={400} style={{ display: "none" }}></canvas>
        </Box>

        {/* Brush Size Control */}
        {image && (
          <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center", gap: 2 }}>
            <Typography variant="h6" color="white" sx={{ alignSelf: "center" }}>
              Brush Size: {brushSize}
            </Typography>
            <Slider
              value={brushSize}
              min={5}
              max={50}
              step={1}
              onChange={(e, newValue) => setBrushSize(newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}px`}
              sx={{ width: 200 }}
            />
          </Box>
        )}

        {/* Control Buttons */}
        {image && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={clearCanvas}
              sx={{
                backgroundColor: "#242433", 
                color: "#F9F9F9", 
                '&:hover': {
                  backgroundColor: "#434a27", 
                  color: "#F9F9F9", 
                },
              }}
            >
              Clear Canvas
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={exportMask}
              sx={{
                backgroundColor: "#242433", 
                color: "#F9F9F9", 
                '&:hover': {
                  backgroundColor: "#434a27", 
                  color: "#F9F9F9", 
                },
              }}
            >
              Export Mask
            </Button>
          </Box>
        )}

        {/* Display Uploaded and Masked Images */}
        {uploadedData && (
          <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography align="center">Original Image</Typography>
              <img
                src={uploadedData.original_image_url}
                alt="Original"
                style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography align="center">Mask Image</Typography>
              <img
                src={uploadedData.mask_image_url}
                alt="Mask"
                style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
              />
            </Box>
          </Stack>
        )}
      </Container>
    </>
  );
}

export default App;
