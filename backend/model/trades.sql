SELECT
	s.name_long,
    s.symbol,
    s.quote_type,
    s.currency,
    SUM(m.value) AS entryPrice,
    SUM(m.value + m.fee + m.tax) as entryPriceAll,
    SUM(st.amount) as number,
    CAST(SUM(st.amount) * sh_hi.close AS DECIMAL(19, 4)) AS exitPrice
FROM security_transaction AS st
LEFT JOIN security AS s ON st.security_id = s.id
LEFT JOIN money AS m ON st.money_id = m.id
LEFT JOIN (
	SELECT sph.*
	FROM security_price_history AS sph
	JOIN (
		SELECT sph_inner.security_id, MAX(date) as max_date
		FROM security_price_history as sph_inner
        -- WHERE date = '2022-01-03'
		GROUP BY security_id
	) AS sph_sorted ON sph_sorted.security_id = sph.security_id and sph_sorted.max_date = sph.date
) as sph_hi on sph_hi.security_id = s.id
WHERE st.type IN ('buy', 'sell', 'posting')
GROUP BY s.name_long, s.symbol, s.quote_type, s.currency