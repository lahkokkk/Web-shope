document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const userTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const themeCheck = () => {
        if (userTheme === 'dark' || (!userTheme && systemTheme)) {
            document.documentElement.classList.add('dark');
            return;
        }
        document.documentElement.classList.remove('dark');
    };
    
    const themeSwitch = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', themeSwitch);
    });

    themeCheck();
});
