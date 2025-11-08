import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type Key = readonly unknown[];

type UseToastMutationParams<TInput, TData, TError = unknown> = {
	mutationFn: (input: TInput) => Promise<TData>;
	successMessage?: string | ((data: TData) => string);
	errorMessage?: string | ((error: TError) => string);
	/** Invalidate these keys on success */
	invalidateKeys?: Key[];
	/** Set data directly for these keys on success */
	setData?: Array<{ key: Key; data: (result: TData) => unknown }>;
	options?: UseMutationOptions<TData, TError, TInput, unknown>;
};

export function useToastMutation<TInput, TData, TError = unknown>({
	mutationFn,
	successMessage,
	errorMessage,
	invalidateKeys,
	setData,
	options,
}: UseToastMutationParams<TInput, TData, TError>) {
	const queryClient = useQueryClient();

	return useMutation<TData, TError, TInput>({
		...options,
		mutationFn,
		onSuccess: async (...args) => {
			const result = args[0] as TData;
			if (setData) {
				for (const { key, data } of setData) {
					queryClient.setQueryData(key, data(result));
				}
			}
			if (invalidateKeys && invalidateKeys.length) {
				await Promise.all(
					invalidateKeys.map((key) =>
						queryClient.invalidateQueries({ queryKey: key }),
					),
				);
			}
			if (successMessage) {
				toast.success(
					typeof successMessage === "function"
						? successMessage(result)
						: successMessage,
				);
			}
			await (options?.onSuccess as any)?.(...(args as any));
		},
		onError: (...args) => {
			const err = args[0] as TError;
			if (errorMessage) {
				toast.error(
					typeof errorMessage === "function"
						? errorMessage(err as TError)
						: errorMessage,
				);
			}
			(options?.onError as any)?.(...(args as any));
		},
	});
}
