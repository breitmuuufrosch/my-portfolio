SELECT 
	all_transactions.*,
    s.symbol,
    s.name_short
FROM (
	SELECT atd.id, atd.type, atd.date, atd.to_account_id AS account_id, NULL as security_id, atd.to_currency AS currency, atd.to_value AS total, atd.to_value AS value, atd.to_fee AS fee, atd.to_tax AS tax
	FROM account_transaction_detailed AS atd
    WHERE atd.type IN ('payment', 'interest')
    
    UNION
    
	SELECT atd.id, atd.type, atd.date, atd.from_account_id AS account_id, NULL as security_id, atd.from_currency AS currency, -1 * (atd.from_value + atd.from_fee + atd.from_tax) AS total, atd.from_value AS value, atd.from_fee AS fee, atd.from_tax AS tax
	FROM account_transaction_detailed AS atd
    WHERE atd.type IN ('payout', 'fee')
    
	UNION
    
	SELECT atd.id, 'transfer_to' AS type, atd.date, atd.to_account_id AS account_id, atd.security_id, atd.to_currency AS currency, atd.to_value AS total, atd.to_value AS value, atd.to_fee AS fee, atd.to_tax AS tax
	FROM account_transaction_detailed AS atd
    WHERE atd.type = 'transfer' AND atd.to_account_id IS NOT NULL
    
    UNION
    
	SELECT atd.id, 'transfer_from' AS type, atd.date, atd.from_account_id AS account_id, atd.security_id, atd.from_currency AS currency, -1 * (atd.from_value + atd.from_fee + atd.from_tax) AS total, atd.from_value AS value, atd.from_fee AS fee, atd.from_tax AS tax
	FROM account_transaction_detailed AS atd
	WHERE atd.type = 'transfer' AND atd.from_account_id IS NOT NULL
    
	UNION
    
	SELECT std.id, std.type, std.date, std.account_id, std.security_id, std.currency, std.value - std.fee - std.tax AS total, std.value AS value, std.fee AS fee, std.tax AS tax
	FROM security_transaction_detailed AS std
	WHERE std.type IN ('sell', 'dividend')
    
    UNION
    
	SELECT std.id, std.type, std.date, std.account_id, std.security_id, std.currency, -1 * (std.value + std.fee + std.tax) AS total, std.value AS value, std.fee AS fee, std.tax AS tax
	FROM security_transaction_detailed AS std
    WHERE std.type IN ('buy')
) AS all_transactions
LEFT JOIN security AS s ON s.id = all_transactions.security_id
-- WHERE account_id = 4
ORDER BY date, FIELD(type, 'payment', 'transfer_to', 'dividend',  'sell', 'payout', 'transfer_from', 'buy')