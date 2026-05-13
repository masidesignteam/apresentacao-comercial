# Sistema de Imagens para Apresentações

Este documento é lido por Claude durante o Step 4b do fluxo de criação.  
Define as regras de seleção, distribuição, geração de prompt e chamada à API.

---

## 1. Regras de quantidade máxima

| Total de slides | Máximo de imagens |
|---|---|
| Até 10 | 4 |
| 11 a 20 | 7 |
| 21 a 30 | 10 |
| 31 a 40 | 13 |
| Fórmula geral | `floor(N × 0.35)` |

---

## 2. Regras de distribuição

- **Nunca** dois slides consecutivos com imagem
- **Capa** (`cover`) → **sempre** recebe imagem
- **Contracapa** (`closing`) → **nunca** recebe imagem (design próprio fixo)
- Após definir os slides elegíveis, distribuir de forma intercalada com espaçamento mínimo de 2 slides entre imagens

---

## 3. Prioridade de slides elegíveis para imagem

### Alta prioridade (candidatos preferenciais)
| Tipo | Critério |
|---|---|
| `cover` | Sempre — obrigatório |
| `turning-point` | Recebe imagem em 50% dos casos (intercalado) |
| `statement` | Recebe imagem em 33% dos casos |
| `context` | Elegível se houver cota disponível |
| `opportunity` | Elegível se houver cota disponível |
| `example` | Elegível se houver cota disponível |
| `concept` | Elegível se houver cota disponível |
| `principle` | Elegível se houver cota disponível |

### Nunca recebem imagem
| Tipo | Motivo |
|---|---|
| `stats` | Layout de números em destaque |
| `framework` | Grid de cards estruturado |
| `decision` | Matriz visual própria |
| `action-plan` | Timeline de cards |
| `benefits` | Grid de cards |
| `recommendations` | Grid de cards |
| `risks` | Layout de estatísticas |
| `leaders` | Grid de cards |
| `closing` | Design próprio fixo |

---

## 4. Algoritmo de seleção (passo a passo)

```
1. Calcular M = floor(N × 0.35) — máximo de imagens
2. Slide 01 (cover) → imagem garantida. M restante = M - 1
3. Listar slides elegíveis (excluindo tipos bloqueados e closing)
4. Ordenar por prioridade (turning-point > statement > outros)
5. Percorrer a lista e selecionar slides respeitando:
   - Distância mínima de 2 slides entre imagens
   - Respeitar M restante
6. Se o usuário tiver pedido imagem específica em algum slide → priorizar
```

---

## 5. Prompt de conteúdo por slide

Para cada slide selecionado, gerar um **content prompt** baseado no conteúdo do slide.

### Estrutura do content prompt

```
[objeto ou cena que representa o tema] + [características visuais específicas]
```

### Critérios para o objeto

- Deve ser um **objeto físico ou cena** que represente o conceito do slide
- Não usar pessoas, rostos ou texto visível na imagem
- Preferir objetos que transmitam o tema de forma metafórica ou literal
- Exemplos de mapeamento conceito → objeto:

| Conceito do slide | Objeto sugerido |
|---|---|
| Modelo de Gestão / DNA da organização | Estrutura molecular 3D / engrenagem complexa |
| Planejamento Estratégico | Bússola / mapa com rotas traçadas |
| Direção / Norte estratégico | Bússola isolada / seta de direção |
| Recursos / Alocação | Balança de precisão / blocos empilhados |
| Ciclo / Processo contínuo | Roda de engrenagens em ciclo |
| Framework / Estrutura | Cubo com divisões internas |
| Diagnóstico / Análise | Lupa sobre superfície / scanner 3D |
| SWOT / Mapeamento | Grade dividida em 4 quadrantes |
| Virada / Ponto de mudança | Dobradiça / alavanca em metal |
| Pausa / Descanso | Ampulheta / relógio parado |
| Encerramento / Movimento | Seta em movimento / trajetória |

---

## 6. Prompt base de estilo visual

> **⚠️ PLACEHOLDER — aguardando o prompt oficial do usuário**

```
[INSERIR AQUI O PROMPT BASE DE ESTILO VISUAL]
```

Quando o usuário fornecer o prompt de estilo, substituir o placeholder acima.  
O prompt final de cada imagem será: `[PROMPT BASE] + [CONTENT PROMPT]`

---

## 7. Estrutura da chamada à API OpenAI

> **⚠️ Requer `OPENAI_API_KEY` configurada no ambiente**

```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1-mini",
    "prompt": "[PROMPT BASE] + [CONTENT PROMPT]",
    "n": 1,
    "size": "1024x1024",
    "response_format": "url"
  }'
```

### Após receber a resposta

1. Extrair a URL da imagem do JSON de resposta
2. Fazer download com `curl -o "Imagens/[slug]/slide-[NN].png" "[URL]"`
3. Atualizar o slide correspondente em `user-presentations.ts` com o caminho da imagem

### Convenção de nomes de arquivo

```
/Imagens/[slug]/slide-[NN].png
```

Exemplo: `/Imagens/modelo-gestao/slide-01.png`

---

## 8. Atualização do slide após geração

Após download, atualizar o slide em `user-presentations.ts`:

```typescript
// Adicionar ao topo do arquivo
import slide01Image from "../../../Imagens/modelo-gestao/slide-01.png";

// No slide correspondente, adicionar:
imageSrc: slide01Image,
imageAlt: "[descrição acessível da imagem]",
```

---

## 9. Ordem de execução no fluxo geral

```
Step 5 — Criar todos os slides (texto completo)
         ↓
Step 4b — Definir plano de imagens (este documento)
         ↓
Step 4c — Usuário aprova quais slides terão imagem
         ↓
Step 6  — Gerar imagens via API e integrar nos slides
         ↓
Step 6b — Confirmar apresentação completa ao usuário
```

> **Nota:** A criação dos slides (Step 5) vem antes das imagens.  
> Só após os slides estarem criados e aprovados é que as imagens são geradas e inseridas.
