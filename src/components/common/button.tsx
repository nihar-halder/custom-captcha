import { ButtonHTMLAttributes, FC, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={
        className ||
        "mt-6 bg-yellow-400 hover:bg-yellow-500 py-1 px-8 text-white font-semibold"
      }
    >
      {children}
    </button>
  );
};

export default Button;
