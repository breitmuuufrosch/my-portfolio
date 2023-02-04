SELECT
	a.user_id,
	at.id,
	at.type,
    at.date,
    st.security_id,
	at.from_account_id,
    m_from.currency AS from_currency,
    m_from.value AS from_value,
    m_from.fee AS from_fee,
    m_from.tax AS from_tax,
    at.to_account_id,
    m_to.currency AS to_currency,
    m_to.value AS to_value,
    m_to.fee AS to_fee,
    m_to.tax AS to_tax
FROM account_transaction AS at
LEFT JOIN account AS a ON a.id = CASE WHEN at.to_account_id IS NOT NULL THEN at.to_account_id ELSE at.from_account_id END
LEFT JOIN money AS m_to ON m_to.id = at.to_money_id
LEFT JOIN money AS m_from ON m_from.id = at.from_money_id
LEFT JOIN security_transaction AS st ON st.account_transaction_id = at.id