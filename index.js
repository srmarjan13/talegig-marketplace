const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'talegig_super_secret_jwt_key_2026';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ডাটাবেস কানেকশন এবং প্রিজমা সেটআপ
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// জিমেইল ট্রান্সপোর্টার সেটআপ
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.talegig@gmail.com',
    pass: 'cyyzzzlkecufzfyk'
  }
});

const PORT = process.env.PORT || 3001;

// 🟢 JWT টোকেন ভেরিফিকেশন মিডলওয়্যার
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

// --- রাউটসমূহ ---

// ১. সাইনআপ এপিআই (সংশোধিত ও নিরাপদ)
app.post('/api/signup', async (req, res) => {
  console.log("Signup API hit");
  console.log("Received data:", req.body);
  
  try {
    const { firstName, lastName, username, email, password, role, location } = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already exists!' });
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const generatedTgId = `TG-${randomNum}`;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userRole = role && role.toUpperCase() === 'SELLER' ? 'SELLER' : 'BUYER';

    const user = await prisma.user.create({
      data: {
        tgId: generatedTgId,
        firstName: firstName || '',
        lastName: lastName || '',
        username,
        email,
        password: hashedPassword,
        role: userRole,
        location: location || 'Dubai, UAE'
      }
    });

    const { password: _pw, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("DEBUG ERROR DURING SIGNUP:", error); 
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// ২. লগইন ও JWT টোকেন জেনারেট এপিআই
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _pw, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login Successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ৩. ওটিপি পাঠানোর এপিআই
app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #050b1a; padding: 40px 20px; color: #ffffff; max-width: 600px; margin: auto; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.2);">
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">
          Tale<span style="color: #3b82f6;">Gig</span>
        </span>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">Worldwide Freelancer Marketplace</p>
      </div>
      <div style="background-color: #0a1226; padding: 35px; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3); text-align: center;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Email Verification</h2>
        <div style="margin: 20px 0; padding: 20px; background-color: #050b1a; border-radius: 12px; border: 2px dashed #38bdf8; display: inline-block;">
          <span style="color: #38bdf8; font-size: 40px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
            ${otp}
          </span>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Talegig Support" <info.talegig@gmail.com>',
    to: email,
    subject: '🔒 Your TaleGig Verification Code',
    html: htmlTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent to email successfully!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

// ৪. অ্যাডমিন লগইন রাউট
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    const hashToCompare = admin ? admin.password : '$2b$10$invalidsaltinvalidsaltinvalidsalt.hash';
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (admin && isMatch) {
      const token = jwt.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ message: "Login Successful", token, adminId: admin.id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 🟢 প্রজেক্ট ও কন্টেন্ট রাউটসমূহ
// ==========================================

// ১. নতুন প্রজেক্ট তৈরি করার এপিআই (সংশোধিত ও নিরাপদ)
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, budget, category, authorName, userId, badges, skills, subType, budgetFormatted, type } = req.body;
    
    const parsedUserId = userId && !isNaN(parseInt(userId)) ? parseInt(userId) : null;

    const encodedCategory = JSON.stringify({
      cat: category || 'General',
      badges: badges || [],
      skills: skills || [],
      subType: subType || 'Fixed',
      budgetFormatted: budgetFormatted || `$${budget || 50} USD`
    });

    const newProject = await prisma.project.create({
      data: {
        title: title || 'Untitled Project',
        description: description || '',
        budget: budget ? parseFloat(budget) : 0,
        category: encodedCategory,
        type: type || 'project',
        authorName: authorName || 'Saidur Buyer',
        userId: parsedUserId,
        status: 'active'
      }
    });

    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error("Project Create Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create project' });
  }
});

// ২. সব প্রজেক্ট ফেচ করার এপিআই
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedProjects = projects.map(item => {
      let parsedData = {
        cat: 'General',
        badges: ['VERIFIED'],
        skills: ['Web Development'],
        subType: 'Fixed',
        budgetFormatted: `$${item.budget} USD`
      };

      try {
        if (item.category && item.category.startsWith('{')) {
          parsedData = JSON.parse(item.category);
        }
      } catch (e) {
        parsedData.skills = item.category ? item.category.split(',').map(s => s.trim()) : [];
      }

      return {
        ...item,
        category: parsedData.cat || 'General',
        subType: parsedData.subType || 'Fixed',
        budget: parsedData.budgetFormatted || `$${item.budget} USD`,
        budgetFormatted: parsedData.budgetFormatted || `$${item.budget} USD`,
        badges: parsedData.badges && parsedData.badges.length > 0 ? parsedData.badges : ['VERIFIED'],
        skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : [],
        timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now()
      };
    });

    res.json(formattedProjects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ৩. নির্দিষ্ট প্রজেক্ট বা কন্টেস্ট আইডি অনুযায়ী ডিটেইলস ফেচ করার এপিআই
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let parsedData = {
      cat: 'General',
      badges: ['VERIFIED'],
      skills: [],
      subType: 'Fixed',
      budgetFormatted: `$${project.budget} USD`
    };

    try {
      if (project.category && project.category.startsWith('{')) {
        parsedData = JSON.parse(project.category);
      }
    } catch (e) {
      parsedData.skills = project.category ? project.category.split(',').map(s => s.trim()) : [];
    }

    res.json({
      ...project,
      ...parsedData,
      category: parsedData.cat || 'General',
      subType: parsedData.subType || 'Fixed',
      budget: parsedData.budgetFormatted || `$${project.budget} USD`,
      budgetNum: project.budget,
      badges: parsedData.badges && parsedData.badges.length > 0 ? parsedData.badges : ['VERIFIED'],
      skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : [],
      timestamp: project.createdAt ? new Date(project.createdAt).getTime() : Date.now()
    });
  } catch (error) {
    console.error("Fetch Single Project Error:", error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// ৪. কন্টেস্ট আপডেট সেভ করার এপিআই
app.post('/api/projects/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, budget, proposalsData, awardedEntries, paymentState, reviews } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProject) return res.status(404).json({ error: 'Project not found' });

    let existingCategoryData = {};
    try {
      existingCategoryData = JSON.parse(existingProject.category || '{}');
    } catch (e) {}

    const updatedCategoryData = JSON.stringify({
      ...existingCategoryData,
      proposalsData: proposalsData || existingCategoryData.proposalsData || [],
      awardedEntries: awardedEntries || existingCategoryData.awardedEntries || [],
      paymentState: paymentState || existingCategoryData.paymentState || 'unbilled',
      reviews: reviews || existingCategoryData.reviews || {}
    });

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingProject.title,
        description: description || existingProject.description,
        budget: budget ? parseFloat(String(budget).replace(/[^0-9.]/g, '')) : existingProject.budget,
        category: updatedCategoryData
      }
    });

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Update Contest Error:", error);
    res.status(500).json({ error: 'Failed to update contest data' });
  }
});

// প্রোফাইল আপডেট ও সিঙ্ক করার এপিআইসমূহ
app.get('/api/users/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/users/skills', async (req, res) => {
  try {
    const { email, skills } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { skills: JSON.stringify(skills) }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

app.post('/api/users/portfolio', async (req, res) => {
  try {
    const { email, portfolio, title, role, desc, skills, images } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let existingPortfolio = [];
    try {
      existingPortfolio = user.portfolio ? JSON.parse(user.portfolio) : [];
    } catch (e) {
      existingPortfolio = [];
    }

    let finalPortfolio = portfolio || [];
    if (title && desc) {
      const newItem = { id: Date.now(), title, role, desc, skills, images };
      finalPortfolio = [...existingPortfolio, newItem];
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { portfolio: JSON.stringify(finalPortfolio) }
    });

    res.json(title ? finalPortfolio[finalPortfolio.length - 1] : { success: true, portfolio: finalPortfolio });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

app.post('/api/users/hourly-rate', async (req, res) => {
  try {
    const { email, hourlyRateNum } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { hourlyRateNum: String(hourlyRateNum) }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hourly rate' });
  }
});

app.post('/api/users/title', async (req, res) => {
  try {
    const { email, title } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { title }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update title' });
  }
});

app.post('/api/users/bio', async (req, res) => {
  try {
    const { email, bio } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { bio }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bio' });
  }
});

app.post('/api/users/languages', async (req, res) => {
  try {
    const { email, languages } = req.body;
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { languages: JSON.stringify(languages) }
    });
    res.json({ success: true, updatedUser });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update languages' });
  }
});

app.post('/api/users/education', async (req, res) => {
  try {
    const { email, education } = req.body;
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { education: JSON.stringify(education) }
    });
    res.json({ success: true, updatedUser });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

app.post('/api/users/experience', async (req, res) => {
  try {
    const { email, experience } = req.body;
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { experience: JSON.stringify(experience) }
    });
    res.json({ success: true, updatedUser });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// পেজ কন্টেন্ট ও ফুটার রাউট
app.get('/api/pages/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const page = await prisma.pageContent.findUnique({ where: { pageKey: key } });
    if (!page) return res.status(404).json({ error: 'Page content not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

app.post('/api/admin/pages', async (req, res) => {
  try {
    const { pageKey, title, content } = req.body;
    if (!pageKey || !content) return res.status(400).json({ error: 'Page key and content are required' });

    const savedPage = await prisma.pageContent.upsert({
      where: { pageKey },
      update: { title: title || 'Page', content },
      create: { pageKey, title: title || 'Page', content }
    });

    res.json({ success: true, message: 'Content saved successfully!', page: savedPage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save page content' });
  }
});

// সেলার অ্যানালিটিক্স ও উইথড্রল এপিআই
app.get('/api/seller/analytics/:sellerId', async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId);

    const transactions = await prisma.transaction.findMany({
      where: { sellerId: sellerId },
      orderBy: { createdAt: 'desc' }
    });

    const payoutMethods = await prisma.payoutMethod.findMany({
      where: { sellerId: sellerId }
    });

    let totalEarnings = 1540.00;
    let availableBalance = 420.00;
    let inProgressBalance = 200.00;
    let inReviewBalance = 150.00;
    let last30DaysEarnings = 500.00;

    res.json({
      totalEarnings,
      last30DaysEarnings,
      availableBalance,
      inProgressBalance,
      inReviewBalance,
      completedOrdersCount: 12,
      activeOrdersCount: 2,
      cancelledOrdersCount: 0,
      totalGigsCount: 3,
      totalGigsViews: 145,
      successRate: 100,
      starRating: 5.0,
      onTimeDeliveryRate: 100,
      repeatClientsCount: 2,
      averageOrderValue: 128.33,
      responseRate: 100,
      minWithdrawalLimit: 50,
      transactions: transactions,
      payoutMethods: payoutMethods
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

app.post('/api/seller/withdraw', async (req, res) => {
  try {
    const { sellerId, amount, method, accountNumber } = req.body;

    const newWithdrawal = await prisma.transaction.create({
      data: {
        sellerId: parseInt(sellerId),
        type: 'withdraw',
        amount: parseFloat(amount),
        method: method,
        details: accountNumber,
        status: 'Pending Review'
      }
    });

    res.status(201).json({ success: true, transaction: newWithdrawal });
  } catch (error) {
    console.error("Withdrawal create error:", error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// বায়ার অ্যানালিটিক্স ও স্পেন্ডিং ডেটা ফেচ করার এপিআই
app.get('/api/buyer/analytics/:buyerId', async (req, res) => {
  try {
    const buyerId = parseInt(req.params.buyerId);

    const projects = await prisma.project.findMany({
      where: { userId: buyerId }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: buyerId },
      orderBy: { createdAt: 'desc' }
    });

    let totalSpent = 1250.00;
    let last30DaysSpent = 450.00;

    res.json({
      totalSpent,
      last30DaysSpent,
      totalProjectsPosted: projects.length,
      activeProjectsCount: projects.filter(p => p.status === 'Active' || p.status === 'Pending').length,
      completedProjectsCount: projects.filter(p => p.status === 'Completed').length,
      totalContestsCount: 2,
      hiredFreelancersCount: 4,
      transactions: transactions
    });
  } catch (error) {
    console.error("Buyer Analytics Error:", error);
    res.status(500).json({ error: 'Failed to fetch buyer analytics' });
  }
});

// নির্দিষ্ট বায়ারের ফেভারিটস লিস্ট ফেচ করার এপিআই
app.get('/api/buyer/favorites/:buyerId', async (req, res) => {
  try {
    const buyerId = parseInt(req.params.buyerId);
    
    const favorites = await prisma.favorite.findMany({
      where: { userId: buyerId }
    });

    res.json(favorites);
  } catch (error) {
    console.error("Fetch Favorites Error:", error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// নির্দিষ্ট বায়ারের অর্ডার্স ফেচ করার এপিআই
app.get('/api/buyer/orders/:buyerId', async (req, res) => {
  try {
    const buyerId = parseInt(req.params.buyerId);

    const orders = await prisma.order.findMany({
      where: { buyerId: buyerId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// প্রজেক্টের ডিটেইলস ফেচ করা
app.get('/api/project-details/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { proposals: true, milestones: true, reviews: true }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// মাইলস্টোন আপডেট করা
app.post('/api/milestone/update', async (req, res) => {
  try {
    const { milestoneId, status } = req.body;
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// টেস্ট ডিবি রাউট
app.get('/test-db', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database connection failed!" });
  }
});

// সার্ভার স্টার্ট
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});