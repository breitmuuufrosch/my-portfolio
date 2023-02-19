WITH dates AS (
	SELECT *
	FROM (
		SELECT *
		FROM (
			SELECT adddate('1970-01-01', t4 * 10000 + t3 * 1000 + t2 * 100 + t1 * 10 + t0) AS gen_date
			FROM
				(SELECT 0 AS t0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t0,
				(SELECT 0 AS t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
				(SELECT 0 AS t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
				(SELECT 0 AS t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
				(SELECT 0 AS t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4
		) AS v
		WHERE v.gen_date BETWEEN '2022-01-01' AND '2022-12-31'
		ORDER BY v.gen_date ASC
	) gen_dates
),
security_values AS (
	SELECT sph.security_id, s_details.currency, sph.date, SUM(security_summary.amount) AS amount, SUM(security_summary.amount) * sph.close AS value
	FROM security_price AS sph
	LEFT JOIN security AS s_details ON s_details.id = sph.security_id
	INNER JOIN security_transaction_summary AS security_summary ON security_summary.security_id = sph.security_id AND security_summary.date <= sph.date
	-- WHERE sph.security_id IN (120)
	GROUP BY sph.security_id, s_details.currency, sph.date
	-- ORDER BY sph.date
)
SELECT dates.gen_date AS date, security_values.currency, security_values.amount, security_values.value
FROM dates
LEFT JOIN security_values ON security_values.date = (SELECT MAX(d.date) FROM security_values AS d WHERE d.date <= gen_date)
ORDER BY gen_date