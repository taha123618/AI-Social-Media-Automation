"use client";

import ThemeToggleAnimated, { ThemeToggleAnimatedProps } from "@/components/common/ThemeToggleAnimated";

export function ModeToggle(props: ThemeToggleAnimatedProps) {
  return <ThemeToggleAnimated size="sm" variant="circle-blur" {...props} />;
}

export default ModeToggle;
