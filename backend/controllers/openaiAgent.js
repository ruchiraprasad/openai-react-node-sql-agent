const axios = require('axios');
const { executeQuery } = require('../db/sqlServer');
const OPENAI_URL = 'https://api.openai.com/v1/responses'; // generic REST endpoint - adapt to SDK/version

// const openAiCall = async (prompt) => {
//     const res = await axios.post(
//         OPENAI_URL,
//         {
//             model: 'gpt-4o-mini',
//             input: prompt,
//             max_tokens: 800
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         }
//     );
//     // response shape may vary by SDK/version
//     return res.data;
// };

async function openAiCall(systemPrompt, userPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
  
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
  
    return response.data;
  }
  

  const makeSqlFromQuestion = async (question, schemaDescription) => {
    const systemPrompt = `You are a SQL generator for SQL Server. Use the schema:
  Tables:
  - Customers(id INT PK, name VARCHAR(100), email VARCHAR(200), country VARCHAR(50))
  - Orders(id INT PK, customerId INT FK -> Customers.id, total DECIMAL(10,2), createdAt DATETIME)
  
  Rules:
  1) Always output ONLY valid JSON with two fields: sql (string) and params (object).
  2) The SQL must be a single SELECT statement (no DDL, no INSERT/UPDATE/DELETE).
  3) Use parameter placeholders like @paramName and put values in params.
  4) Keep queries simple and safe.
  5) If the question cannot be answered using SQL against the schema, return {"sql": null, "params": {}}.
  
  Return the JSON only.`;
  
    const userPrompt = `User question: ${question}`;
  
    const aiResp = await openAiCall(systemPrompt, userPrompt);
  
    // ✅ Extract output from proper format
    const text = aiResp.choices?.[0]?.message?.content || JSON.stringify(aiResp);
  
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error('Failed to parse JSON from model output: ' + text);
    }
  
    if (!parsed.sql) return { sql: null, params: {} };
  
    const lower = parsed.sql.trim().toLowerCase();
    if (!lower.startsWith('select')) throw new Error('Only SELECT queries are allowed');
  
    return parsed;
  };
  

const answerQuestion = async (question, schemaDescription) => {
    const { sql, params } = await makeSqlFromQuestion(question, schemaDescription);
    if (!sql) return { error: 'Could not produce SQL for the question' };
    console.log(sql);

    // Execute
    const rows = await executeQuery(sql, params || {});
    return { rows };
};


module.exports = { answerQuestion };