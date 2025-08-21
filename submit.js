// Submit form functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reviewForm');
    const contentTextarea = document.getElementById('content');
    const charCountElement = document.getElementById('charCount');
    
    // Character counter
    if (contentTextarea && charCountElement) {
        contentTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCountElement.textContent = currentLength;
            
            // Change color based on length
            if (currentLength > 900) {
                charCountElement.style.color = '#c62828';
            } else if (currentLength > 800) {
                charCountElement.style.color = '#f57c00';
            } else {
                charCountElement.style.color = '#666';
            }
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission();
        });
    }
    
    // Tag selection styling
    document.querySelectorAll('.tag-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('.tag-checkbox');
            if (this.checked) {
                if (label.classList.contains('positive')) {
                    label.style.background = '#e8f5e8';
                    label.style.borderColor = '#2e7d32';
                } else if (label.classList.contains('negative')) {
                    label.style.background = '#ffebee';
                    label.style.borderColor = '#c62828';
                }
            } else {
                if (label.classList.contains('positive')) {
                    label.style.background = '#f8fdf8';
                    label.style.borderColor = 'transparent';
                } else if (label.classList.contains('negative')) {
                    label.style.background = '#fffafa';
                    label.style.borderColor = 'transparent';
                }
            }
        });
    });
});

async function handleFormSubmission() {
    // Collect form data
    const formData = collectFormData();
    
    // Validate form
    const errors = validateSubmissionForm(formData);
    if (errors.length > 0) {
        alert('请修正以下错误：\n' + errors.join('\n'));
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.btn-primary');
    const originalText = submitButton.textContent;
    submitButton.textContent = '提交中...';
    submitButton.disabled = true;
    
    try {
        // Submit to API
        const result = await uwDateAPIWithFallback.submitReview(formData);
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showSubmissionSuccess(result);
        
        // Clear form
        document.getElementById('reviewForm').reset();
        document.getElementById('charCount').textContent = '0';
        
        // Reset tag styling
        resetTagStyling();
        
    } catch (error) {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show error message
        alert(`提交失败：${error.message}\n\n请检查网络连接或稍后重试。`);
        console.error('Submission error:', error);
    }
}

function resetTagStyling() {
    document.querySelectorAll('.tag-checkbox').forEach(label => {
        if (label.classList.contains('positive')) {
            label.style.background = '#f8fdf8';
            label.style.borderColor = 'transparent';
        } else if (label.classList.contains('negative')) {
            label.style.background = '#fffafa';
            label.style.borderColor = 'transparent';
        }
    });
}

function collectFormData() {
    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    
    // Get selected tags
    const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
        .map(input => input.value);
    
    return {
        reviewerName: formData.get('reviewerName'),
        reviewerEmail: formData.get('reviewerEmail'),
        targetName: formData.get('targetName'),
        targetProgram: formData.get('targetProgram'),
        relationship: formData.get('relationship'),
        duration: formData.get('duration'),
        tags: selectedTags,
        content: formData.get('content'),
        evidence: formData.getAll('evidence'),
        truthDeclaration: formData.has('truthDeclaration'),
        privacyAgreement: formData.has('privacyAgreement')
    };
}

function validateSubmissionForm(formData) {
    const errors = [];
    
    // Required fields
    if (!formData.reviewerName || formData.reviewerName.trim().length < 2) {
        errors.push('• 评价者姓名至少需要2个字符');
    }
    
    if (!formData.targetName || formData.targetName.trim().length < 2) {
        errors.push('• 被评价者姓名至少需要2个字符');
    }
    
    if (!formData.relationship) {
        errors.push('• 请选择关系类型');
    }
    
    if (!formData.content || formData.content.trim().length < 50) {
        errors.push('• 评价内容至少需要50个字符');
    }
    
    if (formData.content && formData.content.length > 1000) {
        errors.push('• 评价内容不能超过1000个字符');
    }
    
    // Email validation (if provided)
    if (formData.reviewerEmail && !validateEmail(formData.reviewerEmail)) {
        errors.push('• 请输入有效的邮箱地址');
    }
    
    // Required checkboxes
    if (!formData.truthDeclaration) {
        errors.push('• 请确认信息真实性声明');
    }
    
    if (!formData.privacyAgreement) {
        errors.push('• 请同意隐私政策和服务条款');
    }
    
    // Content validation
    if (formData.content) {
        // Check for potential inappropriate content
        const inappropriatePatterns = [
            /\b(杀|死|自杀)\b/,
            /\b(恐吓|威胁)\b/,
            /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Emails
        ];
        
        for (const pattern of inappropriatePatterns) {
            if (pattern.test(formData.content)) {
                errors.push('• 评价内容包含不当信息，请修改后重新提交');
                break;
            }
        }
    }
    
    return errors;
}

function showSubmissionSuccess(result) {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    
    const isDemo = result && result.isDemo;
    const reviewId = result && result.reviewId ? result.reviewId : '未知';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isDemo ? '演示提交成功！' : '提交成功！'}</h3>
            </div>
            <div class="modal-body">
                ${isDemo ? 
                    `<p><strong>演示模式：</strong>您的评价已记录在本地浏览器中。</p>
                     <p>在实际部署时，评价将保存到数据库并经过人工审核。</p>` :
                    `<p>您的评价已成功提交，我们将在30分钟内完成审核。</p>
                     <p>审核通过后，评价将在网站上展示。</p>`
                }
                <p>评价ID: <code>${reviewId}</code></p>
                <p>如有问题，请联系 uwdate@example.com</p>
            </div>
            <div class="modal-actions">
                <button onclick="closeSuccessModal()" class="btn-primary">确定</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal {
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
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        
        .modal-header h3 {
            color: #1976d2;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .modal-body p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .modal-actions {
            text-align: center;
            margin-top: 24px;
        }
        
        .modal-actions .btn-primary {
            min-width: 120px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeSuccessModal();
        }
    });
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
    }
}

function resetForm() {
    if (confirm('确定要重置表单吗？所有已填写的内容将丢失。')) {
        document.getElementById('reviewForm').reset();
        document.getElementById('charCount').textContent = '0';
        
        // Reset tag styling
        document.querySelectorAll('.tag-checkbox').forEach(label => {
            if (label.classList.contains('positive')) {
                label.style.background = '#f8fdf8';
                label.style.borderColor = 'transparent';
            } else if (label.classList.contains('negative')) {
                label.style.background = '#fffafa';
                label.style.borderColor = 'transparent';
            }
        });
    }
}

// Utility function for email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
