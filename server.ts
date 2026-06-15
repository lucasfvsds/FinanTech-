import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK safely as guided by gemini-api skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route: AI insights generator
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { monthName, metrics, transactions } = req.body;
    
    const contextString = JSON.stringify(transactions.map((t: any) => ({
      name: t.name,
      amount: t.amount,
      type: t.type === 'entrada' ? 'Receita' : 'Despesa',
      category: t.category,
      dueDate: t.dueDate,
      status: t.isPaid ? 'Pago' : 'Pendente'
    })));

    const systemInstruction = 
      "Você é um analista financeiro de elite do Minhas Finanças. Analise os relatórios e ofereça " +
      "diagnósticos detalhados, avisos de risco estratégico e até 3 dicas de ação práticas e fáceis " +
      "de aplicar em tópicos (usando formatação markdown elegante). Responda estritamente em Português do Brasil.";

    const userPrompt = `Aqui está o meu relatório de competência para o mês de ${monthName}:
- Total de Receitas Planejadas: R$ ${metrics.totalIncome.toFixed(2)}
- Total de Despesas Planejadas: R$ ${metrics.totalExpense.toFixed(2)}
- Saldo Líquido Esperado: R$ ${metrics.totalBalance.toFixed(2)}
- Total Pendente de Pagamento: R$ ${metrics.pendingExpense.toFixed(2)}

Lançamentos detalhados do mês:
${contextString}

Faça uma análise concisa, encorajadora e extremamente inteligente sobre a minha situação atual de caixa, destacando pontos de otimização e possíveis vazamentos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      }
    });

    res.json({ insights: response.text });
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar parecer da inteligência artificial' });
  }
});

// API route: AI Chat & Intelligent command extractor
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { history, message, categories } = req.body;

    const todayStr = new Date().toISOString().split('T')[0];
    const categoryNames = categories.map((c: any) => c.name).join(', ');

    // Detect if message is likely an adding/income/expense transactional instruction
    const containsAddingCommand = /(adicionar|lançar|coloque|paguei|recebi|gastei|freela|ganhei|comi|gasto|compra|pago|fatura|recebimento)/i.test(message);

    if (containsAddingCommand) {
      const systemInstruction = 
        `Você é uma API de processamento financeiro. Sua tarefa é extrair estritamente as intenções de ` +
        `receitas ou despesas a partir de texto desestruturado e responder em JSON estruturado com o esquema selecionado. ` +
        `A data de hoje de referência é ${todayStr}.`;

      const instruction = 
        `Extraia os dados de lançamento financeiro do texto fornecido pelo cliente. ` +
        `Selecione a categoria mais lógica a partir desta lista de categorias válidas registradas pelo usuário: [${categoryNames}]. ` +
        `Se nenhuma categoria na lista fizer sentido, escolha "Outros". ` +
        `Preencha o objeto com o esquema especificado.`;

      const prompt = `Texto do cliente: "${message}"\n\n${instruction}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isTransaction: { 
                type: Type.BOOLEAN, 
                description: 'true se for realmente um comando que indica ganho, despesa ou transação, false caso contrário.' 
              },
              title: { 
                type: Type.STRING, 
                description: 'Um nome descritivo amigável em português para a transação. Exemplo: "Supermercado local", "Bônus Freelance".' 
              },
              amount: { 
                type: Type.NUMBER, 
                description: 'Valor líquido da transação (número flutuante positivo).' 
              },
              type: { 
                type: Type.STRING, 
                description: 'Especifique "entrada" para receitas/ganhos ou "saida" para gastos/despesas.' 
              },
              category: { 
                type: Type.STRING, 
                description: 'O nome exato da categoria correspondente.' 
              },
              dueDate: { 
                type: Type.STRING, 
                description: 'Data calculada ou estimada para vencimento em padrão ISO YYYY-MM-DD.' 
              },
              explanation: { 
                type: Type.STRING, 
                description: 'Explique resumidamente em português por que você realizou essa conversão automática.' 
              }
            },
            required: ['isTransaction', 'title', 'amount', 'type', 'category', 'dueDate', 'explanation']
          }
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText.trim());

      if (parsed.isTransaction) {
        return res.json({ isTransaction: true, transaction: parsed });
      }
    }

    // Normal conversational response if not parsed as a transaction
    const systemInstruction = 
      "Você é o FinanTech AI, o robô conselheiro financeiro incorporado no aplicativo Minhas Finanças. " + 
      "Responda em Português do Brasil de modo amigável, objetivo, conciso e com excelente tom consultivo. " +
      "Seja encorajador e dê dicas financeiras pragmáticas.";

    const contents = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ isTransaction: false, response: response.text });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar mensagem do chat com IA' });
  }
});

// Serve Vite dynamic assets and standard application routing
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
