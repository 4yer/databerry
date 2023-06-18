import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useState } from "react";

const ChatWelcome = () => {
  const circleControls = useAnimation();
  const [showText, setShowText] = useState(false);
  const [typedText, setTypedText] = useState("");

  const textToType = "XiaoQue AI";
  const typingDelay = 150; // 每个字母打字的延迟时间

  // 随机生成红、黄、蓝三种颜色
  function getRandomColor() {
    const colors = ["red", "yellow", "blue"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  useEffect(() => {
    const runAnimation = async () => {
      // 随机选择红、黄、蓝颜色
      const circleColor = getRandomColor();

      // 第一段动画：小圆点放大并弹簧效果
      await circleControls.start({
        scale: 1,
        transition: { type: "spring", damping: 10, stiffness: 120 },
      });

      // 第二段动画：小圆点向左移动
      await circleControls.start({ x: -100 });

      // 显示文字并逐字显示
      setShowText(true);
      for (let i = 0; i < textToType.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, typingDelay));
        setTypedText((prevText) => prevText + textToType[i]);
      }
    };

    runAnimation();
  }, [circleControls]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ scale: 0, x: 0 }}
        animate={circleControls}
        transition={{ duration: 0.5 }}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          position: "absolute",
          top: "calc(40% - 18px)",
          background: getRandomColor(), // 随机选择红、黄、蓝颜色
        }}
      />
      {showText && (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "sans-serif",
            fontSize: "24px",
            fontWeight: "bold",
            position: "absolute",
            top: "calc(40% - 18px)",
            left: "calc(50% - 68px)", // 调整文字与圆点之间的距离
          }}
        >
          {typedText}
        </motion.h1>
      )}
    </div>
  );
};

export default ChatWelcome;
