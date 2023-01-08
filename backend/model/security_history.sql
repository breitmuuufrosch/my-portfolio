SELECT
	all_transactions.*,
    s.symbol,
    s.name_short
FROM (
	SELECT std.id, std.type, std.date, std.account_id, std.security_id, currency, std.price, -1 * std.amount AS amount, std.value - std.fee - std.tax AS total, std.value, std.fee, std.tax
    FROM security_transaction_detailed AS std
    WHERE std.type = 'sell'
    
    UNION
    
	SELECT std.id, std.type, std.date, std.account_id, std.security_id, currency, std.price, std.amount, std.value + std.fee + std.tax AS total, std.value, std.fee, std.tax
    FROM security_transaction_detailed AS std
    WHERE std.type IN ('buy', 'posting', 'dividend')
) AS all_transactions
LEFT JOIN security AS s ON s.id = all_transactions.security_id
ORDER BY all_transactions.date