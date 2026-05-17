const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mediation.db');

let db = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      real_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role_id INTEGER NOT NULL,
      avatar_color TEXT DEFAULT '#c9a84c',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS case_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      type_id INTEGER NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'mediating', 'agreed', 'terminated', 'closed')),
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      mediator_id INTEGER,
      created_by INTEGER,
      assigned_at DATETIME,
      accepted_at DATETIME,
      closed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES case_types(id),
      FOREIGN KEY (mediator_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS case_finance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL UNIQUE,
      loan_contract_number TEXT,
      loan_amount REAL,
      loan_balance REAL,
      loan_interest_rate REAL,
      loan_penalty_rate REAL,
      loan_start_date DATE,
      loan_due_date DATE,
      loan_actual_end_date DATE,
      loan_term_months INTEGER,
      loan_purpose TEXT,
      repayment_method TEXT CHECK(repayment_method IN ('equal_installment', 'equal_principal', 'interest_first', 'bullet', 'other')),
      collateral_type TEXT CHECK(collateral_type IN ('real_estate', 'vehicle', 'deposit', 'guarantee', 'pledge', 'none', 'other')),
      collateral_description TEXT,
      collateral_value REAL,
      guarantor_name TEXT,
      guarantor_id_number TEXT,
      guarantor_phone TEXT,
      overdue_days INTEGER DEFAULT 0,
      overdue_principal REAL DEFAULT 0,
      overdue_interest REAL DEFAULT 0,
      total_claim_amount REAL DEFAULT 0,
      interest_calculated_to DATE,
      litigation_stage TEXT CHECK(litigation_stage IN ('pre_litigation', 'litigation', 'execution', 'post_execution', 'none')),
      collection_status TEXT CHECK(collection_status IN ('not_started', 'in_progress', 'suspended', 'completed', 'failed')),
      institution_name TEXT,
      institution_contact TEXT,
      institution_contact_phone TEXT,
      risk_level TEXT CHECK(risk_level IN ('normal', 'concern', 'substandard', 'doubtful', 'loss')),
      write_off_status TEXT CHECK(write_off_status IN ('none', 'partial', 'full')),
      settlement_amount REAL,
      settlement_date DATE,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      stage_type TEXT NOT NULL CHECK(stage_type IN ('collection', 'negotiation', 'mediation', 'litigation', 'execution', 'settlement', 'other')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
      start_date DATE,
      end_date DATE,
      responsible_person TEXT,
      description TEXT,
      result TEXT,
      amount_involved REAL,
      documents TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      party_type TEXT NOT NULL CHECK(party_type IN ('plaintiff', 'defendant', 'witness', 'other')),
      name TEXT NOT NULL,
      id_number TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mediation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      mediator_id INTEGER NOT NULL,
      record_type TEXT NOT NULL CHECK(record_type IN ('note', 'audio', 'video', 'agreement')),
      content TEXT,
      file_path TEXT,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (mediator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS archive_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_number TEXT NOT NULL UNIQUE,
      category_id INTEGER NOT NULL,
      case_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived', 'destroyed', 'transferred')),
      confidentiality_level TEXT DEFAULT 'internal' CHECK(confidentiality_level IN ('public', 'internal', 'confidential', 'secret')),
      retention_period TEXT DEFAULT 'long-term' CHECK(retention_period IN ('permanent', 'long-term', 'short-term')),
      archive_date DATE,
      tags TEXT,
      storage_location TEXT,
      total_pages INTEGER DEFAULT 0,
      responsible_person TEXT,
      review_status TEXT DEFAULT 'pending' CHECK(review_status IN ('pending', 'approved', 'rejected')),
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES archive_categories(id),
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS archive_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_label TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (archive_id) REFERENCES archives(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS document_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      content_template TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      usage_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      case_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'reviewing', 'approved', 'issued')),
      generated_by INTEGER,
      reviewed_by INTEGER,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (template_id) REFERENCES document_templates(id),
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (generated_by) REFERENCES users(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS video_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      room_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      scheduled_at DATETIME,
      started_at DATETIME,
      ended_at DATETIME,
      duration INTEGER,
      recording_path TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS video_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER,
      party_id INTEGER,
      display_name TEXT NOT NULL,
      join_at DATETIME,
      leave_at DATETIME,
      FOREIGN KEY (session_id) REFERENCES video_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (party_id) REFERENCES case_parties(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('mediator', 'party', 'system')),
      sender_id INTEGER,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'file', 'system')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES video_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('case', 'document', 'video', 'system', 'training', 'urgent')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS party_push_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      party_id INTEGER NOT NULL,
      push_type TEXT NOT NULL CHECK(push_type IN ('acceptance', 'schedule', 'mediation_notice', 'agreement', 'termination', 'document', 'hearing', 'reminder', 'other')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      channel TEXT DEFAULT 'sms' CHECK(channel IN ('sms', 'email', 'in_app', 'mail')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
      document_id INTEGER,
      sent_by INTEGER,
      sent_at DATETIME,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (party_id) REFERENCES case_parties(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES document_records(id),
      FOREIGN KEY (sent_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS call_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caller_number TEXT NOT NULL,
      caller_name TEXT,
      callee_id INTEGER,
      call_type TEXT NOT NULL CHECK(call_type IN ('inbound', 'outbound')),
      category TEXT CHECK(category IN ('consultation', 'appointment', 'query', 'complaint', 'mediation', 'followup', 'other')),
      status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'connected', 'completed', 'missed', 'abandoned', 'transferred')),
      case_id INTEGER,
      queue_position INTEGER,
      wait_duration INTEGER,
      talk_duration INTEGER,
      recording_path TEXT,
      satisfaction INTEGER CHECK(satisfaction BETWEEN 1 AND 5),
      transfer_to TEXT,
      note TEXT,
      started_at DATETIME,
      answered_at DATETIME,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (callee_id) REFERENCES users(id),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS call_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      provider_type TEXT NOT NULL CHECK(provider_type IN ('tencent', 'aliyun', 'huawei', 'custom')),
      display_name TEXT NOT NULL,
      description TEXT,
      api_endpoint TEXT,
      app_id TEXT,
      secret_key TEXT,
      instance_id TEXT,
      sip_number TEXT,
      config_json TEXT,
      status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'testing')),
      balance REAL DEFAULT 0,
      call_package TEXT,
      max_concurrent INTEGER DEFAULT 10,
      features TEXT,
      last_sync_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS call_provider_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      request_data TEXT,
      response_data TEXT,
      status TEXT DEFAULT 'success' CHECK(status IN ('success', 'failed', 'timeout')),
      error_message TEXT,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES call_providers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS push_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      provider_type TEXT NOT NULL CHECK(provider_type IN ('tencent_sms', 'aliyun_sms', 'huawei_sms', 'tencent_email', 'aliyun_email', 'custom_sms', 'custom_email')),
      display_name TEXT NOT NULL,
      description TEXT,
      api_endpoint TEXT,
      app_id TEXT,
      secret_key TEXT,
      sign_name TEXT,
      template_code TEXT,
      region TEXT,
      config_json TEXT,
      status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'testing')),
      balance REAL DEFAULT 0,
      package_info TEXT,
      daily_limit INTEGER DEFAULT 1000,
      monthly_sent INTEGER DEFAULT 0,
      last_sync_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS push_provider_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      push_record_id INTEGER,
      action TEXT NOT NULL,
      request_data TEXT,
      response_data TEXT,
      status TEXT DEFAULT 'success' CHECK(status IN ('success', 'failed', 'timeout')),
      error_message TEXT,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES push_providers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      value_type TEXT DEFAULT 'string' CHECK(value_type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, key)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id INTEGER,
      detail TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dashboard_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_date DATE NOT NULL,
      total_cases INTEGER DEFAULT 0,
      new_cases INTEGER DEFAULT 0,
      closed_cases INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 0,
      avg_duration REAL DEFAULT 0,
      total_calls INTEGER DEFAULT 0,
      answered_calls INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(stat_date)
    );

    CREATE TABLE IF NOT EXISTS case_timelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      operator_id INTEGER NOT NULL,
      operator_name TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (operator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      case_id INTEGER,
      mediator_id INTEGER NOT NULL,
      schedule_type TEXT NOT NULL CHECK(schedule_type IN ('mediation', 'consultation', 'meeting', 'training', 'other')),
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      location TEXT,
      description TEXT,
      reminder INTEGER DEFAULT 15,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (mediator_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      party_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      attitude_score INTEGER CHECK(attitude_score BETWEEN 1 AND 5),
      efficiency_score INTEGER CHECK(efficiency_score BETWEEN 1 AND 5),
      fairness_score INTEGER CHECK(fairness_score BETWEEN 1 AND 5),
      comment TEXT,
      is_anonymous INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY (party_id) REFERENCES case_parties(id)
    );
  `);

  return db;
}

module.exports = { getDb, initDatabase };
