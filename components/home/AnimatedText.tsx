"use client";

import { motion, useInView } from "framer-motion";
import { JSX, useRef, ComponentType } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: keyof JSX.IntrinsicElements | ComponentType<{ className?: string }>;
  once?: boolean;
}

const defaultAnimations = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
};

export const AnimatedText = ({
  text,
  className,
  el: Wrapper = "p",
  once = true,
}: AnimatedTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5, once });

  const Component = Wrapper as any;

  return (
    <Component className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ staggerChildren: 0.02 }}
        aria-hidden
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={defaultAnimations}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};
