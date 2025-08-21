const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/evidence';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Simple file-based database (for demonstration)
// In production, use MongoDB, PostgreSQL, etc.
const DATA_DIR = 'data';
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const PENDING_REVIEWS_FILE = path.join(DATA_DIR, 'pending-reviews.json');

// Initialize data directory and files
async function initializeDatabase() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize reviews file if it doesn't exist
        try {
            await fs.access(REVIEWS_FILE);
        } catch {
            await fs.writeFile(REVIEWS_FILE, JSON.stringify([]));
        }
        
        // Initialize pending reviews file if it doesn't exist
        try {
            await fs.access(PENDING_REVIEWS_FILE);
        } catch {
            await fs.writeFile(PENDING_REVIEWS_FILE, JSON.stringify([]));
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

// Helper functions for data management
async function readJSONFile(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filepath}:`, error);
        return [];
    }
}

async function writeJSONFile(filepath, data) {
    try {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filepath}:`, error);
        return false;
    }
}

// Privacy protection functions
function maskName(name) {
    if (!name || name.length < 2) return name;
    
    if (name.length === 2) {
        return name[0] + '*';
    }
    
    if (name.length === 3) {
        return name[0] + '**';
    }
    
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function sanitizeContent(content) {
    // Remove potential personal information patterns
    return content
        .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[电话号码已隐藏]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[邮箱已隐藏]')
        .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[卡号已隐藏]');
}

// API Routes

// Submit a new review
app.post('/api/reviews/submit', upload.array('evidence', 5), async (req, res) => {
    try {
        const {
            reviewerName,
            reviewerEmail,
            targetName,
            targetProgram,
            relationship,
            duration,
            tags,
            content,
            truthDeclaration,
            privacyAgreement
        } = req.body;

        // Validation
        if (!reviewerName || !targetName || !relationship || !content) {
            return res.status(400).json({ 
                error: '必填字段不能为空',
                details: 'reviewerName, targetName, relationship, content are required'
            });
        }

        if (!truthDeclaration || !privacyAgreement) {
            return res.status(400).json({ 
                error: '请同意真实性声明和隐私政策'
            });
        }

        // Process uploaded files
        const evidenceFiles = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            uploadDate: new Date().toISOString()
        })) : [];

        // Create review object
        const review = {
            id: crypto.randomUUID(),
            submissionDate: new Date().toISOString(),
            status: 'pending', // pending, approved, rejected
            reviewerInfo: {
                name: reviewerName,
                email: reviewerEmail || null,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            },
            targetInfo: {
                name: targetName,
                displayName: maskName(targetName),
                program: targetProgram || null
            },
            relationshipInfo: {
                type: relationship,
                duration: duration || null
            },
            review: {
                tags: typeof tags === 'string' ? tags.split(',') : (tags || []),
                content: sanitizeContent(content),
                originalContent: content // Keep original for moderation
            },
            evidence: evidenceFiles,
            moderation: {
                autoChecked: true,
                autoCheckDate: new Date().toISOString(),
                humanReviewed: false,
                approvedBy: null,
                approvalDate: null,
                rejectionReason: null
            }
        };

        // Save to pending reviews
        const pendingReviews = await readJSONFile(PENDING_REVIEWS_FILE);
        pendingReviews.push(review);
        await writeJSONFile(PENDING_REVIEWS_FILE, pendingReviews);

        console.log(`New review submitted: ${review.id}`);

        // In a real system, you would trigger the moderation workflow here
        // For demo purposes, we'll auto-approve after a delay
        setTimeout(async () => {
            await autoApproveReview(review.id);
        }, 5000); // Auto-approve after 5 seconds for demo

        res.json({
            success: true,
            message: '评价提交成功，我们将在30分钟内完成审核',
            reviewId: review.id
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ 
            error: '提交失败，请稍后重试',
            details: error.message 
        });
    }
});

// Auto-approve function (for demo purposes)
async function autoApproveReview(reviewId) {
    try {
        const pendingReviews = await readJSONFile(PENDING_REVIEWS_FILE);
        const reviewIndex = pendingReviews.findIndex(r => r.id === reviewId);
        
        if (reviewIndex === -1) return;
        
        const review = pendingReviews[reviewIndex];
        
        // Move to approved reviews
        review.status = 'approved';
        review.moderation.humanReviewed = true;
        review.moderation.approvedBy = 'auto-moderator';
        review.moderation.approvalDate = new Date().toISOString();
        
        // Add to main reviews database
        const reviews = await readJSONFile(REVIEWS_FILE);
        reviews.push(review);
        await writeJSONFile(REVIEWS_FILE, reviews);
        
        // Remove from pending
        pendingReviews.splice(reviewIndex, 1);
        await writeJSONFile(PENDING_REVIEWS_FILE, pendingReviews);
        
        console.log(`Review auto-approved: ${reviewId}`);
    } catch (error) {
        console.error('Error auto-approving review:', error);
    }
}

// Get all approved reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await readJSONFile(REVIEWS_FILE);
        
        // Return only approved reviews with privacy protection
        const publicReviews = reviews
            .filter(review => review.status === 'approved')
            .map(review => ({
                id: review.id,
                targetInfo: review.targetInfo,
                relationshipInfo: review.relationshipInfo,
                review: {
                    tags: review.review.tags,
                    content: review.review.content
                },
                submissionDate: review.submissionDate
            }));
        
        res.json(publicReviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Search reviews
app.get('/api/reviews/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search query too short' });
        }
        
        const reviews = await readJSONFile(REVIEWS_FILE);
        const searchTerm = q.toLowerCase().trim();
        
        // Search in approved reviews
        const results = reviews
            .filter(review => review.status === 'approved')
            .filter(review => 
                review.targetInfo.name.toLowerCase().includes(searchTerm) ||
                review.targetInfo.displayName.toLowerCase().includes(searchTerm)
            )
            .map(review => ({
                id: review.id,
                targetInfo: review.targetInfo,
                relationshipInfo: review.relationshipInfo,
                review: {
                    tags: review.review.tags,
                    content: review.review.content
                },
                submissionDate: review.submissionDate,
                // Show full name only for exact matches
                showFullName: review.targetInfo.name.toLowerCase() === searchTerm
            }));
        
        res.json({
            query: q,
            results: results,
            count: results.length
        });
        
    } catch (error) {
        console.error('Error searching reviews:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Report a review
app.post('/api/reviews/:reviewId/report', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason, details, reporterEmail } = req.body;
        
        // Create report record
        const report = {
            id: crypto.randomUUID(),
            reviewId: reviewId,
            reportDate: new Date().toISOString(),
            reason: reason,
            details: details || '',
            reporterEmail: reporterEmail || null,
            ip: req.ip,
            status: 'pending' // pending, resolved, dismissed
        };
        
        // Save report (in production, use proper database)
        const reportsFile = path.join(DATA_DIR, 'reports.json');
        let reports = [];
        try {
            reports = await readJSONFile(reportsFile);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        
        reports.push(report);
        await writeJSONFile(reportsFile, reports);
        
        console.log(`New report submitted for review ${reviewId}: ${report.id}`);
        
        res.json({
            success: true,
            message: '举报已提交，我们将在24小时内处理',
            reportId: report.id
        });
        
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// Get review statistics
app.get('/api/stats', async (req, res) => {
    try {
        const reviews = await readJSONFile(REVIEWS_FILE);
        const pendingReviews = await readJSONFile(PENDING_REVIEWS_FILE);
        
        const stats = {
            totalReviews: reviews.filter(r => r.status === 'approved').length,
            pendingReviews: pendingReviews.length,
            lastUpdate: reviews.length > 0 ? 
                Math.max(...reviews.map(r => new Date(r.submissionDate).getTime())) : 
                Date.now()
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'UW Date API' 
    });
});

// Initialize and start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 UW Date API server running on port ${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
}

startServer().catch(console.error);

module.exports = app;
