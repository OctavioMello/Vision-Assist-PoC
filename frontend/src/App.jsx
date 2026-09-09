import { useEffect, useRef, useState } from "react";
import "./App.css";
import { STATES, MODES } from "./appState";

function App() {
  const [systemState, setSystemState] = useState(STATES.LISTENING);
  const [mode, setMode] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureImage = async (selectedMode = mode) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error("Câmera ou canvas não disponível.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      console.error("A câmera ainda não está pronta para captura.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const image = {
      data: dataUrl.split(",")[1],
      mimeType: "image/jpeg",
};

    console.log("Imagem capturada.");

    setSystemState(STATES.PROCESSING);

    try {
      console.log("Enviando imagem para o backend...");

      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          mode: selectedMode.toLowerCase(),
        }),
      });

      console.log("Resposta HTTP recebida:", response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("Resposta do backend:", data);

      return data;
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      setSystemState(STATES.READY);
    }
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    setSystemState(STATES.READY);
  };

  const processCommand = (command) => {
    const normalizedCommand = command.toLowerCase().trim();

    if (!mode) {
      if (normalizedCommand.includes("ambiente")) {
        selectMode(MODES.CAMPUS);
        return;
      }

      if (normalizedCommand.includes("sala")) {
        selectMode(MODES.CLASSROOM);
        return;
      }

      return;
    }

    if (normalizedCommand.includes("analisar")) {
      return captureImage();
    }

    if (normalizedCommand.includes("nova análise")) {
      setSystemState(STATES.READY);
      return;
    }

    if (normalizedCommand.includes("trocar para sala")) {
      setMode(MODES.CLASSROOM);
      setSystemState(STATES.READY);
      return;
    }

    if (normalizedCommand.includes("trocar para ambiente")) {
      setMode(MODES.CAMPUS);
      setSystemState(STATES.READY);
    }
  };

  useEffect(() => {
  window.testAnalyze = () => captureImage(MODES.CAMPUS);

  return () => {
    delete window.testAnalyze;
  };
});

  return (
    <main className="app">
      <section className="camera-screen">
        <video
          ref={videoRef}
          className="camera"
          autoPlay
          playsInline
          muted
        />

        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />

        {!mode && (
          <div className="mode-selection">
            <div className="brand">
              <span className="brand-mark">◉</span>
              <h1>VISION ASSIST</h1>
            </div>

            <p className="question">Como posso ajudar?</p>

            <div className="mode-info">
              <div>
                <strong>AMBIENTE</strong>
                <span>
                  Espaços, portas, placas e obstáculos
                </span>
              </div>

              <div>
                <strong>SALA</strong>
                <span>
                  Quadros, exercícios, textos e conteúdos
                </span>
              </div>
            </div>

            <div className="status">
              <span className="status-dot" />
              <span>{systemState}</span>
            </div>
          </div>
        )}

        {mode && (
          <header className="top-bar">
            <div className="status">
              <span className="status-dot" />
              <span>{systemState}</span>
            </div>

            <span className="mode">{mode}</span>
          </header>
        )}

        {systemState === STATES.SPEAKING && (
          <div className="voice-wave">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </section>
    </main>
  );
}

export default App;