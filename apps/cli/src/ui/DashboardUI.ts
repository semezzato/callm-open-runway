import chalk from 'chalk';
import stringWidth from 'string-width';

export const COLORS = {
  primary: '#3b82f6', // azul caollm
  secondary: '#64748b', // cinza slate
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#334155'
};

export interface BoxOptions {
  padding?: number;
  margin?: number;
  borderColor?: string;
  title?: string;
}

/**
 * Utilitário para criar caixas (boxes) no terminal usando caracteres Unicode
 */
export function drawBox(content: string[], options: BoxOptions = {}) {
  const padding = options.padding ?? 1;
  const borderColor = options.borderColor ?? COLORS.border;
  const title = options.title ? ` ${options.title} ` : '';

  // Calcular largura máxima do conteúdo
  const contentWidth = Math.max(
    stringWidth(title),
    ...content.map(line => stringWidth(line))
  );
  
  const innerWidth = contentWidth + (padding * 2);

  const topBorder = chalk.hex(borderColor)(
    '╭' + (title ? chalk.bold(title) : '') + '─'.repeat(innerWidth - stringWidth(title)) + '╮'
  );
  const bottomBorder = chalk.hex(borderColor)('╰' + '─'.repeat(innerWidth) + '╯');

  const lines = [topBorder];

  // Top padding
  for (let i = 0; i < padding; i++) {
    lines.push(chalk.hex(borderColor)('│') + ' '.repeat(innerWidth) + chalk.hex(borderColor)('│'));
  }

  // Content
  for (const line of content) {
    const spaceAfter = innerWidth - padding - stringWidth(line);
    lines.push(
      chalk.hex(borderColor)('│') + 
      ' '.repeat(padding) + 
      line + 
      ' '.repeat(spaceAfter) + 
      chalk.hex(borderColor)('│')
    );
  }

  // Bottom padding
  for (let i = 0; i < padding; i++) {
    lines.push(chalk.hex(borderColor)('│') + ' '.repeat(innerWidth) + chalk.hex(borderColor)('│'));
  }

  lines.push(bottomBorder);
  return lines.join('\n');
}

/**
 * Renderiza o cabeçalho principal do caLLM Dashboard
 */
export function renderHeader(version: string) {
  const title = chalk.bold.hex(COLORS.primary)('caLLM Code v' + version);
  const subtitle = chalk.hex(COLORS.secondary)('Open Runway - Universal AI Orchestrator');
  
  console.log('\n' + drawBox([
    `     ${title}     `,
    `  ${subtitle}  `,
    '',
    chalk.gray('Pronto para agir. Digite seu comando ou prompt abaixo.')
  ], { padding: 1, borderColor: COLORS.primary }));
}

/**
 * Renderiza uma barra de separação horizontal
 */
export function renderSeparator(label?: string) {
    const width = process.stdout.columns || 80;
    if (label) {
        const side = '-'.repeat(Math.floor((width - stringWidth(label) - 2) / 2));
        console.log(chalk.hex(COLORS.border)(`${side} ${label} ${side}`));
    } else {
        console.log(chalk.hex(COLORS.border)('-'.repeat(width)));
    }
}
