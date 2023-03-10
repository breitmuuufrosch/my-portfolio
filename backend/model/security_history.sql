SELECT
	all_transactions.*,
    s.symbol,
    s.name_short
FROM (
	SELECT std.user_id, std.id, std.type, std.date, std.account_id, std.account_transaction_id, std.security_id, currency, std.price, -std.amount AS amount, std.value - std.fee - std.tax AS total, std.value, std.fee, std.tax
    FROM security_transaction_detailed AS std
    WHERE std.type IN ('sell','vesting')
    
    UNION
    
	SELECT std.user_id, std.id, std.type, std.date, std.account_id, std.account_transaction_id, std.security_id, currency, std.price, std.amount AS amount, std.value - std.fee - std.tax AS total, std.value, std.fee, std.tax
    FROM security_transaction_detailed AS std
    WHERE std.type IN ('dividend')
    
    UNION
    
	SELECT std.user_id, std.id, std.type, std.date, std.account_id, std.account_transaction_id, std.security_id, currency, std.price, std.amount, std.value + std.fee + std.tax AS total, std.value, std.fee, std.tax
    FROM security_transaction_detailed AS std
    WHERE std.type IN ('buy', 'posting')
) AS all_transactions
LEFT JOIN security AS s ON s.id = all_transactions.security_id
ORDER BY all_transactions.date