import { useMemo, useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  ArrowDownLeft, ArrowUpRight, CalendarDays, ChartNoAxesCombined, ChevronDown,
  ChevronLeft, ChevronRight, CirclePlus, CreditCard, Home, Menu, Plus, ShoppingBasket,
  Sparkles, Wallet, X,
} from 'lucide-react'

type Kind = 'income' | 'expense'
type Transaction = {
  id: number
  title: string
  category: string
  amount: number
  date: string
  kind: Kind
}
const expenseCategories = ['食費', '日用品', '住居費', '水道・光熱費', '通信費', '交通費', '美容・衣服', '医療・健康', '娯楽・交際', 'その他']
const incomeCategories = ['給与', '賞与', '副収入', '臨時収入', 'その他']
const colors = ['#79b9cf', '#9bcbd9', '#a9c6e4', '#b9d8d4', '#8bb9b1', '#c4d9ec', '#9eaccf', '#c9d8dc', '#7da7b9', '#d5e5e9']
const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`
const today = new Date()
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

const seed: Transaction[] = [
  { id: 1, title: '食材', category: '食費', amount: 4280, date: `${monthKey(today)}-02`, kind: 'expense' },
  { id: 2, title: 'カフェ', category: '食費', amount: 980, date: `${monthKey(today)}-04`, kind: 'expense' },
  { id: 3, title: '電気・ガス', category: '水道・光熱費', amount: 8600, date: `${monthKey(today)}-05`, kind: 'expense' },
  { id: 4, title: 'スマートフォン', category: '通信費', amount: 3980, date: `${monthKey(today)}-06`, kind: 'expense' },
  { id: 5, title: '今月のお給料', category: '給与', amount: 280000, date: `${monthKey(today)}-01`, kind: 'income' },
  { id: 6, title: '日用品の買い足し', category: '日用品', amount: 2150, date: `${monthKey(today)}-08`, kind: 'expense' },
  { id: 7, title: '電車・バス', category: '交通費', amount: 1640, date: `${monthKey(today)}-09`, kind: 'expense' },
  { id: 8, title: 'ランチ', category: '食費', amount: 1250, date: `${monthKey(today)}-10`, kind: 'expense' },
  { id: 9, title: '動画サービス', category: '娯楽・交際', amount: 1200, date: `${monthKey(today)}-11`, kind: 'expense' },
]
const sampleMonthly = [
  { month: '6月', income: 275000, expense: 221000 },
  { month: '7月', income: 280000, expense: 214000 },
  { month: '8月', income: 280000, expense: 232000 },
  { month: '9月', income: 282000, expense: 208000 },
  { month: '10月', income: 280000, expense: 219000 },
  { month: '今月', income: 280000, expense: 23800 },
]

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('mizu-transactions')
      return saved ? JSON.parse(saved) as Transaction[] : seed
    } catch { return seed }
  })
  const [month, setMonth] = useState(monthKey(today))
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('expense')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('食費')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(`${monthKey(today)}-${String(today.getDate()).padStart(2, '0')}`)
  const [filter, setFilter] = useState('すべて')

  const currentItems = useMemo(() => transactions.filter(t => t.date.startsWith(month)), [transactions, month])
  const income = currentItems.filter(t => t.kind === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = currentItems.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense
  const prevDate = new Date(`${month}-01T12:00:00`)
  prevDate.setMonth(prevDate.getMonth() - 1)
  const previousMonth = monthKey(prevDate)
  const previousExpense = transactions.filter(t => t.date.startsWith(previousMonth) && t.kind === 'expense').reduce((s, t) => s + t.amount, 0)
  const categoryData = expenseCategories.map((name, i) => ({
    name,
    value: currentItems.filter(t => t.kind === 'expense' && t.category === name).reduce((s, t) => s + t.amount, 0),
    color: colors[i],
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)
  const monthlyChart = sampleMonthly.map((v, i) => i === 5 ? { ...v, income, expense } : v)
  const visibleTransactions = currentItems.filter(t => filter === 'すべて' || t.kind === (filter === '収入' ? 'income' : 'expense')).sort((a, b) => b.date.localeCompare(a.date))

  function saveTransactions(next: Transaction[]) {
    setTransactions(next)
    localStorage.setItem('mizu-transactions', JSON.stringify(next))
  }
  function changeMonth(delta: number) {
    const d = new Date(`${month}-01T12:00:00`)
    d.setMonth(d.getMonth() + delta)
    setMonth(monthKey(d))
  }
  function addTransaction(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount.replace(/,/g, ''))
    if (!title.trim() || !value || value <= 0) return
    saveTransactions([{ id: Date.now(), title: title.trim(), category, amount: value, date, kind }, ...transactions])
    setTitle(''); setAmount(''); setModalOpen(false)
  }
  const dateLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark"><Wallet size={20} /></span><span>mizu<span className="brand-sub">かんたん家計簿</span></span></a>
        <div className="side-label">MENU</div>
        <button className={`nav-item ${activeTab === 'overview' ? 'selected' : ''}`} onClick={() => setActiveTab('overview')}><Home size={18}/> ダッシュボード</button>
        <button className={`nav-item ${activeTab === 'history' ? 'selected' : ''}`} onClick={() => setActiveTab('history')}><CalendarDays size={18}/> 収支の記録</button>
        <button className="nav-item" onClick={() => setModalOpen(true)}><CirclePlus size={18}/> 収支を入力</button>
        <div className="sidebar-note"><Sparkles size={17}/><p>毎日の小さな記録が、<br/>未来のゆとりにつながります。</p></div>
        <div className="side-bottom">© 2026 mizu household</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">YOUR MONEY, CLEARLY.</div><h1>お金の流れを、もっとシンプルに。</h1></div>
          <button className="primary-button top-add" onClick={() => setModalOpen(true)}><Plus size={17}/> 収支を入力</button>
        </header>

        <div className="month-switch">
          <button aria-label="前の月" onClick={() => changeMonth(-1)}><ChevronLeft size={19}/></button>
          <strong>{dateLabel}</strong>
          <button aria-label="次の月" onClick={() => changeMonth(1)}><ChevronRight size={19}/></button>
          <span className="month-caption">MONTHLY REPORT</span>
        </div>

        <section className="summary-grid">
          <article className="summary-card balance-card">
            <div className="summary-head"><span>今月の収支</span><span className="round-icon"><Wallet size={18}/></span></div>
            <div className="summary-value">{yen(balance)}</div>
            <div className="summary-foot">収入 − 支出</div>
          </article>
          <article className="summary-card">
            <div className="summary-head"><span>収入</span><span className="round-icon income-icon"><ArrowDownLeft size={18}/></span></div>
            <div className="summary-value">{yen(income)}</div>
            <div className="summary-foot positive">今月の収入合計</div>
          </article>
          <article className="summary-card">
            <div className="summary-head"><span>支出</span><span className="round-icon expense-icon"><ArrowUpRight size={18}/></span></div>
            <div className="summary-value">{yen(expense)}</div>
            <div className="summary-foot">今月の支出合計</div>
          </article>
        </section>

        <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>今月の家計レポート</h2></div><span className="updated-pill">● 自動で集計</span></div>
        <section className="report-grid">
          <article className="panel trend-panel">
            <div className="panel-title"><div><h3>収入と支出の推移</h3><p>過去6か月の比較</p></div><span className="legend"><i className="legend-income"/>収入 <i className="legend-expense"/>支出</span></div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChart} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#75b9cf" stopOpacity={0.25}/><stop offset="100%" stopColor="#75b9cf" stopOpacity={0.02}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9c9df" stopOpacity={0.3}/><stop offset="100%" stopColor="#a9c9df" stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#eaf0f2"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#91a2a8', fontSize: 11 }}/>
                  <YAxis tickFormatter={v => `${Math.round(v / 10000)}万`} axisLine={false} tickLine={false} tick={{ fill: '#91a2a8', fontSize: 10 }}/>
                  <Tooltip formatter={(v) => yen(Number(v))} contentStyle={{ border: '1px solid #e7eff2', borderRadius: 12, fontSize: 12 }}/>
                  <Area type="monotone" dataKey="income" name="収入" stroke="#70b4ca" strokeWidth={2.5} fill="url(#incomeFill)"/>
                  <Area type="monotone" dataKey="expense" name="支出" stroke="#a1bfd6" strokeWidth={2.5} fill="url(#expenseFill)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="panel category-panel">
            <div className="panel-title"><div><h3>カテゴリー別支出</h3><p>今月の支出内訳</p></div><span className="mini-tag">10 CATEGORIES</span></div>
            {categoryData.length ? <div className="category-content">
              <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="91%" paddingAngle={3} stroke="none">{categoryData.map((entry, i) => <Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip formatter={(v) => yen(Number(v))}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{yen(expense)}</strong><span>TOTAL</span></div></div>
              <div className="category-legend">{categoryData.slice(0, 5).map(c => <div className="category-line" key={c.name}><i style={{ background: c.color }}/><span>{c.name}</span><b>{yen(c.value)}</b></div>)}</div>
            </div> : <div className="empty-chart">収支を入力すると、<br/>カテゴリー別に表示されます。</div>}
          </article>
        </section>

        <section className="comparison-row">
          <div className="compare-card"><div className="compare-icon"><ChartNoAxesCombined size={19}/></div><div><span>前月との支出比較</span><strong>{previousExpense ? `${expense >= previousExpense ? '+' : '−'}${yen(Math.abs(expense - previousExpense))}` : '比較データなし'}</strong></div><small>{previousExpense ? `前月 ${yen(previousExpense)} ／ 今月 ${yen(expense)}` : '前月の記録を入力すると比較できます'}</small></div>
          <div className="compare-card"><div className="compare-icon"><ShoppingBasket size={19}/></div><div><span>記録した項目</span><strong>{currentItems.length}<em> 件</em></strong></div><small>今月入力した収支の合計件数</small></div>
        </section>

        <section className="transactions-section">
          <div className="section-heading transaction-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>{activeTab === 'history' ? '収支の記録' : '最近の記録'}</h2></div><button className="text-button" onClick={() => setActiveTab(activeTab === 'history' ? 'overview' : 'history')}>{activeTab === 'history' ? '概要に戻る' : 'すべて見る'} <ChevronRight size={15}/></button></div>
          <div className="panel transaction-panel">
            <div className="transaction-toolbar"><div className="filter-tabs">{['すべて', '収入', '支出'].map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><span>{visibleTransactions.length}件の記録</span></div>
            {visibleTransactions.length ? visibleTransactions.slice(0, activeTab === 'history' ? undefined : 5).map(t => <div className="transaction-item" key={t.id}><div className={`transaction-symbol ${t.kind}`}><CreditCard size={17}/></div><div className="transaction-info"><strong>{t.title}</strong><span>{t.category} ・ {t.date.replaceAll('-', '/')}</span></div><b className={t.kind === 'income' ? 'amount-income' : ''}>{t.kind === 'income' ? '+' : '−'}{yen(t.amount)}</b></div>) : <div className="empty-list">この月の記録はまだありません。</div>}
          </div>
        </section>
        <footer className="footer-note">mizu <span>— 毎日の暮らしに、やさしい見通しを。</span></footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <form className="entry-modal" onSubmit={addTransaction}>
          <div className="modal-head"><div><span className="eyebrow">NEW RECORD</span><h2>収支を入力</h2></div><button type="button" className="close-button" onClick={() => setModalOpen(false)} aria-label="閉じる"><X size={20}/></button></div>
          <div className="kind-switch"><button type="button" className={kind === 'expense' ? 'chosen expense-choice' : ''} onClick={() => { setKind('expense'); setCategory('食費') }}>支出</button><button type="button" className={kind === 'income' ? 'chosen income-choice' : ''} onClick={() => { setKind('income'); setCategory('給与') }}>収入</button></div>
          <label>内容<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="例：スーパーで買い物"/></label>
          <label>金額（円）<input required type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例：3500"/></label>
          <label>カテゴリー<select value={category} onChange={e => setCategory(e.target.value)}>{(kind === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c}>{c}</option>)}</select></label>
          <label>日付<input required type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
          <button className="primary-button submit-button" type="submit">この内容で登録する</button>
        </form>
      </div>}
    </div>
  )
}
