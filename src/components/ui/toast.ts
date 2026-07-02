import { toast as sonnerToast } from "sonner";

/** Toast helpers — usa Sonner con estilos DS ya configurados en layout. */
export const toast = {
  message: (message: string) => sonnerToast(message),
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};

export type { ExternalToast } from "sonner";
