# Status do Sistema de Apresentações

> Quando o usuário perguntar "o que falta?" ou "qual o status do sistema?", ler este arquivo e responder com o estado atual.

---

## ✅ Concluído

### Sistema de criação (PRESENTATION-SYSTEM.md)
- Steps 1–5: gatilho → pergunta → análise → mapeamento → preview → criação
- Step 4b e 4c: plano de imagens e aprovação
- Step 6: geração de imagens via API (estrutura pronta, falta API key + prompt)
- Step 7: confirmação final
- Arquivo `user-presentations.ts` para armazenar apresentações criadas
- Mapeamento de 20 tipos de página com limites de caracteres

### Sistema de imagens (IMAGE-SYSTEM.md)
- Algoritmo de seleção: quais slides recebem imagem (fórmula + prioridades)
- Regra de não-consecutividade entre slides com imagem
- Mapa conceito → objeto para prompts de conteúdo
- Estrutura da chamada API (modelo gpt-image-1-mini)
- Convenção de nomes de arquivo e atualização dos slides após geração

### Interface (app)
- Página inicial: hero com animação de digitação + slides empilhados com scroll-fan
- Section 2: Apresentação Demo com sidebar colapsável e thumbnails verticais
- Section 3: Mapeamento de Páginas (20 tipos com limites de caracteres)
- Menu hambúrguer funcional com lista de apresentações
- Rota dinâmica `/apresentacao/[slug]` para cada apresentação

### Apresentação de exemplo
- "Modelo de Gestão" criada com 23 slides em `user-presentations.ts`

---

## 🔴 Faltando — Bloqueado aguardando usuário

### 1. Prompt base de estilo visual das imagens
**O que é:** o prompt que define a linguagem visual de TODAS as imagens geradas.  
Exemplo: estilo 3D editorial, fundo transparente, sombra suave, paleta neutra.  
**Onde vai:** `IMAGE-SYSTEM.md` seção 6, substituindo o placeholder `[INSERIR AQUI]`.  
**Quem fornece:** usuário.

### 2. API Key da OpenAI
**O que é:** chave de acesso para chamar o modelo `gpt-image-1-mini`.  
**Como configurar:** `export OPENAI_API_KEY="sk-..."` no terminal antes de rodar.  
**Quem fornece:** usuário (criar em platform.openai.com com billing ativo).

---

## 🟡 Faltando — Para construir

### 3. Integração real de geração de imagens
**O que é:** o script que lê `IMAGE-SYSTEM.md`, chama a API da OpenAI e salva as imagens em `/Imagens/[slug]/slide-NN.png`, atualizando `user-presentations.ts`.  
**Depende de:** itens 1 e 2 acima.  
**Arquivo alvo:** `scripts/generate-images.ts`

### 4. Rotas de exportação para Figma (apresentações do usuário)
**O que é:** rotas isoladas `1600×900` sem sidebar/navbar para cada slide de cada apresentação do usuário, equivalente às que já existem para a apresentação demo em `/styleguide/paginas/apresentacoes-comerciais/slide-N`.  
**Rota proposta:** `/apresentacao/[slug]/export/[index]`  
**Por que:** necessário para exportar apresentações do usuário para o Figma → PPT.  
**Depende de:** nada, pode ser construído agora.

### 5. Script de exportação Figma automatizado (local)
**O que é:** um único comando que captura todos os slides de uma apresentação para o Figma automaticamente, sem abrir URL manualmente slide a slide.  
**Como:** usar `open` em loop para cada rota isolada + polling do MCP.  
**Rota:** `npm run export-figma modelo-gestao`  
**Depende de:** item 4 (rotas isoladas).  
**Limitação conhecida:** funciona apenas localmente (requer Figma Desktop + localhost).

---

## 📋 Ordem de execução recomendada

```
1. Usuário fornece: prompt de estilo visual → atualizar IMAGE-SYSTEM.md
2. Usuário fornece: API Key OpenAI → configurar no ambiente
3. Construir: scripts/generate-images.ts
4. Construir: rotas /apresentacao/[slug]/export/[index]
5. Construir: script de exportação Figma automatizado
6. Testar: fluxo completo (criar apresentação → gerar imagens → exportar Figma → PPT)
```

---

## 🗒️ Notas e decisões tomadas

- **Exportação PPT direta (PptxGenJS):** testada, resultado muito diferente do visual original. Descartada por enquanto.
- **Exportação via screenshot (Playwright):** não é editável. Descartada.
- **Melhor caminho para PPT editável:** Figma → PPT (já funciona localmente, resultado perfeito).
- **Fonte no PPT:** se retomar PptxGenJS, usar Arial (usuário aprovou).
- **Imagens com fundo transparente:** custo igual ao PNG normal (preço por tokens/resolução, não por transparência).
- **Modelo de imagem:** `gpt-image-1-mini` (melhor custo-benefício).
