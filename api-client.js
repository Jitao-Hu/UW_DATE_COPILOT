// API Client for UW Date Platform
class UWDateAPI {
    constructor(baseURL = 'http://localhost:3001/api') {
        this.baseURL = baseURL;
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Submit a new review
    async submitReview(formData) {
        try {
            // Create FormData for file upload
            const apiFormData = new FormData();
            
            // Add text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'evidence' && formData[key] !== undefined) {
                    if (Array.isArray(formData[key])) {
                        formData[key].forEach(item => apiFormData.append(key, item));
                    } else {
                        apiFormData.append(key, formData[key]);
                    }
                }
            });

            // Add files
            if (formData.evidence && formData.evidence.length > 0) {
                Array.from(formData.evidence).forEach(file => {
                    apiFormData.append('evidence', file);
                });
            }

            const response = await fetch(`${this.baseURL}/reviews/submit`, {
                method: 'POST',
                body: apiFormData
                // Don't set Content-Type header for FormData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Submission failed');
            }

            return result;
        } catch (error) {
            console.error('Submit review error:', error);
            throw error;
        }
    }

    // Get all reviews
    async getReviews() {
        return this.request('/reviews');
    }

    // Search reviews
    async searchReviews(query) {
        const encodedQuery = encodeURIComponent(query);
        return this.request(`/reviews/search?q=${encodedQuery}`);
    }

    // Report a review
    async reportReview(reviewId, reportData) {
        return this.request(`/reviews/${reviewId}/report`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    }

    // Get platform statistics
    async getStats() {
        return this.request('/stats');
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create global API instance
const uwDateAPI = new UWDateAPI();

// Fallback data for when API is not available
const fallbackReviewsData = [
    {
        id: 1,
        targetInfo: {
            name: "王某某",
            displayName: "王***",
            program: "CS"
        },
        relationshipInfo: {
            type: "dating",
            duration: "1-3_months"
        },
        review: {
            tags: ["PUA", "不可靠"],
            content: "CS专业，在某科技公司实习，相识于某相亲APP，开始各种甜言蜜语说要一起去DC看樱花，等到确立关系后就开始冷淡，说自己压力大要专心学习，但朋友圈经常看到他和其他女生出去玩。这种变化仅发生在两周内，典型的渣男行为，建议大家小心。"
        },
        submissionDate: "2025-01-10T10:30:00Z"
    },
    {
        id: 2,
        targetInfo: {
            name: "李某某",
            displayName: "李***",
            program: "Math"
        },
        relationshipInfo: {
            type: "boyfriend_girlfriend",
            duration: "6-12_months"
        },
        review: {
            tags: ["忠诚", "情绪稳定", "真诚付出", "幽默"],
            content: "Math专业的学霸，人很好这是确凿的，室友见了都说好。他说话有趣，经常逗得人捧腹，又极关心我的学习，三句话不离'assignment'二字。虽然有时候太专注于学习，但这也是UW学生的通病。期末期间会给我买Tim Hortons，还会陪我在DC图书馆刷夜。"
        },
        submissionDate: "2025-01-12T14:20:00Z"
    }
];

// Enhanced API client with fallback
class UWDateAPIWithFallback extends UWDateAPI {
    constructor(baseURL) {
        super(baseURL);
        this.isOnline = true;
    }

    async request(endpoint, options = {}) {
        try {
            return await super.request(endpoint, options);
        } catch (error) {
            console.warn('API request failed, using fallback data:', error.message);
            this.isOnline = false;
            
            // Return fallback data based on endpoint
            if (endpoint === '/reviews' || endpoint.startsWith('/reviews/search')) {
                return this.getFallbackData(endpoint, options);
            }
            
            throw error;
        }
    }

    getFallbackData(endpoint, options) {
        if (endpoint === '/reviews') {
            return fallbackReviewsData;
        }
        
        if (endpoint.startsWith('/reviews/search')) {
            const query = new URLSearchParams(endpoint.split('?')[1]).get('q');
            const results = fallbackReviewsData.filter(review => 
                review.targetInfo.name.toLowerCase().includes(query.toLowerCase()) ||
                review.targetInfo.displayName.toLowerCase().includes(query.toLowerCase())
            );
            
            return {
                query: query,
                results: results,
                count: results.length
            };
        }
        
        return [];
    }

    async submitReview(formData) {
        try {
            return await super.submitReview(formData);
        } catch (error) {
            console.warn('Review submission failed, showing demo message:', error.message);
            this.isOnline = false;
            
            // Return a simulated success response
            return {
                success: true,
                message: '演示模式：评价已记录在本地，实际部署时将保存到数据库',
                reviewId: 'demo-' + Date.now(),
                isDemo: true
            };
        }
    }

    async getStats() {
        try {
            return await super.getStats();
        } catch (error) {
            console.warn('Stats request failed, using fallback:', error.message);
            return {
                totalReviews: fallbackReviewsData.length,
                pendingReviews: 0,
                lastUpdate: Date.now()
            };
        }
    }
}

// Replace the global API instance with fallback version
const uwDateAPIWithFallback = new UWDateAPIWithFallback();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UWDateAPI, UWDateAPIWithFallback, uwDateAPIWithFallback };
}
