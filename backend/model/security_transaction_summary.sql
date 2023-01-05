SELECT *
FROM (
	SELECT 'sell' AS type, set_sell.security_id, set_sell.date, -1 * set_sell.amount AS amount, -1 * actm_sell.value AS value, -1 * actm_sell.fee AS fee, -1 * actm_sell.tax AS tax
	FROM security_transaction AS set_sell
	LEFT JOIN money AS actm_sell ON actm_sell.id = set_sell.money_id
    WHERE set_sell.type = 'sell'
    
    UNION
    
	SELECT 'buy' AS type, set_buy.security_id, set_buy.date, set_buy.amount, actm_buy.value, actm_buy.fee, actm_buy.tax
	FROM security_transaction AS set_buy
	LEFT JOIN money AS actm_buy ON actm_buy.id = set_buy.money_id
    WHERE set_buy.type = 'buy'
    
    UNION
    
	SELECT 'posting' AS type, set_buy.security_id, set_buy.date, set_buy.amount, actm_buy.value, actm_buy.fee, actm_buy.tax
	FROM security_transaction AS set_buy
	LEFT JOIN money AS actm_buy ON actm_buy.id = set_buy.money_id
    WHERE set_buy.type = 'posting'
    
    UNION
    
	SELECT 'dividend' AS type, set_buy.security_id, set_buy.date, set_buy.amount, actm_buy.value, actm_buy.fee, actm_buy.tax
	FROM security_transaction AS set_buy
	LEFT JOIN money AS actm_buy ON actm_buy.id = set_buy.money_id
    WHERE set_buy.type = 'dividend'
) AS all_transactions