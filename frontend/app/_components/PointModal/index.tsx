import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import ReactDOM from "react-dom";

const LoginBonusModal = forwardRef(
  (
    {
      title = "LOGIN BONUS",
      earnedPoints,
      totalPoints,
      duration = 3,
    }: {
      title?: string;
      earnedPoints: number;
      totalPoints: number;
      duration?: number;
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayPoints, setDisplayPoints] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    // SSR対策: マウントされたかどうかのフラグ
    const [mounted, setMounted] = useState(false);

    // マウント時にフラグを立てる（これはクライアント側でのみ実行される）
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        setIsClosing(false);
        setDisplayPoints(0);
        triggerAnimation();

        setTimeout(() => {
          handleClose();
        }, duration * 1000);
      },
    }));

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    };

    const triggerAnimation = () => {
      let start = 0;
      const end = earnedPoints;
      const durationMs = 1000;
      const incrementTime = 16;
      const step = Math.ceil(end / (durationMs / incrementTime));

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setDisplayPoints(end);
          clearInterval(timer);
        } else {
          setDisplayPoints(start);
        }
      }, incrementTime);
    };

    // 【重要】
    // 1. サーバー側(SSR)では mounted が false なので null を返す（何も描画しない）
    // 2. クライアント側でも、isOpen が false なら何も描画しない
    if (!mounted || !isOpen) return null;

    // ここに来る時点で「ブラウザである」かつ「documentが存在する」ことが保証される
    return ReactDOM.createPortal(
      <>
        <style>{`
        /* スタイルは変更なしのため省略しますが、前のコードと同じものを入れてください */
        .lb-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: ${isClosing ? 0 : 1};
          transition: opacity 0.3s ease;
        }
        .lb-content {
          background: white;
          padding: 40px;
          border-radius: 20px;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          transform: ${isClosing ? "scale(0.9) translateY(20px)" : "scale(1) translateY(0)"};
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: lb-popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes lb-popIn {
          0% { transform: scale(0.5) translateY(50px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .lb-title { font-weight: bold; color: #888; font-size: 1.1rem; margin: 0; }
        .lb-points-wrap { text-align: center; }
        .lb-points {
          font-family: 'Arial Black', sans-serif;
          font-size: 4rem;
          line-height: 1;
          background: linear-gradient(to bottom, #FFD700, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lb-pt { font-size: 1.5rem; color: #FFA500; font-weight: bold; margin-left: 5px; }
        .lb-total { background: #f5f5f5; color: #666; padding: 6px 15px; border-radius: 100px; font-size: 0.85rem; margin-top: 10px; }
      `}</style>

        <div className="lb-overlay">
          <div className="lb-content">
            <h2 className="lb-title">{title}</h2>
            <div className="lb-points-wrap">
              <span className="lb-points">
                +{displayPoints.toLocaleString()}
              </span>
              <span className="lb-pt">pt</span>
            </div>
            <div className="lb-total">
              現在の総合: {totalPoints.toLocaleString()} pt
            </div>
          </div>
        </div>
      </>,
      document.body, // ここで安全に document.body にアクセスできる
    );
  },
);

export default LoginBonusModal;
