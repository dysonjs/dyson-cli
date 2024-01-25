export function info(...messages: unknown[]) {
  console.info('❕', '\x1b[36m', ...messages, '\x1b[0m');
}

export function success(...messages: unknown[]) {
  console.log('🎉', '\x1b[32m', ...messages, '\x1b[0m');
}

export function warn(...messages: unknown[]) {
  console.warn('❗️', '\x1b[33m', ...messages, '\x1b[0m');
}

export function error(...messages: unknown[]) {
  console.error('❌', '\x1b[31m', ...messages, '\x1b[0m');
}
