import generateAiResponse from "./ai-adapter";

interface RequestCompletionProps {
  prompt: string;
  onLoading?: () => void;
  onChunk?: (chunk: string) => void;
  onSuccess?: (completion: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export const requestCompletion = async ({
  prompt,
  onLoading,
  onChunk,
  onSuccess,
  onError,
  onComplete,
}: RequestCompletionProps) => {
  try {
    onLoading?.();
    const response = await generateAiResponse({ prompt });

    if (!response.ok) {
      throw Error(await response.text());
    }

    const reader = response.body?.getReader();

    if (!reader) {
      throw Error("No content");
    }

    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onSuccess?.(result);
        return;
      }
      const chunk = new TextDecoder().decode(value);
      const size = 5;

      for (let i = 0; i < chunk.length; i += size) {
        const w = chunk.slice(i, i + size);
        result += w;

        onChunk?.(result);

        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      // if (result.length > 200) {
      //   throw Error("Limit exceeds");
      // }
    }
  } catch (error) {
    onError?.(error as Error);
  } finally {
    onComplete?.();
  }
};
