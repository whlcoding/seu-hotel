<?php

namespace App\Http\Controllers;

use App\Services\ChatbotContextBuilder;
use App\Services\ChatbotPromptFactory;
use App\Services\GeminiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function ask(
        Request $request,
        ChatbotContextBuilder $contextBuilder,
        ChatbotPromptFactory $promptFactory,
        GeminiClient $gemini
    ): JsonResponse {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'sometimes|array',
            'history.*.role' => 'required_with:history|string|in:user,model',
            'history.*.text' => 'required_with:history|string|max:2000',
        ]);

        try {
            $context = $contextBuilder->build();
            $systemPrompt = $promptFactory->build($context);

            $result = $gemini->generate(
                $systemPrompt,
                $validated['message'],
                $validated['history'] ?? []
            );

            return response()->json([
                'reply' => $result['text'],
                'usage' => $result['usage'],
                'model' => $result['model'],
                'context_meta' => $context['meta'] ?? null,
            ]);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 502);
        }
    }
}
