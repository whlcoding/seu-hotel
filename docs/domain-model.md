# Domain Model — Seu Hotel

## Entidades

### `guests`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| phone | string nullable | |
| cpf | string nullable | |
| address | text nullable | |
| dob | date nullable | |
| avatar_color | enum | blue/green/orange/purple/red |
| tag | enum nullable | VIP/Novo |
| created_at / updated_at | timestamps | |

---

### `rooms`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| number | string unique | ex: "101" |
| type | enum | Single/Duplo/Suíte |
| floor | tinyint | |
| price_per_night | decimal(10,2) | |
| status | enum | available/occupied/cleaning/maintenance/reserved |
| created_at / updated_at | timestamps | |

---

### `reservations`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| ref | string unique | ex: "RES-001" |
| guest_id | FK → guests | |
| room_id | FK → rooms | |
| checkin | date | |
| checkout | date | |
| nights | smallint | calculado mas armazenado |
| guests_count | tinyint | nr de hóspedes |
| status | enum | confirmada/pendente/cancelada/realizada/no-show |
| channel | string | Recepção/Website/App/Booking.com/etc |
| paid | boolean | default false |
| total | decimal(10,2) | |
| tax | decimal(10,2) | |
| note | text nullable | |
| created_at / updated_at | timestamps | |

---

### `stay_items` — itens de cobrança no checkout
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| reservation_id | FK → reservations | |
| name | string | "Diária", "Frigobar", etc |
| unit_price | decimal(10,2) | |
| qty | smallint | |
| unit_label | string | "noite", "item", etc |
| icon | string | nome do ícone |
| locked | boolean | default false |
| custom | boolean | default false |
| created_at / updated_at | timestamps | |

> Gerado automaticamente com as diárias ao criar uma reserva; editável no checkout.

---

### `users` — estendida para cobrir equipe
Colunas adicionadas à tabela existente:

| Coluna | Tipo | Notas |
|---|---|---|
| phone | string nullable | |
| cpf | string nullable | |
| role | enum nullable | recepcao/housekeeping/gerente/manutencao/cozinha |
| team_status | enum | ativo/ferias/inativo — default "ativo" |
| admission_date | date nullable | |
| salary | decimal(10,2) nullable | |
| avatar_color | enum nullable | blue/green/orange/purple/red |
| schedule | json nullable | array de 7 shifts (dom→sáb): mat/vesp/noite/off/ferias |

> Optamos por uma única tabela (estender `users`) em vez de criar `team_members` separado, por simplicidade no MVP.

---

### `cleaning_tasks`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| room_id | FK → rooms | |
| assignee_id | FK → users nullable | funcionário responsável |
| verifier_id | FK → users nullable | quem verificou |
| status | enum | pendente/andamento/concluida/verificada |
| type | enum | completa/rapida/manutencao/especial |
| priority | enum | alta/normal/baixa |
| estimated_minutes | smallint | |
| real_minutes | smallint nullable | preenchido ao concluir |
| started_at | timestamp nullable | |
| deadline | timestamp | |
| note | text nullable | |
| checklist | json | array de `{id, label, done}` |
| verified_at | timestamp nullable | |
| created_at / updated_at | timestamps | |

---

## Relacionamentos

```
guests        ──< reservations >── rooms
reservations  ──< stay_items
rooms         ──< cleaning_tasks
users         ──< cleaning_tasks (assignee)
users         ──< cleaning_tasks (verifier)
```

---

## Decisões de Design

| Decisão | Escolha | Motivo |
|---|---|---|
| Login = Funcionário | Estender `users` | Evita duplicação; simples para MVP |
| Checklist de limpeza | JSON em `cleaning_tasks.checklist` | Sem necessidade de query por item individual; migra para tabela se precisar |
| Escala semanal | JSON em `users.schedule` | 7 valores de shift; simples para renderizar na grade |
| Itens de cobrança | Tabela `stay_items` (não JSON) | Precisa de soma, edição individual e geração automática |

---

## Enums de Referência

```
RoomType:            Single | Duplo | Suíte
RoomStatus:          available | occupied | cleaning | maintenance | reserved
ReservationStatus:   confirmada | pendente | cancelada | realizada | no-show
TeamRole:            recepcao | housekeeping | gerente | manutencao | cozinha
TeamMemberStatus:    ativo | ferias | inativo
Shift:               mat | vesp | noite | off | ferias
CleaningTaskStatus:  pendente | andamento | concluida | verificada
CleaningTaskType:    completa | rapida | manutencao | especial
Priority:            alta | normal | baixa
AvatarColor:         blue | green | orange | purple | red
```
