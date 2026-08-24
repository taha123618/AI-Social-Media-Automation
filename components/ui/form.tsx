import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form"

const Form = React.forwardRef<
  React.ElementRef<"form">,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  // Filter out react-hook-form props that shouldn't be on DOM elements
  const {
    handleSubmit,
    setValue,
    getValues,
    resetField,
    clearErrors,
    setError,
    setFocus,
    getFieldState,
    formState,
    subscribe,
    trigger,
    register,
    watch,
    reset,
    unregister,
    ...domProps
  } = props as any;

  return (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...domProps}
    />
  );
})
Form.displayName = "Form"

const FormItem = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<"label">,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => (
  <Slot
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  React.ElementRef<"p">,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-destructive", className)}
    {...props}
  />
))
FormMessage.displayName = "FormMessage"

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  control,
  name,
  render,
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller control={control} name={name} render={render} />
}

export { Form, FormItem, FormLabel, FormControl, FormMessage, FormField }
