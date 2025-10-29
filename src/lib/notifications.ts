import { toast } from "sonner";

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  success(options: NotificationOptions) {
    return toast.success(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  }

  error(options: NotificationOptions) {
    return toast.error(options.title, {
      description: options.description,
      duration: options.duration || 6000,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  }

  warning(options: NotificationOptions) {
    return toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  }

  info(options: NotificationOptions) {
    return toast.info(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  }

  loading(options: NotificationOptions) {
    return toast.loading(options.title, {
      description: options.description,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  }

  dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  // Batch operations notification
  batchOperation(total: number, operation: string) {
    return this.loading({
      title: `Processing ${total} items`,
      description: `${operation} in progress...`,
    });
  }

  // Security alert notification
  securityAlert(message: string) {
    return this.error({
      title: "Security Alert",
      description: message,
      duration: 10000,
      action: {
        label: "View Details",
        onClick: () => {
          window.location.href = "/security";
        },
      },
    });
  }

  // Export completion notification
  exportComplete(format: string, count: number) {
    return this.success({
      title: "Export Complete",
      description: `Successfully exported ${count} items as ${format.toUpperCase()}`,
      action: {
        label: "Download",
        onClick: () => {
          // Download will already be triggered
        },
      },
    });
  }
}

export const notify = new NotificationService();
