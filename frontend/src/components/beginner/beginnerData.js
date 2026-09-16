/**
 * Financial Compass Curriculum Data, Quizzes, Badges, and Calculations
 */

export const INITIAL_QUESTIONNAIRE = {
  age: 24,
  occupation: 'Salaried Employee',
  monthlyIncome: 45000,
  monthlySavings: 12000,
  monthlyExpenses: 25000,
  priorInvestment: 'Never',
  goals: ['Emergency Fund', 'Wealth Creation'],
  riskTolerance: 'Low', // Very Low, Low, Medium, High
  monthlyInvestable: 3000,
  targetTimeline: '5 Years' // 1 Year, 3 Years, 5 Years, 10+ Years
};

export const BADGES_LIST = [
  {
    id: 'first_lesson',
    title: 'First Lesson',
    description: 'Completed your first financial lesson',
    icon: '🎓',
    unlockedAtLevel: 1
  },
  {
    id: 'budget_builder',
    title: 'Budget Builder',
    description: 'Mastered income & expense budgeting principles',
    icon: '📊',
    unlockedAtLevel: 2
  },
  {
    id: 'savings_starter',
    title: 'Savings Starter',
    description: 'Understood savings capacity and discipline',
    icon: '💡',
    unlockedAtLevel: 3
  },
  {
    id: 'emergency_ready',
    title: 'Emergency Fund Ready',
    description: 'Learned how to build a 6-month liquid safety reserve',
    icon: '🛡️',
    unlockedAtLevel: 3
  },
  {
    id: 'sip_explorer',
    title: 'SIP Explorer',
    description: 'Discovered automated Systematic Investment Plans',
    icon: '📈',
    unlockedAtLevel: 7
  },
  {
    id: 'finance_explorer',
    title: 'Finance Explorer',
    description: 'Understood stock market basics & asset allocation',
    icon: '🧭',
    unlockedAtLevel: 9
  },
  {
    id: 'wealth_builder',
    title: 'Wealth Builder',
    description: 'Completed all 10 Financial Compass Levels',
    icon: '🏆',
    unlockedAtLevel: 10
  }
];

export const ROADMAP_LEVELS = [
  {
    id: 1,
    title: 'Money Basics',
    subtitle: 'Understanding cash flow, assets, and how money works',
    readTime: '3 min',
    difficulty: 'Beginner',
    icon: '🪙',
    explanation: `Money is a tool for exchange and storing value. Understanding income, expenses, assets (things that put money in your pocket), and liabilities (things that take money out) is the foundation of financial independence.`,
    example: `If you buy a car that costs you fuel and maintenance every month, it's a liability. If you use that money to buy a rental property or index fund that pays you dividends, it's an asset.`,
    commonMistakes: [
      'Thinking income equals wealth (wealth is what you keep, not what you spend).',
      'Failing to track where daily small expenses go.',
      'Treating credit cards as free extra money.'
    ],
    quiz: {
      question: 'What is the definition of a financial Asset?',
      options: [
        'Anything you buy on credit',
        'Something that generates value or puts money in your pocket over time',
        'Your monthly apartment rent',
        'Expensive clothes you wear once'
      ],
      correctAnswer: 1,
      explanation: 'Correct! An asset puts money in your pocket or appreciates in value over time.'
    }
  },
  {
    id: 2,
    title: 'Budgeting',
    subtitle: 'Mastering the 50/30/20 rule to control your cash flow',
    readTime: '3 min',
    difficulty: 'Beginner',
    icon: '💳',
    explanation: `Budgeting isn't about restricting yourself; it's about giving every rupee a clear purpose. The gold standard is the 50/30/20 Rule: 50% for Needs (rent, food), 30% for Wants (entertainment), and 20% for Savings & Investments.`,
    example: `Imagine you earn ₹40,000/month. You put ₹20,000 into rent & groceries (Needs), ₹12,000 into outings & tech (Wants), and the remaining ₹8,000 goes straight to your investments (Savings).`,
    commonMistakes: [
      'Saving whatever is left at the end of the month instead of saving FIRST.',
      'Confusing Wants with Needs (e.g. latest flagship phone vs functional phone).'
    ],
    quiz: {
      question: 'According to the 50/30/20 rule, how much of your net income should go toward Savings & Investments?',
      options: ['10%', '20%', '30%', '50%'],
      correctAnswer: 1,
      explanation: 'Correct! 20% of your income should be allocated to savings and investments right after you get paid.'
    }
  },
  {
    id: 3,
    title: 'Emergency Fund',
    subtitle: 'Building a 3 to 6-month safety buffer for unforeseen events',
    readTime: '4 min',
    difficulty: 'Beginner',
    icon: '🛡️',
    explanation: `An Emergency Fund is cash set aside to cover unexpected life events like medical emergencies, job transitions, or urgent home repairs. It should cover 3 to 6 months of essential living expenses in a safe, liquid account.`,
    example: `If your essential monthly expenses are ₹20,000, your target Emergency Fund is ₹60,000 to ₹1,20,000. If an unexpected bill occurs, you pay from this fund without selling investments or taking high-interest loans.`,
    commonMistakes: [
      'Investing emergency money in risky stocks or locked real estate.',
      'Using emergency savings for vacations or shopping sales.'
    ],
    quiz: {
      question: 'How many months of essential expenses should an Emergency Fund cover?',
      options: ['1 Month', '3 to 6 Months', '12 to 24 Months', 'None, invest everything'],
      correctAnswer: 1,
      explanation: 'Correct! 3 to 6 months of living expenses provides a safe financial cushion.'
    }
  },
  {
    id: 4,
    title: 'Inflation',
    subtitle: 'Why idle cash in a cupboard loses purchasing power',
    readTime: '3 min',
    difficulty: 'Beginner',
    icon: '📉',
    explanation: `Inflation is the rate at which prices of goods and services rise over time. If inflation is 6% per year, something that costs ₹100 today will cost ₹106 next year. Cash sitting idle loses purchasing power every year!`,
    example: `Ten years ago, a cinema ticket cost ₹100. Today, the exact same ticket costs ₹250. If you kept ₹100 in a safe for 10 years, you could no longer afford the movie ticket!`,
    commonMistakes: [
      'Keeping large balances in zero-interest accounts.',
      'Ignoring inflation when planning long-term goals 10-20 years away.'
    ],
    quiz: {
      question: 'What happens to cash kept idle in a safe during 6% annual inflation?',
      options: [
        'It grows by 6%',
        'It stays exactly the same value',
        'Its purchasing power decreases by ~6% every year',
        'It doubles automatically'
      ],
      correctAnswer: 2,
      explanation: 'Spot on! Inflation erodes purchasing power over time.'
    }
  },
  {
    id: 5,
    title: 'Saving vs Investing',
    subtitle: 'Preserving capital vs compounding wealth over time',
    readTime: '4 min',
    difficulty: 'Beginner',
    icon: '⚖️',
    explanation: `Saving is putting money aside in low-risk, liquid accounts for short-term needs. Investing is putting money into wealth-generating assets (like mutual funds or equities) to beat inflation and compound over the long term.`,
    example: `Saving ₹5,000/month in a 3% account yields ₹61,000 in 1 year. Investing ₹5,000/month in a diversified fund yielding 12% annual return can grow to over ₹11 Lakhs in 10 years!`,
    commonMistakes: [
      'Using savings tools for 10-year long-term goals.',
      'Using volatile investments for money needed next month.'
    ],
    quiz: {
      question: 'Which option is best for a financial goal 10 years in the future?',
      options: ['Cash under mattress', 'Standard Savings Account', 'Diversified Long-Term Investment', 'Checking Account'],
      correctAnswer: 2,
      explanation: 'Correct! Diversified investments help beat inflation for long-term goals.'
    }
  },
  {
    id: 6,
    title: 'Mutual Funds',
    subtitle: 'Pooling money managed by professional fund managers',
    readTime: '5 min',
    difficulty: 'Beginner',
    icon: '📊',
    explanation: `A Mutual Fund pools money from thousands of small investors. A professional Fund Manager uses this combined pool to buy a diversified basket of stocks, bonds, or other securities.`,
    example: `Imagine 5 friends each put ₹100 into one box. Now an expert uses the ₹500 to buy pieces of 20 different companies. If those companies grow, everyone benefits according to their share.`,
    commonMistakes: [
      'Choosing funds based solely on past 1-year returns.',
      'Panicking and withdrawing money during short-term market dips.'
    ],
    quiz: {
      question: 'Who manages the investments inside a mutual fund?',
      options: ['The investor personally', 'A professional Fund Manager', 'The government', 'Algorithms only'],
      correctAnswer: 1,
      explanation: 'Exactly! Professional fund managers analyze market data and manage the portfolio on behalf of investors.'
    }
  },
  {
    id: 7,
    title: 'SIP (Systematic Investment Plan)',
    subtitle: 'Automating monthly investments & rupee cost averaging',
    readTime: '4 min',
    difficulty: 'Beginner',
    icon: '🔄',
    explanation: `SIP allows you to invest a fixed amount into a mutual fund automatically every month. It instills discipline, removes market timing stress, and benefits from Rupee Cost Averaging.`,
    example: `You set an automatic ₹2,000 SIP on the 5th of every month. When markets are high, your ₹2,000 buys fewer units. When markets dip, your ₹2,000 buys more units! Over time, your purchase cost balances smoothly.`,
    commonMistakes: [
      'Stopping SIPs when markets fall (dips are the best time to accumulate units!).',
      'Waiting for the "perfect market time" to start.'
    ],
    quiz: {
      question: 'What is the main advantage of Rupee Cost Averaging in SIP?',
      options: [
        'Guarantees zero risk',
        'Buys more units when prices drop and fewer when prices rise',
        'Eliminates all taxes',
        'Doubles your income monthly'
      ],
      correctAnswer: 1,
      explanation: 'Correct! SIP automatically buys more units during market dips, lowering average cost.'
    }
  },
  {
    id: 8,
    title: 'Stock Market Basics',
    subtitle: 'Understanding fractional ownership in growing businesses',
    readTime: '5 min',
    difficulty: 'Intermediate',
    icon: '🏛️',
    explanation: `A stock represents fractional ownership in a company. When you buy a share, you become a part-owner. If the company grows its profits over time, your share value increases.`,
    example: `If Tata Motors issues shares and you buy 10 shares, you own a tiny slice of Tata Motors. As Tata Motors sells more vehicles globally, its business value rises, making your shares more valuable.`,
    commonMistakes: [
      'Treating the stock market like gambling or day-trading tips.',
      'Putting all money into a single hyped stock without research.'
    ],
    quiz: {
      question: 'What does owning a stock mean?',
      options: ['Lending money to a bank', 'Owning a small percentage share of a company', 'Buying a lottery ticket', 'Paying government taxes'],
      correctAnswer: 1,
      explanation: 'Spot on! Owning a stock gives you fractional ownership in that business.'
    }
  },
  {
    id: 9,
    title: 'Diversification',
    subtitle: 'Spreading risk across asset classes and market sectors',
    readTime: '4 min',
    difficulty: 'Intermediate',
    icon: '🧺',
    explanation: `Diversification means spreading your investments across different asset classes (equity, debt, gold) and sectors (tech, banking, pharma). If one sector declines, others buffer your portfolio.`,
    example: `If you put ₹1 Lakh into an airline company and flights get grounded, you suffer heavy losses. If you split ₹1 Lakh across IT, Banking, Pharma, and Gold, a slump in airlines won't ruin your overall portfolio.`,
    commonMistakes: [
      'Over-concentrating in one sector (e.g. only Tech stocks).',
      'Over-diversifying into 50 identical funds.'
    ],
    quiz: {
      question: 'Why is asset diversification crucial in investing?',
      options: [
        'It doubles returns overnight',
        'It spreads risk so a decline in one asset does not ruin your portfolio',
        'It avoids all processing fees',
        'It guarantees 100% fixed returns'
      ],
      correctAnswer: 1,
      explanation: 'Correct! Diversification mitigates risk by reducing the impact of any single failing investment.'
    }
  },
  {
    id: 10,
    title: 'Long-Term Wealth Building',
    subtitle: 'Harnessing the power of exponential compounding over 10-20 years',
    readTime: '5 min',
    difficulty: 'Intermediate',
    icon: '🚀',
    explanation: `Compounding happens when your investment returns start generating their own returns over long horizons. Time and discipline are the most powerful forces in wealth creation.`,
    example: `Investing ₹5,000/month at 12% annual return for 10 years yields ₹11.6 Lakhs. If you stay invested for 20 years, it grows to ₹49.9 Lakhs! The second decade generates 3x more wealth than the first decade!`,
    commonMistakes: [
      'Checking portfolio balance daily and panicking over temporary dips.',
      'Starting late instead of investing small amounts early.'
    ],
    quiz: {
      question: 'What is the most crucial factor in compounding wealth over time?',
      options: ['Predicting tomorrow’s stock market price', 'Time and consistency over 10-20 years', 'Frequent daily trading', 'High transaction fees'],
      correctAnswer: 1,
      explanation: 'Awesome! Time and consistency allow compounding to exponentially multiply your wealth.'
    }
  }
];

export function calculateHealthScores(profile) {
  const income = Number(profile.monthlyIncome || 1);
  const savings = Number(profile.monthlySavings || 0);
  const expenses = Number(profile.monthlyExpenses || 0);

  const savingsRate = Math.min(100, Math.round((savings / income) * 100));
  const expenseRatio = Math.round((expenses / income) * 100);

  let budgetingScore = expenseRatio <= 50 ? 95 : expenseRatio <= 65 ? 80 : expenseRatio <= 80 ? 65 : 45;
  let savingsScore = savingsRate >= 30 ? 95 : savingsRate >= 20 ? 82 : savingsRate >= 10 ? 65 : 40;
  let emergencyScore = (profile.goals || []).includes('Emergency Fund') ? 85 : 65;
  if (savings >= expenses * 3) emergencyScore = 95;

  let knowledgeScore = profile.priorInvestment === 'Yes' ? 85 : profile.priorInvestment === 'A little' ? 65 : 45;
  let riskScore = profile.riskTolerance === 'Medium' || profile.riskTolerance === 'Low' ? 80 : 70;

  const overall = Math.round((budgetingScore + savingsScore + emergencyScore + knowledgeScore + riskScore) / 5);

  let healthStatus = 'Good';
  if (overall >= 85) healthStatus = 'Excellent';
  else if (overall >= 70) healthStatus = 'Strong';
  else if (overall >= 55) healthStatus = 'Moderate';
  else healthStatus = 'Needs Attention';

  const suggestedMonthlyInvestment = Math.max(1000, Math.round(savings * 0.4));

  return {
    budgetingScore,
    savingsScore,
    emergencyScore,
    knowledgeScore,
    riskScore,
    overall,
    healthStatus,
    suggestedMonthlyInvestment,
    savingsRate
  };
}
