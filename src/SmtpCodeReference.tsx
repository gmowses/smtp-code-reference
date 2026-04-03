import { useState, useMemo } from 'react'
import { Search, Sun, Moon, Languages, Mail, Copy, Check } from 'lucide-react'

const translations = {
  en: {
    title: 'SMTP Response Codes',
    subtitle: 'Reference for SMTP status codes with descriptions and common causes.',
    searchPlaceholder: 'Search by code or description...',
    code: 'Code',
    class: 'Class',
    description: 'Description',
    causes: 'Common causes',
    noResults: 'No results found.',
    results: 'results',
    allClasses: 'All classes',
    copy: 'Copy',
    copied: 'Copied!',
    builtBy: 'Built by',
    classes: { success: 'Success (2xx)', queued: 'Queued (3xx)', tempFail: 'Temp Failure (4xx)', permFail: 'Perm Failure (5xx)' },
  },
  pt: {
    title: 'Codigos de Resposta SMTP',
    subtitle: 'Referencia dos codigos de status SMTP com descricoes e causas comuns.',
    searchPlaceholder: 'Pesquise por codigo ou descricao...',
    code: 'Codigo',
    class: 'Classe',
    description: 'Descricao',
    causes: 'Causas comuns',
    noResults: 'Nenhum resultado encontrado.',
    results: 'resultados',
    allClasses: 'Todas as classes',
    copy: 'Copiar',
    copied: 'Copiado!',
    builtBy: 'Criado por',
    classes: { success: 'Sucesso (2xx)', queued: 'Na fila (3xx)', tempFail: 'Falha temporaria (4xx)', permFail: 'Falha permanente (5xx)' },
  }
} as const

type Lang = keyof typeof translations

interface SmtpCode {
  code: number
  classKey: 'success' | 'queued' | 'tempFail' | 'permFail'
  desc: string
  causes: string[]
}

const SMTP_CODES: SmtpCode[] = [
  { code: 211, classKey: 'success', desc: 'System status or help reply', causes: ['Response to HELP command', 'System information'] },
  { code: 214, classKey: 'success', desc: 'Help message', causes: ['Response to HELP command'] },
  { code: 220, classKey: 'success', desc: 'Service ready', causes: ['Server greeting when connection is established', 'Server is ready to accept commands'] },
  { code: 221, classKey: 'success', desc: 'Service closing transmission channel', causes: ['Server closed the connection (QUIT command accepted)', 'Session ended normally'] },
  { code: 235, classKey: 'success', desc: 'Authentication successful', causes: ['AUTH command completed successfully', 'Credentials verified by server'] },
  { code: 250, classKey: 'success', desc: 'Requested mail action OK', causes: ['Command completed successfully', 'EHLO/HELO accepted', 'MAIL FROM accepted', 'RCPT TO accepted', 'DATA accepted'] },
  { code: 251, classKey: 'success', desc: 'User not local; will forward', causes: ['Recipient is on another server and will be forwarded'] },
  { code: 252, classKey: 'success', desc: 'Cannot verify user, but will accept', causes: ['Server cannot verify address but will try delivery'] },
  { code: 334, classKey: 'queued', desc: 'Authentication challenge (Base64 encoded)', causes: ['AUTH command in progress', 'Server is requesting credentials'] },
  { code: 354, classKey: 'queued', desc: 'Start mail input; end with <CRLF>.<CRLF>', causes: ['DATA command accepted', 'Server ready to receive message body'] },
  { code: 421, classKey: 'tempFail', desc: 'Service not available, closing channel', causes: ['Server overloaded', 'Server shutting down', 'Too many connections from your IP', 'Rate limiting in effect'] },
  { code: 422, classKey: 'tempFail', desc: 'Mailbox full', causes: ['Recipient mailbox has exceeded its quota', 'Disk space issue on receiving server'] },
  { code: 431, classKey: 'tempFail', desc: 'Not enough storage on server', causes: ['Server disk space exhausted', 'Quota exceeded on server side'] },
  { code: 432, classKey: 'tempFail', desc: 'Recipient server password changed', causes: ['AUTH credentials expired on receiving server'] },
  { code: 441, classKey: 'tempFail', desc: 'Recipient mailbox connection problem', causes: ['Temporary issue connecting to recipient mailbox'] },
  { code: 442, classKey: 'tempFail', desc: 'Connection dropped during transmission', causes: ['Network issues during sending', 'Timeout during data transfer'] },
  { code: 446, classKey: 'tempFail', desc: 'Max hop count exceeded', causes: ['Email routing loop', 'Too many relay hops'] },
  { code: 447, classKey: 'tempFail', desc: 'Message timed out', causes: ['Delivery timeout exceeded', 'Slow network connection'] },
  { code: 449, classKey: 'tempFail', desc: 'Routing error (Microsoft-specific)', causes: ['Exchange server routing problem', 'Specific to Microsoft Exchange'] },
  { code: 450, classKey: 'tempFail', desc: 'Requested mail action not taken: mailbox unavailable', causes: ['Mailbox busy', 'Temporary unavailability of recipient server', 'Server policy (IP reputation check)'] },
  { code: 451, classKey: 'tempFail', desc: 'Local error in processing', causes: ['Server-side error during processing', 'Greylisting (retry later)', 'DNS failure', 'Content policy temporarily blocking'] },
  { code: 452, classKey: 'tempFail', desc: 'Insufficient storage', causes: ['Server out of disk space', 'Too many recipients in one message', 'Delivery queue full'] },
  { code: 471, classKey: 'tempFail', desc: 'Local error (anti-spam)', causes: ['Anti-spam filter temporary rejection', 'Suspicious content flagged'] },
  { code: 500, classKey: 'permFail', desc: 'Syntax error: command unrecognized', causes: ['Invalid SMTP command', 'Typo in command name', 'Server does not support command'] },
  { code: 501, classKey: 'permFail', desc: 'Syntax error in parameters or arguments', causes: ['Invalid email address format', 'Bad parameters in MAIL FROM or RCPT TO'] },
  { code: 502, classKey: 'permFail', desc: 'Command not implemented', causes: ['SMTP command not supported by this server', 'Feature disabled by server configuration'] },
  { code: 503, classKey: 'permFail', desc: 'Bad sequence of commands', causes: ['Sending commands out of order', 'DATA before MAIL FROM', 'RCPT TO before MAIL FROM'] },
  { code: 504, classKey: 'permFail', desc: 'Command parameter not implemented', causes: ['Unsupported AUTH mechanism', 'Specific extension not supported'] },
  { code: 521, classKey: 'permFail', desc: 'Domain does not accept mail', causes: ['Receiving domain explicitly rejects all mail', 'Null MX record'] },
  { code: 523, classKey: 'permFail', desc: 'Recipient cannot receive messages this size', causes: ['Message exceeds recipient maximum message size'] },
  { code: 541, classKey: 'permFail', desc: 'Spam rejected', causes: ['Anti-spam filter permanent rejection', 'IP/domain on blacklist'] },
  { code: 550, classKey: 'permFail', desc: 'Requested action not taken: mailbox unavailable', causes: ['Recipient address does not exist', 'IP/domain blacklisted', 'Policy rejection', 'Sender domain not allowed'] },
  { code: 551, classKey: 'permFail', desc: 'User not local; please forward', causes: ['Recipient mailbox has moved', 'Server will not relay to the destination'] },
  { code: 552, classKey: 'permFail', desc: 'Exceeded storage allocation', causes: ['Message too large for recipient mailbox', 'Server storage quota exceeded'] },
  { code: 553, classKey: 'permFail', desc: 'Requested action not taken: mailbox name not allowed', causes: ['Invalid email address', 'Non-existent domain', 'Bad mailbox syntax'] },
  { code: 554, classKey: 'permFail', desc: 'Transaction failed', causes: ['General permanent failure', 'IP blacklisted', 'Spam filter permanent reject', 'Invalid HELO/EHLO hostname'] },
  { code: 555, classKey: 'permFail', desc: 'MAIL FROM/RCPT TO parameters not recognized', causes: ['Unsupported ESMTP extension parameters in address'] },
]

const CLASS_COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  queued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  tempFail: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  permFail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const CODE_COLORS: Record<string, string> = {
  success: 'text-green-600 dark:text-green-400',
  queued: 'text-blue-600 dark:text-blue-400',
  tempFail: 'text-yellow-600 dark:text-yellow-400',
  permFail: 'text-red-600 dark:text-red-400',
}

export default function SmtpCodeReference() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [copiedCode, setCopiedCode] = useState<number | null>(null)

  const t = translations[lang]

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return SMTP_CODES.filter(c => {
      const matchClass = classFilter === 'all' || c.classKey === classFilter
      const matchSearch = !q || String(c.code).includes(q) || c.desc.toLowerCase().includes(q) || c.causes.some(ca => ca.toLowerCase().includes(q))
      return matchClass && matchSearch
    })
  }, [search, classFilter])

  const handleCopy = (code: number) => {
    navigator.clipboard.writeText(String(code)).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <span className="font-semibold">SMTP Response Codes</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/smtp-code-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">{t.allClasses}</option>
              <option value="success">{t.classes.success}</option>
              <option value="queued">{t.classes.queued}</option>
              <option value="tempFail">{t.classes.tempFail}</option>
              <option value="permFail">{t.classes.permFail}</option>
            </select>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} {t.results}</p>

          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.code} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`font-mono font-bold text-2xl tabular-nums ${CODE_COLORS[c.classKey]}`}>{c.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CLASS_COLORS[c.classKey]}`}>
                      {t.classes[c.classKey]}
                    </span>
                  </div>
                  <button onClick={() => handleCopy(c.code)} title={copiedCode === c.code ? t.copied : t.copy}
                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0">
                    {copiedCode === c.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="font-semibold text-sm">{c.desc}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t.causes}</p>
                  <ul className="space-y-0.5">
                    {c.causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="text-red-400 mt-0.5">•</span>{cause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-zinc-400">{t.noResults}</div>}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
