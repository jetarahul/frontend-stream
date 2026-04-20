import { toast } from "react-toastify";

export function handleApiError(error, context = "Request") {
  console.error(`${context} failed:`, error);
  toast.error(`${context} failed. Please try again.`);
}

export function handleSuccess(message) {
  toast.success(message);
}
