// routes/chat.js
const express = require('express');
const router = express.Router();
const { answerQuestion } = require('../controllers/openaiAgent');


// Minimal schema description — you should build this dynamically from DB metadata
const SAMPLE_SCHEMA = `
Tables:
- Customers(id INT PK, name VARCHAR(100), email VARCHAR(200), country VARCHAR(50))
- Orders(id INT PK, customerId INT FK -> Customers.id, total DECIMAL(10,2), createdAt DATETIME)
`;


// router.post('/', async (req, res) => {
//     try {
//         console.log(req.body)
//         const { question } = req.body;
//         console.log(question)
//         if (!question) return res.status(400).json({ error: 'question required' });


//         const result = await answerQuestion(question, SAMPLE_SCHEMA);
//         res.json(result);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: String(err) });
//     }
// });

router.post('/', async (req, res) => {
    try {
      console.log(req.body);
      const { question } = req.body;
      console.log(question);
  
      if (!question) {
        return res.status(400).json({ error: 'question required' });
      }
  
      const result = await answerQuestion(question, SAMPLE_SCHEMA);
  
      // If rows are present, build user-friendly text
      if (result.rows && result.rows.length > 0) {
        let text = `Here are the results for your question:\n\n`;
        result.rows.forEach((row, idx) => {
          // Try to format generically
          const rowText = Object.entries(row)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          text += `${idx + 1}. ${rowText}\n`;
        });
  
        console.log(text)
        return res.json({
          answer: text,
          rows: result.rows, // keep raw data too in case frontend needs it
        });
      }
  
      // If no rows
      return res.json({
        answer: "I couldn’t find any results for that question.",
        rows: [],
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });


module.exports = router;