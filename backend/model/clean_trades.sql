DELETE FROM security_transaction WHERE id > 0;
ALTER TABLE security_transaction AUTO_INCREMENT = 1;

DELETE FROM account_transaction WHERE id > 0;
ALTER TABLE account_transaction AUTO_INCREMENT = 1;

DELETE FROM money WHERE id > 0;
ALTER TABLE money AUTO_INCREMENT = 1;
