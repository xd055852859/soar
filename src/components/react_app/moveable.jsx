import React, { useState, useImperativeHandle } from "react";

const gapTime = 16.666;
let spaceKeyDown = false;
let lastTime = 0;
let clickX = 0;
let clickY = 0;

const Moveable = React.forwardRef(
  (
    {
      style,
      rightClickToStart,
      scrollable,
      scrollStep = 23,
      children,
      onCloseMenu,
    },
    ref,
  ) => {
    // 暴露方法
    useImperativeHandle(ref, () => ({
      reset: () => {
        setTranslateX(-100);
        setTranslateY(-920);
      },
    }));
    const [translateX, setTranslateX] = useState(-100);
    const [translateY, setTranslateY] = useState(-920);
    const [started, setStarted] = useState(false);

    const handleMoveStart = (e) => {
      // 左键
      if (e.button === 0) {
        if (!rightClickToStart || spaceKeyDown) {
          clickX = e.clientX;
          clickY = e.clientY;
          setStarted(true);
        }
      } else if (e.button === 2) {
        e.preventDefault();
        // 右键
        if (rightClickToStart) {
          clickX = e.clientX;
          clickY = e.clientY;
          setStarted(true);
        }
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      clickX = e.touches[0].clientX;
      clickY = e.touches[0].clientY;
      setStarted(true);
    };

    const handleMove = (e) => {
      e.preventDefault();
      if (started) {
        let time = new Date().getTime();
        if (time - lastTime > gapTime || !lastTime) {
          let movedX = 0;
          let movedY = 0;
          movedX = e.clientX - clickX;
          movedY = e.clientY - clickY;

          setTranslateX(translateX + movedX);
          setTranslateY(translateY + movedY);

          clickX = e.clientX;
          clickY = e.clientY;

          lastTime = time;
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (started) {
        let time = new Date().getTime();
        if (time - lastTime > gapTime || !lastTime) {
          let movedX = 0;
          let movedY = 0;
          movedX = e.touches[0].clientX - clickX;
          movedY = e.touches[0].clientY - clickY;

          setTranslateX(translateX + movedX);
          setTranslateY(translateY + movedY);

          clickX = e.touches[0].clientX;
          clickY = e.touches[0].clientY;

          lastTime = time;
        }
      }
    };

    const handleWheel = (e) => {
      if (scrollable) {
        if (e.deltaY < 0) {
          setTranslateY(translateY + scrollStep);
        } else {
          setTranslateY(translateY - scrollStep);
        }
      }
    };

    const handleMoveEnd = () => {
      setStarted(false);
    };

    const handleContextMenu = (e) => {
      if (rightClickToStart) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === " " && !spaceKeyDown) {
        spaceKeyDown = true;
      }
    };
    const handleKeyUp = (event) => {
      if (event.key === " ") {
        spaceKeyDown = false;
      }
    };

    const propsStyle = style || {};
    return (
      <div
        style={{
          ...{
            position: "relative",
            width: "100%",
            height: "100%",
            cursor: started ? "grabbing" : "auto",
          },
          ...propsStyle,
        }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMoveStart}
        onMouseUp={handleMoveEnd}
        onMouseLeave={handleMoveEnd}
        onMouseMove={handleMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMoveEnd}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            position: "relative",
            width: "fit-content",
            transform: `translate(${translateX}px,${translateY}px)`,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);
export default Moveable;
