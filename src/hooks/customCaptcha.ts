import { useEffect, useRef, useState } from "react";
import {
  CaptchaStates,
  CaptchaUnit,
  CaptchaUnitShape,
  CaptchaWaterShadow,
} from "../types";

export const useCustomCaptcha = () => {
  // Define the state variables
  const [captchaState, setCaptchaState] = useState<CaptchaStates>("Loading");
  const [shapes, setShapes] = useState<CaptchaUnit[]>([]);
  const [userAttemptsCount, setUserAttemptsCount] = useState(0);
  const [targetIcon, setTargetIcon] = useState<CaptchaUnitShape>();
  const [photoData, setPhotoData] = useState("");
  const [waterShadow, setWaterShadow] =
    useState<CaptchaWaterShadow>("bg-slate-100");

  // Define the refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Start the camera
   *
   */

  const startCamera = async () => {
    try {
      // Check the mediaDevices is availability
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 180 },
      });

      if (videoRef.current) {
        setCaptchaState("Ready");
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  /**
   * Capture Photo: Take a picture form the video
   * Process the video and save as a image
   *
   */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      // Set canvas dimensions to match the video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame onto the canvas
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get base64 data from the canvas
      const data = canvas.toDataURL("image/png");

      // Stop the video stream
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      // Set the video source to null to release the camera
      video.srcObject = null;

      setPhotoData(data);

      // Set 150ms delay for feel the user good experience
      setTimeout(() => {
        setCaptchaState("SelfieCompleted");
      }, 150);
    }
  };

  /**
   * Generate Random Unique Values
   * Pick 50% random unique positions range is [0-25]
   * Pick a Targeted shape for challenge as random
   * Pick a Random water mark for the mask
   */

  const generateRandomValues = () => {
    const selected: number[] = [];

    // Pick 50% random unique positions range is [0-25]
    while (selected.length < 12) {
      const pick = Math.floor(Math.random() * 25);
      if (!selected.includes(pick)) {
        selected.push(pick);
      }
    }

    const boxItems: CaptchaUnit[] = [];
    const shapes: CaptchaUnitShape[] = ["Circle", "Square", "Triangle"];

    // Make the CaptchaUnitShape array for the mask
    for (let i = 0; i <= 24; i++) {
      boxItems.push({
        index: i,
        marked: false,
        shape: selected.includes(i)
          ? shapes[Math.floor(Math.random() * 3)]
          : undefined,
      });
    }

    const Shadows: CaptchaWaterShadow[] = [
      "bg-pink-100",
      "bg-slate-100",
      "bg-yellow-100",
    ];

    // Pick a Targeted shape for challenge as random
    setTargetIcon(shapes[Math.floor(Math.random() * 3)]);

    //Pick a Random water mark for the mask
    setWaterShadow(Shadows[Math.floor(Math.random() * 3)]);

    setShapes(boxItems);
  };

  /**
   * To take a selfie
   * Pick 50% random unique positions range is [0-25]
   *
   */

  const handleContinue = () => {
    setCaptchaState("TakingSelfie");
    capturePhoto();
    generateRandomValues();
  };

  /**
   * If user is failed to verifying the captcha, can try again
   * Reset the states.
   *
   */

  const handleRegenerate = () => {
    setShapes([]);
    setCaptchaState("Loading");
  };

  /**
   * Verify the user inputs and calculate the user score
   * Calculate the Sensitivity | True Positive Rate
   * Calculate the Specificity | True Negative Rate
   * Penalty added every wrong fail
   * User should be blocked if he excid the max try limit
   */

  const handleVerify = () => {
    if (userAttemptsCount + 1 >= parseInt(import.meta.env.CAPTCHA_MAX_TRY)) {
      setCaptchaState("UserBlocked");
      return;
    }

    setCaptchaState("Verifying");
    const items = shapes.filter((item) => item.shape != undefined);

    const totalPositives = items.filter(
      (item) => item.shape === targetIcon
    ).length;

    const totalNegatives = items.filter(
      (item) => item.shape != targetIcon
    ).length;

    const truePositive = items.filter(
      (item) => item.shape === targetIcon && item.marked
    ).length;

    const trueNegative = items.filter(
      (item) => item.shape != targetIcon && !item.marked
    ).length;

    // Sensitivity | True Positive Rate
    const tpr = (truePositive / totalPositives) * 100;

    // Specificity | True Negative Rate
    const tnr = (trueNegative / totalNegatives) * 100;

    const penalty =
      parseInt(import.meta.env.CAPTCHA_RETRY_PENALTY_RATE) * userAttemptsCount;

    let passScore =
      penalty +
      parseInt(import.meta.env.CAPTCHA_VALIDATION_ACCEPTED_SCORE_PERCENT);

    if (passScore > 100) {
      passScore = 100;
    }

    setTimeout(() => {
      if (tpr >= passScore && tnr >= passScore) {
        setCaptchaState("Verified");
      } else {
        setCaptchaState("VerificationFailed");
      }
    }, 400);

    setUserAttemptsCount((prev) => prev + 1);
  };

  /**
   * Marked the user selectes shapes
   *
   * @param box CaptchaUnit
   */

  const handleUserActivity = (shape: CaptchaUnit) => {
    const modified = shapes.map((item) => {
      if (item.index === shape.index) {
        item.marked = !item.marked;
      }
      return item;
    });

    setCaptchaState("SelectingCaptchaUnitShape");
    setShapes(modified);
  };

  useEffect(() => {
    // Device camera will turn on when the state is `Loading`
    if (captchaState === "Loading") {
      void startCamera();
    }

    // Control the mask moving
    if (captchaState === "Ready" || captchaState === "TakingSelfie") {
      // Mask element
      const element = maskRef.current;

      if (element) {
        // Moving the mask with a random algorithm
        // Video Frame size is 320X180 and the mask size is 128X128
        const intervalId = setInterval(() => {
          element.style.top = Math.floor(Math.random() * 53) + "px"; // max value is (180-128) = 52
          element.style.left = Math.floor(Math.random() * 193) + "px"; // max value is (320-128) = 192
        }, 250);

        // Stop the Mask moving
        if (captchaState === "TakingSelfie") {
          clearInterval(intervalId);
        }

        // Clean the interval
        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [captchaState]);

  return {
    handleContinue,
    handleUserActivity,
    handleVerify,
    handleRegenerate,
    captchaState,
    targetIcon,
    shapes,
    waterShadow,
    photoData,
    maskRef,
    canvasRef,
    videoRef,
  };
};
