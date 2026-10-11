PRAGMA foreign_keys = ON;
CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK(id=1), accepting INTEGER NOT NULL DEFAULT 0 CHECK(accepting IN(0,1)));
INSERT INTO settings(id) VALUES(1);
CREATE TABLE products(id TEXT PRIMARY KEY CHECK(id IN('massage40','massage60')), name TEXT NOT NULL, minutes INTEGER NOT NULL, price_cents INTEGER CHECK(price_cents>0));
INSERT INTO products VALUES('massage40','Masaje de 40 minutos',40,NULL),('massage60','Masaje de 60 minutos',60,NULL);
CREATE TABLE hours(weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6), open_minute INTEGER NOT NULL CHECK(open_minute BETWEEN 0 AND 1430), close_minute INTEGER NOT NULL CHECK(close_minute BETWEEN 10 AND 1440 AND close_minute>open_minute), PRIMARY KEY(weekday,open_minute));
INSERT INTO hours VALUES(0,540,1260),(1,540,1260),(2,540,1260),(3,540,1260),(4,540,1260),(5,540,1260),(6,540,1260);
CREATE TABLE blocks(id TEXT PRIMARY KEY, start_at INTEGER NOT NULL, end_at INTEGER NOT NULL CHECK(end_at>start_at), reason TEXT NOT NULL DEFAULT '');
CREATE TABLE bookings(
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, reference TEXT NOT NULL UNIQUE,
 service_date TEXT NOT NULL, start_at INTEGER NOT NULL, end_at INTEGER NOT NULL CHECK(end_at>start_at),
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 3), amount_cents INTEGER NOT NULL CHECK(amount_cents>0), lines_json TEXT NOT NULL,
 name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, notes TEXT NOT NULL,
 method TEXT NOT NULL CHECK(method IN('cash','online')), status TEXT NOT NULL CHECK(status IN('held','confirmed','completed','cancelled','expired')),
 payment_status TEXT NOT NULL CHECK(payment_status IN('pending','paid','refunded','partial_refund')),
 created_at INTEGER NOT NULL, hold_until INTEGER, checkout_expires_at INTEGER, session_id TEXT UNIQUE, payment_intent TEXT, paid_at INTEGER,
 manage_url TEXT NOT NULL, checkout_url TEXT, origin TEXT NOT NULL, idempotency_hash TEXT UNIQUE
);
CREATE INDEX booking_calendar ON bookings(service_date,status,start_at);
CREATE INDEX booking_holds ON bookings(status,hold_until);
CREATE TABLE outbox(id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, sent_at INTEGER, provider_id TEXT, lease_until INTEGER, attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at INTEGER NOT NULL);
CREATE INDEX outbox_pending ON outbox(sent_at,lease_until);
CREATE TABLE stripe_events(id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
CREATE TABLE admin_links(token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, consumed_at INTEGER);
CREATE TABLE admin_sessions(token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE rate_limits(key TEXT PRIMARY KEY, bucket INTEGER NOT NULL, count INTEGER NOT NULL);
CREATE TRIGGER booking_guard_insert BEFORE INSERT ON bookings WHEN NEW.status IN('held','confirmed','completed') BEGIN
 SELECT CASE WHEN NEW.start_at<unixepoch()+10800 THEN RAISE(ABORT,'LEAD_TIME') END;
 SELECT CASE WHEN (SELECT COALESCE(SUM(quantity),0) FROM bookings WHERE service_date=NEW.service_date AND status IN('held','confirmed','completed'))+NEW.quantity>3 THEN RAISE(ABORT,'CAPACITY') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM bookings WHERE status IN('held','confirmed','completed') AND NEW.start_at<end_at+1800 AND NEW.end_at+1800>start_at) THEN RAISE(ABORT,'OVERLAP') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM blocks WHERE NEW.start_at<end_at AND NEW.end_at>start_at) THEN RAISE(ABORT,'BLOCKED') END;
END;
CREATE TRIGGER booking_guard_update BEFORE UPDATE OF status,start_at,end_at,quantity ON bookings WHEN NEW.status IN('held','confirmed','completed') BEGIN
 SELECT CASE WHEN (SELECT COALESCE(SUM(quantity),0) FROM bookings WHERE id<>NEW.id AND service_date=NEW.service_date AND status IN('held','confirmed','completed'))+NEW.quantity>3 THEN RAISE(ABORT,'CAPACITY') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM bookings WHERE id<>NEW.id AND status IN('held','confirmed','completed') AND NEW.start_at<end_at+1800 AND NEW.end_at+1800>start_at) THEN RAISE(ABORT,'OVERLAP') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM blocks WHERE NEW.start_at<end_at AND NEW.end_at>start_at) THEN RAISE(ABORT,'BLOCKED') END;
END;
CREATE TRIGGER block_guard BEFORE INSERT ON blocks BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM bookings WHERE status IN('held','confirmed') AND NEW.start_at<end_at AND NEW.end_at>start_at) THEN RAISE(ABORT,'BOOKING_IN_BLOCK') END;
END;

