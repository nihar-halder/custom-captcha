import { FC } from "react";
import { useCustomCaptcha } from "../hooks/customCaptcha";
import Button from "./common/button";

interface CaptchaProps {}

const Captcha: FC<CaptchaProps> = () => {
  const {
    captchaState,
    targetIcon,
    photoData,
    shapes,
    waterShadow,
    maskRef,
    videoRef,
    canvasRef,
    handleContinue,
    handleUserActivity,
    handleRegenerate,
    handleVerify,
  } = useCustomCaptcha();

  return (
    <div className="lg:container lg:mx-auto border mx-auto bg-slate-100 h-screen flex justify-center items-center">
      <div className="w-96 h-96 bg-white border-[20px] border-indigo-800 flex flex-col items-center">
        {captchaState === "UserBlocked" ? (
          <div className="text-lg text-red-600 text-center">
            Sorry! The system is not trust you!
          </div>
        ) : (
          <>
            {/* Header section */}
            <div className="text-blue-600 text-lg font-semibold pt-8 pb-5">
              {["Loading", "Ready"].includes(captchaState) && (
                <span>Take Selfie</span>
              )}
              {!["Loading", "Ready"].includes(captchaState) && (
                <span>Select the {targetIcon}s</span>
              )}
            </div>
            {/* Main Selfie Container */}
            <div className="w-80 h-[180px] bg-slate-400 relative">
              {["SelfieCompleted", "SelectingCaptchaUnitShape"].includes(
                captchaState
              ) && <img src={photoData} className="w-full h-full" />}

              {["Loading", "Ready", "TakingSelfie"].includes(captchaState) && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full"
                />
              )}

              {["Loading", "TakingSelfie", "Verifying"].includes(
                captchaState
              ) && (
                <img
                  src="/processing.svg"
                  className="w-4 h-4 animate-spin absolute top-1/2 left-1/2 -ml-2 -mt-2"
                />
              )}

              <div ref={maskRef} className="absolute top-0 left-0">
                {![
                  "Loading",
                  "VerificationFailed",
                  "Verified",
                  "Verifying",
                ].includes(captchaState) && (
                  <div className="w-32 h-32 border grid grid-cols-5 grid-rows-5">
                    {["SelfieCompleted", "SelectingCaptchaUnitShape"].includes(
                      captchaState
                    ) &&
                      shapes.map((item, index) => (
                        <div
                          key={index}
                          className={`border w-full flex align-middle justify-center opacity-70 ${
                            waterShadow === "bg-slate-100" ? "bg-slate-100" : ""
                          } ${
                            waterShadow === "bg-yellow-100"
                              ? "bg-yellow-100"
                              : ""
                          } ${
                            waterShadow === "bg-pink-100" ? "bg-pink-100" : ""
                          } ${
                            item.marked ? "border-green-800" : "border-white"
                          }`}
                        >
                          {item.shape ? (
                            <Button
                              onClick={() => handleUserActivity(item)}
                              className="p-0 flex items-center justify-center"
                            >
                              <img
                                src={
                                  item.shape === "Circle"
                                    ? "/circle.svg"
                                    : item.shape === "Square"
                                    ? "/square.svg"
                                    : "/triangle.svg"
                                }
                                className="w-4 h-4 opacity-65"
                              />
                            </Button>
                          ) : (
                            <></>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {captchaState === "Ready" && (
              <Button onClick={handleContinue}>CONTINUE</Button>
            )}

            {["SelfieCompleted", "SelectingCaptchaUnitShape"].includes(
              captchaState
            ) && <Button onClick={handleVerify}>VERIFY</Button>}

            {captchaState === "VerificationFailed" && (
              <Button
                onClick={handleRegenerate}
                className="mt-6 bg-red-300 hover:bg-red-400 py-1 px-8 text-white font-semibold"
              >
                <img src="/regenerate.svg" className="w-4 h-4" />
              </Button>
            )}

            {captchaState === "Verified" && (
              <p className="text-sm text-green-500 pt-1">Verified!</p>
            )}

            {captchaState === "VerificationFailed" && (
              <p className="text-sm text-red-500 pt-1">Failed! Try again</p>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Captcha;
