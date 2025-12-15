import * as React from "react"
import { motion } from 'framer-motion';
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-helm-green-500 text-white hover:bg-helm-green-600 hover:scale-105 hover:shadow-lg hover:shadow-helm-green-500/30",
        secondary:
          "border-transparent bg-helm-cream-200 dark:bg-helm-gray-800 text-helm-gray-950 dark:text-helm-cream-100 hover:bg-helm-cream-300 dark:hover:bg-helm-gray-700 hover:scale-105",
        destructive:
          "border-transparent bg-helm-red text-white hover:bg-helm-red/90 hover:scale-105 hover:shadow-lg hover:shadow-helm-red/30",
        outline: "text-helm-gray-950 dark:text-helm-cream-100 border-helm-gray-400 dark:border-helm-gray-600 bg-transparent hover:bg-helm-blue/10 dark:hover:bg-helm-blue/20 hover:border-helm-blue/50 hover:scale-105 hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}></div>
)}
export { Badge, badgeVariants }

