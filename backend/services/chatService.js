const { generateCompletion } = require('./llm/openrouterProvider');

const SYSTEM_PROMPT = `You are an AI Financial Mentor. Use the user's Financial Compass profile only as supporting context. Always answer the user's latest question directly. If relevant, personalize the explanation using their goals, risk tolerance, and experience. Never ignore the user's question or repeat the same roadmap unless explicitly requested.

Rules for responses:
1. Always answer the user's actual question FIRST and directly.
2. Do NOT start responses with generic profile recaps like "Since you are a 24-year-old student with ₹12,000 savings...". Only mention user profile details if it directly improves the explanation.
3. Keep explanations clear, beginner-friendly, and structured using clean Markdown (headings, bullet points, bold text).
4. Do not recommend individual stock tickers. Recommend general asset classes (e.g. Index Funds, SIPs, ELSS, Gold).`;

/**
 * Formats user prompt, history, and profile into OpenAI messages format.
 * Structure:
 * 1. System Prompt
 * 2. Context (User Profile, Learning Progress, Goals)
 * 3. Conversation History
 * 4. Latest User Message (Final & Highest-Priority Input)
 *
 * @param {string} message 
 * @param {Array} conversationHistory 
 * @param {Object} profile 
 * @param {string} levelTopic 
 * @returns {Array<{role: string, content: string}>}
 */
function buildMessagesPayload(message, conversationHistory = [], profile = null, levelTopic = null) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  // 2. Context: User Profile, Learning Progress, Goals, Risk Profile
  if (profile && typeof profile === 'object') {
    let contextStr = `User Profile Supporting Context (Use ONLY for relevant personalization; DO NOT recap unless explicitly asked):\n`;
    if (profile.occupation) contextStr += `- Occupation: ${profile.occupation}\n`;
    if (profile.age) contextStr += `- Age: ${profile.age}\n`;
    if (profile.monthlyIncome) contextStr += `- Monthly Income: ₹${profile.monthlyIncome}\n`;
    if (profile.monthlySavings) contextStr += `- Monthly Savings: ₹${profile.monthlySavings}\n`;
    if (profile.monthlyInvestable) contextStr += `- Monthly Investable Budget: ₹${profile.monthlyInvestable}\n`;
    if (profile.goals && Array.isArray(profile.goals) && profile.goals.length > 0) {
      contextStr += `- Goals: ${profile.goals.join(', ')}\n`;
    }
    if (profile.riskTolerance) contextStr += `- Risk Profile: ${profile.riskTolerance}\n`;
    if (levelTopic) contextStr += `- Active Lesson: ${levelTopic}\n`;

    messages.push({ role: 'system', content: contextStr });
  }

  // 3. Conversation History
  if (Array.isArray(conversationHistory)) {
    const recentHistory = conversationHistory.slice(-10);
    for (const turn of recentHistory) {
      if (turn && turn.content) {
        const role = (turn.role === 'assistant' || turn.role === 'model') ? 'assistant' : 'user';
        messages.push({
          role: role,
          content: String(turn.content).trim()
        });
      }
    }
  }

  // 4. Latest User Message (Highest Priority)
  messages.push({
    role: 'user',
    content: String(message).trim()
  });

  return messages;
}

function getFallbackAdvice(message, profile = null) {
  const query = (message || '').toLowerCase();

  if (query.includes('invest') || query.includes('sip') || query.includes('mutual fund') || query.includes('stock')) {
    return `### 💡 Smart Investment Roadmap

1. **Build Your Foundation First**: Ensure you have an **Emergency Fund** covering 3 to 6 months of living expenses in a liquid savings account or liquid fund.
2. **Low-Cost Index Funds & SIPs**: For long-term wealth accumulation, systematic investment plans (SIPs) in broad-market index funds provide consistent compound growth with low expense ratios.
3. **Asset Allocation Strategy**:
   - **Equity (60-70%)**: Index Funds & Flexi-cap funds for long-term growth.
   - **Debt (20-30%)**: PPF, Fixed Deposits, or Debt Instruments for stability.
   - **Gold / Liquid (10%)**: Sovereign Gold Bonds or Liquid Funds as a hedge against inflation.
4. **Consistency**: Automate monthly investments right after payday to maintain financial discipline.`;
  }

  if (query.includes('budget') || query.includes('save') || query.includes('expense') || query.includes('money')) {
    return `### 📊 Master Your Monthly Budget

The **50/30/20 Budgeting Rule** is a proven framework:

* **50% Needs**: Essential living costs (Rent, Utilities, Groceries, Minimum Debt Payments).
* **30% Wants**: Lifestyle choices (Dining out, Entertainment, Subscriptions, Shopping).
* **20% Savings & Investments**: Wealth building (Emergency Fund, SIPs, Debt Repayment).

**Actionable Tip**: Track your transactions regularly in FinNova to identify unnecessary subscription costs and optimize your monthly cash flow.`;
  }

  if (query.includes('tax') || query.includes('80c') || query.includes('save tax')) {
    return `### 🛡️ Tax Optimization Guide

Here are key strategies to minimize your tax liability legally:

1. **Section 80C Deductions (Up to ₹1.5 Lakhs)**:
   - **ELSS Mutual Funds**: Lowest lock-in period (3 years) with equity growth potential.
   - **PPF / EPF**: Government-backed tax-free returns.
   - **NPS (Section 80CCD 1B)**: Additional tax deduction of up to ₹50,000.
2. **Health Insurance (Section 80D)**: Claim up to ₹25,000 for self/family and additional deductions for parents.
3. **HRA Claims**: Submit valid rent receipts to maximize tax savings.`;
  }

  return `### 🎯 Financial Guidance & Action Steps

To build long-term financial security and achieve your financial goals:

1. **Track Cash Flow**: Monitor income vs. expenses to keep your monthly savings rate above **20%**.
2. **Protect Against Risk**: Maintain comprehensive health insurance and term life cover before aggressive investing.
3. **Automate Wealth Building**: Set up auto-debit SIPs for your primary financial goals.
4. **Review & Rebalance**: Reassess your portfolio every 6 months to maintain your target risk profile.

Feel free to ask specific questions about **investing**, **budgeting**, **tax saving**, or **debt management**!`;
}

function createStreamFromText(text) {
  const encoder = new TextEncoder();
  const chunks = text.match(/.{1,15}/g) || [text];
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < chunks.length) {
        const payload = JSON.stringify({
          choices: [{ delta: { content: chunks[index] } }]
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        index++;
        await new Promise(r => setTimeout(r, 25));
      } else {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    }
  });
}

/**
 * Generates financial advice via OpenRouter API (Non-streaming).
 * @param {string} message - User query.
 * @param {Array} conversationHistory - Past conversation turns.
 * @param {Object} profile - User profile context.
 * @param {string} levelTopic - Active lesson topic.
 * @returns {Promise<string>} AI text reply.
 */
async function generateFinancialAdvice(message, conversationHistory = [], profile = null, levelTopic = null) {
  try {
    const messages = buildMessagesPayload(message, conversationHistory, profile, levelTopic);
    return await generateCompletion(messages, { stream: false });
  } catch (err) {
    console.warn("[ChatService] OpenRouter call failed, providing smart fallback response:", err.message);
    return getFallbackAdvice(message, profile);
  }
}

/**
 * Streams financial advice via OpenRouter API (SSE streaming).
 * @param {string} message - User query.
 * @param {Array} conversationHistory - Past conversation turns.
 * @param {Object} profile - User profile context.
 * @param {string} levelTopic - Active lesson topic.
 * @returns {Promise<ReadableStream>} Response body stream.
 */
async function streamFinancialAdvice(message, conversationHistory = [], profile = null, levelTopic = null) {
  try {
    const messages = buildMessagesPayload(message, conversationHistory, profile, levelTopic);
    return await generateCompletion(messages, { stream: true });
  } catch (err) {
    console.warn("[ChatService] OpenRouter stream failed, using smart fallback stream:", err.message);
    const fallbackText = getFallbackAdvice(message, profile);
    return createStreamFromText(fallbackText);
  }
}

module.exports = {
  generateFinancialAdvice,
  streamFinancialAdvice,
  SYSTEM_PROMPT
};
