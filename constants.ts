
import { Language, Currency, Category, AccountType } from './types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  'USD', 'EUR', 'COP', 'MXN', 'GBP', 'BRL', 'ARS', 'CLP', 'PEN', 'JPY', 'CNY', 'INR', 'KRW', 'CAD', 'AUD', 'CHF'
];

export const FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  COP: '🇨🇴',
  MXN: '🇲🇽',
  GBP: '🇬🇧',
  BRL: '🇧🇷',
  ARS: '🇦🇷',
  CLP: '🇨🇱',
  PEN: '🇵🇪',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
  INR: '🇮🇳',
  KRW: '🇰🇷',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  CHF: '🇨🇭'
};

// Auto-detection map
export const REGION_CURRENCY_MAP: Record<string, Currency> = {
  'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'ES': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 
  'CO': 'COP', 'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS', 'CL': 'CLP', 'PE': 'PEN', 
  'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'KR': 'KRW', 'CA': 'CAD', 'AU': 'AUD', 'CH': 'CHF'
};

// Smart Categorization Keywords
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'cat_transport': ['uber', 'taxi', 'bus', 'tren', 'metro', 'gasolina', 'fuel', 'peaje', 'lyft', 'cabify', 'did', 'zug', 'bahn', 'treno', 'densha'],
  'cat_food': ['mcdonalds', 'burger', 'pizza', 'sushi', 'restaurante', 'kfc', 'starbucks', 'cafe', 'coffee', 'lunch', 'dinner', 'taco', 'comida', 'almuerzo', 'cena', 'essen', 'cibo', 'tabemono'],
  'cat_shopping': ['amazon', 'walmart', 'target', 'zara', 'nike', 'adidas', 'ropa', 'clothes', 'shoes', 'tienda', 'market', 'supermercado', 'compra', 'einkaufen', 'spesa', 'kaimono'],
  'cat_entertainment': ['netflix', 'spotify', 'hbo', 'disney', 'cine', 'movie', 'cinema', 'juego', 'game', 'steam', 'playstation', 'xbox', 'kino', 'film', 'eiga'],
  'cat_utilities': ['luz', 'agua', 'gas', 'internet', 'wifi', 'telefono', 'celular', 'phone', 'bill', 'factura', 'electricidad', 'strom', 'wasser', 'luce', 'acqua', 'denki'],
  'cat_housing': ['alquiler', 'rent', 'hipoteca', 'mortgage', 'casa', 'home', 'mantenimiento', 'miete', 'affitto', 'yachin'],
  'cat_health': ['farmacia', 'pharmacy', 'doctor', 'medico', 'hospital', 'dentista', 'salud', 'gym', 'gimnasio', 'apotheke', 'farmacia', 'byoin'],
  'cat_salary': ['nomina', 'salary', 'sueldo', 'pago', 'payroll', 'gehalt', 'stipendio', 'kyuryo'],
};

export const ACCOUNT_TYPES: AccountType[] = ['cash', 'checking', 'savings', 'credit_card', 'investment'];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', key: 'cat_salary', icon: 'Briefcase', color: 'bg-green-100 text-green-600', type: 'income' },
  { id: '2', key: 'cat_freelance', icon: 'Laptop', color: 'bg-blue-100 text-blue-600', type: 'income' },
  { id: '3', key: 'cat_gift', icon: 'Gift', color: 'bg-purple-100 text-purple-600', type: 'income' },
  { id: '4', key: 'cat_investment', icon: 'TrendingUp', color: 'bg-emerald-100 text-emerald-600', type: 'income' },
  { id: '5', key: 'cat_food', icon: 'Utensils', color: 'bg-orange-100 text-orange-600', type: 'expense' },
  { id: '6', key: 'cat_transport', icon: 'Car', color: 'bg-blue-100 text-blue-600', type: 'expense' },
  { id: '7', key: 'cat_utilities', icon: 'Zap', color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  { id: '8', key: 'cat_entertainment', icon: 'Film', color: 'bg-pink-100 text-pink-600', type: 'expense' },
  { id: '9', key: 'cat_shopping', icon: 'ShoppingBag', color: 'bg-indigo-100 text-indigo-600', type: 'expense' },
  { id: '10', key: 'cat_health', icon: 'Heart', color: 'bg-red-100 text-red-600', type: 'expense' },
  { id: '11', key: 'cat_education', icon: 'BookOpen', color: 'bg-teal-100 text-teal-600', type: 'expense' },
  { id: '12', key: 'cat_housing', icon: 'Home', color: 'bg-stone-100 text-stone-600', type: 'expense' },
  { id: '13', key: 'cat_other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-600', type: 'expense' },
];

const BASE_ES = {
    greeting_morning: 'Buenos días,', greeting_afternoon: 'Buenas tardes,', greeting_evening: 'Buenas noches,',
    continue: 'Continuar', save: 'Guardar', delete: 'Eliminar', undo: 'Deshacer', deleted: 'Eliminado', cancel: 'Cancelar', add: 'Añadir',
    settings: 'Ajustes', history: 'Historial', search: 'Buscar...', calculator: 'Calculadora',
    tab_balance: 'Balance', tab_goals: 'Metas', tab_debts: 'Deudas', tab_budgets: 'Límites',
    total_balance: 'Balance Total', my_accounts: 'Cuentas', recent_activity: 'Movimientos', your_goals: 'Tus Objetivos',
    voice_listening: 'Escuchando...', voice_error: 'No te entendí bien', voice_hint: 'Di: "Gasto de 50 en Comida"',
    budget_title: 'Límites de Gastos', create_limit: 'Crear Límite', limit_amount: 'Monto Límite', add_budget: 'Nuevo Límite', edit_budget: 'Editar Límite', budget_limit: 'Límite Mensual', spent: 'Gastado', remaining: 'Disponible', no_budgets: 'Sin límites definidos.',
    account: 'Cuenta', goal: 'Meta', debt: 'Deuda', new_record: 'Nuevo Registro', add_account: 'Añadir Cuenta', add_goal: 'Añadir Meta', add_debt: 'Añadir Persona',
    edit_account: 'Editar Cuenta', edit_goal: 'Editar Meta', edit_debt: 'Editar Deuda',
    type_cash: 'Efectivo', type_checking: 'Corriente', type_savings: 'Ahorros', type_credit_card: 'Crédito', type_investment: 'Inversión',
    amount: 'Monto', concept: 'Concepto', description: 'Descripción', category: 'Categoría', type: 'Tipo', date: 'Fecha', target: 'Objetivo',
    current_saved: 'Ahorrado', initial_balance: 'Saldo Inicial', icon_label: 'Icono', goal_name: 'Nombre Meta', debt_person: 'Persona',
    owe_me: 'Me deben', i_owe: 'Debo', missing: 'Faltan', completed: 'Completado',
    income: 'Ingreso', expense: 'Gasto', transfer: 'Transferencia',
    active_rules: 'Reglas Activas', no_recurring: 'Sin transacciones recurrentes.', is_recurring: 'Hacer recurrente', recurring_suggestion: 'Sugerencia: Gasto mensual detectado.',
    frequency: 'Frecuencia', notify_me: 'Notificarme', freq_daily: 'Diario', freq_weekly: 'Semanal', freq_monthly: 'Mensual', freq_yearly: 'Anual',
    advanced_options: 'Opciones Avanzadas', enable_interest: 'Generar Intereses', interest_rate: 'Tasa (%)', compounding: 'Capitalización',
    int_daily: 'Diaria', int_weekly: 'Semanal', int_monthly: 'Mensual', int_yearly: 'Anual', start_date: 'Inicio', capital: 'Capital', interest: 'Interés',
    filters: 'Filtros', date_range: 'Fechas', from: 'Desde', to: 'Hasta', all_time: 'Todo', entity_type: 'Mostrar', all_entities: 'Todo', all_accounts: 'Solo Cuentas', all_goals: 'Solo Metas', all_debts: 'Solo Deudas', specific_item: 'Seleccionar...',
    balance_evolution: 'Evolución', distribution: 'Distribución', clear_dates: 'Limpiar', spending_pace: 'Ritmo', safe_pace: 'Saludable', warning_pace: 'Acelerado',
    notifications: 'Notificaciones', notify_low_balance: 'Balance Bajo', notify_debts: 'Deudas', notify_goals: 'Metas', threshold: 'Umbral',
    alert_low_balance: '¡Alerta de balance bajo!', alert_debt_due: 'Vencimiento cercano:', alert_goal_milestone: '¡Hito alcanzado!:', alert_recurring_processed: 'Procesado:',
    welcome_title: 'Bienvenido a Cuentas Claras', name_placeholder: '¿Cómo te llamas?', select_currency_title: 'Tu moneda principal',
    setup_first_title: 'Primer registro', setup_subtitle: 'Crea una cuenta, meta o deuda.', setup_skip: 'Omitir', create_finish: 'Finalizar',
    theme: 'Tema', theme_light: 'Claro', theme_dark: 'Oscuro', theme_system: 'Sistema', language: 'Idioma', currency: 'Divisa',
    feedback: 'Calificar App', reports: 'Reportes', data_management: 'Datos', export_data: 'Exportar', import_data: 'Importar', expenses_by_category: 'Por Categoría', view_list: 'Lista', view_chart: 'Gráficas', no_transactions: 'Sin movimientos',
    cat_salary: 'Salario', cat_freelance: 'Freelance', cat_gift: 'Regalo', cat_investment: 'Inversión', cat_food: 'Comida', cat_transport: 'Transporte', cat_utilities: 'Servicios', cat_entertainment: 'Entretenimiento', cat_shopping: 'Compras', cat_health: 'Salud', cat_education: 'Educación', cat_housing: 'Vivienda', cat_other: 'Otros'
};

const BASE_EN = {
    ...BASE_ES,
    greeting_morning: 'Good morning,', greeting_afternoon: 'Good afternoon,', greeting_evening: 'Good evening,',
    continue: 'Continue', save: 'Save', delete: 'Delete', undo: 'Undo', deleted: 'Deleted', cancel: 'Cancel', add: 'Add',
    settings: 'Settings', history: 'History', search: 'Search...', calculator: 'Calculator',
    tab_balance: 'Balance', tab_goals: 'Goals', tab_debts: 'Debts', tab_budgets: 'Budgets',
    total_balance: 'Total Balance', my_accounts: 'Accounts', recent_activity: 'Recent Activity', your_goals: 'Your Goals',
    voice_listening: 'Listening...', voice_error: 'Could not understand', voice_hint: 'Say: "Spent 50 on Food"',
    budget_title: 'Spending Limits', create_limit: 'Create Limit', limit_amount: 'Limit Amount', add_budget: 'New Budget', edit_budget: 'Edit Budget', budget_limit: 'Monthly Limit', spent: 'Spent', remaining: 'Left', no_budgets: 'No limits set.',
    account: 'Account', goal: 'Goal', debt: 'Debt', new_record: 'New Record', add_account: 'Add Account', add_goal: 'Add Goal', add_debt: 'Add Person',
    edit_account: 'Edit Account', edit_goal: 'Edit Goal', edit_debt: 'Edit Debt',
    type_cash: 'Cash', type_checking: 'Checking', type_savings: 'Savings', type_credit_card: 'Credit Card', type_investment: 'Investment',
    amount: 'Amount', concept: 'Title', description: 'Description', category: 'Category', type: 'Type', date: 'Date', target: 'Target',
    current_saved: 'Saved', initial_balance: 'Initial Balance', icon_label: 'Icon', goal_name: 'Goal Name', debt_person: 'Person',
    owe_me: 'Owed to me', i_owe: 'I owe', missing: 'Remaining', completed: 'Completed',
    income: 'Income', expense: 'Expense', transfer: 'Transfer',
    active_rules: 'Active Rules', no_recurring: 'No recurring items.', is_recurring: 'Make Recurring', recurring_suggestion: 'Suggestion: Monthly expense.',
    frequency: 'Frequency', notify_me: 'Notify me', freq_daily: 'Daily', freq_weekly: 'Weekly', freq_monthly: 'Monthly', freq_yearly: 'Yearly',
    advanced_options: 'Advanced', enable_interest: 'Enable Interest', interest_rate: 'Rate (%)', compounding: 'Compounding',
    int_daily: 'Daily', int_weekly: 'Weekly', int_monthly: 'Monthly', int_yearly: 'Yearly', start_date: 'Start Date', capital: 'Principal', interest: 'Interest',
    filters: 'Filters', date_range: 'Date Range', from: 'From', to: 'To', all_time: 'All Time', entity_type: 'Show', all_entities: 'All', all_accounts: 'Accounts', all_goals: 'Goals', all_debts: 'Debts', specific_item: 'Select...',
    balance_evolution: 'Evolution', distribution: 'Distribution', clear_dates: 'Clear', spending_pace: 'Pace', safe_pace: 'Safe', warning_pace: 'Fast',
    notifications: 'Notifications', notify_low_balance: 'Low Balance', notify_debts: 'Debts', notify_goals: 'Milestones', threshold: 'Threshold',
    alert_low_balance: 'Low balance!', alert_debt_due: 'Due soon:', alert_goal_milestone: 'Milestone:', alert_recurring_processed: 'Processed:',
    welcome_title: 'Welcome', name_placeholder: 'What should we call you?', select_currency_title: 'Select Currency',
    setup_first_title: 'First Record', setup_subtitle: 'Create an account, goal or debt.', setup_skip: 'Skip', create_finish: 'Finish',
    theme: 'Theme', theme_light: 'Light', theme_dark: 'Dark', theme_system: 'System', language: 'Language', currency: 'Currency',
    feedback: 'Rate App', reports: 'Reports', data_management: 'Data', export_data: 'Export', import_data: 'Import', expenses_by_category: 'By Category', view_list: 'List', view_chart: 'Charts', no_transactions: 'No transactions',
    cat_salary: 'Salary', cat_freelance: 'Freelance', cat_gift: 'Gift', cat_investment: 'Investment', cat_food: 'Food', cat_transport: 'Transport', cat_utilities: 'Utilities', cat_entertainment: 'Entertainment', cat_shopping: 'Shopping', cat_health: 'Health', cat_education: 'Education', cat_housing: 'Housing', cat_other: 'Other'
};

const BASE_FR = {
    ...BASE_EN,
    greeting_morning: 'Bonjour,', greeting_afternoon: 'Bon après-midi,', greeting_evening: 'Bonsoir,',
    continue: 'Continuer', save: 'Enregistrer', delete: 'Supprimer', undo: 'Annuler', deleted: 'Supprimé', cancel: 'Annuler', add: 'Ajouter',
    settings: 'Réglages', history: 'Historique', search: 'Rechercher...', calculator: 'Calculatrice',
    tab_balance: 'Solde', tab_goals: 'Objectifs', tab_debts: 'Dettes', tab_budgets: 'Budgets',
    total_balance: 'Solde Total', my_accounts: 'Comptes', recent_activity: 'Activité', your_goals: 'Vos Objectifs',
    voice_listening: 'Écoute...', voice_error: 'Pas compris', voice_hint: 'Dites: "50 pour Repas"',
    budget_title: 'Limites', create_limit: 'Créer Limite', limit_amount: 'Montant Limite', add_budget: 'Nouveau', edit_budget: 'Modifier', budget_limit: 'Limite', spent: 'Dépensé', remaining: 'Restant', no_budgets: 'Aucune limite.',
    account: 'Compte', goal: 'Objectif', debt: 'Dette', new_record: 'Nouveau', add_account: 'Ajouter Compte', add_goal: 'Ajouter Obj.', add_debt: 'Ajouter Dette',
    type_cash: 'Espèces', type_checking: 'Courant', type_savings: 'Épargne', type_credit_card: 'Crédit', type_investment: 'Investissement',
    amount: 'Montant', concept: 'Titre', category: 'Catégorie', type: 'Type', date: 'Date', target: 'Cible',
    current_saved: 'Épargné', initial_balance: 'Solde Initial', icon_label: 'Icône', goal_name: 'Nom', debt_person: 'Personne',
    owe_me: 'On me doit', i_owe: 'Je dois', missing: 'Restant', completed: 'Terminé',
    income: 'Revenu', expense: 'Dépense', transfer: 'Virement',
    active_rules: 'Règles', no_recurring: 'Rien récurrent.', is_recurring: 'Récurrent', recurring_suggestion: 'Suggestion: Mensuel.',
    frequency: 'Fréquence', notify_me: 'Notifier', freq_daily: 'Quotidien', freq_weekly: 'Hebdomadaire', freq_monthly: 'Mensuel', freq_yearly: 'Annuel',
    advanced_options: 'Avancé', enable_interest: 'Intérêts', interest_rate: 'Taux (%)', compounding: 'Capitalisation',
    int_daily: 'Journalier', int_weekly: 'Hebdomadaire', int_monthly: 'Mensuel', int_yearly: 'Annuel', start_date: 'Début', capital: 'Capital', interest: 'Intérêt',
    welcome_title: 'Bienvenue', name_placeholder: 'Votre nom ?', select_currency_title: 'Votre devise',
    setup_first_title: 'Premier ajout', setup_subtitle: 'Compte, objectif ou dette.', setup_skip: 'Passer', create_finish: 'Finir',
    theme: 'Thème', theme_light: 'Clair', theme_dark: 'Sombre', theme_system: 'Système', language: 'Langue', currency: 'Devise',
    cat_salary: 'Salaire', cat_freelance: 'Freelance', cat_gift: 'Cadeau', cat_investment: 'Investissement', cat_food: 'Nourriture', cat_transport: 'Transport', cat_utilities: 'Utilitaires', cat_entertainment: 'Loisirs', cat_shopping: 'Shopping', cat_health: 'Santé', cat_education: 'Éducation', cat_housing: 'Logement', cat_other: 'Autre'
};

const BASE_PT = {
    ...BASE_EN,
    greeting_morning: 'Bom dia,', greeting_afternoon: 'Boa tarde,', greeting_evening: 'Boa noite,',
    continue: 'Continuar', save: 'Salvar', delete: 'Excluir', undo: 'Desfazer', deleted: 'Excluído', cancel: 'Cancelar', add: 'Adicionar',
    settings: 'Ajustes', history: 'Histórico', search: 'Buscar...', calculator: 'Calculadora',
    tab_balance: 'Saldo', tab_goals: 'Metas', tab_debts: 'Dívidas', tab_budgets: 'Limites',
    total_balance: 'Saldo Total', my_accounts: 'Contas', recent_activity: 'Atividade', your_goals: 'Seus Objetivos',
    voice_listening: 'Ouvindo...', voice_error: 'Não entendi', voice_hint: 'Diga: "50 em Comida"',
    budget_title: 'Limites', create_limit: 'Criar Limite', limit_amount: 'Valor Limite', add_budget: 'Novo', edit_budget: 'Editar', budget_limit: 'Limite', spent: 'Gasto', remaining: 'Restante', no_budgets: 'Sem limites.',
    account: 'Conta', goal: 'Meta', debt: 'Dívida', new_record: 'Novo', add_account: 'Add Conta', add_goal: 'Add Meta', add_debt: 'Add Dívida',
    type_cash: 'Dinheiro', type_checking: 'Corrente', type_savings: 'Poupança', type_credit_card: 'Crédito', type_investment: 'Investimento',
    amount: 'Valor', concept: 'Título', category: 'Categoria', type: 'Tipo', date: 'Data', target: 'Alvo',
    current_saved: 'Guardado', initial_balance: 'Saldo Inicial', icon_label: 'Ícone', goal_name: 'Nome', debt_person: 'Pessoa',
    owe_me: 'Me devem', i_owe: 'Devo', missing: 'Faltam', completed: 'Concluído',
    income: 'Receita', expense: 'Despesa', transfer: 'Transferência',
    active_rules: 'Regras', no_recurring: 'Nada recorrente.', is_recurring: 'Recorrente', recurring_suggestion: 'Sugestão: Mensal.',
    frequency: 'Frequência', notify_me: 'Notificar', freq_daily: 'Diário', freq_weekly: 'Semanal', freq_monthly: 'Mensal', freq_yearly: 'Anual',
    advanced_options: 'Avançado', enable_interest: 'Juros', interest_rate: 'Taxa (%)', compounding: 'Capitalização',
    int_daily: 'Diária', int_weekly: 'Semanal', int_monthly: 'Mensal', int_yearly: 'Anual', start_date: 'Início', capital: 'Capital', interest: 'Juros',
    welcome_title: 'Bem-vindo', name_placeholder: 'Seu nome?', select_currency_title: 'Sua moeda',
    setup_first_title: 'Primeiro registro', setup_subtitle: 'Conta, meta ou dívida.', setup_skip: 'Pular', create_finish: 'Finalizar',
    theme: 'Tema', theme_light: 'Claro', theme_dark: 'Escuro', theme_system: 'Sistema', language: 'Idioma', currency: 'Moeda',
    cat_salary: 'Salário', cat_freelance: 'Freelance', cat_gift: 'Presente', cat_investment: 'Investimento', cat_food: 'Comida', cat_transport: 'Transporte', cat_utilities: 'Contas', cat_entertainment: 'Lazer', cat_shopping: 'Compras', cat_health: 'Saúde', cat_education: 'Educação', cat_housing: 'Moradia', cat_other: 'Outros'
};

const BASE_DE = {
    ...BASE_EN,
    greeting_morning: 'Guten Morgen,', greeting_afternoon: 'Guten Tag,', greeting_evening: 'Guten Abend,',
    continue: 'Weiter', save: 'Speichern', delete: 'Löschen', undo: 'Rückgängig', deleted: 'Gelöscht', cancel: 'Abbrechen', add: 'Hinzufügen',
    settings: 'Einstellungen', history: 'Verlauf', search: 'Suchen...', calculator: 'Taschenrechner',
    tab_balance: 'Bilanz', tab_goals: 'Ziele', tab_debts: 'Schulden', tab_budgets: 'Budgets',
    total_balance: 'Gesamtbilanz', my_accounts: 'Konten', recent_activity: 'Aktivität', your_goals: 'Deine Ziele',
    voice_listening: 'Zuhören...', voice_error: 'Nicht verstanden', voice_hint: 'Sag: "50 für Essen"',
    budget_title: 'Ausgabenlimits', create_limit: 'Limit erstellen', limit_amount: 'Limit-Betrag', add_budget: 'Neu', edit_budget: 'Bearbeiten', budget_limit: 'Monatslimit', spent: 'Ausgegeben', remaining: 'Übrig', no_budgets: 'Keine Limits.',
    account: 'Konto', goal: 'Ziel', debt: 'Schuld', new_record: 'Neu', add_account: 'Konto hinz.', add_goal: 'Ziel hinz.', add_debt: 'Schuld hinz.',
    type_cash: 'Bargeld', type_checking: 'Girokonto', type_savings: 'Sparbuch', type_credit_card: 'Kreditkarte', type_investment: 'Investition',
    amount: 'Betrag', concept: 'Titel', category: 'Kategorie', type: 'Typ', date: 'Datum', target: 'Ziel',
    current_saved: 'Gespart', initial_balance: 'Anfangssaldo', icon_label: 'Symbol', goal_name: 'Name', debt_person: 'Person',
    owe_me: 'Schulden mir', i_owe: 'Schulde ich', missing: 'Fehlen', completed: 'Fertig',
    income: 'Einkommen', expense: 'Ausgabe', transfer: 'Übertrag',
    active_rules: 'Regeln', no_recurring: 'Keine.', is_recurring: 'Wiederkehrend', recurring_suggestion: 'Vorschlag: Monatlich.',
    frequency: 'Frequenz', notify_me: 'Benachrichtigen', freq_daily: 'Täglich', freq_weekly: 'Wöchentlich', freq_monthly: 'Monatlich', freq_yearly: 'Jährlich',
    advanced_options: 'Erweitert', enable_interest: 'Zinsen', interest_rate: 'Satz (%)', compounding: 'Zinseszins',
    int_daily: 'Täglich', int_weekly: 'Wöchentlich', int_monthly: 'Monatlich', int_yearly: 'Jährlich', start_date: 'Start', capital: 'Kapital', interest: 'Zins',
    welcome_title: 'Willkommen', name_placeholder: 'Dein Name?', select_currency_title: 'Währung wählen',
    setup_first_title: 'Erster Eintrag', setup_subtitle: 'Konto, Ziel oder Schuld.', setup_skip: 'Überspringen', create_finish: 'Fertig',
    theme: 'Thema', theme_light: 'Hell', theme_dark: 'Dunkel', theme_system: 'System', language: 'Sprache', currency: 'Währung',
    cat_salary: 'Gehalt', cat_freelance: 'Freelance', cat_gift: 'Geschenk', cat_investment: 'Investition', cat_food: 'Essen', cat_transport: 'Transport', cat_utilities: 'Rechnungen', cat_entertainment: 'Unterhaltung', cat_shopping: 'Einkauf', cat_health: 'Gesundheit', cat_education: 'Bildung', cat_housing: 'Wohnen', cat_other: 'Andere'
};

const BASE_IT = {
    ...BASE_EN,
    greeting_morning: 'Buongiorno,', greeting_afternoon: 'Buon pomeriggio,', greeting_evening: 'Buonasera,',
    continue: 'Continua', save: 'Salva', delete: 'Elimina', undo: 'Annulla', deleted: 'Eliminato', cancel: 'Annulla', add: 'Aggiungi',
    settings: 'Impostazioni', history: 'Cronologia', search: 'Cerca...', calculator: 'Calcolatrice',
    tab_balance: 'Bilancio', tab_goals: 'Obiettivi', tab_debts: 'Debiti', tab_budgets: 'Budget',
    total_balance: 'Saldo Totale', my_accounts: 'Conti', recent_activity: 'Attività', your_goals: 'Tuoi Obiettivi',
    voice_listening: 'Ascolto...', voice_error: 'Non capito', voice_hint: 'Dì: "50 per Cibo"',
    budget_title: 'Limiti Spesa', create_limit: 'Crea Limite', limit_amount: 'Importo Limite', add_budget: 'Nuovo', edit_budget: 'Modifica', budget_limit: 'Limite Mensile', spent: 'Speso', remaining: 'Rimanente', no_budgets: 'Nessun limite.',
    account: 'Conto', goal: 'Obiettivo', debt: 'Debito', new_record: 'Nuovo', add_account: 'Agg. Conto', add_goal: 'Agg. Obiet.', add_debt: 'Agg. Debito',
    type_cash: 'Contanti', type_checking: 'Corrente', type_savings: 'Risparmio', type_credit_card: 'Carta Credito', type_investment: 'Investimento',
    amount: 'Importo', concept: 'Titolo', category: 'Categoria', type: 'Tipo', date: 'Data', target: 'Target',
    current_saved: 'Salvato', initial_balance: 'Saldo Iniziale', icon_label: 'Icona', goal_name: 'Nome', debt_person: 'Persona',
    owe_me: 'Mi devono', i_owe: 'Devo', missing: 'Mancano', completed: 'Completato',
    income: 'Entrata', expense: 'Uscita', transfer: 'Trasferimento',
    active_rules: 'Regole', no_recurring: 'Nessuna.', is_recurring: 'Ricorrente', recurring_suggestion: 'Sugg: Mensile.',
    frequency: 'Frequenza', notify_me: 'Notifica', freq_daily: 'Quotidiano', freq_weekly: 'Settimanale', freq_monthly: 'Mensile', freq_yearly: 'Annuale',
    advanced_options: 'Avanzate', enable_interest: 'Interessi', interest_rate: 'Tasso (%)', compounding: 'Capitalizzazione',
    int_daily: 'Giornaliera', int_weekly: 'Settimanale', int_monthly: 'Mensile', int_yearly: 'Annuale', start_date: 'Inizio', capital: 'Capitale', interest: 'Interesse',
    welcome_title: 'Benvenuto', name_placeholder: 'Il tuo nome?', select_currency_title: 'Scegli Valuta',
    setup_first_title: 'Primo record', setup_subtitle: 'Crea conto, obiettivo o debito.', setup_skip: 'Salta', create_finish: 'Finito',
    theme: 'Tema', theme_light: 'Chiaro', theme_dark: 'Scuro', theme_system: 'Sistema', language: 'Lingua', currency: 'Valuta',
    cat_salary: 'Stipendio', cat_freelance: 'Freelance', cat_gift: 'Regalo', cat_investment: 'Investimento', cat_food: 'Cibo', cat_transport: 'Trasporti', cat_utilities: 'Utenze', cat_entertainment: 'Intrattenimento', cat_shopping: 'Shopping', cat_health: 'Salute', cat_education: 'Istruzione', cat_housing: 'Casa', cat_other: 'Altro'
};

const BASE_JA = {
    ...BASE_EN,
    greeting_morning: 'おはようございます、', greeting_afternoon: 'こんにちは、', greeting_evening: 'こんばんは、',
    continue: '次へ', save: '保存', delete: '削除', undo: '元に戻す', deleted: '削除しました', cancel: 'キャンセル', add: '追加',
    settings: '設定', history: '履歴', search: '検索...', calculator: '電卓',
    tab_balance: '残高', tab_goals: '目標', tab_debts: '借金', tab_budgets: '予算',
    total_balance: '総残高', my_accounts: '口座', recent_activity: '最近の活動', your_goals: 'あなたの目標',
    voice_listening: '聞いています...', voice_error: '理解できませんでした', voice_hint: '「食費に50」と言ってください',
    budget_title: '支出制限', create_limit: '制限を作成', limit_amount: '制限額', add_budget: '追加', edit_budget: '編集', budget_limit: '月間制限', spent: '使用済み', remaining: '残り', no_budgets: '制限なし',
    account: '口座', goal: '目標', debt: '借金', new_record: '新規', add_account: '口座追加', add_goal: '目標追加', add_debt: '借金追加',
    type_cash: '現金', type_checking: '当座', type_savings: '貯蓄', type_credit_card: 'クレカ', type_investment: '投資',
    amount: '金額', concept: 'タイトル', category: 'カテゴリ', type: '種類', date: '日付', target: '目標額',
    current_saved: '現在額', initial_balance: '初期残高', icon_label: 'アイコン', goal_name: '目標名', debt_person: '相手',
    owe_me: '貸し', i_owe: '借り', missing: '不足', completed: '完了',
    income: '収入', expense: '支出', transfer: '振替',
    active_rules: '定期ルール', no_recurring: 'なし', is_recurring: '定期にする', recurring_suggestion: '提案: 毎月のようです',
    frequency: '頻度', notify_me: '通知する', freq_daily: '毎日', freq_weekly: '毎週', freq_monthly: '毎月', freq_yearly: '毎年',
    advanced_options: '詳細', enable_interest: '利息', interest_rate: '利率(%)', compounding: '複利',
    int_daily: '日次', int_weekly: '週次', int_monthly: '月次', int_yearly: '年次', start_date: '開始日', capital: '元本', interest: '利息',
    welcome_title: 'ようこそ', name_placeholder: 'お名前は？', select_currency_title: '通貨を選択',
    setup_first_title: '最初の記録', setup_subtitle: '口座、目標、借金を作成', setup_skip: 'スキップ', create_finish: '完了',
    theme: 'テーマ', theme_light: 'ライト', theme_dark: 'ダーク', theme_system: 'システム', language: '言語', currency: '通貨',
    cat_salary: '給料', cat_freelance: 'フリーランス', cat_gift: '贈り物', cat_investment: '投資', cat_food: '食費', cat_transport: '交通費', cat_utilities: '光熱費', cat_entertainment: '娯楽', cat_shopping: '買い物', cat_health: '健康', cat_education: '教育', cat_housing: '住居', cat_other: 'その他'
};

export const TRANSLATIONS = {
  es: BASE_ES,
  en: BASE_EN,
  fr: BASE_FR,
  pt: BASE_PT,
  de: BASE_DE,
  it: BASE_IT,
  ja: BASE_JA
};
