import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Leaf,
  Loader2,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
  ArrowRight,
  AlertTriangle,
  Info,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import { API_URL } from "../config";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ScanWaste() {
  const [mode, setMode] = useState("upload");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  /* ================= FILE UPLOAD ================= */

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setResult(null);

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setResult({
        error:
          "Unsupported image format. Please upload a JPG, PNG or WEBP image.",
      });

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setResult({
        error:
          "Image is too large. Please choose an image smaller than 10 MB.",
      });

      return;
    }

    setFile(selectedFile);

    const imageUrl = URL.createObjectURL(selectedFile);

    setPreview(imageUrl);
  }

  /* ================= IMAGE ANALYSIS ================= */

  async function analyzeImage() {
    if (!file || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `AI server returned status ${response.status}`
        );
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        error:
          "Unable to connect to the AI server. Make sure FastAPI is running on port 8000.",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= CAMERA ================= */

  async function startCamera() {
    if (cameraActive) return;

    setCameraError("");
    setResult(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (error) {
      console.error(error);

      setCameraError(
        "Camera access was denied or unavailable. Please allow camera permission and try again."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  }

  /* ================= CAMERA CAPTURE ================= */

  function captureFrame() {
    if (!videoRef.current || loading) return;

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setResult({
        error:
          "Camera is still starting. Please wait a moment and try again.",
      });

      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setResult({
        error: "Unable to capture the camera frame.",
      });

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setResult({
            error: "Unable to create an image from the camera.",
          });

          return;
        }

        setLoading(true);
        setResult(null);

        try {
          const formData = new FormData();

          formData.append(
            "file",
            blob,
            "camera-scan.jpg"
          );

          const response = await fetch(
            `${API_URL}/predict-frame`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(
              `Camera prediction failed with status ${response.status}`
            );
          }

          const data = await response.json();

          setResult(data);
        } catch (error) {
          console.error(error);

          setResult({
            error:
              "Camera prediction failed. Check that the FastAPI server is running.",
          });
        } finally {
          setLoading(false);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  /* ================= RESET ================= */

  function resetScanner() {
    stopCamera();

    setFile(null);
    setPreview("");
    setResult(null);
    setCameraError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* ================= MODE SWITCH ================= */

  function switchMode(nextMode) {
    setResult(null);

    if (nextMode === "upload") {
      stopCamera();
    }

    setMode(nextMode);
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f6f8fa] text-[#111c2c]">

        <main className="mx-auto max-w-[1050px] px-5 py-10 md:py-14">

          {/* ================= HERO ================= */}

          <div className="text-center">

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#bcebd1] bg-[#effbf4] px-4 py-2 text-[11px] font-bold text-[#087443]">
              <Sparkles size={14} />

              AI-POWERED WASTE CLASSIFICATION
            </div>

            <h1 className="mx-auto mt-6 max-w-[850px] text-[38px] font-black leading-[1.05] tracking-[-0.055em] sm:text-[52px] md:text-[62px]">
              Turn every piece of waste into{" "}
              <span className="text-[#078c51]">
                the right decision.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[650px] text-[14px] leading-6 text-[#627286] md:text-[16px]">
              Upload a waste image or use your camera.
              ECO-SORT AI classifies it as recyclable,
              organic, or hazardous.
            </p>

          </div>

          {/* ================= SCANNER ================= */}

          <div className="mx-auto mt-10 max-w-[760px] rounded-[22px] border border-[#dfe7e3] bg-white p-5 shadow-[0_20px_60px_rgba(16,45,34,0.08)] md:p-7">

            {/* TABS */}

            <div className="mx-auto flex max-w-[420px] rounded-xl bg-[#f1f5f3] p-1">

              <button
                onClick={() => switchMode("upload")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[12px] font-bold transition ${
                  mode === "upload"
                    ? "bg-white text-[#087443] shadow-sm"
                    : "text-[#657383]"
                }`}
              >
                <Upload size={16} />

                Upload Image
              </button>

              <button
                onClick={() => switchMode("camera")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[12px] font-bold transition ${
                  mode === "camera"
                    ? "bg-white text-[#087443] shadow-sm"
                    : "text-[#657383]"
                }`}
              >
                <Camera size={16} />

                Use Camera
              </button>

            </div>

            {/* ================= UPLOAD MODE ================= */}

            {mode === "upload" && (
              <div className="mt-6">

                {!preview ? (
                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="group flex min-h-[340px] w-full flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-[#9be9c0] bg-[#f7fffa] px-5 text-center transition hover:border-[#0ba460] hover:bg-[#f1fff7]"
                  >

                    <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#d8f8e5] text-[#079c59] transition group-hover:scale-105">
                      <ImagePlus size={35} />
                    </div>

                    <h2 className="mt-6 text-[17px] font-black">
                      Upload waste image
                    </h2>

                    <p className="mt-2 max-w-[400px] text-[11px] leading-5 text-[#788797]">
                      Choose a clear image of the waste
                      item. Our AI will analyze it and
                      suggest the correct disposal
                      category.
                    </p>

                    <div className="mt-6 rounded-xl bg-[#078c51] px-6 py-3 text-[11px] font-bold text-white shadow-lg shadow-[#078c51]/20">
                      Choose Image
                    </div>

                    <p className="mt-4 text-[9px] text-[#9aa5af]">
                      JPG, PNG or WEBP • Max 10 MB
                    </p>

                  </button>
                ) : (

                  <div>

                    <div className="relative overflow-hidden rounded-[18px] bg-[#eef3f0]">

                      <img
                        src={preview}
                        alt="Waste preview"
                        className="h-[380px] w-full object-contain"
                      />

                      <button
                        onClick={resetScanner}
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#52606d] shadow-lg transition hover:scale-105"
                      >
                        <X size={17} />
                      </button>

                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                      <button
                        onClick={analyzeImage}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#078c51] py-3.5 text-[12px] font-bold text-white shadow-lg shadow-[#078c51]/20 transition hover:bg-[#087845] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {loading ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />

                            AI is analyzing...
                          </>
                        ) : (
                          <>
                            <ScanLine size={17} />

                            Analyze Waste
                          </>
                        )}

                      </button>

                      <button
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={loading}
                        className="rounded-xl border border-[#cbd8d1] bg-white px-6 py-3.5 text-[12px] font-bold text-[#087443] disabled:opacity-50"
                      >
                        Change Image
                      </button>

                    </div>

                  </div>

                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </div>
            )}

            {/* ================= CAMERA MODE ================= */}

            {mode === "camera" && (
              <div className="mt-6">

                <div className="relative overflow-hidden rounded-[18px] bg-[#071b16]">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video w-full object-cover"
                  />

                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#071b16] px-5 text-center">

                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0c3b2f] text-[#55c987]">
                        <Camera size={34} />
                      </div>

                      <h2 className="mt-5 text-[18px] font-black text-white">
                        Ready to scan?
                      </h2>

                      <p className="mt-2 max-w-[380px] text-[11px] leading-5 text-[#9bb5ac]">
                        Allow camera access and position
                        the waste item clearly inside the
                        frame.
                      </p>

                      <button
                        onClick={startCamera}
                        className="mt-6 flex items-center gap-2 rounded-xl bg-[#0aa460] px-7 py-3 text-[12px] font-bold text-white transition hover:bg-[#087d4b]"
                      >
                        <Camera size={16} />

                        Start Camera
                      </button>

                    </div>
                  )}

                  {cameraActive && (
                    <>
                      {/* SCAN FRAME */}

                      <div className="pointer-events-none absolute inset-0">

                        <div className="absolute left-1/2 top-1/2 h-[65%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-[#63d795] shadow-[0_0_0_999px_rgba(0,0,0,0.12)]" />

                        <div className="absolute left-1/2 top-1/2 h-px w-[55%] -translate-x-1/2 bg-[#63d795]/70" />

                      </div>

                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-[9px] font-bold text-white backdrop-blur">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#42dc7d]" />

                        CAMERA ACTIVE

                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-[9px] font-medium text-white backdrop-blur">
                        Place waste inside the frame
                      </div>
                    </>
                  )}

                </div>

                {cameraError && (
                  <div className="mt-4 flex gap-3 rounded-xl border border-[#f0c7c7] bg-[#fff5f5] p-4 text-[11px] text-[#a53c3c]">

                    <AlertTriangle
                      size={17}
                      className="shrink-0"
                    />

                    <span>{cameraError}</span>

                  </div>
                )}

                {cameraActive && (
                  <div className="mt-4 flex gap-3">

                    <button
                      onClick={captureFrame}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#078c51] py-3.5 text-[12px] font-bold text-white disabled:opacity-60"
                    >

                      {loading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          AI is analyzing...
                        </>
                      ) : (
                        <>
                          <ScanLine size={17} />

                          Scan Waste
                        </>
                      )}

                    </button>

                    <button
                      onClick={stopCamera}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#ccd8d2] bg-white px-6 py-3.5 text-[12px] font-bold text-[#5c6c78] disabled:opacity-50"
                    >
                      <X size={16} />

                      Stop
                    </button>

                  </div>
                )}

              </div>
            )}

            {/* ================= RESULT ================= */}

            {result && !result.error && (
              <ResultCard
                result={result}
                onReset={resetScanner}
              />
            )}

            {/* ================= ERROR ================= */}

            {result?.error && (
              <div className="mt-6 rounded-xl border border-[#f1cccc] bg-[#fff5f5] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffe4e4] text-[#c94b4b]">
                    <ShieldAlert size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-bold text-[#9f3535]">
                      Something went wrong
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-[#a76666]">
                      {result.error}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setResult(null)}
                  className="mt-4 rounded-lg border border-[#e5baba] px-4 py-2 text-[10px] font-bold text-[#a53c3c]"
                >
                  Try Again
                </button>

              </div>
            )}

          </div>

          {/* ================= CATEGORY INFO ================= */}

          <div className="mt-12">

            <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#07864b]">
              SMART SORTING
            </p>

            <h2 className="mt-2 text-center text-[25px] font-black tracking-[-0.04em]">
              Three simple waste categories
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <CategoryCard
                icon={ScanLine}
                title="Recyclable"
                text="Paper, plastic, glass and other recoverable materials."
                className="bg-[#eff7ff] text-[#287fc4]"
              />

              <CategoryCard
                icon={Leaf}
                title="Organic"
                text="Food scraps, garden waste and biodegradable materials."
                className="bg-[#effaf2] text-[#14884b]"
              />

              <CategoryCard
                icon={ShieldAlert}
                title="Hazardous"
                text="Waste requiring special handling for safe disposal."
                className="bg-[#fff7e9] text-[#d67a16]"
              />

            </div>

          </div>

          {/* ================= DISCLAIMER ================= */}

          <div className="mt-8 flex gap-3 rounded-xl bg-[#063d34] p-4 text-[9px] leading-5 text-[#d4e5df]">

            <Leaf
              size={15}
              className="mt-0.5 shrink-0 text-[#64c96a]"
            />

            <p>
              <strong className="text-white">
                AI Safety Notice:
              </strong>{" "}
              Predictions may not always be 100% accurate.
              Please verify uncertain items before disposal,
              especially hazardous waste.
            </p>

          </div>

        </main>

      </div>
    </AppLayout>
  );
}

/* ================================================= */
/* RESULT CARD */
/* ================================================= */

function ResultCard({ result, onReset }) {
  const confidence = Number(result.confidence ?? 0);

  const confidenceInfo =
    getConfidenceInfo(confidence);

  return (
    <div className="mt-7 overflow-hidden rounded-[18px] border border-[#dce8e1] bg-white">

      {/* HEADER */}

      <div className="border-b border-[#e6ece8] bg-[#f8fcf9] px-5 py-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff5e6] text-[#087d46]">
              <CheckCircle2 size={22} />
            </div>

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#788991]">
                AI Classification
              </p>

              <p className="mt-0.5 text-[22px] font-black text-[#087443]">
                {result.category || "Unknown"}
              </p>

            </div>

          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold ${confidenceInfo.badge}`}
          >
            {confidenceInfo.icon}

            {confidence.toFixed(0)}% Confidence
          </div>

        </div>

        {/* CONFIDENCE BAR */}

        <div className="mt-5">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-[10px] font-bold text-[#657383]">
              AI Confidence
            </span>

            <span className="text-[10px] font-black text-[#263b32]">
              {confidenceInfo.label}
            </span>

          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8eeeb]">

            <div
              className={`h-full rounded-full transition-all duration-1000 ${confidenceInfo.bar}`}
              style={{
                width: `${Math.min(
                  Math.max(confidence, 0),
                  100
                )}%`,
              }}
            />

          </div>

          <div className="mt-2 flex justify-between text-[8px] text-[#9aa6ae]">
            <span>0%</span>
            <span>60% threshold</span>
            <span>100%</span>
          </div>

        </div>

      </div>

      {/* BODY */}

      <div className="space-y-3 p-5">

        <ResultRow
          label="Confidence Status"
          value={
            result.confidence_status ||
            confidenceInfo.label
          }
        />

        <ResultRow
          label="Recommended Bin"
          value={
            result.recommended_bin ||
            "Manual Verification"
          }
        />

        <div className="rounded-xl bg-[#f4f8fa] p-4">

          <div className="flex gap-3">

            <Info
              size={17}
              className="mt-0.5 shrink-0 text-[#4383a5]"
            />

            <div>

              <p className="text-[10px] font-black text-[#536474]">
                Disposal Guidance
              </p>

              <p className="mt-2 text-[11px] leading-5 text-[#687988]">
                {result.disposal_guidance ||
                  "Verify the item before disposal."}
              </p>

            </div>

          </div>

        </div>

        {/* AI EXPLANATION */}

        {result.explanation && (
          <div className="rounded-xl bg-[#f1faf4] p-4">

            <div className="flex gap-3">

              <Sparkles
                size={17}
                className="mt-0.5 shrink-0 text-[#16894e]"
              />

              <div>

                <p className="text-[10px] font-black text-[#087443]">
                  Why AI classified it this way
                </p>

                <p className="mt-2 text-[11px] leading-5 text-[#64796d]">
                  {result.explanation}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            EXPLAINABLE AI — GRAD-CAM
        ============================================================ */}

        {result.gradcam_available && result.gradcam_image && (
          <div className="rounded-xl border border-[#bcebd1] bg-[#f1faf4] p-4">

            <div className="flex gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dff5e6] text-[#087443]">
                <Sparkles size={17} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-black text-[#087443]">
                  Explainable AI
                </p>

                <p className="mt-1 text-[13px] font-black text-[#263b32]">
                  Why did AI classify this?
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#64796d]">
                  Grad-CAM highlights the image regions that
                  contributed more strongly to the AI prediction.
                </p>

              </div>

            </div>

            {/* GRAD-CAM VISUALIZATION */}

            <div className="mt-4 overflow-hidden rounded-xl border border-[#d6e8dd] bg-white">

              <img
                src={`data:image/jpeg;base64,${result.gradcam_image}`}
                alt="Grad-CAM visualization showing regions that influenced the AI classification"
                className="block h-auto w-full object-contain"
              />

            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-white p-3">

              <Info
                size={14}
                className="mt-0.5 shrink-0 text-[#16894e]"
              />

              <p className="text-[9px] leading-5 text-[#64796d]">
                <strong className="text-[#087443]">
                  How to read this:
                </strong>{" "}
                highlighted areas indicate where the model
                focused most when making this classification.
                This is an AI explanation, not a guarantee that
                every highlighted region represents the actual
                waste material.
              </p>

            </div>

          </div>
        )}

        {/* LOW CONFIDENCE */}

        {(result.review_required ||
          confidence < 60) && (
          <div className="rounded-xl border border-[#f0d38d] bg-[#fff9e9] p-4">

            <div className="flex gap-3">

              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-[#d88916]"
              />

              <div>

                <p className="text-[10px] font-black text-[#9b5b0a]">
                  Manual Verification Recommended
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#9d6c2e]">
                  The AI confidence is below the recommended
                  threshold. Please verify this item before
                  placing it in a waste bin.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* HAZARDOUS */}

        {(result.hazardous_warning ||
          result.category === "Hazardous") && (
          <div className="rounded-xl border border-[#f1cf8b] bg-[#fff8e8] p-4">

            <div className="flex gap-3">

              <ShieldAlert
                size={20}
                className="mt-0.5 shrink-0 text-[#db7412]"
              />

              <div>

                <p className="text-[10px] font-black text-[#9d5109]">
                  Hazardous Waste Alert
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#9d642b]">
                  Do not mix this item with regular household
                  waste. Follow authorized hazardous-waste
                  disposal procedures.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* FOOTER */}

      <div className="flex flex-col gap-3 border-t border-[#e6ece8] bg-[#fbfdfc] p-4 sm:flex-row">

        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#cbd9d1] py-3 text-[11px] font-bold text-[#087443] transition hover:bg-[#f3faf6]"
        >
          <RefreshCcw size={15} />

          Scan Another
        </button>

        <NavLink
          to="/history"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#078c51] py-3 text-[11px] font-bold text-white transition hover:bg-[#087845]"
        >
          View History

          <ArrowRight size={14} />
        </NavLink>

      </div>

    </div>
  );
}

/* ================================================= */
/* CONFIDENCE LOGIC */
/* ================================================= */

function getConfidenceInfo(confidence) {
  if (confidence >= 85) {
    return {
      label: "Very High Confidence",
      badge: "bg-[#dff6e7] text-[#087443]",
      bar: "bg-[#078c51]",
      icon: <CheckCircle2 size={13} />,
    };
  }

  if (confidence >= 60) {
    return {
      label: "High Confidence",
      badge: "bg-[#e8f7ed] text-[#087443]",
      bar: "bg-[#16a05d]",
      icon: <CheckCircle2 size={13} />,
    };
  }

  if (confidence >= 40) {
    return {
      label: "Medium Confidence",
      badge: "bg-[#fff4d8] text-[#a9680b]",
      bar: "bg-[#e3a72f]",
      icon: <AlertTriangle size={13} />,
    };
  }

  return {
    label: "Low Confidence",
    badge: "bg-[#ffe9e9] text-[#b53d3d]",
    bar: "bg-[#d95555]",
    icon: <ShieldAlert size={13} />,
  };
}

/* ================================================= */
/* RESULT ROW */
/* ================================================= */

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-[#e7ece9] bg-white px-4 py-3">

      <span className="text-[10px] text-[#71808d]">
        {label}
      </span>

      <span className="text-right text-[10px] font-bold text-[#263b32]">
        {value}
      </span>

    </div>
  );
}

/* ================================================= */
/* CATEGORY CARD */
/* ================================================= */

function CategoryCard({
  icon: Icon,
  title,
  text,
  className,
}) {
  return (
    <div className="rounded-2xl border border-[#e1e8e4] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
      >
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-[13px] font-black">
        {title}
      </h3>

      <p className="mt-2 text-[10px] leading-5 text-[#74818c]">
        {text}
      </p>

    </div>
  );
}