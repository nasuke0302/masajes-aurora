CREATE TABLE bookings_cash(
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, reference TEXT NOT NULL UNIQUE,
 service_date TEXT NOT NULL, start_at INTEGER NOT NULL, end_at INTEGER NOT NULL CHECK(end_at>start_at),
 quantity INTEGER NOT NULL CHECK(quantity>0), amount_cents INTEGER NOT NULL CHECK(amount_cents>0), lines_json TEXT NOT NULL,
 name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, notes TEXT NOT NULL,
 method TEXT NOT NULL CHECK(method='cash'), status TEXT NOT NULL CHECK(status IN('confirmed','completed','cancelled')),
 payment_status TEXT NOT NULL CHECK(payment_status IN('pending','paid')),
 created_at INTEGER NOT NULL, paid_at INTEGER,
 manage_url TEXT NOT NULL, origin TEXT NOT NULL, idempotency_hash TEXT UNIQUE
);
INSERT INTO bookings_cash(id,token_hash,reference,service_date,start_at,end_at,quantity,amount_cents,lines_json,name,email,phone,address,notes,method,status,payment_status,created_at,paid_at,manage_url,origin,idempotency_hash) SELECT id,token_hash,reference,service_date,start_at,end_at,quantity,amount_cents,lines_json,name,email,phone,address,notes,method,status,payment_status,created_at,paid_at,manage_url,origin,idempotency_hash FROM bookings;
DROP TRIGGER booking_guard_insert;
DROP TRIGGER booking_guard_update;
DROP TRIGGER block_guard;
DROP TABLE bookings;
ALTER TABLE bookings_cash RENAME TO bookings;
CREATE INDEX booking_calendar ON bookings(service_date,status,start_at);
CREATE TRIGGER booking_guard_insert BEFORE INSERT ON bookings WHEN NEW.status IN('confirmed','completed') BEGIN
 SELECT RAISE(ABORT,'LEAD_TIME') WHERE NEW.start_at<unixepoch()+10800;
 SELECT RAISE(ABORT,'OVERLAP') WHERE EXISTS(SELECT 1 FROM bookings WHERE status IN('confirmed','completed') AND NEW.start_at<end_at+1800 AND NEW.end_at+1800>start_at);
 SELECT RAISE(ABORT,'BLOCKED') WHERE EXISTS(SELECT 1 FROM blocks WHERE NEW.start_at<end_at AND NEW.end_at>start_at);
END;
CREATE TRIGGER booking_guard_update BEFORE UPDATE OF status,start_at,end_at,quantity ON bookings WHEN NEW.status IN('confirmed','completed') BEGIN
 SELECT RAISE(ABORT,'OVERLAP') WHERE EXISTS(SELECT 1 FROM bookings WHERE id<>NEW.id AND status IN('confirmed','completed') AND NEW.start_at<end_at+1800 AND NEW.end_at+1800>start_at);
 SELECT RAISE(ABORT,'BLOCKED') WHERE EXISTS(SELECT 1 FROM blocks WHERE NEW.start_at<end_at AND NEW.end_at>start_at);
END;
CREATE TRIGGER block_guard BEFORE INSERT ON blocks BEGIN
 SELECT RAISE(ABORT,'BOOKING_IN_BLOCK') WHERE EXISTS(SELECT 1 FROM bookings WHERE status IN('confirmed') AND NEW.start_at<end_at AND NEW.end_at>start_at);
END;


DROP TABLE stripe_events;
