// **هشدار: قرار دادن API Key به این شکل اصلا امن نیست و در محیط واقعی نباید استفاده شود.**
// این روش فقط برای سادگی تست و طبق درخواست شما استفاده شده است.
const OPENAI_API_KEY = "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";

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

/**
 * تابعی برای اضافه کردن پیام به پنجره چت
 * @param {string} text - متن پیام
 * @param {'user'|'ai'} sender - فرستنده پیام (user یا ai)
 * @param {boolean} isNew - آیا پیام تازه اضافه شده است؟ (برای اعمال انیمیشن)
 * @returns {HTMLElement} المان پیام ایجاد شده
 */
function addMessage(text, sender, isNew = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isNew) {
        messageDiv.classList.add('new');
    }

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = text;
    messageDiv.appendChild(messageParagraph);

    const metaDiv = document.createElement('div');
    metaDiv.classList.add('message-meta');
    metaDiv.textContent = sender === 'ai' ? 'شاندوز - هوش مصنوعی' : 'شما';
    messageDiv.appendChild(metaDiv);

    chatMessages.appendChild(messageDiv);
    // اسکرول به پایین برای دیدن جدیدترین پیام
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv; // برای استفاده‌های بعدی (مثل حذف پیام لودینگ)
}

/**
 * تابعی برای ارسال درخواست به OpenAI و مدیریت پاسخ
 */
async function sendRequest() {
    const input = userInput.value.trim();

    if (!input) {
        return; // اگر ورودی خالی بود، کاری نکن
    }

    // اضافه کردن پیام کاربر به چت و پاک کردن ورودی
    addMessage(input, 'user');
    userInput.value = '';

    // اضافه کردن پیام "در حال پردازش..." از طرف AI
    const loadingMessageDiv = addMessage('در حال پردازش...', 'ai');
    loadingMessageDiv.classList.add('loading-message'); // کلاس برای انیمیشن پالس

    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "text-davinci-003", // مدل مورد استفاده
                prompt: input,
                max_tokens: 150,
                temperature: 0.7 // می‌تواند برای کنترل خلاقیت پاسخ تنظیم شود
            })
        });

        const data = await response.json();

        // حذف پیام "در حال پردازش..."
        loadingMessageDiv.remove();

        let aiResponseText;
        if (data.choices && data.choices.length > 0) {
            aiResponseText = data.choices[0].text.trim();
        } else if (data.error) {
            aiResponseText = `خطا از API: ${data.error.message}`;
            console.error("OpenAI API Error:", data.error);
        } else {
            aiResponseText = 'پاسخی از سرور دریافت نشد.';
        }

        // منطق برای پاسخ‌های خاص
        if (input.includes('نام تو چیه') || input.includes('اسمت چیه')) {
            aiResponseText = 'من شاندوز هستم، یک دستیار هوش مصنوعی.';
        } else if (input.includes('سازنده تو کیه') || input.includes('کی ساختتت')) {
            aiResponseText = 'من توسط ابوالفضل سلیمانی ساخته شدم.';
        }

        addMessage(aiResponseText, 'ai');

    } catch (error) {
        // حذف پیام "در حال پردازش..." در صورت خطا
        loadingMessageDiv.remove();
        addMessage(`خطای شبکه یا سرور: ${error.message}`, 'ai');
        console.error("Network or Server Error:", error);
    }
}

// گوش دادن به رویداد 'keypress' برای ارسال پیام با Enter
userInput.addEventListener('keypress', (e) => {
    // اگر کلید Enter فشرده شد و کلید Shift فشرده نشده بود
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // جلوگیری از ایجاد خط جدید در textarea
        sendRequest();
    }
});


