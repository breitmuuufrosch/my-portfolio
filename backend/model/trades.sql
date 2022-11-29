SELECT s.name_long, s.symbol, s.quote_type, s.currency, SUM(m.value) AS entryPrice, SUM(m.value + m.fee + m.tax) as entryPriceAll, SUM(st.amount) as number, CAST(SUM(st.amount) * sh_hi.close AS DECIMAL(19, 4)) AS exitPrice
FROM security_transaction AS st
LEFT JOIN security AS s ON st.security_id = s.id
LEFT JOIN money AS m ON st.money_id = m.id
LEFT JOIN (
	SELECT sh.*
	FROM security_history AS sh
	JOIN (
		SELECT sh_inner.security_id, MAX(date) as max_date
		FROM security_history as sh_inner
        -- WHERE date = '2022-01-03'
		GROUP BY security_id
	) AS sh_sorted ON sh_sorted.security_id = sh.security_id and sh_sorted.max_date = sh.date
) as sh_hi on sh_hi.security_id = s.id
GROUP BY s.name_long, s.symbol, s.quote_type, s.currency