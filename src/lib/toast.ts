import { enqueueSnackbar, closeSnackbar, type SnackbarKey, type OptionsObject } from 'notistack';

type HotToastOptions = {
  icon?: React.ReactNode | string;
  duration?: number;
  id?: string | number;
};

const toOptions = (opts?: HotToastOptions): OptionsObject | undefined => {
  if (!opts) return undefined;
  const o: OptionsObject = {};
  if (opts.duration != null) o.autoHideDuration = opts.duration;
  if (opts.id != null) o.key = opts.id;
  return o;
};

type ToastFn = ((message: string, opts?: HotToastOptions) => SnackbarKey) & {
  success: (message: string, opts?: HotToastOptions) => SnackbarKey;
  error: (message: string, opts?: HotToastOptions) => SnackbarKey;
  loading: (message: string, opts?: HotToastOptions) => SnackbarKey;
  dismiss: (key?: SnackbarKey) => void;
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => Promise<T>;
};

const toast = ((message: string, opts?: HotToastOptions) =>
  enqueueSnackbar(message, { variant: 'default', ...toOptions(opts) })) as ToastFn;

toast.success = (message, opts) =>
  enqueueSnackbar(message, { variant: 'success', ...toOptions(opts) });

toast.error = (message, opts) =>
  enqueueSnackbar(message, { variant: 'error', ...toOptions(opts) });

toast.loading = (message, opts) =>
  enqueueSnackbar(message, { variant: 'info', persist: true, ...toOptions(opts) });

toast.dismiss = (key) => closeSnackbar(key);

toast.promise = async (promise, msgs) => {
  const loadingKey = enqueueSnackbar(msgs.loading, { variant: 'info', persist: true });
  try {
    const result = await promise;
    closeSnackbar(loadingKey);
    enqueueSnackbar(msgs.success, { variant: 'success' });
    return result;
  } catch (err) {
    closeSnackbar(loadingKey);
    enqueueSnackbar(msgs.error, { variant: 'error' });
    throw err;
  }
};

export default toast;
