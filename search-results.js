// Search Results Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadSearchResults();
    
    // Allow new search from this page
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performNewSearch();
            }
        });
    }
});

function loadSearchResults() {
    const results = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
    const searchTerm = sessionStorage.getItem('searchTerm') || '';
    
    const resultsInfo = document.getElementById('resultsInfo');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    
    // Set search input value
    if (searchInput && searchTerm) {
        searchInput.value = searchTerm;
    }
    
    if (results.length === 0) {
        resultsInfo.textContent = `未找到与 "${searchTerm}" 相关的评价记录`;
        noResults.style.display = 'block';
        searchResults.style.display = 'none';
        return;
    }
    
    // Update results info
    resultsInfo.textContent = `找到 ${results.length} 条与 "${searchTerm}" 相关的评价记录`;
    
    // Display results
    searchResults.innerHTML = '';
    results.forEach((result, index) => {
        const resultCard = createResultCard(result, index);
        searchResults.appendChild(resultCard);
    });
    
    // Hide no results message
    noResults.style.display = 'none';
    searchResults.style.display = 'block';
}

function createResultCard(review, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    // Determine if this is an exact match (show full name)
    const searchTerm = sessionStorage.getItem('searchTerm') || '';
    const isExactMatch = review.name.toLowerCase() === searchTerm.toLowerCase();
    const displayName = isExactMatch ? review.name : review.displayName;
    
    // Create tags HTML
    const tagsHtml = review.tags.map((tag, tagIndex) => {
        const tagType = review.tagTypes[tagIndex] || 'neutral';
        return `<span class="tag ${tagType}">${tag}</span>`;
    }).join('');
    
    // Create meta information
    const metaItems = [];
    if (review.program) metaItems.push(`<span class="meta-item">${review.program}</span>`);
    if (review.year) metaItems.push(`<span class="meta-item">${review.year}</span>`);
    
    // Truncate content for preview
    const maxLength = 200;
    const truncatedContent = review.content.length > maxLength 
        ? review.content.substring(0, maxLength) + '...' 
        : review.content;
    
    card.innerHTML = `
        <div class="result-header">
            <h3 class="result-name">${displayName}</h3>
            <div class="result-meta">
                ${metaItems.join('')}
            </div>
        </div>
        
        <div class="result-tags">
            ${tagsHtml}
        </div>
        
        <div class="result-content">
            <p>${truncatedContent}</p>
        </div>
        
        <div class="result-actions">
            <a href="#" class="view-full" onclick="viewFullReview(${review.id})">查看完整评价</a>
            <a href="#" class="report-link" onclick="reportReview(${review.id})">举报</a>
        </div>
    `;
    
    return card;
}

function performNewSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('请输入要搜索的姓名');
        return;
    }
    
    // Import reviewsData from script.js (in real app, this would be an API call)
    if (typeof reviewsData !== 'undefined') {
        const results = reviewsData.filter(review => 
            review.name.toLowerCase().includes(searchTerm) ||
            review.displayName.toLowerCase().includes(searchTerm)
        );
        
        // Update session storage
        sessionStorage.setItem('searchResults', JSON.stringify(results));
        sessionStorage.setItem('searchTerm', searchTerm);
        
        // Reload results
        loadSearchResults();
    } else {
        alert('搜索功能暂时不可用，请返回首页重新搜索');
    }
}

function viewFullReview(reviewId) {
    // In a real application, this would navigate to a detailed review page
    const results = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
    const review = results.find(r => r.id === reviewId);
    
    if (review) {
        showFullReviewModal(review);
    }
}

function showFullReviewModal(review) {
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    
    const tagsHtml = review.tags.map((tag, index) => {
        const tagType = review.tagTypes[index] || 'neutral';
        return `<span class="tag ${tagType}">${tag}</span>`;
    }).join('');
    
    const metaItems = [];
    if (review.program) metaItems.push(review.program);
    if (review.year) metaItems.push(review.year);
    const metaText = metaItems.length > 0 ? metaItems.join(' · ') : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${review.displayName}</h3>
                <button onclick="closeReviewModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                ${metaText ? `<p class="review-meta">${metaText}</p>` : ''}
                <div class="review-tags">${tagsHtml}</div>
                <div class="review-content">
                    <p>${review.content}</p>
                </div>
            </div>
            <div class="modal-actions">
                <button onclick="reportReview(${review.id})" class="btn-secondary">举报</button>
                <button onclick="closeReviewModal()" class="btn-primary">关闭</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .review-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .review-modal .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            
            .review-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 24px 0;
                border-bottom: 1px solid #e5e5e5;
                margin-bottom: 24px;
            }
            
            .review-modal .modal-header h3 {
                font-size: 24px;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }
            
            .close-btn:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .review-modal .modal-body {
                padding: 0 24px 24px;
            }
            
            .review-meta {
                color: #666;
                font-size: 14px;
                margin-bottom: 16px;
                font-weight: 500;
            }
            
            .review-modal .review-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .review-modal .review-content p {
                color: #444;
                line-height: 1.7;
                font-size: 15px;
            }
            
            .review-modal .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 0 24px 24px;
                border-top: 1px solid #e5e5e5;
                margin-top: 24px;
                padding-top: 24px;
            }
            
            @media (max-width: 768px) {
                .review-modal .modal-content {
                    margin: 20px;
                    max-height: 90vh;
                }
                
                .review-modal .modal-header {
                    padding: 20px 20px 0;
                    margin-bottom: 20px;
                }
                
                .review-modal .modal-body {
                    padding: 0 20px 20px;
                }
                
                .review-modal .modal-actions {
                    padding: 20px 20px 20px;
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeReviewModal();
        }
    });
}

function closeReviewModal() {
    const modal = document.querySelector('.review-modal');
    if (modal) {
        modal.remove();
    }
}

function reportReview(reviewId) {
    if (confirm('确定要举报这条评价吗？\n\n我们会在24小时内审核您的举报，如果违规将会移除相关内容。')) {
        alert('举报已提交，感谢您的反馈！\n\n我们会尽快处理您的举报并将结果通过邮件通知您。');
        
        // In a real application, this would send the report to the backend
        console.log(`Reported review ID: ${reviewId}`);
    }
}
