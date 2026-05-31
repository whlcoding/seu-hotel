<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GeminiClient
{
    public function generate(string $systemPrompt, string $userMessage, array $history = []): array
    {
        $apiKey = config('chatbot.gemini.api_key');
        $model = config('chatbot.gemini.model');
        $baseUrl = rtrim(config('chatbot.gemini.base_url'), '/');
        $timeout = (int) config('chatbot.gemini.timeout', 20);

        if (! $apiKey) {
            throw new \RuntimeException('GEMINI_API_KEY is not configured.');
        }

        $endpoint = "{$baseUrl}/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $contents = $this->buildContents($history, $userMessage);

        $response = $this->client($timeout)
            ->post($endpoint, [
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemPrompt],
                    ],
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => config('chatbot.generation.temperature'),
                    'topP' => config('chatbot.generation.top_p'),
                    'topK' => config('chatbot.generation.top_k'),
                    'maxOutputTokens' => config('chatbot.generation.max_output_tokens'),
                ],
            ]);

        if (! $response->successful()) {
            $message = Str::limit($response->body(), 400);
            throw new \RuntimeException("Gemini API error: {$message}");
        }

        $payload = $response->json();
        $text = data_get($payload, 'candidates.0.content.parts.0.text');

        if (! $text) {
            throw new \RuntimeException('Gemini API returned an empty response.');
        }

        return [
            'text' => $text,
            'usage' => data_get($payload, 'usageMetadata'),
            'model' => data_get($payload, 'modelVersion'),
        ];
    }

    private function client(int $timeout): PendingRequest
    {
        return Http::timeout($timeout)
            ->acceptJson()
            ->retry(1, 200);
    }

    private function buildContents(array $history, string $userMessage): array
    {
        $contents = collect($history)
            ->filter(function ($item) {
                return is_array($item)
                    && isset($item['role'], $item['text'])
                    && in_array($item['role'], ['user', 'model'], true);
            })
            ->map(fn ($item) => [
                'role' => $item['role'],
                'parts' => [
                    ['text' => (string) $item['text']],
                ],
            ])
            ->values()
            ->all();

        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $userMessage],
            ],
        ];

        return $contents;
    }
}
