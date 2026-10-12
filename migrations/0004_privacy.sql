PRAGMA foreign_keys = ON;
CREATE TABLE booking_legal (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
 terms_version TEXT,
 accepted_at INTEGER,
 source TEXT NOT NULL DEFAULT 'legacy' CHECK(source IN('web','admin','legacy')),
 adults_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(adults_confirmed IN(0,1)),
 early_service_requested INTEGER NOT NULL DEFAULT 0 CHECK(early_service_requested IN(0,1)),
 withdrawal_acknowledged INTEGER NOT NULL DEFAULT 0 CHECK(withdrawal_acknowledged IN(0,1)),
 early_requested_at INTEGER,
 withdrawal_acknowledged_at INTEGER,
 early_source TEXT CHECK(early_source IN('web','admin')),
 retention_hold INTEGER NOT NULL DEFAULT 0 CHECK(retention_hold IN(0,1))
);
ALTER TABLE rate_limits ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;
