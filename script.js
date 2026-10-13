document.addEventListener('DOMContentLoaded', () => {

    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            htmlElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleGrid = document.getElementById('articles-grid');
    const articleCategories = new Set(['Development', 'Design', 'AI & Tech']);
    const savedArticlesKey = 'nexusblog-user-articles';
    let activeCategory = 'all';

    const createElement = (tag, className, text) => {
        const element = document.createElement(tag);
        element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    const safeImageUrl = value => {
        try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
        } catch {
            return '';
        }
    };

    const createArticleCard = article => {
        const card = createElement('article', 'article-card group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between');
        card.dataset.category = article.category;
        card.dataset.fullContent = article.content;

        const main = createElement('div');
        const imageContainer = createElement('div', 'relative h-52 overflow-hidden');
        const image = createElement('img', 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500');
        image.src = safeImageUrl(article.image) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
        image.alt = article.title;
        const categoryBadge = createElement('span', 'absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold', article.category);
        imageContainer.append(image, categoryBadge);

        const details = createElement('div', 'p-6 space-y-3');
        const metadata = createElement('div', 'flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium');
        metadata.append(createElement('span', '', article.date), createElement('span', '', '•'), createElement('span', '', `${article.readTime} min read`));
        const title = createElement('h3', 'text-xl font-bold tracking-tight group-hover:text-brand-500 transition-colors', article.title);
        const description = createElement('p', 'text-slate-600 dark:text-slate-400 text-sm line-clamp-3', article.description);
        details.append(metadata, title, description);

        const footer = createElement('div', 'p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-4');
        const author = createElement('div', 'flex items-center gap-3');
        const avatar = createElement('img', 'w-8 h-8 rounded-full object-cover');
        avatar.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80';
        avatar.alt = '';
        author.append(avatar, createElement('span', 'text-sm font-semibold', article.author));
        const readButton = createElement('button', 'text-brand-500 hover:text-brand-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform');
        readButton.type = 'button';
        readButton.append(document.createTextNode('Read '));
        const arrow = createElement('i', 'fa-solid fa-arrow-right text-xs');
        arrow.setAttribute('aria-hidden', 'true');
        readButton.append(arrow);
        footer.append(author, readButton);
        main.append(imageContainer, details);
        card.append(main, footer);
        return card;
    };

    const isValidSavedArticle = article => article
        && articleCategories.has(article.category)
        && ['title', 'description', 'content', 'author', 'date'].every(key => typeof article[key] === 'string' && article[key].trim())
        && Number.isFinite(article.readTime);

    let savedArticles = [];
    try {
        const storedArticles = JSON.parse(localStorage.getItem(savedArticlesKey) || '[]');
        if (Array.isArray(storedArticles)) {
            savedArticles = storedArticles.filter(isValidSavedArticle);
            savedArticles.forEach(article => articleGrid.prepend(createArticleCard(article)));
        }
    } catch {
        savedArticles = [];
    }

    const applyArticleFilter = () => {
        articleGrid.querySelectorAll('.article-card').forEach(card => {
            card.style.display = activeCategory === 'all' || card.dataset.category === activeCategory ? 'flex' : 'none';
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(filterButton => {
                filterButton.classList.remove('bg-brand-600', 'text-white', 'shadow-md', 'shadow-brand-500/20');
                filterButton.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
            });
            button.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
            button.classList.add('bg-brand-600', 'text-white', 'shadow-md', 'shadow-brand-500/20');
            activeCategory = button.dataset.category;
            applyArticleFilter();
        });
    });

    const articleReader = document.getElementById('article-reader');
    const readerTitle = document.getElementById('reader-title');
    const readerCategory = document.getElementById('reader-category');
    const readerAuthor = document.getElementById('reader-author');
    const readerContent = document.getElementById('reader-content');
    const readerClose = document.getElementById('reader-close');

    if (articleReader) {
        articleGrid.addEventListener('click', event => {
            const readButton = event.target.closest('.article-card button');
            if (!readButton || !articleGrid.contains(readButton)) return;

            const card = readButton.closest('.article-card');
            readerTitle.textContent = card.querySelector('h3').textContent.trim();
            readerCategory.textContent = card.dataset.category;
            readerAuthor.textContent = `By ${card.querySelector('.text-sm.font-semibold').textContent.trim()}`;
            readerContent.textContent = card.dataset.fullContent.replace(/\\n/g, '\n');
            articleReader.showModal();
        });

        readerClose.addEventListener('click', () => articleReader.close());
        articleReader.addEventListener('click', event => {
            if (event.target === articleReader) {
                articleReader.close();
            }
        });
    }

    const newArticleButton = document.getElementById('new-article-button');
    const newArticleDialog = document.getElementById('new-article-dialog');
    const newArticleForm = document.getElementById('new-article-form');
    const newArticleError = document.getElementById('new-article-error');

    newArticleButton.addEventListener('click', () => {
        newArticleError.classList.add('hidden');
        newArticleDialog.showModal();
    });

    document.getElementById('cancel-new-article').addEventListener('click', () => newArticleDialog.close());

    newArticleForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(newArticleForm);
        const content = formData.get('content').trim();
        const imageInput = formData.get('image').trim();
        const image = imageInput ? safeImageUrl(imageInput) : '';

        if (imageInput && !image) {
            newArticleError.textContent = 'Use a valid image URL starting with http:// or https://.';
            newArticleError.classList.remove('hidden');
            return;
        }

        const article = {
            title: formData.get('title').trim(),
            category: formData.get('category'),
            author: formData.get('author').trim(),
            description: formData.get('description').trim(),
            content,
            image,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            readTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
        };

        const updatedArticles = [article, ...savedArticles];
        try {
            localStorage.setItem(savedArticlesKey, JSON.stringify(updatedArticles));
        } catch {
            newArticleError.textContent = 'This browser could not save the article. Check available local storage and try again.';
            newArticleError.classList.remove('hidden');
            return;
        }

        savedArticles = updatedArticles;
        const card = createArticleCard(article);
        articleGrid.prepend(card);
        filterButtons[0].click();
        newArticleForm.reset();
        newArticleDialog.close();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterInput = document.getElementById('newsletter-input');
    const newsletterSuccess = document.getElementById('newsletter-success');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (newsletterInput.value.trim() !== '') {
                newsletterForm.style.display = 'none';
                newsletterSuccess.classList.remove('hidden');
            }
        });
    }

});