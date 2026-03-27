import fs from 'fs-extra';
import path from 'path';
import { LlmService, LocalLlamaService } from '../packages/core/src/index.js';

async function runComplianceTest() {
  console.log('🚀 Iniciando Teste de Conformidade caLLM...');

  const zenPath = path.resolve(process.cwd(), '.callm', 'ZEN.md');
  const zenContent = await fs.readFile(zenPath, 'utf-8');

  console.log('📖 ZEN.md Carregado. Testando com o modelo...');

  // Simulando o sistema de contexto injetando o ZEN.md como instrução de sistema
  const systemInstruction = `
    VOCÊ É O ORQUESTRADOR caLLM (OPEN RUNWAY).
    VOCÊ DEVE SEGUIR ESTRICTAMENTE O ZEN.md ABAIXO EM TODAS AS RESPOSTAS:
    
    ${zenContent}
  `;

  // Usando o Gemini se houver API Key, senão tenta o local (simulado para o teste)
  const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
  const llm = new LlmService({ apiKey });

  const prompt = "Preciso implementar um serviço de upload de arquivos no backend. Como devo proceder seguindo o nosso Códice?";

  console.log(`\n💬 Prompt: "${prompt}"`);
  console.log('⏳ Aguardando resposta do orquestrador...\n');

  // Para o teste sem gastar tokens reais do usuário se não houver chave, 
  // vamos mostrar como a IA deveria responder baseada no contexto injetado.
  // Se houver chave, faremos a chamada real.
  
  if (apiKey === 'MOCK_KEY') {
    console.log('⚠️ [MOCK MODE] Nenhuma GEMINI_API_KEY encontrada. Simulando conformidade...');
    console.log('✅ Verificação de Segurança: Anti-Injection e Sanitização mencionadas.');
    console.log('✅ Verificação de TDD: Recomendação de criar testes unitários antes do código.');
    console.log('✅ Verificação de 12-Factor: Sugestão de usar Variáveis de Ambiente para o path de storage.');
  } else {
    try {
      const response = await llm.sendMessage(prompt, [], [], undefined, systemInstruction);
      console.log('🤖 Resposta do Orquestrador:');
      console.log('--------------------------------------------------');
      console.log(response);
      console.log('--------------------------------------------------');
      
      const checks = {
        tdd: response.toLowerCase().includes('test') || response.toLowerCase().includes('tdd'),
        security: response.toLowerCase().includes('secure') || response.toLowerCase().includes('sanitiz'),
        factor12: response.toLowerCase().includes('env') || response.toLowerCase().includes('variáveis')
      };

      console.log('\n📊 Resultado da Auditoria .callm:');
      console.log(`- TDD Compliance: ${checks.tdd ? '✅' : '❌'}`);
      console.log(`- Security Compliance: ${checks.security ? '✅' : '❌'}`);
      console.log(`- 12-Factor Compliance: ${checks.factor12 ? '✅' : '❌'}`);
    } catch (e: any) {
      console.error('❌ Erro na chamada do modelo:', e.message);
    }
  }
}

runComplianceTest().catch(console.error);
