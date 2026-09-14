import { useEffect, useRef, useState } from "react";
import "./App.css";
import { STATES, MODES } from "./appState";
import Eye from "./Eye";

const API_URL = "https://vision-assist-ai-6t15.onrender.com";

function App() {
  const [systemState, setSystemState] = useState(STATES.LISTENING);
  const [mode, setMode] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");

  const modeRef = useRef(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analysisImageRef = useRef(null);
  const analysisResultRef = useRef("");
  const greetingStartedRef = useRef(false);

  useEffect(() => {
    analysisResultRef.current = analysisResult;
  }, [analysisResult]);

  const finishRecording = (mediaRecorder) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return;
    }

    console.time("⏱️ STT");

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

      startProcessingFeedback();

      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];

        try {
          console.log("Enviando áudio para o backend...");

          const response = await fetch(
            `${API_URL}/speech/transcribe`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                audio: base64Audio,
                mimeType: audioBlob.type,
              }),
            },
          );

          console.log("Resposta HTTP recebida:", response.status);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
          }

          const data = await response.json();

          console.log("Transcrição:", data.text);
          console.timeEnd("⏱️ STT");

          try {
            await processCommand(data.text);
            startListening();
          } finally {
            stopProcessingFeedback();
          }
        } catch (error) {
          console.error("Erro ao enviar áudio:", error);
          console.timeEnd("⏱️ STT");

          if (error.message === "Speech transcription quota exceeded") {
            console.error("Quota de transcrição excedida.");
            playFeedbackSound("error");
            setSystemState(STATES.READY);
            return;
          }

          playFeedbackSound("error");
          setSystemState(STATES.READY);
        }
      };

      reader.readAsDataURL(audioBlob);

      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
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

      playFeedbackSound("listening");

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

        animationFrameRef.current = requestAnimationFrame(detectSilence);
      };

      animationFrameRef.current = requestAnimationFrame(detectSilence);
    } catch (error) {
      console.error("Erro ao acessar o microfone:", error);
    }
  };

  const playFeedbackSound = (type) => {
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
      listening: {
        frequency: 880,
        duration: 0.12,
        volume: 0.08,
      },
      processing: {
        frequency: 520,
        duration: 0.1,
        volume: 0.05,
      },
      success: {
        frequency: 1046,
        duration: 0.15,
        volume: 0.07,
        secondFrequency: 1318,
        gap: 0.06,
      },
      analysisComplete: {
        frequency: 784,
        duration: 0.15,
        volume: 0.06,
      },
      error: {
        frequency: 220,
        duration: 0.2,
        volume: 0.07,
      },
    };

    const sound = sounds[type];

    if (!sound) {
      audioContext.close();
      return;
    }

    oscillator.frequency.value = sound.frequency;
    gainNode.gain.value = sound.volume;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + sound.duration);

    if (sound.secondFrequency) {
      const secondOscillator = audioContext.createOscillator();
      const secondGainNode = audioContext.createGain();

      secondOscillator.connect(secondGainNode);
      secondGainNode.connect(audioContext.destination);

      secondOscillator.frequency.value = sound.secondFrequency;
      secondGainNode.gain.value = sound.volume;

      const secondStart = audioContext.currentTime + sound.duration + sound.gap;

      secondOscillator.start(secondStart);
      secondOscillator.stop(secondStart + sound.duration);

      secondOscillator.onended = () => {
        audioContext.close();
      };
    } else {
      oscillator.onended = () => {
        audioContext.close();
      };
    }
  };

  const processingIntervalRef = useRef(null);

  const startProcessingFeedback = () => {
    if (processingIntervalRef.current) {
      return;
    }

    playFeedbackSound("processing");

    processingIntervalRef.current = setInterval(() => {
      playFeedbackSound("processing");
    }, 2500);
  };

  const stopProcessingFeedback = () => {
    if (!processingIntervalRef.current) {
      return;
    }

    clearInterval(processingIntervalRef.current);
    processingIntervalRef.current = null;
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
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);

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

  const captureImage = async (selectedMode = modeRef.current) => {
    console.time("⏱️ ANALYZE");

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

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const image = {
      data: dataUrl.split(",")[1],
      mimeType: "image/jpeg",
    };

    analysisImageRef.current = image;

    console.log("Imagem capturada.");

    setSystemState(STATES.PROCESSING);

    try {
      console.log("Enviando imagem para o backend...");

      const response = await fetch(`${API_URL}/analyze`, {
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

      console.timeEnd("⏱️ ANALYZE");

      setAnalysisResult(data.result);

      playFeedbackSound("analysisComplete");

      if (data.audio) {
        stopProcessingFeedback();
        setSystemState(STATES.SPEAKING);
        await playAudio(data.audio);
      }

      setSystemState(STATES.LISTENING);

      return data;
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      playFeedbackSound("error");
      setSystemState(STATES.READY);
      console.timeEnd("⏱️ ANALYZE");
    }
  };

  const selectMode = (selectedMode) => {
    modeRef.current = selectedMode;

    setMode(selectedMode);
    setAnalysisResult("");
    analysisResultRef.current = "";
    analysisImageRef.current = null;
    setSystemState(STATES.READY);
  };

  const askQuestion = async (question) => {
    console.time("⏱️ ASK");

    const image = analysisImageRef.current;

    if (!image) {
      console.log("Nenhuma imagem disponível para pergunta.");
      playFeedbackSound("error");
      setSystemState(STATES.READY);
      return;
    }

    setSystemState(STATES.PROCESSING);

    try {
      console.log("Enviando pergunta para o backend...");
      console.log("Pergunta:", question);

      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          mode: modeRef.current.toLowerCase(),
          question,
          context: analysisResultRef.current,
        }),
      });

      console.log("Resposta HTTP recebida:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("Resposta da pergunta:", data);

      console.timeEnd("⏱️ ASK");

      if (data.audio) {
        stopProcessingFeedback();
        setSystemState(STATES.SPEAKING);
        await playAudio(data.audio);
      }

      setSystemState(STATES.LISTENING);

      return data;
    } catch (error) {
      console.error("Erro ao fazer pergunta:", error);
      playFeedbackSound("error");
      setSystemState(STATES.READY);
      console.timeEnd("⏱️ ASK");
    }
  };

  const processCommand = async (command) => {
    const normalizedCommand = command
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!modeRef.current) {
      if (
        normalizedCommand === "ambiente" ||
        normalizedCommand === "modo ambiente"
      ) {
        console.log("Executando: ambiente");
        selectMode(MODES.CAMPUS);
        playFeedbackSound("success");
        return;
      }

      if (normalizedCommand === "sala" || normalizedCommand === "modo sala") {
        console.log("Executando: sala");
        selectMode(MODES.CLASSROOM);
        playFeedbackSound("success");
        return;
      }

      return;
    }

    if (
      normalizedCommand === "ambiente" ||
      normalizedCommand === "modo ambiente" ||
      normalizedCommand === "trocar para ambiente"
    ) {
      console.log("Executando: ambiente");
      selectMode(MODES.CAMPUS);
      playFeedbackSound("success");
      return;
    }

    if (
      normalizedCommand === "sala" ||
      normalizedCommand === "modo sala" ||
      normalizedCommand === "trocar para sala"
    ) {
      console.log("Executando: sala");
      selectMode(MODES.CLASSROOM);
      playFeedbackSound("success");
      return;
    }

    if (
      normalizedCommand === "analisar" ||
      normalizedCommand === "nova analise"
    ) {
      console.log("Executando: analisar");
      return captureImage();
    }

    if (
      normalizedCommand === "resumo" ||
      normalizedCommand === "fazer resumo"
    ) {
      console.log("Executando: resumo");
      return askQuestion("faça um resumo do material");
    }

    if (
      normalizedCommand === "contextualizacao" ||
      normalizedCommand === "fazer contextualizacao"
    ) {
      console.log("Executando: contextualização");
      return askQuestion("faça uma contextualização do conteúdo");
    }

    if (analysisImageRef.current) {
      console.log("Executando: pergunta contextual");
      return askQuestion(normalizedCommand);
    }
  };

  useEffect(() => {
    const audio = new Audio("/audio/welcome.wav");
    audio.preload = "auto";

    let greetingPlayed = false;

    const playGreeting = async () => {
      if (greetingPlayed) return;

      try {
        await audio.play();
        greetingPlayed = true;
        cleanup();
      } catch (error) {
        console.log("Autoplay bloqueado. Aguardando interação do usuário.");
      }
    };

    const handleFirstInteraction = () => {
      playGreeting();
    };

    const cleanup = () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    playGreeting();

    return () => {
      cleanup();
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <main className="app">
      <section className="camera-screen">
        <video ref={videoRef} className="camera" autoPlay playsInline muted />

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {!mode && (
          <div className="mode-selection">
            <div className="brand">
              <h1>Vision Assist AI</h1>
            </div>

            <div className="mode-info">
              <div>
                <strong>Ambiente</strong>
                <span>Espaços, portas, placas e obstáculos</span>
              </div>

              <div>
                <strong>Sala</strong>
                <span>Quadros, exercícios, textos e conteúdos</span>
              </div>
            </div>

            <div className="mode-selection-eye">
              <Eye state={systemState} />
            </div>
          </div>
        )}

        {mode && (
          <>
            <header className="top-bar">
              <span className={`status status-${systemState.toLowerCase()}`}>
                {systemState}
              </span>

              <span className="mode">{mode}</span>
            </header>

            <div className="eye-dock">
              <Eye state={systemState} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
