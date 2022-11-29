SELECT *
FROM (
	SELECT 'transfer_to' AS action, act_to.to_account_id AS account_id, act_to.date, actm_to.value + actm_to.fee + actm_to.tax AS value
	FROM account_transaction AS act_to
	LEFT JOIN money AS actm_to ON actm_to.id = act_to.to_money_id
    
    UNION
    
	SELECT 'transfer_from' AS action, act_from.from_account_id AS account_id, act_from.date, -1 * (actm_from.value + actm_from.fee + actm_from.tax) AS value
	FROM account_transaction AS act_from
	LEFT JOIN money AS actm_from ON actm_from.id = act_from.to_money_id
    
	UNION
    
	SELECT 'sell' AS action, set_sell.account_id, set_sell.date, actm_sell.value + actm_sell.fee + actm_sell.tax AS value
	FROM security_transaction AS set_sell
	LEFT JOIN money AS actm_sell ON actm_sell.id = set_sell.money_id
    WHERE set_sell.type = 'sell'
    
    UNION
    
	SELECT 'buy' AS action, set_buy.account_id, set_buy.date, -1 * (actm_buy.value + actm_buy.fee + actm_buy.tax) AS value
	FROM security_transaction AS set_buy
	LEFT JOIN money AS actm_buy ON actm_buy.id = set_buy.money_id
    WHERE set_buy.type = 'buy'
) AS all_transactions