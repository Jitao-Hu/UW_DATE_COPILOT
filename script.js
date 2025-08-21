// Sample review data for demonstration
const reviewsData = [
    {
        id: 1,
        name: "王某某",
        displayName: "王***",
        tags: ["PUA", "不可靠"],
        tagTypes: ["negative", "negative"],
        content: "CS专业，在某科技公司实习，相识于某相亲APP，开始各种甜言蜜语说要一起去DC看樱花，等到确立关系后就开始冷淡，说自己压力大要专心学习，但朋友圈经常看到他和其他女生出去玩。这种变化仅发生在两周内，典型的渣男行为，建议大家小心。此人会说前女友背叛他，其实就是自己问题大。",
        program: "CS",
        year: "3A"
    },
    {
        id: 2,
        name: "李某某",
        displayName: "李***",
        tags: ["忠诚", "情绪稳定", "真诚付出", "幽默"],
        tagTypes: ["positive", "positive", "positive", "positive"],
        content: "Math专业的学霸，人很好这是确凿的，室友见了都说好。他说话有趣，经常逗得人捧腹，又极关心我的学习，三句话不离'assignment'二字。虽然有时候太专注于学习，但这也是UW学生的通病。期末期间会给我买Tim Hortons，还会陪我在DC图书馆刷夜。托他办事，是极可靠的。",
        program: "Math",
        year: "4A"
    },
    {
        id: 3,
        name: "张某某",
        displayName: "张***",
        tags: ["出轨", "冷暴力"],
        tagTypes: ["negative", "negative"],
        content: "ECE专业，co-op在多伦多，long distance期间至少脚踏两条船，在滑铁卢和女生A交往，同时在多伦多与女生B约会，分别承诺要serious relationship。对我经常已读不回，说是忙co-op，结果Instagram story经常看到他和别人出去玩。该男本科UW，现在在多伦多工作，本性极差，请谨慎！",
        program: "ECE",
        year: "Graduate"
    },
    {
        id: 4,
        name: "陈某某",
        displayName: "陈***",
        tags: ["忠诚", "情绪稳定", "真诚付出"],
        tagTypes: ["positive", "positive", "positive"],
        content: "我是某某的前女友，实名推荐他，他真的是一个特别好的ex，活力满满，精力十足，超爱学习，前人栽树后人乘凉，我已经把他的procrastination治好了，推荐给下一任！AFM专业，未来CPA，很有上进心，会给女朋友做饭，虽然手艺一般般但心意很好。",
        program: "AFM",
        year: "3B"
    },
    {
        id: 5,
        name: "赵某某",
        displayName: "赵***",
        tags: ["出轨", "冷暴力", "骗钱"],
        tagTypes: ["negative", "negative", "negative"],
        content: "去年这个渣男在开学仅不到一个月的时候，和另一个有男朋友的女生在宿舍发生关系，随后的一个月两个人一直在微信互发不当照片。我知道这些事是因为我看了他的手机。聊天记录中他还和朋友说：'她太幼稚了，太naive了'。问题是，我是某天忽然变幼稚的？？？有趣的是这个渣男还问我借钱买课本，说co-op工资还没到账。",
        program: "SYDE",
        year: "2B"
    },
    {
        id: 6,
        name: "刘某某",
        displayName: "刘***",
        tags: ["PUA", "不成熟", "不可靠", "骗人"],
        tagTypes: ["negative", "negative", "negative", "negative"],
        content: "此人圣诞节的时候说过要给我买某品牌礼物，结果最后收到了一条所谓的自制围巾，感觉是小时候做手工做的不知道在家里放了几年了。此人听说我很讨厌他的室友之后，在我面前假装和他的室友绝交、删微信，转头在我背后和室友说过一天之后就把他加回来，还在我面前不停地演自己和这个室友断的多么彻底。",
        program: "SE",
        year: "2A"
    },
    {
        id: 7,
        name: "Michael",
        displayName: "M***",
        tags: ["自愿投稿"],
        tagTypes: ["neutral"],
        content: "此人自愿投稿：去MATH 137上课，到了发现大家都在做卷子，做完才发现这不是Practice是Midterm。昨天还熬夜凌晨两点在MC刷题，压根没复习，还看了两集动漫，今天差点没来还迟到了！这就是我，一个典型的UW学生的日常。",
        program: "Math",
        year: "1A"
    }
];

// Search functionality
function searchReviews() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('请输入要搜索的姓名');
        return;
    }
    
    // Find matching reviews
    const results = reviewsData.filter(review => 
        review.name.toLowerCase().includes(searchTerm) ||
        review.displayName.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        alert('未找到相关评价记录');
        return;
    }
    
    // Store search results in sessionStorage and redirect
    sessionStorage.setItem('searchResults', JSON.stringify(results));
    sessionStorage.setItem('searchTerm', searchTerm);
    window.location.href = 'search-results.html';
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchReviews();
            }
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add click handlers for review cards
    document.querySelectorAll('.view-details').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real implementation, this would navigate to a detailed view
            alert('详细信息页面功能开发中...');
        });
    });
});

// Form validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm(formData) {
    const errors = [];
    
    if (!formData.reviewerName || formData.reviewerName.length < 2) {
        errors.push('评价者姓名至少需要2个字符');
    }
    
    if (!formData.targetName || formData.targetName.length < 2) {
        errors.push('被评价者姓名至少需要2个字符');
    }
    
    if (!formData.relationship) {
        errors.push('请选择关系类型');
    }
    
    if (!formData.content || formData.content.length < 50) {
        errors.push('评价内容至少需要50个字符');
    }
    
    if (formData.email && !validateEmail(formData.email)) {
        errors.push('请输入有效的邮箱地址');
    }
    
    return errors;
}

// Privacy protection utilities
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

// Statistics updates
function updateStats() {
    const statsElement = document.querySelector('.stats strong');
    if (statsElement) {
        statsElement.textContent = reviewsData.length.toString();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    
    // Add fade-in animation for review cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all review cards
    document.querySelectorAll('.review-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        reviewsData,
        searchReviews,
        validateForm,
        maskName,
        sanitizeContent
    };
}
