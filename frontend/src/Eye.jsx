import { STATES } from "./appState";

const STATE_CLASS = {
  [STATES.READY]: "eye--ready",
  [STATES.LISTENING]: "eye--listening",
  [STATES.PROCESSING]: "eye--processing",
  [STATES.SPEAKING]: "eye--speaking",
};

function Eye({ state }) {
  const stateClass = STATE_CLASS[state] || STATE_CLASS[STATES.READY];

  return (
    <div className={`eye ${stateClass}`} aria-hidden="true">
      <div className="eye-motion">
        <svg
          className="eye-visual"
          viewBox="0 0 160 96"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="eye-gradient"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <stop offset="0%" stopColor="var(--accent-blue)" />
              <stop offset="50%" stopColor="#8276ff" />
              <stop offset="100%" stopColor="var(--accent-violet)" />
            </linearGradient>

            <radialGradient id="core-gradient">
              <stop offset="0%" stopColor="#c9c4ff" />
              <stop offset="45%" stopColor="#9c8cff" />
              <stop offset="100%" stopColor="#725cff" />
            </radialGradient>

            <filter id="eye-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="core-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            className="eye-upper"
            d="
              M 8 49
              C 35 15, 68 7, 96 13
              C 119 18, 140 32, 153 47
            "
            fill="none"
            stroke="url(#eye-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#eye-glow)"
          />

          <path
            className="eye-lower"
            d="
              M 8 49
              C 35 79, 70 88, 99 81
              C 122 76, 141 63, 153 47
            "
            fill="none"
            stroke="url(#eye-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#eye-glow)"
          />

          <path
            className="eye-inner-upper"
            d="
              M 28 47
              C 51 27, 72 23, 91 27
              C 107 30, 119 37, 130 46
            "
            fill="none"
            stroke="url(#eye-gradient)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          <path
            className="eye-inner-lower"
            d="
              M 29 50
              C 51 67, 72 73, 91 69
              C 108 66, 120 58, 130 49
            "
            fill="none"
            stroke="url(#eye-gradient)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          <g className="eye-core-group">
            <path
              className="eye-core"
              d="
                M 80 28
                C 89 27, 96 36, 96 47
                C 96 59, 89 68, 79 68
                C 69 68, 63 59, 64 48
                C 64 37, 70 29, 80 28
                Z
              "
              fill="url(#core-gradient)"
              filter="url(#core-glow)"
            />

            <ellipse
              className="eye-core-light"
              cx="75"
              cy="39"
              rx="4"
              ry="7"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default Eye;