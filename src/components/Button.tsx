import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'cta' | 'success' | 'ghost' | 'danger' | 'yellow';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: 'md' | 'lg';
  full?: boolean;
  children: React.ReactNode;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  cta: 'bg-cta text-white hover:brightness-110',
  success: 'bg-success text-white hover:brightness-110',
  yellow: 'bg-accent text-black hover:brightness-110',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'bg-card-2 text-white hover:bg-[#1d2e44]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  full,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      className={[
        'rounded-2xl font-semibold transition',
        size === 'lg' ? 'h-14 px-6 text-base' : 'h-12 px-5 text-sm',
        full ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        styles[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  );
};
