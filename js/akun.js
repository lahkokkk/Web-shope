document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(targetId) {
        
        tabContents.forEach(content => content.classList.add('hidden'));
        tabLinks.forEach(link => link.classList.remove('active-tab', 'bg-gray-200', 'dark:bg-gray-700'));

        
        const targetContent = document.getElementById(targetId);
        const targetLink = document.querySelector(`a.tab-link[href="#${targetId}"]`);

        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
        if (targetLink) {
            targetLink.classList.add('active-tab', 'bg-gray-200', 'dark:bg-gray-700');
        }
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            history.pushState(null, '', '#' + targetId); 
            showTab(targetId);
        });
    });

    
    const currentHash = window.location.hash.substring(1);
    const validTabIds = Array.from(tabLinks).map(link => link.getAttribute('href').substring(1));

    if (currentHash && validTabIds.includes(currentHash)) {
        showTab(currentHash);
    } else {
        showTab('profil'); 
    }
    
    
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash && validTabIds.includes(hash)) {
            showTab(hash);
        } else {
            showTab('profil');
        }
    });
});