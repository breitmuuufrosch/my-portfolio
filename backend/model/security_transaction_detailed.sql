SELECT
	a.user_id,
	st.id,
	st.type,
    st.date,
	st.security_id,
    s.symbol,
    s.name_short,
    st.account_id,
    st.account_transaction_id,
    st.price,
    st.amount,
    m.currency,
    m.value,
    m.fee,
    m.tax
FROM security_transaction AS st
LEFT JOIN account AS a ON a.id = st.account_id
LEFT JOIN security AS s ON s.id = st.security_id
LEFT JOIN money AS m ON m.id = st.money_id