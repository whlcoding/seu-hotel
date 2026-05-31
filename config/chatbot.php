<?php

return [
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'),
        'timeout' => env('GEMINI_TIMEOUT', 20),
    ],
    'generation' => [
        'temperature' => 0.2,
        'top_p' => 0.9,
        'top_k' => 40,
        'max_output_tokens' => 600,
    ],
    'context' => [
        'reservations' => [
            'past_days' => 90,
            'future_days' => 90,
            'limit' => 200,
        ],
        'guests' => [
            'limit' => 200,
        ],
        'rooms' => [
            'limit' => 200,
        ],
        'cleaning_tasks' => [
            'days' => 30,
            'limit' => 200,
        ],
        'stay_items' => [
            'limit' => 300,
        ],
        'team' => [
            'limit' => 200,
        ],
    ],
    'prompt' => [
        'assistant_name' => 'Aurora',
        'language' => 'pt-BR',
    ],
];
