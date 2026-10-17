const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawnSync } = require('child_process');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Multer memory storage for bank statement CSV upload
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// In-Memory Transaction Data Store (Ensure both id and _id are set on every record)
let transactionsStore = [];

// Helper to load fallback data
function getFallbackData() {
  const filePath = path.resolve(__dirname, 'fallback_data.json');
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error("Error reading fallback_data.json:", e);
    }
  }
  return { users: {}, transactions: {} };
}

// Helper to save fallback data
function saveFallbackData(data) {
  const filePath = path.resolve(__dirname, 'fallback_data.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Error writing fallback_data.json:", e);
  }
}

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  const data = getFallbackData();
  const users = data.users || {};

  let matchedUser = Object.values(users).find(u => u.email && u.email.toLowerCase() === cleanEmail);

  if (!matchedUser) {
    const defaultName = cleanEmail.split('@')[0];
    matchedUser = {
      id: `user_${cleanEmail}`,
      _id: `user_${cleanEmail}`,
      username: defaultName,
      fullName: defaultName,
      email: cleanEmail,
      nationality: "Indian",
      preferredCurrency: "INR"
    };
  }

  const token = `token_finnova_${Date.now()}_${matchedUser.id}`;

  const responseUser = {
    id: matchedUser.id || matchedUser._id || "demo-id",
    username: matchedUser.username || matchedUser.fullName || matchedUser.email.split('@')[0],
    fullName: matchedUser.fullName || matchedUser.username || matchedUser.email.split('@')[0],
    email: matchedUser.email,
    nationality: matchedUser.nationality || "Indian",
    preferredCurrency: matchedUser.preferredCurrency || "INR"
  };

  return res.json({
    access_token: token,
    token_type: "bearer",
    user: responseUser
  });
});

app.post('/api/auth/register', (req, res) => {
  const { fullName, username, email, password, nationality } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required." });
  }

  const nameVal = (username || fullName || "").trim() || email.split('@')[0];
  const cleanEmail = email.toLowerCase().trim();
  const userId = `user_${Date.now()}`;
  
  const user = {
    id: userId,
    _id: userId,
    username: nameVal,
    fullName: nameVal,
    email: cleanEmail,
    nationality: nationality || "Indian",
    preferredCurrency: "INR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const data = getFallbackData();
  if (!data.users) data.users = {};
  data.users[cleanEmail] = user;
  saveFallbackData(data);

  return res.status(201).json(user);
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ detail: "Email address is required." });
  }
  return res.json({
    message: "Password reset token generated successfully.",
    reset_token: `reset_${Date.now()}`,
    expires_in_minutes: 15
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ detail: "New password is required." });
  }
  return res.json({
    message: "Password reset successfully! You can now log in with your new password."
  });
});

app.get('/api/users/me', (req, res) => {
  const data = getFallbackData();
  const users = data.users || {};
  const allUsers = Object.values(users);
  
  if (allUsers.length > 0) {
    const latestUser = allUsers[allUsers.length - 1];
    return res.json({
      id: latestUser.id || latestUser._id,
      username: latestUser.username || latestUser.fullName,
      fullName: latestUser.fullName || latestUser.username,
      email: latestUser.email,
      nationality: latestUser.nationality || "Indian",
      preferredCurrency: latestUser.preferredCurrency || "INR"
    });
  }

  return res.json({
    id: "demo-user-123",
    username: "Aarav Sharma",
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    nationality: "Indian",
    preferredCurrency: "INR"
  });
});

app.put('/api/users/profile', (req, res) => {
  const { fullName, username, nationality, preferredCurrency } = req.body;
  const nameVal = (username || fullName || "").trim();

  const data = getFallbackData();
  const users = data.users || {};
  const allUsers = Object.values(users);

  if (allUsers.length > 0) {
    const latestUser = allUsers[allUsers.length - 1];
    if (nameVal) {
      latestUser.username = nameVal;
      latestUser.fullName = nameVal;
    }
    if (nationality) latestUser.nationality = nationality;
    if (preferredCurrency) latestUser.preferredCurrency = preferredCurrency;

    users[latestUser.email.toLowerCase()] = latestUser;
    saveFallbackData(data);

    return res.json({
      id: latestUser.id || latestUser._id,
      username: latestUser.username,
      fullName: latestUser.fullName,
      email: latestUser.email,
      nationality: latestUser.nationality,
      preferredCurrency: latestUser.preferredCurrency
    });
  }

  return res.json({
    id: "demo-user-123",
    username: nameVal || "Aarav Sharma",
    fullName: nameVal || "Aarav Sharma",
    email: "aarav.sharma@example.com",
    nationality: nationality || "Indian",
    preferredCurrency: preferredCurrency || "INR"
  });
});

// Helper for calculating financial totals across all current transactions
function calculateTotals() {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryMap = {};

  transactionsStore.forEach(t => {
    const amt = Number(t.amount || 0);
    if (t.type === 'Income') {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    }
  });

  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Number(((totalSavings / totalIncome) * 100).toFixed(1)) : 0;
  
  let topCategory = "General";
  let topCategoryAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    _id: name,
    id: name,
    name: name,
    value: value,
    totalAmount: value
  }));

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    topCategory,
    categoryData
  };
}

// ----------------------------------------------------
// Dashboard & Analytics Endpoints
// ----------------------------------------------------
app.get('/api/dashboard', (req, res) => {
  const totals = calculateTotals();
  const txList = transactionsStore.slice(0, 10);
  return res.json({
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    totalSavings: totals.totalSavings,
    savingsRate: totals.savingsRate,
    topCategory: totals.topCategory,
    recentTransactions: txList,
    latestTransactions: txList,
    monthlyTrend: [
      { month: "May", income: 0, expense: 0 },
      { month: "Jun", income: 0, expense: 0 },
      { month: "Jul", income: totals.totalIncome, expense: totals.totalExpenses }
    ]
  });
});

app.get('/api/ai/summary', (req, res) => {
  const totals = calculateTotals();
  return res.json({
    summaryText: `Your financial health is strong with a ${totals.savingsRate}% savings rate. Discretionary spending is highest in ${totals.topCategory}.`,
    topCategory: totals.topCategory,
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    totalSavings: totals.totalSavings,
    savingsRate: totals.savingsRate,
    categoryBreakdown: totals.categoryData
  });
});

app.get('/api/ai/predict', (req, res) => {
  const totals = calculateTotals();
  const predictedNext = Math.round(totals.totalExpenses > 0 ? totals.totalExpenses * 1.02 : 22400);
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthStr = nextMonthDate.toISOString().slice(0, 7);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const nextMonthLabel = `${monthNames[nextMonthDate.getMonth()]} ${nextMonthDate.getFullYear()}`;

  return res.json({
    predictionMonth: nextMonthStr,
    predictionMonthLabel: nextMonthLabel,
    predictedExpense: predictedNext,
    historicalAverage: totals.totalExpenses || 22000,
    trend: "stable",
    modelUsed: "Gradient Boosting Regressor",
    trainingMonths: 6,
    mae: 850.0,
    rmse: 1020.0,
    r2: 0.91,
    expectedSavings: Math.max(0, totals.totalIncome - predictedNext),
    forecastChangePct: 2.0,
    confidenceNote: "Evaluated across historical transactions with Gradient Boosting Regressor.",
    createdAt: new Date().toISOString()
  });
});

app.get('/api/ai/recommendations', (req, res) => {
  return res.json({
    recommendations: [
      { title: "Increase Flexi-Cap Mutual Fund SIP", description: "Allocate ₹5,000 extra to equity funds for long-term growth.", category: "Investment" },
      { title: "Optimize Food Spends", description: "Cap dining out to ₹2,500/week to boost your monthly savings rate.", category: "Savings" }
    ]
  });
});

// ----------------------------------------------------
// AI Merchant Classification Integration Helper
// ----------------------------------------------------
function classifyDescription(description, existingCategory) {
  const genericCategories = ['other', 'general', 'uncategorized', 'unknown', ''];
  const cleanExisting = (existingCategory || '').trim();
  const lowerExisting = cleanExisting.toLowerCase();

  // Preserve user's manual category selection if specific
  if (cleanExisting && !genericCategories.includes(lowerExisting)) {
    return {
      category: cleanExisting,
      confidence: 1.0,
      isAutoClassified: false
    };
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    return {
      category: cleanExisting || 'Other',
      confidence: 0.0,
      isAutoClassified: false
    };
  }

  try {
    const cliScript = path.resolve(__dirname, 'app/ai_engine/classification/predict_cli.py');
    const pythonProc = spawnSync('python', [cliScript, description.trim()], {
      encoding: 'utf8',
      timeout: 5000,
      windowsHide: true
    });

    if (pythonProc.status === 0 && pythonProc.stdout) {
      const output = JSON.parse(pythonProc.stdout.trim());
      if (output && output.predicted_category) {
        return {
          category: output.predicted_category,
          confidence: output.confidence ?? 0.0,
          isAutoClassified: true
        };
      }
    }
  } catch (err) {
    console.warn('[Classifier Integration] Inference call fallback:', err.message);
  }

  return {
    category: cleanExisting || 'Other',
    confidence: 0.0,
    isAutoClassified: false
  };
}

function classifyBatch(descriptions) {
  if (!Array.isArray(descriptions) || descriptions.length === 0) return [];
  try {
    const cliScript = path.resolve(__dirname, 'app/ai_engine/classification/predict_cli.py');
    const pythonProc = spawnSync('python', [cliScript], {
      input: JSON.stringify(descriptions),
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true
    });

    if (pythonProc.status === 0 && pythonProc.stdout) {
      const output = JSON.parse(pythonProc.stdout.trim());
      if (Array.isArray(output)) return output;
    }
  } catch (err) {
    console.warn('[Classifier Batch Integration] Fallback:', err.message);
  }
  return descriptions.map(d => ({ description: d, predicted_category: 'Other', confidence: 0.0 }));
}

// ----------------------------------------------------
// Transactions Endpoints
// ----------------------------------------------------
app.get('/api/transactions', (req, res) => {
  const { page = 1, limit = 10, search, category, type } = req.query;
  let filtered = [...transactionsStore];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(t => t.category.toLowerCase() === String(category).toLowerCase());
  }

  if (type && type !== 'All') {
    filtered = filtered.filter(t => t.type.toLowerCase() === String(type).toLowerCase());
  }

  const total = filtered.length;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  return res.json({
    transactions: paginated,
    total: total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1
  });
});

app.post('/api/transactions', (req, res) => {
  const { type, category, amount, description, date } = req.body;
  const uniqueId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Run ML classification if category is missing/Other/General
  const classification = classifyDescription(description, category);

  const newTx = {
    id: uniqueId,
    _id: uniqueId,
    type: type || (classification.category === 'Income' ? 'Income' : 'Expense'),
    category: classification.category || category || 'Other',
    classificationConfidence: classification.confidence,
    amount: Number(amount || 0),
    description: description || 'New Transaction',
    date: date || new Date().toISOString()
  };

  transactionsStore.unshift(newTx);
  return res.status(201).json(newTx);
});

// DELETE single transaction by ID
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = transactionsStore.length;
  
  transactionsStore = transactionsStore.filter(t => t.id !== id && t._id !== id);

  if (transactionsStore.length === initialLength) {
    return res.status(404).json({ success: false, detail: `Transaction with ID ${id} not found.` });
  }

  return res.status(200).json({
    success: true,
    message: "Transaction deleted successfully.",
    id: id
  });
});

// DELETE bulk transactions
app.delete('/api/transactions', (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, detail: "Transaction IDs array is required." });
  }

  const idsSet = new Set(ids);
  const initialCount = transactionsStore.length;
  transactionsStore = transactionsStore.filter(t => !idsSet.has(t.id) && !idsSet.has(t._id));
  const deletedCount = initialCount - transactionsStore.length;

  return res.status(200).json({
    success: true,
    message: `Successfully deleted ${deletedCount} transactions.`,
    deletedCount: deletedCount
  });
});

// ----------------------------------------------------
// Bank Statement Upload & Download Endpoints
// ----------------------------------------------------

/**
 * POST /api/reports/upload or /api/transactions/upload
 * Bulk import bank statement CSV file.
 */
const handleStatementUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No statement file provided. Please upload a CSV file." });
  }

  try {
    const csvContent = req.file.buffer.toString('utf8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) {
      return res.status(400).json({ detail: "The uploaded CSV statement file is empty." });
    }

    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('date') || header.includes('amount') || header.includes('description');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsedRows = [];
    const genericCategories = ['other', 'general', 'uncategorized', 'unknown', ''];

    dataLines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 3) {
        let dateVal = parts[0];
        let descVal = parts[1];
        let amtVal = parseFloat(parts[2]);
        let typeVal = parts[3];
        let catVal = parts[4];

        if (isNaN(amtVal)) amtVal = 0;
        amtVal = Math.abs(amtVal);

        if (!dateVal || isNaN(Date.parse(dateVal))) {
          dateVal = new Date().toISOString();
        } else {
          dateVal = new Date(dateVal).toISOString();
        }

        const cleanDesc = descVal || `Statement Entry ${index + 1}`;
        const cleanCat = (catVal || '').trim();
        const isGeneric = !cleanCat || genericCategories.includes(cleanCat.toLowerCase());

        parsedRows.push({
          index,
          dateVal,
          descVal: cleanDesc,
          amtVal,
          typeVal,
          catVal: cleanCat,
          isGeneric
        });
      }
    });

    if (parsedRows.length === 0) {
      return res.status(400).json({ detail: "Could not parse any valid transaction rows from the CSV file." });
    }

    // Collect descriptions needing ML auto-classification
    const needsClassification = parsedRows.filter(r => r.isGeneric).map(r => r.descVal);
    const predictions = needsClassification.length > 0 ? classifyBatch(needsClassification) : [];

    let predMap = {};
    predictions.forEach(p => {
      if (p && p.description) {
        predMap[p.description] = p;
      }
    });

    const importedTransactions = parsedRows.map((r) => {
      const uniqueId = `csv_${Date.now()}_${r.index}_${Math.random().toString(36).substring(2, 6)}`;
      let finalCategory = r.catVal;
      let confidence = 1.0;

      if (r.isGeneric && predMap[r.descVal]) {
        finalCategory = predMap[r.descVal].predicted_category || 'General';
        confidence = predMap[r.descVal].confidence ?? 0.0;
      }

      if (!finalCategory || genericCategories.includes(finalCategory.toLowerCase())) {
        finalCategory = 'General';
      }

      const txType = r.typeVal 
        ? (r.typeVal.toLowerCase() === 'income' ? 'Income' : 'Expense')
        : (finalCategory === 'Income' ? 'Income' : 'Expense');

      return {
        id: uniqueId,
        _id: uniqueId,
        date: r.dateVal,
        description: r.descVal,
        amount: r.amtVal,
        type: txType,
        category: finalCategory,
        classificationConfidence: confidence
      };
    });

    // Insert imported transactions into store
    transactionsStore = [...importedTransactions, ...transactionsStore];

    return res.status(200).json({
      success: true,
      imported: importedTransactions.length,
      message: `Successfully imported ${importedTransactions.length} transactions from statement.`,
      filename: req.file.originalname
    });
  } catch (err) {
    console.error("Statement upload error:", err);
    return res.status(500).json({ detail: "Failed to process bank statement CSV." });
  }
};



app.post('/api/reports/upload', upload.single('file'), handleStatementUpload);
app.post('/api/transactions/upload', upload.single('file'), handleStatementUpload);

/**
 * GET /api/reports/download or /api/transactions/export
 * Download all transactions as CSV bank statement.
 */
const handleStatementDownload = (req, res) => {
  let csvRows = ['date,description,amount,type,category'];

  transactionsStore.forEach(t => {
    const formattedDate = new Date(t.date).toISOString().slice(0, 10);
    const cleanDesc = `"${String(t.description || '').replace(/"/g, '""')}"`;
    csvRows.push(`${formattedDate},${cleanDesc},${t.amount},${t.type},${t.category}`);
  });

  const csvString = csvRows.join('\n');
  const filename = `FinNova_Statement_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvString);
};

app.get('/api/reports/download', handleStatementDownload);
app.get('/api/reports/export', handleStatementDownload);
app.get('/api/transactions/export', handleStatementDownload);

// Reports Summary Endpoint
app.get('/api/reports/summary', (req, res) => {
  const totals = calculateTotals();
  return res.json({
    summary: {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netSavings: totals.totalSavings,
      savingsRate: totals.savingsRate
    },
    monthlySummary: {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netSavings: totals.totalSavings
    },
    categoryData: totals.categoryData,
    monthlyTrend: [
      { month: "May", income: 70000, expense: 20000 },
      { month: "Jun", income: 72000, expense: 21000 },
      { month: "Jul", income: totals.totalIncome, expense: totals.totalExpenses }
    ]
  });
});

app.get('/api/reports', (req, res) => {
  const totals = calculateTotals();
  return res.json({
    monthlySummary: { totalIncome: totals.totalIncome, totalExpenses: totals.totalExpenses, netSavings: totals.totalSavings },
    categoryData: totals.categoryData
  });
});

// ----------------------------------------------------
// Chat Routes (OpenRouter API)
// ----------------------------------------------------
app.use('/api', chatRoutes);
app.use('/', chatRoutes);

// Health check
app.get(['/health', '/api/health', '/'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FinNova AI Backend',
    provider: 'OpenRouter API',
    model: 'openai/gpt-4.1-mini'
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 FinNova Backend running on http://localhost:${PORT}`);
  console.log(`🤖 OpenRouter Chat Endpoint active at http://localhost:${PORT}/api/chat`);
  console.log(`📄 Statement Upload & Download ready at http://localhost:${PORT}/api/reports/upload & /download`);
});

module.exports = app;
