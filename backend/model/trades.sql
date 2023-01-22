SELECT
	s.id,
	s.name_long AS name,
    s.symbol,
    s.quote_type,
    s.currency,
    sh.value,
    SUM(sh.fee) AS entry_fee,
    SUM(sh.tax) AS entry_tax,
    CASE WHEN SUM(sh.amount) = 0 THEN SUM(CASE WHEN sh.amount > 0 THEN sh.value + sh.fee + sh.tax ELSE 0 END) ELSE SUM(sh.value + sh.fee + sh.tax) END AS entry_price_all,
    SUM(sh.value + sh.fee + sh.tax) as entry_price_all2,
    SUM(sh.amount) AS amount,
    sph_hi.close AS last_price,
    sph_hi.date AS last_date,
    CASE WHEN SUM(sh.amount) = 0 THEN SUM(CASE WHEN sh.amount < 0 THEN sh.value ELSE 0 END) ELSE CAST(SUM(sh.amount) * sph_hi.close AS DECIMAL(19, 4)) END AS exit_price,
    CAST(SUM(sh.amount) * sph_hi.close AS DECIMAL(19, 4)) AS exit_price2
FROM security_history AS sh
LEFT JOIN security AS s ON sh.security_id = s.id
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
WHERE sh.type IN ('buy', 'sell', 'posting')
GROUP BY s.id, s.name_long, s.symbol, s.quote_type, s.currency
ORDER BY s.symbol
