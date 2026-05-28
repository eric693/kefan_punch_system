#!/usr/bin/env python3
"""
重置資料庫腳本：刪除所有資料表並重新初始化。
使用方式：DATABASE_URL=... python reset_db.py
"""
import os
import sys

_raw = os.environ.get('DATABASE_URL', '')
if not _raw:
    print("[ERROR] DATABASE_URL 未設定")
    sys.exit(1)

DATABASE_URL = _raw.replace('postgres://', 'postgresql://', 1) if _raw.startswith('postgres://') else _raw

import psycopg

TABLES = [
    'payslip_sends',
    'punch_audit_log',
    'asset_loans',
    'assets',
    'travel_expenses',
    'travel_requests',
    'leave_balances',
    'leave_requests',
    'leave_types',
    'salary_items',
    'overtime_requests',
    'shift_assignments',
    'shift_types',
    'punch_requests',
    'schedule_requests',
    'schedule_config',
    'line_punch_config',
    'punch_config',
    'punch_locations',
    'punch_records',
    'shift_staffing_requirements',
    'stores',
    'admin_accounts',
    'punch_staff',
]

confirm = input(f"確定要清空並重建所有資料表嗎？這將刪除所有資料！(輸入 'yes' 確認): ")
if confirm.strip() != 'yes':
    print("已取消。")
    sys.exit(0)

with psycopg.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:
        for table in TABLES:
            try:
                cur.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                print(f"[OK] 已刪除 {table}")
            except Exception as e:
                print(f"[WARN] 刪除 {table} 失敗: {e}")
    conn.commit()

print("\n所有資料表已清除，正在重建...")

# 匯入並執行 init_db
os.environ['DATABASE_URL'] = DATABASE_URL
import importlib, app as _app
_app.init_db()

print("\n資料庫重置完成！")
