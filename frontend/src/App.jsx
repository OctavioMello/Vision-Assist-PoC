import { useEffect, useRef, useState } from "react";
import "./App.css";
import { STATES, MODES } from "./appState";

function App() {
  const [systemState, setSystemState] = useState(STATES.LISTENING);
  const [mode, setMode] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

const finishRecording = (mediaRecorder) => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    return;
  }

  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }

  if (audioContextRef.current) {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }

  analyserRef.current = null;

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, {
      type: mediaRecorder.mimeType,
    });

    console.log("Gravação finalizada.");
    console.log("Formato:", audioBlob.type);
    console.log("Tamanho:", audioBlob.size);

    setSystemState(STATES.PROCESSING);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Audio = reader.result.split(",")[1];

      try {
        console.log("Enviando áudio para o backend...");

        const response = await fetch(
          "http://localhost:3000/speech/transcribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              audio: base64Audio,
              mimeType: audioBlob.type,
            }),
          }
        );

        console.log("Resposta HTTP recebida:", response.status);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        console.log("Transcrição:", data.text);

        await processCommand(data.text);
        startListening();
          } catch (error) {
            console.error("Erro ao enviar áudio:", error);
          }
        };

    reader.readAsDataURL(audioBlob);

    mediaRecorder.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  mediaRecorder.stop();
  mediaRecorderRef.current = null;
};

const startListening = async () => {
  try {
    if (mediaRecorderRef.current) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 512;

    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    mediaRecorder.start();

    setSystemState(STATES.LISTENING);

    console.log("Microfone ouvindo...");

    const data = new Uint8Array(analyser.fftSize);

    let silenceStartedAt = null;
    let hasSpoken = false;

    const detectSilence = () => {
      if (!mediaRecorderRef.current) {
        return;
      }

      analyser.getByteTimeDomainData(data);

      let sum = 0;

      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }

      const volume = Math.sqrt(sum / data.length);

      const silenceThreshold = 0.015;
      const silenceDuration = 1200;

if (volume >= silenceThreshold) {
  hasSpoken = true;
  silenceStartedAt = null;
} else if (hasSpoken) {
  if (!silenceStartedAt) {
    silenceStartedAt = Date.now();
  }

  if (Date.now() - silenceStartedAt >= silenceDuration) {
    console.log("Silêncio detectado. Parando gravação...");

    finishRecording(mediaRecorder);
    return;
  }
}

      animationFrameRef.current =
        requestAnimationFrame(detectSilence);
    };

    animationFrameRef.current =
      requestAnimationFrame(detectSilence);

  } catch (error) {
    console.error("Erro ao acessar o microfone:", error);
  }
};

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
    startListening();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

const playAudio = (base64Audio) => {
  if (!base64Audio) {
    console.log("Áudio indisponível.");
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const audio = new Audio(
      `data:audio/wav;base64,${base64Audio}`
    );

    audio.onended = () => {
      resolve();
    };

    audio.onerror = (error) => {
      console.error("Erro ao reproduzir áudio:", error);
      resolve();
    };

    audio.play().catch((error) => {
      console.error("Erro ao iniciar áudio:", error);
      resolve();
    });
  });
};

  const stopListening = () => {
  const mediaRecorder = mediaRecorderRef.current;

  if (!mediaRecorder) {
    return;
  }

  finishRecording(mediaRecorder);
};

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

setAnalysisResult(data.result);

if (data.audio) {
  setSystemState(STATES.SPEAKING);
  await playAudio(data.audio);
  setSystemState(STATES.LISTENING);
}

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

  const processCommand = async (command) => {
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

        {analysisResult && (
  <div className="analysis-result">
    {analysisResult}
  </div>
)}

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