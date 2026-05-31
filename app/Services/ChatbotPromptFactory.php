<?php

namespace App\Services;

class ChatbotPromptFactory
{
    public function build(array $context): string
    {
        $assistantName = config('chatbot.prompt.assistant_name', 'Aurora');
        $language = config('chatbot.prompt.language', 'pt-BR');

        $contextJson = json_encode(
            $context,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );
        if ($contextJson === false) {
            throw new \RuntimeException('Failed to encode chatbot context to JSON.');
        }

        $rules = [
            "Responda em {$language}.",
            'Use somente o contexto fornecido no JSON.',
            'Se a informacao nao estiver no contexto, diga que nao encontrou no banco de dados atual.',
            'Nao invente numeros, nomes ou valores.',
            'Quando a pergunta pedir analise, calcule usando os dados do contexto.',
            'Seja direto e objetivo.',
        ];

        $rulesText = implode("\n- ", $rules);

        return <<<PROMPT
Voce e {$assistantName}, assistente operacional do hotel.
Sua tarefa e responder perguntas apenas com base no contexto abaixo.

Regras:
- {$rulesText}

Contexto (JSON):
```json
{$contextJson}
```
PROMPT;
    }
}
