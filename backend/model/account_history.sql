SELECT *
FROM (
	SELECT act_to.id, 'payment' AS action, act_to.to_account_id AS account_id, NULL as security_id, act_to.date, actm_to.value + actm_to.fee + actm_to.tax AS value
	FROM account_transaction AS act_to
	LEFT JOIN money AS actm_to ON actm_to.id = act_to.to_money_id
    WHERE act_to.type = 'payment'
    
    UNION
    
	SELECT act_from.id, 'payout' AS action, act_from.from_account_id AS account_id, NULL as security_id, act_from.date, -1 * (actm_from.value + actm_from.fee + actm_from.tax) AS value
	FROM account_transaction AS act_from
	LEFT JOIN money AS actm_from ON actm_from.id = act_from.from_money_id
    WHERE act_from.type = 'payout'
    
	UNION
    
	SELECT act_to.id, 'transfer_to' AS action, act_to.to_account_id AS account_id, set_buy.security_id, act_to.date, actm_to.value + actm_to.fee + actm_to.tax AS value
	FROM account_transaction AS act_to
	LEFT JOIN money AS actm_to ON actm_to.id = act_to.to_money_id
    LEFT JOIN security_transaction AS set_buy ON set_buy.account_transaction_id = act_to.id
    WHERE act_to.type = 'transfer' AND act_to.to_account_id IS NOT NULL
    
    UNION
    
	SELECT act_from.id, 'transfer_from' AS action, act_from.from_account_id AS account_id, set_buy.security_id, act_from.date, -1 * (actm_from.value + actm_from.fee + actm_from.tax) AS value
	FROM account_transaction AS act_from
	LEFT JOIN money AS actm_from ON actm_from.id = act_from.from_money_id
    LEFT JOIN security_transaction AS set_buy ON set_buy.account_transaction_id = act_from.id
    WHERE act_from.type = 'transfer' AND act_from.from_account_id IS NOT NULL
    
	UNION
    
	SELECT set_sell.id, 'sell' AS action, set_sell.account_id, set_sell.security_id, set_sell.date, actm_sell.value AS value
	FROM security_transaction AS set_sell
	LEFT JOIN money AS actm_sell ON actm_sell.id = set_sell.money_id
    WHERE set_sell.type = 'sell'
    
    UNION
    
	SELECT set_buy.id, 'buy' AS action, set_buy.account_id, set_buy.security_id, set_buy.date, -1 * (actm_buy.value + actm_buy.fee + actm_buy.tax) AS value
	FROM security_transaction AS set_buy
	LEFT JOIN money AS actm_buy ON actm_buy.id = set_buy.money_id
    WHERE set_buy.type = 'buy'
    
	UNION
    
	SELECT set_div.id, 'dividend' AS action, set_div.account_id, set_div.security_id, set_div.date, actm_div.value AS value
	FROM security_transaction AS set_div
	LEFT JOIN money AS actm_div ON actm_div.id = set_div.money_id
	WHERE set_div.type = 'dividend'
    
	UNION
    
	SELECT act.id, 'interest' AS action, act.to_account_id, NULL AS security_id, act.date, actm.value AS value
	FROM account_transaction AS act
	LEFT JOIN money AS actm ON actm.id = act.to_money_id
	WHERE act.type = 'interest'
    
	UNION
    
	SELECT act.id, 'fee' AS action, act.from_account_id, NULL AS security_id, act.date, -actm.value AS value
	FROM account_transaction AS act
	LEFT JOIN money AS actm ON actm.id = act.from_money_id
	WHERE act.type = 'fee'
) AS all_transactions
where account_id = 8
order by date asc