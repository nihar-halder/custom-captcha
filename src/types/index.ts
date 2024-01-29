export type CaptchaUnitShape = "Circle" | "Square" | "Triangle";

export type CaptchaUnit = {
  index: number;
  shape?: CaptchaUnitShape;
  marked: boolean;
};

export type CaptchaStates =
  | "Loading"
  | "Ready"
  | "TakingSelfie"
  | "SelfieCompleted"
  | "SelectingCaptchaUnitShape"
  | "Verifying"
  | "Verified"
  | "VerificationFailed"
  | "UserBlocked";

export type CaptchaWaterShadow =
  | "bg-slate-100"
  | "bg-pink-100"
  | "bg-yellow-100";
