import fs from 'fs-extra';
import path from 'path';

export default class SecurityAuditSkill {
  getDefinition() {
    return {
      name: 'security_audit',
      description: 'Analisa o código em busca de segredos expostos ou padrões inseguros (SQLi, XSS).',
      parameters: [
        {
          name: 'filePath',
          type: 'string',
          description: 'Caminho do arquivo para auditar.',
          required: true
        }
      ]
    };
  }

  async execute({ filePath }: { filePath: string }) {
    try {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        
        let targetPath = fullPath;
        if (!fs.existsSync(fullPath)) {
            // Fallback para raiz se não encontrar (considerando apps/server como CWD)
            const rootFallback = path.resolve(process.cwd(), '..', '..', filePath);
            if (!fs.existsSync(rootFallback)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }
            targetPath = rootFallback;
        }

        const content = await fs.readFile(targetPath, 'utf-8');
        const issues: any[] = [];

        // Regex para detectar segredos
        const secretRegex = /(key|secret|password|token)\s*[:=]\s*['"][a-zA-Z0-9_-]{10,}['"]/gi;
        if (secretRegex.test(content)) {
            issues.push({ 
                type: 'HARDCODED_SECRET', 
                severity: 'HIGH', 
                message: 'Possível chave ou segredo codificado diretamente no arquivo.' 
            });
        }

        // Regex para detectar SQL Injection simples
        const sqliRegex = /\.query\(['"].*?\s+\+\s+\w+.*['"]\)/gi;
        if (sqliRegex.test(content)) {
            issues.push({ 
                type: 'SQL_INJECTION', 
                severity: 'CRITICAL', 
                message: 'Detectada concatenação de string em consulta SQL. Use Prepared Statements.' 
            });
        }

        return {
            file: path.basename(targetPath),
            status: issues.length > 0 ? 'FAIL' : 'PASS',
            score: issues.length > 0 ? 0 : 100,
            issues,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        return { 
            file: path.basename(filePath), 
            status: 'FAIL', 
            score: 0, 
            issues: [{ message: error.message }],
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
  }
}
